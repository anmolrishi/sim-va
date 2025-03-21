import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Card,
  styled,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Description as DescriptionIcon,
  ChevronRight as ChevronRightIcon,
  Message as MessageIcon,
} from '@mui/icons-material';

import { useSimulationWizard } from '../../../../../context/SimulationWizardContext';
import SortableItem from './SortableItem';
import ImageHotspot from './ImageHotspot';
import HotspotSequence, { SequenceItem } from './HotspotSequence';

interface Hotspot {
  id: string;
  name: string;
  type: string;
  text?: string;
  hotkey?: string;
}
interface ScriptMessage {
  id: string;
  text: string;
  role: 'Customer' | 'Trainee';
  visualId: string;
  order: number;
}
interface VisualImage {
  id: string;
  url: string;  // Local URL for display
  name: string;
  file?: File;  // Store the actual file reference
  sequence: SequenceItem[]; // Combined sequence of hotspots and messages
}

interface VisualsTabProps {
  images: VisualImage[];
  onImagesUpdate?: (images: VisualImage[]) => void;
  onComplete?: () => void;
  createSimulation?: (slides: any[]) => Promise<any>;
}

const DropZone = styled(Box)(({ theme }) => ({
  border: '2px dashed #DEE2FC',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  backgroundColor: '#FCFCFE',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease-in-out',
  minHeight: '320px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

export default function VisualsTab({
  images = [],
  onImagesUpdate,
  onComplete,
  createSimulation,
  simulationType
}: VisualsTabProps) {
  const { scriptData } = useSimulationWizard();

  // Initialize images with empty sequence array if not exists
  const initializedImages = images.map(img => ({
    ...img,
    sequence: img.sequence || []
  }));

  const [visualImages, setVisualImages] = useState<VisualImage[]>(initializedImages);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);

  // We'll keep the sequence panel default to collapsed
  const [isSequenceExpanded, setIsSequenceExpanded] = useState(false);

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // For the "Add Script Message" menu
  const [scriptMenuAnchor, setScriptMenuAnchor] = useState<null | HTMLElement>(null);

  // Update parent when visualImages changes
  useEffect(() => {
    if (onImagesUpdate) {
      onImagesUpdate(visualImages);
    }
  }, [visualImages, onImagesUpdate]);

  /** Helper: add a hotspot to the selected image's sequence. */
  const addHotspotToSequence = (imageId: string, hotspot: Hotspot) => {
    if (!imageId) return;

    setVisualImages(currentImages => currentImages.map(img => {
      if (img.id === imageId) {
        const newSequenceItem: SequenceItem = {
          id: `hotspot-${hotspot.id}`,
          type: 'hotspot',
          content: hotspot,
          timestamp: Date.now()
        };
        
        return {
          ...img,
          sequence: [...img.sequence, newSequenceItem]
        };
      }
      return img;
    }));
  };

  /** Get the selected image object. */
  const selectedImage = visualImages.find((img) => img.id === selectedImageId);

  // Get the current sequence for the selected image
  const currentSequence: SequenceItem[] = selectedImage?.sequence || [];

  // Handle reordering of the sequence
  const handleSequenceReorder = (newSequence: SequenceItem[]) => {
    if (!selectedImageId) return;
    
    setVisualImages(currentImages => currentImages.map(img => {
      if (img.id === selectedImageId) {
        return {
          ...img,
          sequence: newSequence
        };
      }
      return img;
    }));
  };

  // For the "Add Script Message" menu
  // Filter out messages that have already been assigned to a visual
  const unassignedMessages = scriptData.filter((msg) => {
    return !visualImages.some((img) => 
      img.sequence.some((item) => 
        item.type === 'message' && (item.content as ScriptMessage).id === msg.id
      )
    );
  });

  const handleOpenScriptMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setScriptMenuAnchor(event.currentTarget);
  };

  const handleCloseScriptMenu = () => {
    setScriptMenuAnchor(null);
  };

  const handleAddMessage = (message: { id: string; role: string; message: string }) => {
    if (!selectedImageId) return;

    const newMsg: ScriptMessage = {
      id: message.id,
      role: message.role as 'Customer' | 'Trainee',
      text: message.message,
      visualId: selectedImageId,
      order: 0, // We're not using this anymore as we rely on sequence order
    };

    const newSequenceItem: SequenceItem = {
      id: `message-${message.id}`,
      type: 'message',
      content: newMsg,
      timestamp: Date.now()
    };

    setVisualImages(currentImages => currentImages.map(img => {
      if (img.id === selectedImageId) {
        return {
          ...img,
          sequence: [...img.sequence, newSequenceItem]
        };
      }
      return img;
    }));

    handleCloseScriptMenu();
  };

  // For draggable thumbnails on the left
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleThumbnailsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = visualImages.findIndex((img) => img.id === active.id);
    const newIndex = visualImages.findIndex((img) => img.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newArr = [...visualImages];
    const [moved] = newArr.splice(oldIndex, 1);
    newArr.splice(newIndex, 0, moved);
    setVisualImages(newArr);
  };

  // Image Upload
  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const newImages = imageFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
      file: file, // Store the actual File reference
      sequence: [] // Initialize with empty sequence
    }));
    setVisualImages([...visualImages, ...newImages]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFiles(Array.from(e.target.files));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Delete a thumbnail
  const handleDeleteImage = (imgId: string) => {
    if (selectedImageId === imgId) {
      setSelectedImageId(null);
    }
    setVisualImages(visualImages.filter((img) => img.id !== imgId));
  };

  // Clicking a thumbnail
  const handleSelectImage = (imgId: string) => {
    setSelectedImageId(imgId);
    setEditingHotspot(null);
  };

  // "Save and Continue" - Modified to structure slides and call API with FormData
  const handleSaveAndContinue = async () => {
    if (visualImages.length === 0) return;
    
    // Structure slides data as JSON
    const slidesData = visualImages.map(img => {
      // Extract all necessary data from each image
      return {
        imageId: img.id,
        imageName: img.name,
        // Include the full ordered sequence with both hotspots and messages
        sequence: img.sequence.map(item => {
          if (item.type === 'hotspot') {
            const hotspot = item.content as Hotspot;
            return {
              type: 'hotspot',
              id: hotspot.id,
              name: hotspot.name,
              hotspotType: hotspot.type,
              coordinates: {
                x: hotspot.x,
                y: hotspot.y,
                width: hotspot.width,
                height: hotspot.height
              },
              settings: hotspot.settings || {
                font: 'Inter',
                fontSize: 16,
                buttonColor: '#00AB55',
                textColor: '#FFFFFF',
                timeoutDuration: 2,
                highlightField: false,
                enableHotkey: false
              }
            };
          } else {
            const message = item.content as ScriptMessage;
            return {
              type: 'message',
              id: message.id,
              role: message.role,
              text: message.text
            };
          }
        })
      };
    });

    // Create FormData for multipart/form-data submission with files
    const formData = new FormData();
    
    // Add the slides data as JSON
    formData.append('slidesData', JSON.stringify(slidesData));
    
    // Add image files with corresponding IDs
    visualImages.forEach((image, index) => {
      if (image.file) {
        formData.append(`slides[${index}]`, image.file, image.name);
      }
    });

    // For visual-audio types, create the simulation here
    // For other types, just move to the next step
    if (simulationType === 'visual-audio' && createSimulation) {
      const response = await createSimulation(formData);
      if (response && response.status === 'success') {
        console.log('Simulation created with slides:', response);
      }
    }

    // Update parent with latest images data
    if (onImagesUpdate) {
      onImagesUpdate(visualImages);
    }
    
    // Call onComplete to move to the next step
    if (onComplete) {
      onComplete();
    }
  };

  // Update hotspots in the sequence
  const updateImageHotspots = (imageId: string, newHotspots: Hotspot[]) => {
    if (!imageId) return;

    // Find the current image
    const currentImage = visualImages.find(img => img.id === imageId);
    if (!currentImage) return;

    // Find all sequence items that are hotspots
    const currentHotspotItems = currentImage.sequence.filter(item => item.type === 'hotspot');
    const currentHotspots = currentHotspotItems.map(item => item.content as Hotspot);

    // Identify deleted hotspots
    const deletedHotspots = currentHotspots.filter(
      oldHotspot => !newHotspots.some(newHotspot => newHotspot.id === oldHotspot.id)
    );

    // Identify new hotspots
    const addedHotspots = newHotspots.filter(
      newHotspot => !currentHotspots.some(oldHotspot => oldHotspot.id === newHotspot.id)
    );

    // Updated hotspots (existing but modified)
    const updatedHotspots = newHotspots.filter(
      newHotspot => currentHotspots.some(oldHotspot => oldHotspot.id === newHotspot.id)
    );

    // Update the image's sequence
    setVisualImages(currentImages => currentImages.map(img => {
      if (img.id === imageId) {
        // Remove deleted hotspot items
        let updatedSequence = img.sequence.filter(
          item => !(item.type === 'hotspot' && deletedHotspots.some(h => h.id === (item.content as Hotspot).id))
        );

        // Add new hotspots to the end of the sequence
        addedHotspots.forEach(hotspot => {
          updatedSequence.push({
            id: `hotspot-${hotspot.id}`,
            type: 'hotspot',
            content: hotspot,
            timestamp: Date.now()
          });
        });

        // Update existing hotspots
        updatedSequence = updatedSequence.map(item => {
          if (item.type === 'hotspot') {
            const hotspot = item.content as Hotspot;
            const updatedHotspot = updatedHotspots.find(h => h.id === hotspot.id);
            if (updatedHotspot) {
              return {
                ...item,
                content: updatedHotspot
              };
            }
          }
          return item;
        });

        return {
          ...img,
          sequence: updatedSequence
        };
      }
      return img;
    }));
  };

  // Edit / Delete a single hotspot or message from the sequence
  const handleDeleteItem = (id: string, type: 'hotspot' | 'message') => {
    if (!selectedImageId) return;
    
    setVisualImages(currentImages => currentImages.map(img => {
      if (img.id === selectedImageId) {
        return {
          ...img,
          sequence: img.sequence.filter(item => 
            !(item.type === type && (item.content as any).id === id)
          )
        };
      }
      return img;
    }));
  };

  const handleEditItem = (id: string, type: 'hotspot' | 'message') => {
    if (!selectedImageId) return;
    
    if (type === 'hotspot') {
      // Find the hotspot in the sequence
      const selectedImage = visualImages.find(img => img.id === selectedImageId);
      if (!selectedImage) return;
      
      const hotspotItem = selectedImage.sequence.find(
        item => item.type === 'hotspot' && (item.content as Hotspot).id === id
      );
      
      if (hotspotItem) {
        setEditingHotspot(hotspotItem.content as Hotspot);
      }
    } else {
      // Handle message editing if needed
      alert(`Editing message #${id} not implemented`);
    }
  };

  return (
    <Stack spacing={4}>
      {/* Top row: "Add Script Message" + "Save and Continue" */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          startIcon={<MessageIcon />}
          disabled={!selectedImageId || scriptData.length === 0}
          onClick={(e) => {
            if (!selectedImageId) return;
            setScriptMenuAnchor(e.currentTarget);
          }}
          sx={{ bgcolor: '#444CE7', '&:hover': { bgcolor: '#3538CD' } }}
        >
          Add Script Message
        </Button>

        <Button
          variant="contained"
          onClick={handleSaveAndContinue}
          disabled={visualImages.length === 0}
          sx={{
            bgcolor: '#444CE7',
            '&:hover': { bgcolor: '#3538CD' },
            borderRadius: 2,
            px: 4,
          }}
        >
          Save and Continue
        </Button>

        {/* Menu listing unassigned script messages */}
        <Menu
          anchorEl={scriptMenuAnchor}
          open={Boolean(scriptMenuAnchor)}
          onClose={() => setScriptMenuAnchor(null)}
          PaperProps={{
            sx: {
              maxHeight: 300,
              width: 400,
            },
          }}
        >
          {unassignedMessages.length === 0 && (
            <MenuItem disabled>No unassigned messages left</MenuItem>
          )}
          {unassignedMessages.map((msg) => (
            <MenuItem
              key={msg.id}
              onClick={() =>
                handleAddMessage({
                  id: msg.id,
                  role: msg.role,
                  message: msg.message,
                })
              }
              sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Stack spacing={1} sx={{ width: '100%' }}>
                <Typography variant="caption" color="text.secondary">
                  {msg.role}
                </Typography>
                <Typography variant="body2">
                  {msg.message}
                </Typography>
              </Stack>
            </MenuItem>
          ))}
        </Menu>
      </Stack>

      {visualImages.length === 0 ? (
        <DropZone onDrop={handleDrop} onDragOver={handleDragOver}>
          <DescriptionIcon sx={{ fontSize: 80, color: '#DEE2FC', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#0F174F', mb: 2 }} gutterBottom fontWeight="800">
            Add Visuals
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 2 }}>
            Drag and drop your images here in .png, .jpeg format
          </Typography>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', my: 2 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Stack>

          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            sx={{
              bgcolor: '#444CE7',
              color: 'white',
              py: 1.5,
              px: 4,
              '&:hover': { bgcolor: '#3538CD' },
            }}
          >
            Upload
            <input
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={handleFileSelect}
            />
          </Button>
        </DropZone>
      ) : (
        <Stack spacing={3} sx={{ height: 'calc(100vh - 250px)' }}>
          <Box sx={{ display: 'flex', gap: 4, flex: 1 }}>
            {/* Left sidebar: thumbnails */}
            <Box sx={{ width: 280 }}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleThumbnailsDragEnd}>
                <SortableContext
                  items={visualImages.map((img) => img.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Box
                    sx={{
                      maxHeight: 'calc(100vh - 400px)',
                      overflowY: 'auto',
                      '&::-webkit-scrollbar': { width: '4px' },
                      '&::-webkit-scrollbar-track': { background: '#F1F1F1', borderRadius: '10px' },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#DEE2FC',
                        borderRadius: '10px',
                        '&:hover': { background: '#444CE7' },
                      },
                    }}
                  >
                    <Stack spacing={2} sx={{ p: 2 }}>
                      {visualImages.map((img, index) => (
                        <SortableItem
                          key={img.id}
                          id={img.id}
                          image={img}
                          index={index}
                          selectedImageId={selectedImageId}
                          onImageClick={(id) => handleSelectImage(id)}
                          onDelete={(id) => handleDeleteImage(id)}
                        />
                      ))}
                    </Stack>
                  </Box>
                </SortableContext>
              </DndContext>

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                component="label"
                sx={{
                  mt: 2,
                  borderStyle: 'dashed',
                  borderColor: '#DEE2FC',
                  color: '#444CE7',
                  '&:hover': {
                    borderColor: '#444CE7',
                    bgcolor: '#F5F6FF',
                  },
                }}
              >
                Add Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </Button>
            </Box>

            {/* Main content area */}
            <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
              {selectedImageId ? (
                <Box
                  ref={mainContentRef}
                  sx={{
                    height: '100%',
                    bgcolor: '#F9FAFB',
                    borderRadius: 2,
                    p: 4,
                    flex: 1,
                    transition: 'all 0.3s ease',
                    // If sequence is expanded, we'll leave space for it:
                    marginRight: isSequenceExpanded ? '340px' : '40px',
                  }}
                >
                  <ImageHotspot
                    imageUrl={selectedImage?.url || ''}
                    hotspots={selectedImage?.sequence
                      .filter(item => item.type === 'hotspot')
                      .map(item => item.content as Hotspot) || []}
                    editingHotspot={editingHotspot}
                    onHotspotsChange={(newHs) => {
                      if (!selectedImageId) return;
                      updateImageHotspots(selectedImageId, newHs);
                      setEditingHotspot(null);
                    }}
                    onEditHotspot={(ht) => setEditingHotspot(ht)}
                    containerWidth={containerWidth}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    flex: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Select an image from the left to preview
                  </Typography>
                </Box>
              )}

              {selectedImageId && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: '100%',
                    display: 'flex',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Toggle arrow (on the left side of the sequence panel) */}
                  <Box
                    sx={{
                      width: 40,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    <IconButton
                      onClick={() => setIsSequenceExpanded(!isSequenceExpanded)}
                      sx={{
                        bgcolor: '#F5F6FF',
                        '&:hover': { bgcolor: '#EEF0FF' },
                        // If expanded, arrow points right => rotate(180)
                        transform: isSequenceExpanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </Box>

                  {/* Sequence panel */}
                  <Box
                    sx={{
                      transform: isSequenceExpanded ? 'translateX(0)' : 'translateX(100%)',
                      transition: 'transform 0.3s ease',
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: 320,
                      borderLeft: '1px solid',
                      borderColor: 'divider',
                      bgcolor: '#F9FAFB',
                    }}
                  >
                    <HotspotSequence
                      sequence={currentSequence}
                      onSequenceReorder={handleSequenceReorder}
                      onItemDelete={handleDeleteItem}
                      onItemEdit={handleEditItem}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Stack>
      )}
    </Stack>
  );
}