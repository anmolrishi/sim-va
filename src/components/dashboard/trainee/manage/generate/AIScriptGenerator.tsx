import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon, History } from '@mui/icons-material';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';

interface Message {
  id: string;
  role: 'Customer' | 'Trainee';
  message: string;
  keywords: string[];
}

interface Prompt {
  id: string;
  text: string;
}

const recentPrompts: Prompt[] = [
  {
    id: '1',
    text: 'Generate a script for handling customer complaints about delayed delivery',
  },
  {
    id: '2',
    text: 'Create a script for product return and refund process',
  },
  {
    id: '3',
    text: 'Write a script for new customer onboarding process',
  },
  {
    id: '4',
    text: 'Generate a script for technical support troubleshooting',
  },
];

const loadingMessages = [
  'Processing your prompt...',
  'Analyzing customer context...',
  'Processing sentiments...',
  'Generating script...',
];

interface AIScriptGeneratorProps {
  onScriptGenerated: (script: Message[]) => void;
}

const AIScriptGenerator: React.FC<AIScriptGeneratorProps> = ({ onScriptGenerated }) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingInterval = useRef<NodeJS.Timeout>();

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const cycleLoadingMessage = () => {
    setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    loadingInterval.current = setInterval(cycleLoadingMessage, 2000);

    try {
      // Make the API call
      const response = await axios.post('/api/convert/text-to-script', {
        user_id: user?.id || 'user123',
        prompt: prompt,
      });

      // const response = await axios.post('https://everise-backend.replit.app/convert/text-to-script', {
      //   id: 'user123',
      //   prompt: prompt,
      // }, {
      //   headers: {
      //     'Access-Control-Allow-Origin': '*',
      //     'Content-Type': 'application/json'
      //   }
      // });

      // Transform API response into the correct Message format
      if (response.data && Array.isArray(response.data.script)) {
        const transformedScript: Message[] = response.data.script.map((item: any, index: number) => ({
          id: String(Date.now() + index), // Ensure unique IDs
          role: item.role || 'Trainee',
          message: item.message || '',
          keywords: item.keywords || [],
        }));

        // Pass the transformed script to parent
        onScriptGenerated(transformedScript);
      } else {
        // If API doesn't return expected format, create a fallback message
        const fallbackScript: Message[] = [
          {
            id: String(Date.now()),
            role: 'Trainee',
            message: 'I apologize, but I couldn\'t generate a proper script. Please try again.',
            keywords: [],
          },
        ];
        onScriptGenerated(fallbackScript);
      }
    } catch (error) {
      console.error('Error generating script:', error);
      // Handle error by showing an error message in the script
      const errorScript: Message[] = [
        {
          id: String(Date.now()),
          role: 'Trainee',
          message: 'An error occurred while generating the script. Please try again.',
          keywords: [],
        },
      ];
      onScriptGenerated(errorScript);
    } finally {
      setIsLoading(false);
      if (loadingInterval.current) {
        clearInterval(loadingInterval.current);
      }
    }
  };

  return (
    <Box sx={{ height: "70vh", px: 4, bgcolor: "#fff", borderRadius: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Box sx={{ border: "1px solid #CFD1DC", p: 4, bgcolor: "#fff", borderRadius: 4, height: "100%", width: "80%" }}>
        <Stack spacing={4} sx={{ height: "100%" }}>
          {/* Header */}
          <Stack spacing={0}>
            <Typography
              variant="h1"
              sx={{
                fontSize: "2.5rem",
                fontWeight: 800,
                background: "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Hello, {user?.name || "User"}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: "2.5rem",
                color: "#CFD1DC",
                fontWeight: 800,
              }}
            >
              How can I help you today?
            </Typography>
          </Stack>

          {/* Recent Prompts */}
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <History sx={{ color: "#CFD1DC" }} />
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(0, 0, 0, 0.6)",
                  fontWeight: 500,
                }}
              >
                Recently Used
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 2,
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {recentPrompts.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 3,
                    minWidth: 260,
                    bgcolor: "#FAFBFF",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderRadius: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative", // Ensures absolute positioning works inside
                    "&:hover": {
                      borderColor: "#4F46E5",
                      bgcolor: "#FAFBFF",
                    },
                  }}
                  onClick={() => handlePromptSelect(item.text)}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#3F4572",
                      pr: 2,
                    }}
                  >
                    {item.text}
                  </Typography>

                  {/* Circular Box with Icon in Bottom Right */}
                  <Box
                    component="span"
                    sx={{
                      position: "absolute", // Positions it inside the Paper
                      bottom: "10px", // Adjust as needed
                      right: "10px", // Adjust as needed
                      color: "#3F4572",
                      bgcolor: "white",
                      display: "inline-flex",
                      width: "50px", // Adjust size as needed
                      height: "50px", // Ensure width and height are the same
                      borderRadius: "50%", // Makes it a circle
                      alignItems: "center", // Center content vertically
                      justifyContent: "center", // Center content horizontally
                      boxShadow: 1, // Optional shadow for better visibility
                      "& svg": {
                        fontSize: "1.3rem",
                      },
                    }}
                  >
                    <DrawOutlinedIcon />
                  </Box>
                </Paper>

              ))}
            </Box>
          </Stack>

          {/* Loading indicator */}
          {isLoading && (
            <Paper
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: "rgba(79, 70, 229, 0.05)",
                borderRadius: 3,
                border: "1px solid rgba(79, 70, 229, 0.1)",
              }}
            >
              <CircularProgress size={24} sx={{ color: "#4F46E5" }} />
              <Typography sx={{ color: "#4F46E5" }}>{loadingMessages[loadingMessageIndex]}</Typography>
            </Paper>
          )}


        </Stack>

        {/* Input Area */}
        <Box mt={-5} >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: 2,
              bgcolor: "rgba(79, 70, 229, 0.03)",
              borderRadius: 4,
              p: 0.5,
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt for our script..."
              variant="standard"
              sx={{
                px: 3, py: 1,
                "& .MuiInput-root": {
                  fontSize: "1rem",
                  "&:before, &:after": {
                    display: "none",
                  },
                },
              }}
            />
            <IconButton
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              sx={{ color: "#3F4572" }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>

      </Box>


    </Box>
  );
};

export default AIScriptGenerator;