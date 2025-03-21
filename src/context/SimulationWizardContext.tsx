import React, { createContext, useContext, useState } from 'react';

export interface Message {
  id: string;
  role: 'Customer' | 'Trainee';
  message: string;
  keywords: string[];
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  type: 'button' | 'field';
  settings: {
    font: string;
    fontSize: number;
    buttonColor: string;
    textColor: string;
    timeoutDuration: number;
    highlightField: boolean;
    enableHotkey: boolean;
  };
}

export interface VisualImage {
  id: string;
  url: string;
  name: string;
  hotspots?: Hotspot[];
}

export interface SimulationSettings {
  simulationType?: string;
  levels?: {
    [key: string]: {
      lvl1: boolean;
      lvl2: boolean;
      lvl3: boolean;
    };
  };
  estimatedTime?: {
    enabled: boolean;
    value: string;
  };
  objectives?: {
    enabled: boolean;
    text: string;
  };
  overviewVideo?: {
    enabled: boolean;
  };
  quickTips?: {
    enabled: boolean;
    text: string;
  };
  voice: {
    language: string;
    accent: string;
    gender: string;
    ageGroup: string;
    voiceId: string;
  };
  scoring: {
    simulationScore: 'best' | 'last' | 'average';
    keywordScore: string;
    clickScore: string;
    practiceMode: 'unlimited' | 'limited';
    repetitionsAllowed: string;
    repetitionsNeeded: string;
  };
}

interface SimulationWizardContextType {
  // Script Data
  scriptData: Message[];
  setScriptData: (data: Message[]) => void;
  isScriptLocked: boolean;
  setIsScriptLocked: (locked: boolean) => void;
  
  // Visual Data
  visualImages: VisualImage[];
  setVisualImages: (images: VisualImage[]) => void;
  
  // Settings Data
  settings: SimulationSettings;
  setSettings: (settings: SimulationSettings) => void;
  
  // Simulation Response
  simulationResponse: { id: string; status: string; prompt: string } | null;
  setSimulationResponse: (response: { id: string; status: string; prompt: string } | null) => void;
  
  // Published State
  isPublished: boolean;
  setIsPublished: (published: boolean) => void;
}

const SimulationWizardContext = createContext<SimulationWizardContextType | undefined>(undefined);

export const SimulationWizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scriptData, setScriptData] = useState<Message[]>([]);
  const [isScriptLocked, setIsScriptLocked] = useState(false);
  const [visualImages, setVisualImages] = useState<VisualImage[]>([]);
  
  // Initialize settings with default values but allow updates
  const [settings, setSettings] = useState<SimulationSettings>({
    simulationType: 'audio',
    levels: {},
    estimatedTime: {
      enabled: false,
      value: '10 mins',
    },
    objectives: {
      enabled: false,
      text: '',
    },
    overviewVideo: {
      enabled: false,
    },
    quickTips: {
      enabled: false,
      text: '',
    },
    voice: {
      language: 'English',
      accent: 'American',
      gender: 'Male',
      ageGroup: 'Middle Age',
      voiceId: '',
    },
    scoring: {
      simulationScore: 'best',
      keywordScore: '20%',
      clickScore: '80%',
      practiceMode: 'unlimited',
      repetitionsAllowed: '3',
      repetitionsNeeded: '2',
    },
  });
  const [simulationResponse, setSimulationResponse] = useState<{ id: string; status: string; prompt: string } | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  // Update settings while preserving existing values
  const updateSettings = (newSettings: Partial<SimulationSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
      voice: {
        ...prevSettings.voice,
        ...(newSettings.voice || {}),
      },
      scoring: {
        ...prevSettings.scoring,
        ...(newSettings.scoring || {}),
      },
    }));
  };

  return (
    <SimulationWizardContext.Provider
      value={{
        scriptData,
        setScriptData,
        isScriptLocked,
        setIsScriptLocked,
        visualImages,
        setVisualImages,
        settings,
        setSettings: updateSettings,
        simulationResponse,
        setSimulationResponse,
        isPublished,
        setIsPublished,
      }}
    >
      {children}
    </SimulationWizardContext.Provider>
  );
};

export const useSimulationWizard = () => {
  const context = useContext(SimulationWizardContext);
  if (context === undefined) {
    throw new Error('useSimulationWizard must be used within a SimulationWizardProvider');
  }
  return context;
};