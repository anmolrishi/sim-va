import { useState, useEffect, useRef } from "react";
import { Stack, Typography, Box, List, ListItem, ListItemText, Card, styled, Button } from '@mui/material';
import axios from 'axios';
import AdvancedSettings from './AdvancedSetting';
import VoiceAndScoreSettings from './VoiceScoreSetting';
import PreviewTab from '../PreviewTab';

const NavItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#F5F6FF',
  },
}));

interface SettingsTabProps {
  simulationId?: string;
  prompt?: string;
  simulationType?: string;
  simulationData?: {
    name: string;
    division: string;
    department: string;
    tags: string[];
    simulationType: string;
  };
  onPublish?: () => void;
  script?: any[];
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  simulationId,
  prompt,
  simulationType = 'audio',
  simulationData,
  onPublish,
  script
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [publishedSimId, setPublishedSimId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("Simulation Type");
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Smoothly scroll to a section when clicked
  const scrollToSection = (sectionId: string) => {
    if (mainContentRef.current) {
      const section = mainContentRef.current.querySelector(
        `[data-section="${sectionId}"]`
      );
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // When section is changed, scroll to it
  useEffect(() => {
    scrollToSection(activeSection);
  }, [activeSection]);

  // Check if the simulation is a visual type
  const isVisualType = simulationType?.includes('visual');

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
        if (onPublish) {
          onPublish();
        }
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
        simulationType={simulationType as 'audio' | 'chat'}
      />
    );
  }

  // Build navigation items based on simulation type
  const getNavigationItems = () => {
    // Core items for all simulation types
    const coreItems = [
      "Simulation Type",
      "Hide Agent Script",
      "Hide Customer Script",
      "Hide Keyword Scores",
      "Hide Sentiment Scores",
      "Enable Post Simulations Survey",
      "AI Powered Pauses and Feedback",
      "Estimated Time to Attempt",
      "Key Objectives",
      "Quick Tips",
      "Overview Video",
    ];
    
    // Add visual-specific items for visual types
    if (isVisualType) {
      coreItems.splice(4, 0, "Hide Highlights");
      coreItems.splice(5, 0, "Hide Coaching Tips");
    } else {
      // For non-visual types, add their specific items
      coreItems.splice(5, 0, "Hide Coaching Tips");
    }
    
    return coreItems;
  };

  // Voice items are the same for all types
  const voiceItems = ["AI Customer Voice", "Conversation Prompt"];
  
  // Score items are the same for all types
  const scoreItems = [
    "Simulation Completion",
    "Number of Repetition Allowed",
    "Simulation Scoring Metrics",
    "Sym Practice"
  ];

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
              Manage your {isVisualType ? "hotspot, " : ""}score, voice, and simulation settings
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

                <List disablePadding>
                  {getNavigationItems().map((item) => (
                    <NavItem
                      key={item}
                      button
                      className={item === activeSection ? 'active' : ''}
                      sx={{
                        textAlign: "left",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        ...(item === activeSection && {
                          border: "1px solid #0037ff",
                          color: "#0037ff",
                          backgroundColor: "transparent"
                        })
                      }}
                      onClick={() => setActiveSection(item)}
                    >
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: item === activeSection ? 600 : 400,
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
                  {voiceItems.map((item) => (
                    <NavItem
                      key={item}
                      button
                      className={item === activeSection ? 'active' : ''}
                      sx={{
                        textAlign: "left",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        ...(item === activeSection && {
                          border: "1px solid #0037ff",
                          color: "#0037ff",
                          backgroundColor: "transparent"
                        })
                      }}
                      onClick={() => setActiveSection(item)}
                    >
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: item === activeSection ? 600 : 400,
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
                  {scoreItems.map((item) => (
                    <NavItem
                      key={item}
                      button
                      className={item === activeSection ? 'active' : ''}
                      sx={{
                        textAlign: "left",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        ...(item === activeSection && {
                          border: "1px solid #0037ff",
                          color: "#0037ff",
                          backgroundColor: "transparent"
                        })
                      }}
                      onClick={() => setActiveSection(item)}
                    >
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: item === activeSection ? 600 : 400,
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
            ref={mainContentRef}
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
            <Typography variant="h6" sx={{ mt: 2, mb: 4, color: "#666666" }}>
              {simulationType?.includes('visual')
                ? "Visual Simulation Settings"
                : simulationType === 'audio'
                ? "Audio Simulation Settings"
                : "Chat Simulation Settings"}
            </Typography>
            
            <AdvancedSettings 
              // Pass properly structured settings object with default values
              settings={{
                simulationType: simulationType || 'audio',
                levels: {
                  hideAgentScript: { lvl1: false, lvl2: false, lvl3: false },
                  hideCustomerScript: { lvl1: false, lvl2: false, lvl3: false },
                  hideKeywordScores: { lvl1: false, lvl2: false, lvl3: false },
                  hideSentimentScores: { lvl1: true, lvl2: true, lvl3: false },
                  hideHighlights: { lvl1: false, lvl2: false, lvl3: false },
                  hideCoachingTips: { lvl1: true, lvl2: true, lvl3: false },
                  enablePostSurvey: { lvl1: true, lvl2: false, lvl3: false },
                  aiPoweredPauses: { lvl1: true, lvl2: true, lvl3: false }
                },
                estimatedTime: { enabled: true, value: '15 mins' },
                objectives: { 
                  enabled: true, 
                  text: '1: Learn basic customer service.\n2: Understand refund process.' 
                },
                quickTips: { 
                  enabled: true, 
                  text: '1: Listen to the customer carefully.\n2: Be polite and empathetic.\n3: Provide accurate information.' 
                },
                overviewVideo: { enabled: false }
              }}
              onSettingsChange={() => {}}
              simulationType={simulationType}
              activeSection={activeSection}
            />
            
            <VoiceAndScoreSettings 
              // Pass properly structured settings object with default values
              prompt={prompt}
              settings={{
                voice: {
                  language: 'English',
                  accent: 'American',
                  gender: 'Male',
                  ageGroup: 'Middle Aged',
                  voiceId: ''
                },
                scoring: {
                  simulationScore: 'best',
                  keywordScore: '20',
                  clickScore: '80',
                  practiceMode: 'limited',
                  repetitionsAllowed: '3',
                  repetitionsNeeded: '2',
                  scoringMetrics: {
                    enabled: true,
                    keywordScore: '20%',
                    clickScore: '80%'
                  }
                }
              }}
              onSettingsChange={() => {}}
              activeSection={activeSection}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default SettingsTab;