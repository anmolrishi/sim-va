import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  SmartToy as SmartToyIcon,
  Phone,
  Pause,
  CallEnd,
} from '@mui/icons-material';
import { RetellWebClient } from 'retell-client-js-sdk';

interface Message {
  speaker: 'customer' | 'trainee';
  text: string;
}

interface SimulationStartPageProps {
  simulationId: string;
  simulationName: string;
  level: string;
  simType: string;
  attemptType: string;
  onBackToList: () => void;
}

const webClient = new RetellWebClient();

const SimulationStartPage: React.FC<SimulationStartPageProps> = ({
  simulationId,
  simulationName,
  level,
  simType,
  attemptType,
  onBackToList,
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const previousTranscriptRef = useRef<{ role: string; content: string }[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    webClient.on('conversationStarted', () => {
      console.log('Conversation started');
    });

    webClient.on('conversationEnded', ({ code, reason }) => {
      console.log('Conversation ended:', code, reason);
      setIsCallActive(false);
    });

    webClient.on('error', (error) => {
      console.error('WebRTC error:', error);
      setIsCallActive(false);
    });

    webClient.on('update', (update) => {
      if (update.transcript) {
        const newTranscript = update.transcript;
        const previousTranscript = previousTranscriptRef.current || [];

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const newTranscriptLength = newTranscript.length;
          const prevTranscriptLength = previousTranscript.length;

          if (newTranscriptLength === 0) return updatedMessages;

          if (newTranscriptLength > prevTranscriptLength) {
            const newMsg = newTranscript[newTranscriptLength - 1];
            updatedMessages.push({
              speaker: newMsg.role === 'agent' ? 'customer' : 'trainee',
              text: newMsg.content,
            });
          } else if (newTranscriptLength === prevTranscriptLength) {
            const newMsg = newTranscript[newTranscriptLength - 1];
            const lastMsgIndex = updatedMessages.length - 1;

            if (lastMsgIndex >= 0) {
              const lastMsg = updatedMessages[lastMsgIndex];
              if (lastMsg.speaker === (newMsg.role === 'agent' ? 'customer' : 'trainee')) {
                updatedMessages[lastMsgIndex].text = newMsg.content;
              } else {
                updatedMessages.push({
                  speaker: newMsg.role === 'agent' ? 'customer' : 'trainee',
                  text: newMsg.content,
                });
              }
            }
          }

          return updatedMessages;
        });

        previousTranscriptRef.current = newTranscript;
      }
    });

    return () => {
      webClient.stopCall();
    };
  }, []);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      setIsCallActive(true);
      setMessages([{
        speaker: 'customer',
        text: 'Connecting...'
      }]);

      const response = await axios.post('/api/simulations/start-audio-preview', {
        user_id: 'user123',
        sim_id: '67979f3e44831733ed7d9ee6'
      });

      if (response.data.access_token) {
        await webClient.startCall({
          accessToken: response.data.access_token
        });
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      setIsCallActive(false);
      setMessages([]);
    } finally {
      setIsStarting(false);
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
          {!isCallActive ? (
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
                Press start to attempt the Audio Simulation
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon sx={{ color: "#DEE2FD" }} />}
                onClick={handleStart}
                disabled={isStarting}
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
                {isStarting ? 'Starting...' : 'Start Simulation'}
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
                  '&:hover': {
                    bgcolor: '#002ed4',
                  }
                }}
              >
                Back to Sim List
              </Button>
            </Box>
          ) : (
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
          )}
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            maxWidth: 900,
            margin: '0 auto',
            p: 2,
            bgcolor: "#F9FAFB",
            borderTop: "1px solid #E5E7EB",
            borderRadius: 3,
          }}
        >
          <IconButton
            sx={{
              bgcolor: "#D8F3D2",
              "&:hover": { bgcolor: "#D8F3D2" },
              mr: 1,
            }}
          >
            <Phone sx={{ color: "#2E7D16" }} />
          </IconButton>

          <Typography variant="subtitle1" sx={{ color: "black", flexGrow: 1 }}>
            <span style={{ fontWeight: "normal" }}>Call with </span>
            <span style={{ fontWeight: "bold" }}>Lewis Simmons</span>
            <span style={{ fontWeight: "normal" }}> 00:21</span>
          </Typography>




          <IconButton
            sx={{
              bgcolor: "#EFF1FA",
              "&:hover": { bgcolor: "#EFF1FA" },
              ml: 2,
            }}
          >
            <Pause sx={{ color: "#343F8A" }} />
          </IconButton>

          <IconButton
            sx={{
              bgcolor: "#E6352B",
              "&:hover": { bgcolor: "#E6352B" },
            }}
          >
            <CallEnd sx={{ color: "white" }} />
          </IconButton>
        </Stack>
      </Card>
    </Box>
  );
};

export default SimulationStartPage;