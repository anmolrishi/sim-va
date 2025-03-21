import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Dialog,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  type: 'button' | 'field';
  settings: {
    font: string;
    fontSize: number;
    buttonColor: string;
    textColor: string;
    timeoutDuration: number;
    highlightField: boolean;
    enableHotkey: boolean;
  };
}

interface ImageHotspotProps {
  imageUrl: string;
  onHotspotsChange?: (hotspots: Hotspot[]) => void;
  hotspots?: Hotspot[];
  onEditHotspot?: (hotspot: Hotspot) => void;
  editingHotspot?: Hotspot | null;
  containerWidth: number;
}

const ImageHotspot: React.FC<ImageHotspotProps> = ({ 
  imageUrl, 
  onHotspotsChange,
  hotspots = [],
  onEditHotspot,
  editingHotspot, 
  containerWidth,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentHotspot, setCurrentHotspot] = useState<Partial<Hotspot> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dialogPosition, setDialogPosition] = useState<{ top: number; left: number; }>({ top: 0, left: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });

  // Track original image size
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalImageSize({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Track viewport size
  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  // Track image size changes
  useEffect(() => {
    const updateImageSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const img = container.querySelector('img');
        if (img) {
          const rect = img.getBoundingClientRect();
          setImageSize({ width: rect.width, height: rect.height });
          setScale(rect.width / img.naturalWidth);
        }
      }
    };

    const observer = new ResizeObserver(updateImageSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Update hotspots when editing hotspot changes
  useEffect(() => {
    if (editingHotspot) {
      setEditingId(editingHotspot.id);
      setEditMode(true);
      setCurrentHotspot(editingHotspot);
      setShowSettings(true);
      calculateDialogPosition(editingHotspot);
    }
  }, [editingHotspot]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const img = containerRef.current.querySelector('img');
    if (!img) return;

    const rect = img.getBoundingClientRect();
    // Store coordinates relative to original image size
    const x = ((e.clientX - rect.left) / rect.width) * originalImageSize.width;
    const y = ((e.clientY - rect.top) / rect.height) * originalImageSize.height;
    
    setIsDrawing(true);
    setStartPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return;

    const img = containerRef.current.querySelector('img');
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * originalImageSize.width;
    const y = ((e.clientY - rect.top) / rect.height) * originalImageSize.height;

    setCurrentHotspot({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentHotspot) return;
    setIsDrawing(false);
    calculateDialogPosition(currentHotspot);
    setShowSettings(true);
  };

  const calculateDialogPosition = (hotspot: Partial<Hotspot>) => {
    if (!containerRef.current || !hotspot) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const img = containerRef.current.querySelector('img');
    if (!img) return;

    const imgRect = img.getBoundingClientRect();
    const scale = imgRect.width / originalImageSize.width;
    const dialogHeight = 520; // Fixed dialog height
    const dialogWidth = 320;  // Fixed dialog width
    const padding = 16;       // Padding from edges

    // Calculate initial position relative to the hotspot
    let x = (hotspot.x! * scale) + imgRect.left;
    let y = (hotspot.y! * scale) + imgRect.top;

    // Try positioning to the right of the hotspot
    let left = x + (hotspot.width! * scale) + padding;
    
    // If it would go off the right edge, position to the left instead
    if (left + dialogWidth > viewportSize.width) {
      left = x - dialogWidth - padding;
    }

    // If it would go off the left edge, position it at the left edge with padding
    if (left < padding) {
      left = padding;
    }

    // Center vertically by default
    let top = y - (dialogHeight / 2);

    // Ensure the dialog stays within the vertical bounds
    if (top < padding) {
      top = padding;
    } else if (top + dialogHeight > viewportSize.height - padding) {
      top = viewportSize.height - dialogHeight - padding;
    }

    setDialogPosition({ top, left });
  };

  // Recalculate position when editing an existing hotspot
  useEffect(() => {
    if (editingHotspot) {
      calculateDialogPosition(editingHotspot);
    }
  }, [editingHotspot, viewportSize]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (showSettings && currentHotspot) {
        calculateDialogPosition(currentHotspot);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSettings, currentHotspot]);

  const handleSettingsSave = (settings: Partial<Hotspot>) => {
    if (!currentHotspot) return;

    const id = editMode ? editingId : Date.now().toString();

    // Preserve existing hotspot data when editing
    const hotspot: Hotspot = {
      ...currentHotspot as Hotspot,
      id,
      name: settings.name || 'Untitled hotspot',
      type: settings.type || 'button',
      settings: {
        font: settings.settings?.font || currentHotspot.settings?.font || 'Inter',
        fontSize: settings.settings?.fontSize || currentHotspot.settings?.fontSize || 16,
        buttonColor: settings.settings?.buttonColor || currentHotspot.settings?.buttonColor || '#00AB55',
        textColor: settings.settings?.textColor || currentHotspot.settings?.textColor || '#FFFFFF',
        timeoutDuration: settings.settings?.timeoutDuration || currentHotspot.settings?.timeoutDuration || 2,
        highlightField: settings.settings?.highlightField ?? currentHotspot.settings?.highlightField ?? false,
        enableHotkey: settings.settings?.enableHotkey ?? currentHotspot.settings?.enableHotkey ?? false,
      },
    };

    // Update existing hotspot or add new one
    const newHotspots = editMode
      ? [...hotspots].map(h => h.id === hotspot.id ? hotspot : h)
      : [...(hotspots || []), hotspot];

    setCurrentHotspot(null);
    setShowSettings(false);
    setEditMode(false);
    setEditingId(null);
    onHotspotsChange?.(newHotspots);
  };

  // Function to remove a hotspot
  const removeHotspot = (id: string) => {
    const newHotspots = hotspots.filter(h => h.id !== id);
    onHotspotsChange?.(newHotspots);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box
        onClick={() => {
          if (editMode) {
            setEditMode(false);
            setEditingId(null);
            setShowSettings(false);
            setCurrentHotspot(null);
          }
        }}
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          cursor: isDrawing ? 'crosshair' : 'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\' fill=\'black\'/%3E%3Cpath d=\'M12 7V17M7 12H17\' stroke=\'white\' stroke-width=\'2\'/%3E%3C/svg%3E") 12 12, auto',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Box
          component="img"
          src={imageUrl}
          alt="Hotspot canvas"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />

        {/* Existing hotspots */}
        {hotspots.map((hotspot) => (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              if (!editMode || editingId !== hotspot.id) {
                onEditHotspot?.(hotspot);
              }
            }}
            key={hotspot.id}
            sx={{
              position: 'absolute',
              left: `${(hotspot.x / originalImageSize.width) * 100}%`,
              top: `${(hotspot.y / originalImageSize.height) * 100}%`,
              width: `${(hotspot.width / originalImageSize.width) * 100}%`,
              height: `${(hotspot.height / originalImageSize.height) * 100}%`,
              border: '2px solid #444CE7',
              borderColor: editingId === hotspot.id ? '#00AB55' : '#444CE7',
              backgroundColor: 'rgba(68, 76, 231, 0.1)',
              cursor: 'pointer',
            }}
          />
        ))}

        {/* Currently drawing hotspot */}
        {currentHotspot && (
          <Box
            sx={{
              position: 'absolute',
              left: `${(currentHotspot.x / originalImageSize.width) * 100}%`,
              top: `${(currentHotspot.y / originalImageSize.height) * 100}%`,
              width: `${(currentHotspot.width / originalImageSize.width) * 100}%`,
              height: `${(currentHotspot.height / originalImageSize.height) * 100}%`,
              border: '2px solid #444CE7',
              backgroundColor: 'rgba(68, 76, 231, 0.1)',
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>

      {/* Settings Dialog */}
      {showSettings && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            top: Math.max(16, Math.min(dialogPosition.top, viewportSize.height - 520 - 16)),
            left: Math.max(16, Math.min(dialogPosition.left, viewportSize.width - 320 - 16)),
            maxWidth: 320,
            width: '100%',
            borderRadius: 2,
            zIndex: 1300,
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            transform: 'translate3d(0,0,0)',
          }}
        >
          <Stack spacing={2} sx={{ p: 2 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#F5F6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {editMode ? <EditIcon sx={{ fontSize: 16, color: '#444CE7' }} /> : <AddIcon sx={{ fontSize: 16, color: '#444CE7' }} />}
                </Box>
                <Typography variant="subtitle1" fontWeight="600">{editMode ? 'Edit Hotspot' : 'Add Hotspot'}</Typography>
              </Stack>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(false);
                  setCurrentHotspot(null);
                  setEditMode(false);
                  setEditingId(null);
                }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* Form Fields */}
            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Name *"
                defaultValue={currentHotspot?.name || "Untitled button"}
                onChange={(e) => setCurrentHotspot(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
              
              <Select
                size="small"
                label="Type"
                InputLabelProps={{ shrink: true }}
                value={currentHotspot?.type || currentHotspot?.settings?.type || 'button'}
                onChange={(e) => setCurrentHotspot(prev => ({
                  ...prev,
                  type: e.target.value as 'button' | 'field'
                }))}
                sx={{
                  '& .MuiInputLabel-root': {
                    backgroundColor: 'white',
                    padding: '0 4px',
                  }
                }}
              >
                <MenuItem value="button">Button</MenuItem>
                <MenuItem value="dropdown">Dropdown</MenuItem>
                <MenuItem value="checkbox">Checkbox</MenuItem>
                <MenuItem value="textfield">Text Field</MenuItem>
                <MenuItem value="highlight">Highlight</MenuItem>
                <MenuItem value="coaching">Coaching Tip</MenuItem>
              </Select>

              <Stack direction="row" spacing={1}>
                <Select
                  size="small"
                  fullWidth
                  label="Font"
                  InputLabelProps={{ shrink: true }}
                  value={currentHotspot?.settings?.font || currentHotspot?.settings?.font || 'Inter'}
                  onChange={(e) => setCurrentHotspot(prev => ({
                    ...prev,
                    settings: {
                      ...prev?.settings,
                      font: e.target.value as string
                    }
                  }))}
                  sx={{
                    '& .MuiInputLabel-root': {
                      backgroundColor: 'white',
                      padding: '0 4px',
                    }
                  }}
                >
                  <MenuItem value="Inter">Inter</MenuItem>
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Roboto">Roboto</MenuItem>
                </Select>

                <Select
                  size="small"
                  fullWidth
                  label="Size"
                  InputLabelProps={{ shrink: true }}
                  value={currentHotspot?.settings?.fontSize || currentHotspot?.settings?.fontSize || 16}
                  onChange={(e) => setCurrentHotspot(prev => ({
                    ...prev,
                    settings: {
                      ...prev?.settings,
                      fontSize: e.target.value as number
                    }
                  }))}
                  sx={{
                    '& .MuiInputLabel-root': {
                      backgroundColor: 'white',
                      padding: '0 4px',
                    }
                  }}
                >
                  {[12, 14, 16, 18, 20].map(size => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              </Stack>

              <Select
                size="small"
                label="Timeout Duration"
                InputLabelProps={{ shrink: true }}
                value={currentHotspot?.settings?.timeoutDuration || currentHotspot?.settings?.timeoutDuration || 2}
                onChange={(e) => setCurrentHotspot(prev => ({
                  ...prev,
                  settings: {
                    ...prev?.settings,
                    timeoutDuration: e.target.value as number
                  }
                }))}
                sx={{
                  '& .MuiInputLabel-root': {
                    backgroundColor: 'white',
                    padding: '0 4px',
                  }
                }}
              >
                {[1, 2, 3, 4, 5].map(duration => (
                  <MenuItem key={duration} value={duration}>{duration} sec</MenuItem>
                ))}
              </Select>

              <Stack direction="row" spacing={1}>
                <Select
                  size="small"
                  fullWidth
                  label="Button Color"
                  InputLabelProps={{ shrink: true }}
                  value={currentHotspot?.settings?.buttonColor || currentHotspot?.settings?.buttonColor || '#00AB55'}
                  onChange={(e) => setCurrentHotspot(prev => ({
                    ...prev,
                    settings: {
                      ...prev?.settings,
                      buttonColor: e.target.value as string
                    }
                  }))}
                  sx={{
                    '& .MuiInputLabel-root': {
                      backgroundColor: 'white',
                      padding: '0 4px',
                    }
                  }}
                  renderValue={(value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: value,
                          borderRadius: 0.5,
                        }}
                      />
                      {value}
                    </Box>
                  )}
                >
                  <MenuItem value="#00AB55">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: '#00AB55',
                        borderRadius: 0.5,
                        mr: 1,
                      }}
                    />
                    #00AB55
                  </MenuItem>
                  <MenuItem value="#444CE7">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: '#444CE7',
                        borderRadius: 0.5,
                        mr: 1,
                      }}
                    />
                    #444CE7
                  </MenuItem>
                </Select>

                <Select
                  size="small"
                  fullWidth
                  label="Text Color"
                  InputLabelProps={{ shrink: true }}
                  value={currentHotspot?.settings?.textColor || currentHotspot?.settings?.textColor || '#FFFFFF'}
                  onChange={(e) => setCurrentHotspot(prev => ({
                    ...prev,
                    settings: {
                      ...prev?.settings,
                      textColor: e.target.value as string
                    }
                  }))}
                  sx={{
                    '& .MuiInputLabel-root': {
                      backgroundColor: 'white',
                      padding: '0 4px',
                    }
                  }}
                  renderValue={(value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: value,
                          borderRadius: 0.5,
                          border: '1px solid #E5E7EB',
                        }}
                      />
                      {value}
                    </Box>
                  )}
                >
                  <MenuItem value="#FFFFFF">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: '#FFFFFF',
                        borderRadius: 0.5,
                        border: '1px solid #E5E7EB',
                        mr: 1,
                      }}
                    />
                    #FFFFFF
                  </MenuItem>
                  <MenuItem value="#000000">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: '#000000',
                        borderRadius: 0.5,
                        mr: 1,
                      }}
                    />
                    #000000
                  </MenuItem>
                </Select>
              </Stack>

              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={currentHotspot?.settings?.highlightField || false}
                    onChange={(e) => setCurrentHotspot(prev => ({
                      ...prev,
                      settings: {
                        ...prev?.settings,
                        highlightField: e.target.checked
                      }
                    }))}
                  />
                }
                label={
                  <Typography variant="body2">Highlight Field</Typography>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={currentHotspot?.settings?.enableHotkey || false}
                    onChange={(e) => setCurrentHotspot(prev => ({
                      ...prev,
                      settings: {
                        ...prev?.settings,
                        enableHotkey: e.target.checked
                      }
                    }))}
                  />
                }
                label={
                  <Typography variant="body2">Enable Hotkey</Typography>
                }
              />
            </Stack>

            {/* Actions */}
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(false);
                  setCurrentHotspot(null);
                  setEditMode(false);
                  setEditingId(null);
                }}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSettingsSave(currentHotspot || {});
                }}
                sx={{
                  bgcolor: '#444CE7',
                  '&:hover': { bgcolor: '#3538CD' },
                  textTransform: 'none',
                }}
              >
                {editMode ? 'Update' : 'Save'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default ImageHotspot;