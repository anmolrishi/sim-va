import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  IconButton,
  styled,
  Card,
  Divider,
} from '@mui/material';
import {
  PlayCircle as PlayCircleIcon,
  Headphones as HeadphonesIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import DashboardContent from '../DashboardContent';
import SimulationStartPage from './simulation/SimulationStartPage';


interface SimulationCard {
  id: string;
  title: string;
  simType: string;
  status: 'Completed' | 'Not Started';
}


type AttemptCardProps = {
  selected: boolean; // Custom prop for the selected state
  onClick: () => void; // Click handler
  children: React.ReactNode; // Children for card content
};


const LevelButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0.5, 2.5),
  borderRadius: 30,
  textTransform: 'none',
  fontWeight: 500,
  border: '1px solid',
  borderColor: theme.palette.divider,
  '&.selected': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
  },
}));

const AttemptCard = styled(Card)<AttemptCardProps>(({ theme, selected }) => ({
  padding: theme.spacing(1),
  width: "33%",
  border: selected ? `3px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  cursor: "pointer",
  transition: theme.transitions.create(["border", "color", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: "white",
  color: selected ? theme.palette.primary.main : "black",
  "& .MuiSvgIcon-root": {
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: theme.transitions.create("color", {
      duration: theme.transitions.duration.short,
    }),
  },
  "& .MuiTypography-body2": {
    color: selected ? theme.palette.primary.main : "gray",
    transition: theme.transitions.create("color", {
      duration: theme.transitions.duration.short,
    }),
  },
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
  },
}));


import ChatSimulationPage from './simulation/ChatSimulationPage';

const SimulationAttemptPage = () => {
  const [selectedLevel, setSelectedLevel] = useState('Level 01');
  const [selectedAttempt, setSelectedAttempt] = useState<'Test' | 'Practice'>('Test');
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [showStartPage, setShowStartPage] = useState(false);
  const [simulationType, setSimulationType] = useState<'audio' | 'chat'>('audio');

  const simulations: SimulationCard[] = [
    { id: '1', title: 'Humana_MS_PCP Change', simType: 'Audio', status: 'Completed' },
    { id: '2', title: 'Humana_MS_PCP Change', simType: 'Audio', status: 'Completed' },
    { id: '3', title: 'Humana_MS_PCP Not Change', simType: 'Audio', status: 'Not Started' },
    { id: '4', title: 'Humana_MS_PCP Change', simType: 'Audio', status: 'Not Started' },
    { id: '5', title: 'Humana_MS_PCP Change', simType: 'Audio', status: 'Not Started' },
  ];

  const cards = [
    {
      key: "Test",
      icon: <SettingsIcon />,
      title: "Test",
      subtitle: "Subtitle goes here",
    },
    {
      key: "Practice",
      icon: <PlayCircleIcon />,
      title: "Practice",
      subtitle: "Subtitle goes here",
    },
  ];

  const handlePrevSim = () => {
    setCurrentSimIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextSim = () => {
    setCurrentSimIndex((prev) => Math.min(simulations.length - 1, prev + 1));
  };

  const handleContinue = () => {
    setSimulationType(selectedAttempt === 'Test' ? 'audio' : 'chat');
    setShowStartPage(true);
  };

  if (showStartPage) {
    const currentSim = simulations[currentSimIndex];
    if (simulationType === 'chat') {
      return (
        <ChatSimulationPage
          simulationId={currentSim.id}
          simulationName={currentSim.title}
          level={selectedLevel}
          simType={currentSim.simType}
          attemptType={selectedAttempt}
          onBackToList={() => setShowStartPage(false)}
        />
      );
    }
    return (
      <SimulationStartPage
        simulationId={currentSim.id}
        simulationName={currentSim.title}
        level={selectedLevel}
        simType={currentSim.simType}
        attemptType={selectedAttempt}
        onBackToList={() => setShowStartPage(false)}
      />
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg" sx={{ py: 2, bgcolor: '#F3F5F5' }}>
        {/* Simulation Carousel */}
        <Box sx={{ mb: 1.5, position: 'relative' }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', px: 6 }}>
            <IconButton
              onClick={handlePrevSim}
              disabled={currentSimIndex === 0}
              sx={{
                position: 'absolute',
                left: 0,
                backgroundColor: 'white',
                borderRadius: '0 50% 50% 0', // Top-right and bottom-right rounded
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: '#f4f4f4',
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            <Box
              id="carousel"
              sx={{
                display: 'flex',
                overflowX: 'scroll',
                whiteSpace: 'nowrap',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none', // For Firefox
                '&::-webkit-scrollbar': { display: 'none' }, // For Chrome and other Webkit browsers
                flex: 1,
              }}
            >
              {simulations.map((sim, index) => (
                <Card
                  key={sim.id}
                  sx={{
                    minWidth: 290,
                    p: 2,
                    border: '2px solid #343F8A',
                    borderColor: index === currentSimIndex ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    transform: `scale(${index === currentSimIndex ? 1 : 0.9})`,
                    transition: 'all 0.3s',
                    backgroundColor: sim.status === 'Completed' ? '#FFFFFF' : '#FFFFFF',
                    mx: 1, // Add spacing between cards
                    display: 'inline-block',
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: index === currentSimIndex ? '#343F8A' : '#000000CC' }}
                    >
                      {index + 1}. {sim.title}
                    </Typography>
                    <Stack direction="row" justifyContent="left" gap={2}>
                      <Typography
                        variant="caption"
                        sx={{
                          backgroundColor: '#F2F4F7',
                          px: 1, py: 0.4,
                          borderRadius: 3,
                          color: '#344054',
                        }}
                      >
                        Sim Type: {sim.simType}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1, py: 0.4,
                          borderRadius: 3,
                          color: sim.status === 'Completed' ? 'success.main' : '#B54708',
                          backgroundColor: sim.status === 'Completed' ? '#ECFDF3' : '#FFFAEB',

                        }}
                      >
                        {sim.status}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Box>


            <IconButton
              onClick={handleNextSim}
              disabled={currentSimIndex === simulations.length - 1}
              sx={{
                position: 'absolute',
                right: 0,
                backgroundColor: 'white',
                borderRadius: '50% 0 0 50%', // Top-left and bottom-left rounded
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: '#f4f4f4',
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Box>



        {/* Main Content */}
        <Card sx={{ p: 2, borderRadius: 3, }}>


          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              height: "100vh", // Full viewport height
            }}
          >
            <Stack spacing={1.5} maxWidth="md" sx={{ width: "100%" }}>
              <Box
                sx={{
                  border: "1px solid #0F174F99",
                  borderRadius: 5,
                  p: 2,
                }}
              >
                {/* Title and Actions */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                    {simulations[currentSimIndex].title}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      startIcon={<PlayCircleIcon />}
                      variant="text"
                      sx={{ color: "#3A4170", bgcolor: "#F6F6FF", px: 2 }}
                    >
                      Overview Video
                    </Button>
                    <Button
                      startIcon={<HeadphonesIcon />}
                      variant="text"
                      sx={{ color: "#3A4170", bgcolor: "#F6F6FF", px: 2 }}
                    >
                      Headset Settings
                    </Button>
                  </Stack>
                </Stack>

                {/* Divider */}
                <Divider sx={{ my: 3 }} />

                {/* Level Selection */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#0F174F99" }} gutterBottom>
                    Select Level:
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {["Level 01", "Level 02", "Level 03"].map((level) => (
                      <LevelButton
                        key={level}
                        className={selectedLevel === level ? "selected" : ""}
                        onClick={() => setSelectedLevel(level)}
                        sx={{
                          border: selectedLevel === level ? "2px solid #001EEE" : "1px solid #0F174F99",
                          color: selectedLevel === level ? "#001EEE" : "black",
                          fontWeight: selectedLevel === level ? "bold" : "normal",
                          backgroundColor: selectedLevel === level ? "#FAFAFF" : "white",


                        }}
                      >
                        {level}
                      </LevelButton>
                    ))}
                  </Stack>
                </Box>

                {/* Attempt Type Selection */}
                <Box mt={3}>
                  <Typography variant="subtitle2" sx={{ color: "#0F174F99" }} gutterBottom>
                    Attempt as:
                  </Typography>
                  <Stack direction="row" spacing={3}>
                    {cards.map((card) => (
                      <AttemptCard
                        key={card.key}
                        selected={selectedAttempt === card.key}
                        onClick={() => setSelectedAttempt(card.key as "Test" | "Practice")}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 58,
                              height: 58,
                              borderRadius: "50%",
                              bgcolor: "#F5F6FE",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {card.icon}
                          </Box>
                          <Stack spacing={0.5}>
                            <Typography variant="h4">{card.title}</Typography>
                            <Typography variant="body2">{card.subtitle}</Typography>
                          </Stack>
                        </Stack>
                      </AttemptCard>
                    ))}
                  </Stack>
                </Box>


                {/* Learning Objectives and Quick Tips */}
                <Box mt={3}>
                  <Typography variant="subtitle2" sx={{ color: "#0F174F99" }} gutterBottom>
                    You will learn
                  </Typography>

                  <Box
                    sx={{
                      border: "1px solid #0F174F99", // Border with the color you specified
                      borderRadius: "8px", // Curved border
                      padding: 1, // Padding to give some space around the content
                      width: "28%",
                    }}
                  >
                    <Stack spacing={0}>
                      <Typography variant="body2" sx={{ fontSize: "13px" }} color="text.secondary">
                        1. Product and Service Knowledge
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: "13px" }} color="text.secondary">
                        2. Effective Communication Skills
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: "13px" }} color="text.secondary">
                        3. Call Center Tools and Procedures
                      </Typography>
                    </Stack>
                  </Box>
                </Box>


                {/* Continue Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth


                  onClick={handleContinue}
                  disabled={!selectedLevel || !selectedAttempt}
                  sx={{
                    bgcolor: "#444CE7",
                    mt: 3,
                    borderRadius: 1.5,
                    color: "white",
                    "&:hover": {
                      bgcolor: "#3538CD",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#F5F6FF",
                      color: "#444CE7",
                    },
                  }}
                >
                  Continue
                </Button>
              </Box>

              {/* Quick Tips */}
              <Box
                sx={{
                  border: "1px solid grey",
                  borderRadius: 3,  // Rounded corners for the entire box
                  p: 1.5,
                }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    backgroundColor: "#F9FAFB",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 12px",
                    width: "100%",  // Ensures the background spans the full width
                    marginTop: "-3px",  // Removes the gap between the box and the heading
                    borderRadius: "3px 3px 0 0",  // Rounded top corners of the heading
                  }}
                >
                  <LightbulbIcon
                    sx={{
                      fontWeight: "bold",
                      color: "#0F174F99",
                      marginRight: 1,
                    }}
                  />
                  Some quick tips for easy navigation
                </Typography>
                <Stack spacing={0}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "13px" }}>
                    1. Press tab to enter or the spacebar to stop recording your response
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "13px" }}>
                    2. Press tab to enter or the spacebar to stop recording your response
                  </Typography>
                </Stack>
              </Box>

            </Stack>
          </Box>


        </Card>

      </Container >
    </DashboardContent >
  );
};

export default SimulationAttemptPage;
