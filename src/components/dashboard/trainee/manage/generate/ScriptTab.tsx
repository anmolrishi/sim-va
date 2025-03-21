import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  TextField,
  IconButton,
  Link,
  Stack,
  Select,
  styled,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import {
  SmartToy,
  Description,
  Upload,
  AudioFile,
  Mic,
  PlayArrow,
  ChatBubble,
  Lock as LockIcon
} from '@mui/icons-material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import { useSimulationWizard } from '../../../../../context/SimulationWizardContext';
import AIScriptGenerator from './AIScriptGenerator';
import ScriptEditor from './ScriptEditor';
import axios from 'axios';

interface Message {
  id: string;
  role: 'Customer' | 'Trainee';
  message: string;
  keywords: string[];
}

interface ScriptTabProps {
  simulationType?: string;
  isLocked?: boolean;
}

const OptionCard = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
  border: '2px dashed #DEE2FC',
  borderRadius: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  minHeight: '320px',
  backgroundColor: '#FCFCFE',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: 'auto',
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  backgroundColor: '#E8EAFD',

  fontWeight: 600,
}));

const ScriptTab: React.FC<ScriptTabProps> = ({
  simulationType,
  isLocked = false,
}) => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showSavedScript, setShowSavedScript] = useState(false);
  const [currentRole, setCurrentRole] = useState<'Customer' | 'Trainee'>('Trainee');
  const [showBackButton, setShowBackButton] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const { scriptData, setScriptData } = useSimulationWizard();

  const handleScriptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show loading message
    const loadingScript: Message[] = [{
      id: String(Date.now()),
      role: 'Trainee',
      message: 'Processing file... Please wait.',
      keywords: [],
    }];
    setScriptData(loadingScript);

    try {
      const content = await file.text();

      // Parse the dialogue content
      const dialogueLines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.includes(':'));

      const messages: Message[] = dialogueLines.map((line, index) => {
        const [role, message] = line.split(':').map(part => part.trim());
        return {
          id: String(Date.now() + index),
          role: role === 'Customer' ? 'Customer' : 'Trainee',
          message: message,
          keywords: [],
        };
      });

      if (messages.length === 0) {
        throw new Error('No valid dialogue content found in the file. Please check the format.');
      }

      setScriptData(messages);

    } catch (error: any) {
      console.error('Error processing file:', error);
      const errorScript: Message[] = [{
        id: String(Date.now()),
        role: 'Trainee',
        message: `Error: ${error.message || 'Failed to process file. Please check the format and try again.'}`,
        keywords: [],
      }];
      setScriptData(errorScript);
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorScript: Message[] = [{
        id: String(Date.now()),
        role: 'Trainee',
        message: 'Error: File size exceeds 10MB limit. Please upload a smaller file.',
        keywords: [],
      }];
      setScriptData(errorScript);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', 'user123');
      formData.append('audio_file', file);

      // Show loading message
      const loadingScript: Message[] = [{
        id: String(Date.now()),
        role: 'Trainee',
        message: 'Processing audio file... This may take a few minutes.',
        keywords: [],
      }];
      setScriptData(loadingScript);

      // Make direct API call without /api prefix
      const response = await axios.post(
        'api/convert/audio-to-script',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
            console.log('Upload Progress:', percentCompleted + '%');
          }
        }
      );

      console.log('API Response:', response.data);

      if (response.data && Array.isArray(response.data.script)) {
        const transformedScript: Message[] = response.data.script.map((item: any, index: number) => ({
          id: String(Date.now() + index),
          role: item.role || 'Trainee',
          message: item.message || '',
          keywords: item.keywords || [],
        }));

        console.log('Transformed Script:', transformedScript);
        setScriptData(transformedScript);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error processing audio file:', error);

      let errorMessage = 'An error occurred while processing the audio file.';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'The request took too long to complete. Please try again with a smaller file or check your internet connection.';
      } else if (error.response) {
        errorMessage = `Server Error: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      const errorScript: Message[] = [{
        id: String(Date.now()),
        role: 'Trainee',
        message: `Error: ${errorMessage}`,
        keywords: [],
      }];

      setScriptData(errorScript);
    }
  };

  const handleTextInput = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: currentRole,
        message: inputMessage.trim(),
        keywords: [],
      };

      setScriptData((prev) => [...prev, newMessage]);
      setInputMessage('');
    }
  };

  const handleScriptGenerated = (script: Message[]) => {
    console.log('Received script:', script);
    setShowAIGenerator(false);
    setScriptData(script);
  };

  if (scriptData.length > 0 && !isLocked && !showSavedScript) {
    return (
      <Stack spacing={2}>
        <Button
          variant="text"
          onClick={() => {
            setScriptData([]);
            setShowAIGenerator(false);
          }}
          sx={{
            alignSelf: 'flex-start',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          ← Back to script options
        </Button>
        <ScriptEditor script={scriptData} onScriptUpdate={setScriptData} />
      </Stack>
    );
  }
  
  if (showSavedScript) {
    return <ScriptEditor script={scriptData} onScriptUpdate={setScriptData} />;
  }

  if (showAIGenerator) {
    return (
      <Stack spacing={2}>
        <Button
          variant="text"
          onClick={() => setShowAIGenerator(false)}
          sx={{
            alignSelf: 'flex-start',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          ← Back to script options
        </Button>
        <AIScriptGenerator onScriptGenerated={handleScriptGenerated} />
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      {isLocked && (
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{ 
            bgcolor: '#ECFDF3', 
            p: 2, 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: 1
          }}>
            <LockIcon sx={{ color: 'success.main' }} />
            <Typography color="success.main">
              Script is locked and ready for visuals
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setShowSavedScript(true)}
            sx={{
              bgcolor: '#444CE7',
              '&:hover': { bgcolor: '#3538CD' },
              borderRadius: 2,
              px: 4,
            }}
          >
            View Script
          </Button>
        </Stack>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 3,
        }}
      >
        <OptionCard sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '200px' }}>
          <SmartToy sx={{ fontSize: 80, color: '#DEE2FC', mb: 2 }} />  {/* Increased icon size */}
          <Typography variant="h5" sx={{ color: "#0F174F", mb: 2 }} gutterBottom fontWeight="800">
            Generate Script with AI
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 1,
                py: 0.5,
                bgcolor: '#343F8A',
                color: 'white',
                borderRadius: 5,
                fontSize: '0.75rem',
                verticalAlign: 'middle',
              }}
            >
              New
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "13px", mb: 2 }}>
            Generate script for {simulationType || 'simulation'} scenarios using SymAI
          </Typography>
          <ActionButton
            variant="contained"
            startIcon={<SmartToy />}
            sx={{
              bgcolor: '#001EEE',
              py: 2.7,
              '&:hover': { bgcolor: '#3538CD' },
              height: '40px',  // Consistent button height
              width: '300px',  // Fixed button width
              alignItems: 'center',
            }}
            onClick={() => setShowAIGenerator(true)}
          >
            Try Now
          </ActionButton>
        </OptionCard>

        <OptionCard sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '200px' }}>
          <Description sx={{ fontSize: 80, color: '#DEE2FC', mb: 2 }} />  {/* Increased icon size */}
          <Typography variant="h4" sx={{ color: "#0F174F", mb: 2 }} gutterBottom fontWeight="800">
            Upload Script
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "13px" }}>
            Simulation script as text in .doc, .docx
          </Typography>
          <Link
            href="#"
            color="text.secondary"

            sx={{
              mb: 0,
              display: 'block',
            }}
          >
            Download template
          </Link>
          <input
            type="file"
            accept=".txt"
            style={{ display: 'none' }}
            id="script-upload"
            onChange={handleScriptUpload}
          />
          <label htmlFor="script-upload">
            <ActionButton
              variant="outlined"
              component="span"
              startIcon={<Upload sx={{ fontSize: 30 }} />}
              sx={{
                color: '#001EEE', py: 2.7,
                borderColor: '#E8EAFD',
                '&:hover': {
                  borderColor: '#3538CD',
                  bgcolor: '#F5F6FF',
                },
                height: '40px',  // Consistent button height
                width: '300px',  // Fixed button width
                alignItems: 'center',
              }}
            >
              Upload Script
            </ActionButton>
          </label>
        </OptionCard>

        <OptionCard
          sx={{
            visibility: simulationType?.includes('audio') || simulationType?.includes('chat') ? 'visible' : 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '200px',  // Consistent card height
          }}
        >
          <AudioFile sx={{ fontSize: 80, color: '#DEE2FC', mb: 2 }} />  {/* Increased icon size */}
          <Typography variant="h4" sx={{ color: "#0F174F", mb: 2 }} gutterBottom fontWeight="800">
            Upload Audio
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "13px" }}>
            Simulation script as audio in .mp3 format
          </Typography>
          <input
            type="file"
            accept=".mp3"
            style={{ display: 'none' }}
            id="audio-upload"
            onChange={handleAudioUpload}
          />
          <label htmlFor="audio-upload">
            <ActionButton
              variant="outlined"
              component="span"
              startIcon={<Upload sx={{ fontSize: 30 }} />}
              sx={{
                color: '#001EEE', py: 2.7,
                borderColor: '#E8EAFD',
                '&:hover': {
                  borderColor: '#3538CD',
                  bgcolor: '#F5F6FF',
                },
                height: '40px',  // Consistent button height
                width: '300px',  // Fixed button width
                alignItems: 'center',
              }}
            >
              Upload Audio
            </ActionButton>
          </label>
        </OptionCard>


      </Box>

      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Stack>

      <Stack spacing={3}>
        <Button
          variant="outlined"
          startIcon={<ChatBubble />}
          sx={{
            py: 1,
            px: 3,
            borderRadius: 5,
            borderColor: '#DEE2FD',
            color: 'text.secondary',
            textTransform: 'none',
            alignSelf: 'center',
            '&:hover': {
              borderColor: '#DEE2FC',
              bgcolor: '#F5F6FF',
            },
          }}
        >
          Start adding script using the text editor below
        </Button>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            p: 2,
            bgcolor: '#FAFAFF',
            borderRadius: 5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as "Customer" | "Trainee")}
              size="small"
              sx={{
                minWidth: 120,
                bgcolor: "white",
                display: "flex",
                alignItems: "center",
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  pr: "32px !important", // Override default padding
                },
                // Remove default arrow icon
                "& .MuiSelect-icon": {
                  display: "none",
                },
              }}
              IconComponent={() => null} // This removes the default arrow icon
            >
              <MenuItem value="Customer">
                <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                  <SupportAgentIcon sx={{ color: "grey" }} />
                </ListItemIcon>
                Customer
                <ListItemIcon sx={{ minWidth: "auto", ml: "auto" }}>
                  <ManageHistoryIcon sx={{ color: "grey" }} />
                </ListItemIcon>
              </MenuItem>
              <MenuItem value="Trainee">
                <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                  <SupportAgentIcon sx={{ color: "grey" }} />
                </ListItemIcon>
                Trainee
                <ListItemIcon sx={{ minWidth: "auto", ml: "auto" }}>
                  <ManageHistoryIcon sx={{ color: "grey" }} />
                </ListItemIcon>
              </MenuItem>
            </Select>
          </Stack>
          <TextField
            fullWidth
            placeholder="Type in your script..."
            variant="outlined"
            size="small"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTextInput();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
              },
            }}
          />
          <IconButton onClick={handleTextInput}>
            <Mic />
          </IconButton>
          <IconButton onClick={handleTextInput}>
            <PlayArrow />
          </IconButton>
        </Box>
      </Stack>
    </Stack>
  );
};

export default ScriptTab;