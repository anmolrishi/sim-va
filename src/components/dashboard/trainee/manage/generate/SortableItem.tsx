import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Typography,
  IconButton,
  styled,
  Card,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';

interface SortableItemProps {
  id: string;
  image: {
    id: string;
    url: string;
    name: string;
  };
  index: number;
  selectedImageId: string | null;
  onImageClick: (id: string) => void;
  onDelete: (id: string) => void;
}

const ImagePreview = styled(Card)(({ theme }) => ({
  width: '100%',
  borderRadius: theme.spacing(1),
  position: 'relative',
  marginBottom: theme.spacing(2),
  '&:hover .image-actions': {
    opacity: 1,
  },
}));

const ThumbnailContainer = styled(Box)(({ theme }) => ({
  width: '280px',
  height: '200px',
  overflow: 'hidden',
  borderRadius: theme.spacing(1),
  position: 'relative',
  '&:hover .image-actions': {
    opacity: 1,
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

export default function SortableItem({
  id,
  image,
  index,
  selectedImageId,
  onImageClick,
  onDelete,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ImagePreview
      ref={setNodeRef}
      style={style}
      onClick={() => onImageClick(image.id)}
      sx={{
        border: selectedImageId === image.id ? '2px solid #444CE7' : '1px solid #E5E7EB',
        cursor: 'pointer',
      }}
    >
      <ThumbnailContainer>
        <Box
          component="img"
          src={image.url}
          alt={image.name}
        />
        <Box
          className="image-actions"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            p: 1,
            opacity: 0,
            transition: 'opacity 0.2s',
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            sx={{ bgcolor: 'white' }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <Box {...attributes} {...listeners}>
            <IconButton
              size="small"
              sx={{ bgcolor: 'white', cursor: 'grab' }}
            >
              <DragIndicatorIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            p: 1,
          }}
        >
          Screen {index + 1}
        </Typography>
      </ThumbnailContainer>
    </ImagePreview>
  );
}