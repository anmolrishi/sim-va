import { useState } from "react";
import { Stack, Typography, Box, List, ListItem, ListItemText, Card, styled, Button } from '@mui/material';
import axios from 'axios';
import AdvancedSettings from './AdvancedSetting';
import VoiceAndScoreSettings from './VoiceScoreSetting';
import PreviewTab from '../PreviewTab';

const NavItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  '&:hover': {
    backgroundColor: '#F5F6FF',
  },
  '&.active': {
    backgroundColor: '#F5F6FF',
    color: '#444CE7',
  },
}));

interface SettingsTabProps {
  simulationId?: string;
  prompt?: string;
  simulationType?: 'audio' | 'chat';
  simulationData?: {
    name: string;
    division: string;
    department: string;
    tags: string[];
    simulationType: string;
  };
  script?: any[];
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  simulationId,
  prompt,
  simulationType = 'audio',
  simulationData,
  script
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [publishedSimId, setPublishedSimId] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!simulationId || !simulationData) return;

    setIsPublishing(true);
    try {
      // Transform script to required format by removing 'id' field
      const transformedScript = script?.map(({ id, ...rest }) => ({
        ...rest,
        script_sentence: rest.message,
        role: rest.role.toLowerCase() === 'trainee' ? 'assistant' : rest.role.toLowerCase()
      }));

      const payload = {
        user_id: "userId1",
        name: simulationData.name,
        division_id: simulationData.division,
        department_id: simulationData.department,
        type: simulationData.simulationType.toLowerCase(),
        tags: simulationData.tags,
        status: "published",
        lvl1: {
          is_enabled: true,
          enable_practice: true,
          hide_agent_script: false,
          hide_customer_script: false,
          hide_keyword_scores: false,
          hide_sentiment_scores: true,
          hide_highlights: false,
          hide_coaching_tips: true,
          enable_post_simulation_survey: true,
          ai_powered_pauses_and_feedback: true
        },
        lvl2: {
          is_enabled: false
        },
        lvl3: {
          is_enabled: false
        },
        estimated_time_to_attempt_in_mins: 15,
        key_objectives: [
          "Learn basic customer service",
          "Understand refund process"
        ],
        overview_video: "https://example.com/overview.mp4",
        quick_tips: [
          "Listen to the customer carefully.",
          "Be polite and empathetic.",
          "Provide accurate information."
        ],
        voice_id: "11labs-Adrian",
        language: "English",
        mood: "Neutral",
        voice_speed: "Normal",
        prompt: prompt,
        simulation_completion_repetition: 3,
        simulation_max_repetition: 5,
        final_simulation_score_criteria: "Best of three",
        simulation_scoring_metrics: {
          is_enabled: true,
          keyword_score: 20,
          click_score: 80
        },
        sim_practice: {
          is_unlimited: false,
          pre_requisite_limit: 3
        },
        is_locked: false,
        version: 1,
        script: transformedScript
      };

      const response = await axios.put(
        `/api/simulations/${simulationId}/update`,
        payload
      );

      console.log(response.data);
      
      if (response.data.status === 'success') {
        setPublishedSimId(simulationId);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error publishing simulation:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (showPreview && publishedSimId) {
    return (
      <PreviewTab 
        simulationId={publishedSimId}
        simulationType={simulationType}
      />
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#F9FAFB',
        py: 0,
        px: 0,
        height: "100vh"
      }}
    >
      <Stack spacing={1}>
        {/* Header Section */}
        <Card
          elevation={2}
          sx={{
            px: 4,
            py: 3,
            bgcolor: '#FFFFFF',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h5">Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your hotspot, score, voice, and simulation settings
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handlePublish}
            disabled={isPublishing}
            sx={{
              bgcolor: '#444CE7',
              '&:hover': { bgcolor: '#3538CD' },
              borderRadius: 2,
              px: 4,
            }}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </Card>

        {/* Content Section */}
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row-reverse',
            gap: 4,
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          {/* Sidebar */}
          <Card
            elevation={2}
            sx={{
              width: 350,
              height: 660,
              bgcolor: '#FFFFFF',
              borderRadius: 2,
              py: 1,
              px: 4,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none',
            }}
          >
            <Stack spacing={3}>
              {/* Advanced Settings Navigation */}
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight="500" sx={{ color: "#666666" }}>
                  Advance Settings
                </Typography>
                <Button
                  onClick={() => {
                    console.log("Practice mode set to 'limited'");
                  }}
                  sx={{
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: "#143FDA",
                    color: "#143FDA",
                    backgroundColor: "transparent",
                    width: "65%",
                    justifyContent: "center",
                    "&:hover": {
                      borderColor: "#143FDA",
                      color: "#143FDA",
                    },
                  }}
                >
                  Simulation Type
                </Button>

                <List disablePadding>
                  {[
                    'Hide Agent Script',
                    'Hide Customer Script',
                    'Hide Keyword Scores',
                    'Hide Sentiment Scores',
                    'Hide Highlights',
                    'Hide Coaching Tips',
                    'Enable Post Simulations Survey',
                    'AI Powered Pauses and Feedback',
                    'Estimated Time to Attempt',
                    'Key Objectives',
                    'Quick Tips',
                    'Overview Video',
                  ].map((item) => (
                    <NavItem
                      key={item}
                      button
                      className={item === 'Simulation Type' ? 'active' : ''}
                      sx={{
                        textAlign: "left",
                        padding: "8px 0",
                      }}
                    >
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: item === 'Simulation Type' ? 600 : 400,
                        }}
                      />
                    </NavItem>
                  ))}
                </List>
              </Stack>

              {/* Voice & Prompt Settings Navigation */}
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight="500" sx={{ color: "#666666" }}>
                  Voice & Prompt Settings
                </Typography>
                <List disablePadding>
                  {['AI Customer Voice', 'Conversation Prompt'].map((item) => (
                    <NavItem
                      key={item}
                      button
                      sx={{
                        textAlign: "left",
                        padding: "8px 0",
                      }}
                    >
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: 'body2',
                        }}
                      />
                    </NavItem>
                  ))}
                </List>
              </Stack>

              {/* Score Settings Navigation */}
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight="500" sx={{ color: "#666666" }}>
                  Score Settings
                </Typography>
                <List disablePadding>
                  {['Simulation Completion', 'Number of Repetition Allowed', 'Simulation Scoring Metrics', 'Sym Practice'].map((item) => (
                    <NavItem
                      key={item}
                      button
                      sx={{
                        textAlign: "left",
                        padding: "8px 0",
                      }}
                    >
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: 'body2',
                        }}
                      />
                    </NavItem>
                  ))}
                </List>
              </Stack>
            </Stack>
          </Card>

          {/* Main Content */}
          <Box
            sx={{
              flex: 1,
              px: 10,
              height: 660,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none',
            }}
          >
            <AdvancedSettings />
            <VoiceAndScoreSettings prompt={prompt} />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default SettingsTab;