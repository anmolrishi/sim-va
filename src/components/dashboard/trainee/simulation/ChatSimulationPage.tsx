import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  Avatar,
  TextField,
  IconButton,
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Send as SendIcon,
} from '@mui/icons-material';

interface Message {
  speaker: 'customer' | 'trainee';
  text: string;
}

interface ChatSimulationPageProps {
  simulationId: string;
  simulationName: string;
  level: string;
  simType: string;
  attemptType: string;
  onBackToList: () => void;
}

const ChatSimulationPage: React.FC<ChatSimulationPageProps> = ({
  simulationId,
  simulationName,
  level,
  simType,
  attemptType,
  onBackToList,
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStart = async () => {
    setIsStarted(true);
    try {
      const response = await axios.post('/api/simulations/start-chat-preview', {
        user_id: 'user123',
        sim_id: simulationId,
        message: ''
      });

      if (response.data.response) {
        setMessages([{
          speaker: 'customer',
          text: response.data.response
        }]);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      setIsStarted(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      speaker: 'trainee',
      text: inputMessage.trim()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/simulations/start-chat-preview', {
        user_id: 'user123',
        sim_id: simulationId,
        message: inputMessage.trim()
      });

      if (response.data.response) {
        setMessages(prev => [...prev, {
          speaker: 'customer',
          text: response.data.response
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100vh', bgcolor: 'white', py: 0, px: 0 }}>
      {/* Header */}
      <Box sx={{ maxWidth: '900px', mx: 'auto', borderRadius: '16px' }}>
        <Stack
          direction="row"
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#F9FAFB',
            borderRadius: '16px',
            gap: "20px",
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="body2" color="text.main" sx={{ borderRadius: '8px', padding: '4px 8px' }}>
            {simulationName}
          </Typography>
          <Typography variant="body2" color="text.main" sx={{ backgroundColor: '#ECEFF3', borderRadius: '12px', padding: '4px 8px' }}>
            {level}
          </Typography>
          <Typography variant="body2" color="text.main" sx={{ backgroundColor: '#ECEFF3', borderRadius: '12px', padding: '4px 8px' }}>
            Sim Type: {simType}
          </Typography>
          <Typography variant="body2" color="text.main" sx={{ backgroundColor: '#ECEFF3', borderRadius: '12px', padding: '4px 8px' }}>
            {attemptType} Attempt
          </Typography>
          <Typography variant="body2" color="text.main" sx={{ backgroundColor: '#ECEFF3', borderRadius: '12px', padding: '4px 8px', ml: 'auto', color: "#0037ff" }}>
            00:00
          </Typography>
        </Stack>
      </Box>

      <Card sx={{ maxWidth: '900px', minHeight: '600px', mx: 'auto', mt: 1, borderRadius: '16px' }}>
        <Box sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
          <Typography variant="subtitle2" color="text.secondary">Trainee</Typography>
        </Box>

        <Box sx={{ position: 'relative', height: 'calc(100vh - 200px)' }}>
          {!isStarted ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              width: "50%",
              mx: 'auto',
              my: 10,
              border: "1px solid #DEE2FD",
              borderRadius: 4
            }}>
              <Box sx={{
                bgcolor: '#f5f7ff',
                borderRadius: '50%',
                p: 2,
                mb: 2,
              }}>
                <SmartToyIcon sx={{ fontSize: 48, color: '#DEE2FD' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1 }}>
                Start Simulation
              </Typography>
              <Typography sx={{ color: '#666', mb: 4 }}>
                Press start to attempt the Chat Simulation
              </Typography>
              <Button
                variant="contained"
                startIcon={<SmartToyIcon />}
                onClick={handleStart}
                sx={{
                  bgcolor: '#0037ff',
                  color: 'white',
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '16px',
                  '&:hover': {
                    bgcolor: '#002ed4',
                  }
                }}
              >
                Start Simulation
              </Button>
              <Button
                variant="text"
                onClick={onBackToList}
                sx={{
                  mt: 2,
                  color: '#666',
                  textTransform: 'none',
                  border: "1px solid #DEE2FD",
                  px: 8,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '16px',
                }}
              >
                Back to Sim List
              </Button>
            </Box>
          ) : (
            <>
              <Box
                ref={chatContainerRef}
                sx={{
                  height: 'calc(100% - 80px)',
                  overflowY: 'auto',
                  px: 3,
                  py: 2,
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                }}
              >
                <Stack spacing={2}>
                  {messages.map((message, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={2}
                      justifyContent={message.speaker === 'customer' ? 'flex-start' : 'flex-end'}
                      alignItems="flex-start"
                    >
                      {message.speaker === 'customer' && (
                        <Avatar sx={{ width: 32, height: 32 }}>C</Avatar>
                      )}
                      <Box
                        sx={{
                          maxWidth: '70%',
                          bgcolor: '#FAFAFF',
                          p: 2,
                          borderRadius: 3,
                          border: '2px solid #6D7295',
                          borderTopLeftRadius: message.speaker === 'customer' ? 0 : 3,
                          borderTopRightRadius: message.speaker === 'trainee' ? 0 : 3,
                        }}
                      >
                        <Typography variant="body1">{message.text}</Typography>
                      </Box>
                      {message.speaker === 'trainee' && (
                        <Avatar
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                          sx={{ width: 32, height: 32 }}
                        />
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'white',
                  display: 'flex',
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  sx={{
                    bgcolor: '#444CE7',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#3538CD',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#F5F6FF',
                      color: '#444CE7',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ChatSimulationPage;