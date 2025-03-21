import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Card, CardContent, Tabs, Tab, Button, Stack, styled } from '@mui/material';
import { createSimulation } from '../../../../../services/simulationCreate';
import type { CreateSimulationPayload } from '../../../../../services/simulationCreate';
import { Lock as LockIcon } from '@mui/icons-material';
import { SimulationWizardProvider, useSimulationWizard } from '../../../../../context/SimulationWizardContext';
import ScriptTab from './ScriptTab';
import VisualsTab from './VisualsTab';
import SettingsTab from './settingTab/SettingTab';
import PreviewTab from './PreviewTab';
import axios from 'axios';

interface TabState {
  script: boolean;
  visuals: boolean;
  settings: boolean;
  preview: boolean;
}

interface SimulationData {
  id: string;
  name: string;
  division: string;
  department: string;
  tags: string[];
  simulationType: 'audio' | 'chat' | 'visual-audio' | 'visual-chat' | 'visual';
}

interface Message {
  id: string;
  role: 'Customer' | 'Trainee';
  message: string;
  keywords: string[];
}

interface SimulationResponse {
  id: string;
  status: string;
  prompt: string;
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: '44px',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTabs-flexContainer': {
    marginBottom: '-1px',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: '44px',
  padding: '10px 20px',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  marginRight: '4px',
  color: theme.palette.text.secondary,
  boxShadow: '0 -1px 2px rgba(0,0,0,0.05)',
  '&.Mui-selected': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    fontWeight: 600,
    zIndex: 1,
  },
  '&:not(.Mui-selected)': {
    backgroundColor: '#F3F4F6',
  },
  '&.preview-tab': {
    opacity: 0.5,
    pointerEvents: 'none',
  },
}));

// Helper function to create simulation with FormData
const createSimulationWithFormData = async (formData: FormData) => {
  const response = await axios.post('/api/simulations/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const GenerateScriptContent = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const {
    scriptData,
    setScriptData,
    isScriptLocked,
    setIsScriptLocked,
    visualImages,
    setVisualImages,
    isPublished,
    setIsPublished,
    simulationResponse,
    setSimulationResponse
  } = useSimulationWizard();

  const [enabledTabs, setEnabledTabs] = useState<TabState>({
    script: true,
    visuals: false,
    settings: false,
    preview: false
  });
  const location = useLocation();
  const simulationData = location.state?.simulationData as SimulationData;
  const isVisualType = simulationData?.simulationType?.includes('visual');

  // Update enabled tabs based on state changes
  useEffect(() => {
    setEnabledTabs(prev => ({
      ...prev,
      visuals: isScriptLocked,
      settings: isScriptLocked && visualImages.length > 0,
      preview: isPublished
    }));
  }, [isScriptLocked, visualImages.length, isPublished]);

  // Get tabs based on simulation type
  const tabs = useMemo(() => {
    const baseTabs = [
      { label: 'Script', value: 0 }
    ];
    
    // Only add Visuals tab for visual types
    if (isVisualType) {
      baseTabs.push({ label: 'Visuals', value: 1 });
      baseTabs.push({ label: 'Settings', value: 2 });
      baseTabs.push({ label: 'Preview', value: 3 });
    } else {
      // For audio and chat, go straight from Script to Settings
      baseTabs.push({ label: 'Settings', value: 1 });
      baseTabs.push({ label: 'Preview', value: 2 });
    }
    
    return baseTabs;
  }, [isVisualType]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Check if the tab is enabled before allowing the change
    const tabKeys = ['script', 'visuals', 'settings', 'preview'];
    if (!enabledTabs[tabKeys[newValue]]) {
      return;
    }
    setTabValue(newValue);
  };

  const handleScriptLoad = useCallback((script: Message[]) => {
    setScriptData(script);
  }, [setScriptData]);

  // Modified to handle both visual and non-visual simulation types
  const handleContinue = async () => {
    if (!simulationData || !scriptData.length) return;

    if (!simulationData.division || !simulationData.department) {
      console.error('Missing required fields: division or department');
      return;
    }

    setIsLoading(true);
    
    try {
      // Lock the script for all types
      setIsScriptLocked(true);
      
      // For non-visual types (audio, chat), create simulation directly here
      if (!isVisualType) {
        // Transform script data to match API format
        const formattedScript = scriptData.map(msg => ({
          script_sentence: msg.message,
          role: msg.role.toLowerCase() === 'trainee' ? 'assistant' : msg.role.toLowerCase(),
          keywords: msg.keywords || []
        }));

        const payload: CreateSimulationPayload = {
          user_id: "user123", // This should come from your auth context
          name: simulationData.name,
          division_id: simulationData.division || '',
          department_id: simulationData.department || '',
          type: simulationData.simulationType.toLowerCase(),
          script: formattedScript,
          tags: simulationData.tags
        };

        const response = await createSimulation(payload);

        if (response.status === 'success') {
          setSimulationResponse({
            id: response.id,
            status: response.status,
            prompt: response.prompt
          });
          
          // Move to settings tab (skipping visuals) - for audio/chat this would be index 1
          const settingsTabIndex = tabs.findIndex(tab => tab.label === 'Settings');
          setTabValue(settingsTabIndex);
        }
      } 
      // For visual types, just move to visuals tab
      else {
        // Visuals tab is always at index 1 for visual types
        setTabValue(1); 
      }
    } catch (error) {
      console.error('Error handling continue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create simulation with slides (called from VisualsTab)
  const createSimulationWithSlides = async (formData: FormData) => {
    if (!simulationData || !scriptData.length) return null;
    
    setIsLoading(true);
    try {
      // Transform script data to match API format
      const formattedScript = scriptData.map(msg => ({
        script_sentence: msg.message,
        role: msg.role.toLowerCase() === 'trainee' ? 'assistant' : msg.role.toLowerCase(),
        keywords: msg.keywords || []
      }));

      // Add script data and other required fields to formData
      formData.append('user_id', 'user123'); // This should come from your auth context
      formData.append('name', simulationData.name);
      formData.append('division_id', simulationData.division || '');
      formData.append('department_id', simulationData.department || '');
      formData.append('type', simulationData.simulationType.toLowerCase());
      formData.append('script', JSON.stringify(formattedScript));
      formData.append('tags', JSON.stringify(simulationData.tags));

      // Use a modified create simulation function that accepts FormData
      const response = await createSimulationWithFormData(formData);

      if (response.status === 'success') {
        setSimulationResponse({
          id: response.id,
          status: response.status,
          prompt: response.prompt
        });
        
        // Move to settings tab
        const settingsTabIndex = tabs.findIndex(tab => tab.label === 'Settings');
        setTabValue(settingsTabIndex);
        
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error creating simulation:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 4, py: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <StyledTabs value={tabValue} onChange={handleTabChange}>
            {tabs.map((tab, index) => {
              const tabKey = ['script', 'visuals', 'settings', 'preview'][index];
              return (
                <StyledTab
                  key={tab.label}
                  label={tab.label}
                  disabled={!enabledTabs[tabKey]}
                  sx={{
                    opacity: enabledTabs[tabKey] ? 1 : 0.5,
                    cursor: enabledTabs[tabKey] ? 'pointer' : 'not-allowed'
                  }}
                />
              );
            })}
          </StyledTabs>
          {isScriptLocked && (
            <LockIcon sx={{ color: 'success.main', fontSize: 20 }} />
          )}
        </Stack>
        
        {scriptData.length > 0 && tabValue === 0 && (
          <Button
            variant="contained"
            onClick={async () => {
              await handleContinue();
            }}
            disabled={isLoading}
            sx={{
              bgcolor: '#444CE7',
              '&:hover': { bgcolor: '#3538CD' },
              borderRadius: 2,
              px: 4,
            }}
          >
            {isLoading ? 'Processing...' : 'Save and Continue'}
          </Button>
        )}
      </Stack>

      <Box sx={{ px: 4 }}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
            position: 'relative',
            zIndex: 0,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {tabValue === 0 && (
              <ScriptTab 
                simulationType={simulationData?.simulationType}
                isLocked={isScriptLocked}
              />
            )}
            {/* Only render VisualsTab for visual simulation types */}
            {isVisualType && tabValue === 1 && (
              <VisualsTab 
                images={visualImages}
                onImagesUpdate={setVisualImages}
                createSimulation={createSimulationWithSlides}
                simulationType={simulationData?.simulationType}
                onComplete={() => {
                  if (visualImages.length > 0) {
                    // For visual-audio types, API call is handled in VisualsTab
                    // For other visual types, we'll handle it here
                    if (simulationData?.simulationType !== 'visual-audio' && 
                        simulationData?.simulationType?.includes('visual')) {
                      // TODO: Create simulation for visual types that aren't visual-audio
                      // This will be handled by the createSimulation method passed to VisualsTab
                    }
                    // Move to settings tab
                    const settingsTabIndex = tabs.findIndex(tab => tab.label === 'Settings');
                    setTabValue(settingsTabIndex);
                  }
                }}
              />
            )}
            {/* Render SettingsTab at the correct index based on simulation type */}
            {((isVisualType && tabValue === 2) || (!isVisualType && tabValue === 1)) && (
              <SettingsTab 
                simulationId={simulationResponse?.id}
                prompt={simulationResponse?.prompt}
                simulationType={simulationData?.simulationType}
                simulationData={simulationData}
                onPublish={() => {
                  setIsPublished(true);
                  // Move to preview tab - index depends on simulation type
                  const previewTabIndex = tabs.findIndex(tab => tab.label === 'Preview');
                  setTabValue(previewTabIndex);
                }}
              />
            )}
            {/* Render PreviewTab at the correct index based on simulation type */}
            {((isVisualType && tabValue === 3) || (!isVisualType && tabValue === 2)) && 
              <PreviewTab 
                simulationId={simulationResponse?.id || ''} 
                simulationType={simulationData?.simulationType as 'audio' | 'chat'}
              />
            }
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

const GenerateScript = () => {
  return (
    <SimulationWizardProvider>
      <GenerateScriptContent />
    </SimulationWizardProvider>
  );
};

export default GenerateScript;