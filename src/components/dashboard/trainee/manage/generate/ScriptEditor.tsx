import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

import {
  Stack,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  IconButton,
  TextField,
  Button,
  Box,
  styled,
  useTheme,
  Popper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Mic as MicIcon,
  Send as SendIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

//
// 1. Define a custom Quill format for "keyword"
//    This style uses green text + lightgreen background.
//
const KeywordStyle = Quill.import('formats/bold'); // or use a more basic blot
class KeywordFormat extends KeywordStyle {}
KeywordFormat.blotName = 'keyword';
KeywordFormat.tagName = 'span';
KeywordFormat.className = 'keyword-highlight'; // we can define styling in CSS
Quill.register(KeywordFormat, true);

//
// 2. Set up a small CSS rule for .keyword-highlight
//    (You can also do this inline in a <style> or your theme.)
//    E.g. .keyword-highlight { color: green; background-color: #ccffd1; }
//

//
// The rest is your existing data model.
//
interface Message {
  id: string;
  role: 'Customer' | 'Trainee';
  message: string;       // We'll store Quill HTML in here once editing is done
  keywords: string[];    // The array of selected keywords
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'Customer',
    message: 'Hello! I want to refill my medications please.',
    keywords: [],
  },
  {
    id: '2',
    role: 'Trainee',
    message:
      'Thank you for calling <strong>Centerwell Pharmacy</strong>. My name is [Your Name]. Are you ready to take advantage of your <u>Mail Order Benefits</u> today?',
    keywords: [],
  },
];

const MessageBubble = styled('div')(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: '1px solid transparent',
  minWidth: '140px',
  backgroundColor: theme.palette.grey[100],
  '&:hover': {
    borderColor: theme.palette.grey[300],
  },
}));

interface ScriptEditorProps {
  script?: Message[];
  onScriptUpdate?: (script: Message[]) => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ script = initialMessages, onScriptUpdate }) => {
  const theme = useTheme();

  // ----------------------------
  //   State
  // ----------------------------
  const [messages, setMessages] = useState<Message[]>(script);
  const [inputText, setInputText] = useState('');
  const [currentRole, setCurrentRole] = useState<'Customer' | 'Trainee'>('Customer');

  // Drag‐and‐drop
  const [draggedMessage, setDraggedMessage] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');   // we store the Quill HTML here
  const [editingMinWidth, setEditingMinWidth] = useState<number>(0);

  // We'll track which message's "keywords" we might be modifying
  // as we highlight/unhighlight text inside the Quill editor
  const [editingKeywords, setEditingKeywords] = useState<string[]>([]);

  // We'll show a small popup at selection for "Add/Remove Keyword"
  const [selectionAnchor, setSelectionAnchor] = useState<Range | null>(null);
  const [selectionIndex, setSelectionIndex] = useState<number>(0);
  const [selectionLength, setSelectionLength] = useState<number>(0);
  const [showKeywordPopper, setShowKeywordPopper] = useState(false);
  const [isAlreadyKeyword, setIsAlreadyKeyword] = useState(false); // does selection have 'keyword'?

  // Refs
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // Popper ref
  const keywordPopperRef = useRef(null);

  // Quill modules
  const modules = useMemo(() => ({
    toolbar: false,  // Hide the default toolbar
  }), []);

  // We define which Quill formats are allowed
  const formats = useMemo(() => ['keyword', 'bold', 'italic', 'underline'], []);

  // ----------------------------
  //  Basic UI logic
  // ----------------------------
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      role: currentRole,
      message: inputText,
      keywords: [],
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRole = () => {
    setCurrentRole((prev) => (prev === 'Customer' ? 'Trainee' : 'Customer'));
  };

  const deleteMessage = (id: string) => {
    const updatedMessages = messages.filter((m) => m.id !== id);
    setMessages(updatedMessages);
    onScriptUpdate?.(updatedMessages);
  };

  // ----------------------------
  //  Drag & Drop
  // ----------------------------
  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    msgId: string,
    index: number
  ) => {
    setDraggedMessage(msgId);
    e.dataTransfer.effectAllowed = 'move';

    const rowEl = messageRefs.current[index];
    if (rowEl) {
      const dragImage = rowEl.cloneNode(true) as HTMLElement;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);

      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  const handleDragEnd = () => {
    setDraggedMessage(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseY = e.clientY - containerRect.top;

    let newIndex = -1;
    for (let i = 0; i < messageRefs.current.length; i++) {
      const el = messageRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2 - containerRect.top;
        if (mouseY < mid) {
          newIndex = i;
          break;
        }
      }
    }
    if (newIndex === -1) {
      newIndex = messages.length;
    }
    setDragOverIndex(newIndex);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedMessage || dragOverIndex === null) return;

    const draggedIndex = messages.findIndex((m) => m.id === draggedMessage);
    if (draggedIndex === dragOverIndex || draggedIndex + 1 === dragOverIndex) return;

    const newArr = [...messages];
    const [removed] = newArr.splice(draggedIndex, 1);
    newArr.splice(
      dragOverIndex > draggedIndex ? dragOverIndex - 1 : dragOverIndex,
      0,
      removed
    );

    setMessages(newArr);
    setDraggedMessage(null);
    setDragOverIndex(null);
  };

  // ----------------------------
  //  Editing + Quill
  // ----------------------------
  const handleClickMessage = (msg: Message, index: number) => {
    if (editingId === msg.id) return;
    // Start editing
    setEditingId(msg.id);
    // In a real app, 'msg.message' might be plain text or already HTML. We'll assume HTML
    setDraftText(msg.message);
    setEditingKeywords(msg.keywords || []);

    // measure bubble width
    const rowEl = messageRefs.current[index];
    if (rowEl) {
      const bubbleEl = rowEl.querySelector('.bubble-content') as HTMLElement;
      if (bubbleEl) {
        setEditingMinWidth(bubbleEl.offsetWidth);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowKeywordPopper(false);
  };

  const handleSaveEdit = (id: string) => {
    // Save the updated HTML + updated keywords
    const updatedMessages = messages.map((m) =>
        m.id === id ? { ...m, message: draftText, keywords: editingKeywords } : m
    );
    setMessages(updatedMessages);
    onScriptUpdate?.(updatedMessages);
    setEditingId(null);
    setShowKeywordPopper(false);
  };

  // We'll treat the original text vs. new text to see if changed
  const hasChanged = useMemo(() => {
    const msg = messages.find((m) => m.id === editingId);
    if (!msg) return false;
    // Compare HTML text
    if (msg.message !== draftText) return true;
    // Compare keywords array
    if (JSON.stringify(msg.keywords) !== JSON.stringify(editingKeywords)) return true;
    return false;
  }, [editingId, draftText, editingKeywords, messages]);

  //
  // onSelectionChange in Quill
  // If the user highlights some text, we show the "Add/Remove Keyword" popup
  //
  const handleQuillChangeSelection = (
    range: { index: number; length: number } | null,
    oldRange: { index: number; length: number } | null,
    source: string,
    editor: any
  ) => {
    if (!range || range.length === 0) {
      // no selection
      setShowKeywordPopper(false);
      return;
    }
    // If the user highlights text, we figure out if it's already a "keyword"
    const format = editor.getFormat(range.index, range.length);
    const isKeyword = !!format.keyword;
    setIsAlreadyKeyword(isKeyword);

    // We'll store the selection index/length
    setSelectionIndex(range.index);
    setSelectionLength(range.length);

    // Let's get bounding rect of that selection to position a Popper
    const nativeRange = editor.editor.getSelectionBounds(range.index, range.length);
    // The editor container is offset in the page, so we get the container's position
    const quillEl = editor.editor.container.getBoundingClientRect();

    // We'll create a Range to anchor the Popper in pure DOM
    const selectionRange = document.createRange();
    selectionRange.setStart(editor.editor.scroll.domNode, 0); // minimal anchor
    setSelectionAnchor(selectionRange);

    // Now we show the popper
    setShowKeywordPopper(true);

    // We'll position the popper near the selection
    // We'll pass these offsets via style or store them in state
    // so the popper can position above the text
  };

  //
  // handleQuillChange is the main text change handler for Quill
  //
  const handleQuillChange = (content: string) => {
    setDraftText(content);
  };

  //
  // Adding/Removing a Keyword in Quill
  //
  const addKeyword = (quill: any) => {
    // highlight the selection with the 'keyword' format
    quill.formatText(selectionIndex, selectionLength, 'keyword', true);

    // also push that substring into `editingKeywords`
    const substring = quill.getText(selectionIndex, selectionLength);
    setEditingKeywords((prev) => [...prev, substring]);

    // hide the popper
    setShowKeywordPopper(false);
  };

  const removeKeyword = (quill: any) => {
    // un‐highlight the selection
    quill.formatText(selectionIndex, selectionLength, 'keyword', false);

    // remove that substring from editingKeywords
    const substring = quill.getText(selectionIndex, selectionLength);
    setEditingKeywords((prev) => prev.filter((kw) => kw !== substring));

    setShowKeywordPopper(false);
  };

  // We will attach a small ref to Quill
  const quillRef = useRef<ReactQuill>(null);

  // We'll create a Popper that points to our "selectionAnchor" (a DOM Range).
  // However, DOM Ranges aren't typical "anchorEl", so we do a trick: we create an empty hidden span near the selection:
  const [popperPos, setPopperPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  useEffect(() => {
    if (!selectionAnchor || !showKeywordPopper) return;

    // We can approximate the selection's bounding box from the Quill's bounding rect
    // + the results of editor.getSelectionBounds()
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const bounds = editor.getSelectionBounds(selectionIndex, selectionLength);
      const containerRect = editor.editor.container.getBoundingClientRect();

      setPopperPos({
        left: containerRect.left + bounds.left,
        top: containerRect.top + bounds.top - 40, // 40px above
      });
    }
  }, [selectionAnchor, showKeywordPopper, selectionIndex, selectionLength]);

  useEffect(() => {
    console.log('Script updated:', script); // Debug log
    setMessages(script);
  }, [script]);

  // ----------------------------
  //  Render
  // ----------------------------
  return (
    <Card
      sx={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        mx: 4,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        borderRadius: 2,
      }}
    >
      <CardHeader
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          py: 1.5,
          px: 3,
          bgcolor: '#F9FAFB',
        }}
        title={
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Customer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trainee
            </Typography>
          </Stack>
        }
      />

      <CardContent
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 3,
          py: 2,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {dragOverIndex === 0 && (
          <Box sx={{ height: 3, bgcolor: 'secondary.main', my: 1, borderRadius: 2 }} />
        )}

        {messages.map((msg, i) => {
          const isEditing = editingId === msg.id;

          return (
            <React.Fragment key={msg.id}>
              <Box
                ref={(el) => (messageRefs.current[i] = el)}
                sx={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'Customer' ? 'flex-start' : 'flex-end',
                  mb: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ maxWidth: '70%' }}>
                  {/* Customer avatar on left */}
                  {msg.role === 'Customer' && (
                    <Avatar sx={{ bgcolor: '#E7E7E7' }}>
                      <MicIcon fontSize="small" />
                    </Avatar>
                  )}

                  {/* Bubble + hover icons */}
                  <Box
                    sx={{
                      position: 'relative',
                      ...(msg.role === 'Customer'
                        ? { pr: '3rem' }
                        : { pl: '3rem' }),
                      '&:hover .action-buttons': {
                        opacity: 1,
                        visibility: 'visible',
                      },
                    }}
                  >
                    <Box
                      className="action-buttons"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        display: 'flex',
                        gap: 0.5,
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'opacity 0.2s',
                        ...(msg.role === 'Customer'
                          ? { right: '-6rem' }
                          : { left: '-6rem' }),
                      }}
                    >
                      {msg.role === 'Customer' ? (
                        <>
                          <IconButton
                            size="small"
                            draggable
                            onDragStart={(e) => handleDragStart(e, msg.id, i)}
                            onDragEnd={handleDragEnd}
                          >
                            <DragIndicatorIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteMessage(msg.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton size="small">
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteMessage(msg.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            draggable
                            onDragStart={(e) => handleDragStart(e, msg.id, i)}
                            onDragEnd={handleDragEnd}
                          >
                            <DragIndicatorIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>

                    {/* Bubble */}
                    {!isEditing ? (
                      <MessageBubble
                        className="bubble-content"
                        onClick={() => handleClickMessage(msg, i)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: msg.role === 'Customer' ? '#F9FAFB' : '#F5F6FF',
                          borderTopRightRadius: msg.role === 'Trainee' ? 0 : undefined,
                          borderTopLeftRadius: msg.role === 'Customer' ? 0 : undefined,
                        }}
                        // Dangerously set the HTML since Quill content is HTML
                      >
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.message) }} />
                      </MessageBubble>
                    ) : (
                      <MessageBubble
                        className="bubble-content"
                        sx={{
                          minWidth: editingMinWidth,
                          bgcolor: '#fff',
                          borderColor: 'primary.main',
                          borderWidth: 1,
                          borderStyle: 'solid',
                          boxShadow: theme.shadows[1],
                        }}
                      >
                        {/* QUILL Editor */}
                        <ReactQuill
                          ref={quillRef}
                          value={draftText}
                          onChange={handleQuillChange}
                          onChangeSelection={handleQuillChangeSelection}
                          modules={modules}
                          formats={formats}
                          theme="snow"
                          style={{
                            // override the default quill editor bg
                            backgroundColor: 'inherit',
                            border: 'none',
                          }}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleSaveEdit(msg.id)}
                            disabled={!hasChanged}
                            sx={{ textTransform: 'none' }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleCancelEdit}
                            sx={{ textTransform: 'none' }}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </MessageBubble>
                    )}
                  </Box>

                  {/* Trainee avatar on right */}
                  {msg.role === 'Trainee' && (
                    <Avatar
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                      sx={{ width: 32, height: 32 }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Insertion line if dropping below this message */}
              {dragOverIndex === i + 1 && (
                <Box sx={{ height: 3, bgcolor: 'secondary.main', my: 1, borderRadius: 2 }} />
              )}
            </React.Fragment>
          );
        })}
      </CardContent>

      {/* Footer */}
      <CardActions
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          p: 2,
          px: 3,
          bgcolor: '#F9FAFB',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ width: '100%' }} alignItems="center">
          <Button
            variant="outlined"
            onClick={toggleRole}
            endIcon={<RefreshIcon />}
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              minWidth: 120,
              textTransform: 'none',
              bgcolor: 'background.paper',
            }}
          >
            {currentRole}
          </Button>
          <TextField
            fullWidth
            size="small"
            placeholder="Type in your script..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 2,
              },
            }}
          />
          <IconButton sx={{ bgcolor: 'background.paper' }}>
            <MicIcon />
          </IconButton>
          <IconButton
            onClick={handleSendMessage}
            sx={{
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </CardActions>

      {/* Keyword Popper */}
      <Popper
        open={showKeywordPopper}
        anchorEl={keywordPopperRef.current} // not used in a standard way
        style={{
          position: 'absolute',
          left: popperPos.left,
          top: popperPos.top,
          zIndex: 1300,
        }}
      >
        <Box
          sx={{
            p: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: theme.shadows[2],
            display: 'flex',
            gap: 1,
          }}
        >
          {isAlreadyKeyword ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) removeKeyword(quill);
              }}
            >
              Remove Keyword
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                if (quill) addKeyword(quill);
              }}
            >
              Add Keyword
            </Button>
          )}
        </Box>
      </Popper>
    </Card>
  );
};

export default ScriptEditor;