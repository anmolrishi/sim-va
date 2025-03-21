import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import {
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChatBubble as ChatBubbleIcon,
  Lightbulb as LightbulbIcon,
  Highlight as HighlightIcon,
  Person as PersonIcon,
  SupportAgent as SupportAgentIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

/** The shape of a single item in our combined sequence. */
export interface SequenceItem {
  /** Unique ID, e.g. "hotspot-xxx" or "message-yyy". */
  id: string;
  /** "hotspot" or "message". */
  type: 'hotspot' | 'message';
  /** The actual content object. */
  content: Hotspot | ScriptMessage;
  /** Addition timestamp for natural ordering */
  timestamp?: number;
}

/** A normal hotspot definition. */
export interface Hotspot {
  id: string;
  name: string;
  type: 'button' | 'coaching' | 'highlight' | string;
  text?: string;
  hotkey?: string;
}

/** A script message definition. */
export interface ScriptMessage {
  id: string;
  text: string;
  role: 'Customer' | 'Trainee';
}

/** Props to the overall HotspotSequence container. */
interface HotspotSequenceProps {
  /** Combined array of messages + hotspots in the correct sequence. */
  sequence: SequenceItem[];
  /** Called after reordering so the parent can store new sequence. */
  onSequenceReorder: (newSequence: SequenceItem[]) => void;

  /** Called if user clicks delete on an item. */
  onItemDelete: (id: string, type: 'hotspot' | 'message') => void;
  /** Called if user clicks edit on an item. */
  onItemEdit: (id: string, type: 'hotspot' | 'message') => void;
}

/** Single row in the sequence (draggable). */
function SortableRow({
  item,
  onDelete,
  onEdit,
}: {
  item: SequenceItem;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (item.type === 'message') {
    // Render a script message row
    const msg = item.content as ScriptMessage;

    return (
      <Box
        ref={setNodeRef}
        style={style}
        sx={{
          p: 2,
          bgcolor: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Drag handle */}
            <Box {...attributes} {...listeners}>
              <IconButton size="small">
                <DragIndicatorIcon fontSize="small" />
              </IconButton>
            </Box>

            {msg.role === 'Customer' ? (
              <SupportAgentIcon sx={{ color: '#444CE7', fontSize: 20 }} />
            ) : (
              <PersonIcon sx={{ color: '#444CE7', fontSize: 20 }} />
            )}
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              {msg.role}
            </Typography>

            <IconButton size="small" onClick={onEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {msg.text}
          </Typography>
        </Stack>
      </Box>
    );
  } else {
    // Render a hotspot row
    const ht = item.content as Hotspot;

    function getHotspotIcon(hType: string) {
      switch (hType) {
        case 'button':
          return <ChatBubbleIcon sx={{ fontSize: 20, color: '#444CE7' }} />;
        case 'coaching':
          return <LightbulbIcon sx={{ fontSize: 20, color: '#444CE7' }} />;
        case 'highlight':
          return <HighlightIcon sx={{ fontSize: 20, color: '#444CE7' }} />;
        default:
          return <ChatBubbleIcon sx={{ fontSize: 20, color: '#444CE7' }} />;
      }
    }

    return (
      <Box
        ref={setNodeRef}
        style={style}
        sx={{
          p: 2,
          bgcolor: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Drag handle */}
            <Box {...attributes} {...listeners}>
              <IconButton size="small">
                <DragIndicatorIcon fontSize="small" />
              </IconButton>
            </Box>

            {getHotspotIcon(ht.type)}

            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              {ht.name}
            </Typography>

            <IconButton size="small" onClick={onEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>

          {ht.text && (
            <Typography variant="body2" color="text.secondary" sx={{ pl: 5 }}>
              {ht.text}
            </Typography>
          )}
          {ht.hotkey && (
            <Typography variant="caption" sx={{ pl: 5, color: 'text.secondary' }}>
              Hotkey: {ht.hotkey}
            </Typography>
          )}
        </Stack>
      </Box>
    );
  }
}

const HotspotSequence: React.FC<HotspotSequenceProps> = ({
  sequence,
  onSequenceReorder,
  onItemDelete,
  onItemEdit,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Reorder local array
    const oldIndex = sequence.findIndex(x => x.id === active.id);
    const newIndex = sequence.findIndex(x => x.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newArr = [...sequence];
    const [moved] = newArr.splice(oldIndex, 1);
    newArr.splice(
      newIndex > oldIndex ? newIndex - 1 : newIndex,
      0,
      moved
    );

    // Fire parent callback with new order
    onSequenceReorder(newArr);
  };

  return (
    <Box
      sx={{
        width: 320,
        height: '100%',
        bgcolor: '#F9FAFB',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header row */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" fontWeight="600">
          Sequence
        </Typography>
      </Stack>

      {/* Draggable items - always shown */}
      
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#F1F1F1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#DEE2FC',
              borderRadius: '10px',
              '&:hover': {
                background: '#444CE7',
              },
            },
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sequence.map((it) => it.id)}
              strategy={verticalListSortingStrategy}
            >
              {sequence.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onEdit={() => onItemEdit(item.content.id, item.type)}
                  onDelete={() => onItemDelete(item.content.id, item.type)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Box>
    </Box>
  );
};

export default HotspotSequence;