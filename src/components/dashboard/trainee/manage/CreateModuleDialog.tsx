import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../../../context/AuthContext';
import { createModule } from '../../../../services/modules';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  IconButton,
  TextField,
  Box,
  Button,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  ClickAwayListener,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Book as BookIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { fetchSimulations, type Simulation } from '../../../../services/simulations';

interface SimulationItem {
  id: string;
  name: string;
}

interface CreateModuleFormData {
  name: string;
  tags: string[];
  selectedSimulations: SimulationItem[];
}

interface CreateModuleDialogProps {
  open: boolean;
  onClose: () => void;
}

const availableTags = ['Tag 01', 'Tag 02', 'Tag 03', 'Tag 04', 'Tag 05'];

const CreateModuleDialog: React.FC<CreateModuleDialogProps> = ({
  open,
  onClose,
}) => {
  const { user } = useAuth();
  const [simulations, setSimulations] = React.useState<Simulation[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSimulationsList, setShowSimulationsList] = React.useState(false);
  const searchFieldRef = React.useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadSimulations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchSimulations(user?.id || 'user123');
        setSimulations(data);
      } catch (err) {
        setError('Failed to load simulations');
        console.error('Error loading simulations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadSimulations();
    }
  }, [open, user?.id]);

  const {
    control,
    handleSubmit,
    formState: { isValid },
    watch,
    setValue,
  } = useForm<CreateModuleFormData>({
    mode: 'onChange',
    defaultValues: {
      name: 'Untitled Module 01',
      tags: [],
      selectedSimulations: [],
    },
  });

  const selectedSimulations = watch('selectedSimulations');
  const filteredSimulations = simulations.filter(sim => 
    sim.sim_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: CreateModuleFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const response = await createModule({
        user_id: user?.id || 'user123',
        module_name: data.name,
        tags: data.tags,
        simulations: data.selectedSimulations.map(sim => sim.id)
      });

      if (response.status === 'success') {
        onClose();
      }
    } catch (error) {
      console.error('Error creating module:', error);
      setSubmitError('Failed to create module. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSimulation = (simulationToRemove: SimulationItem) => {
    setValue(
      'selectedSimulations',
      selectedSimulations.filter(sim => sim.id !== simulationToRemove.id),
      { shouldValidate: true }
    );
  };

  const isSimulationSelected = (simulation: Simulation) => {
    return selectedSimulations.some(selected => selected.id === simulation.id);
  };

  const handleSimulationToggle = (simulation: Simulation) => {
    const currentSimulations = selectedSimulations;
    const isCurrentlySelected = isSimulationSelected(simulation);

    let newSimulations: SimulationItem[];
    if (isCurrentlySelected) {
      newSimulations = currentSimulations.filter(selected => selected.id !== simulation.id);
    } else {
      newSimulations = [...currentSimulations, { id: simulation.id, name: simulation.sim_name }];
    }

    setValue('selectedSimulations', newSimulations, { shouldValidate: true });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 600,
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              position: 'relative',
              width: 48,
              height: 48,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: -6,
                left: -6,
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#EEF4FF',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'relative',
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#F5F6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <BookIcon sx={{ color: '#444CE7' }} />
            </Box>
          </Box>

          <Stack spacing={0.5} flex={1}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Create Module
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add module details and simulation
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: '24px !important' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
              <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Module Name"
                    required
                    fullWidth
                    size="medium"
                  />
                )}
              />

            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  multiple
                  fullWidth
                  displayEmpty
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selected?.length === 0 ? (
                        <Typography color="text.secondary">Add Tags</Typography>
                      ) : (
                        selected.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => {
                              const newTags = field.value.filter(t => t !== tag);
                              field.onChange(newTags);
                            }}
                            sx={{
                              borderRadius: 20,
                              backgroundColor: '#F5F6FF',
                              border: '1px solid #DEE2FC',
                              color: '#444CE7',
                            }}
                          />
                        ))
                      )}
                    </Box>
                  )}
                >
                  {availableTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />

            <Box>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">
                    Add Simulations
                  </Typography>
                  <Chip
                    label={`${selectedSimulations.length} Sims`}
                    sx={{
                      bgcolor: '#F5F6FF',
                      color: '#444CE7',
                      borderRadius: 16,
                      height: 28,
                    }}
                  />
                </Stack>

                <Box position="relative" ref={searchFieldRef}>
                  <ClickAwayListener onClickAway={() => setShowSimulationsList(false)}>
                    <Box>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search simulations..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSimulationsList(true);
                        }}
                        onClick={() => setShowSimulationsList(true)}
                        InputProps={{
                          startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        }}
                      />
                      {showSimulationsList && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            zIndex: 1300,
                            width: searchFieldRef.current?.offsetWidth || '100%',
                            left: 0,
                            mt: 0.5,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 3,
                            maxHeight: 300,
                            minHeight: filteredSimulations.length > 0 ? 250 : 'auto',
                            overflow: 'auto',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#E5E7EB',
                              borderRadius: '4px',
                            },
                          }}
                        >
                          {isLoading ? (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                              <CircularProgress size={24} />
                            </Box>
                          ) : error ? (
                            <Typography sx={{ p: 2, color: 'error.main' }}>{error}</Typography>
                          ) : filteredSimulations.length === 0 ? (
                            <Typography sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
                              No matches found
                            </Typography>
                          ) : (
                            filteredSimulations.map((simulation) => (
                              <Box
                                key={simulation.id}
                                onClick={() => {
                                  handleSimulationToggle(simulation);
                                  setShowSimulationsList(false);
                                }}
                                sx={{
                                  p: 1.5,
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: '#F5F6FF' },
                                  display: 'grid',
                                  gridTemplateColumns: 'auto 80px 1fr auto',
                                  alignItems: 'center', 
                                  gap: 2,
                                  width: '100%'
                                }}
                              >
                                <Checkbox 
                                  checked={isSimulationSelected(simulation)}
                                  sx={{ p: 0 }}
                                />
                                <Typography variant="body2" noWrap>
                                  {simulation.id.slice(-6)}
                                </Typography>
                                <Typography variant="body2" noWrap>
                                  {simulation.sim_name}
                                </Typography>
                                <Chip
                                  label="Sim"
                                  size="small"
                                  sx={{
                                    bgcolor: '#F5F6FF',
                                    color: '#444CE7',
                                    justifySelf: 'end'
                                  }}
                                />
                              </Box>
                            ))
                          )}
                        </Box>
                      )}
                    </Box>
                  </ClickAwayListener>
                </Box>

                {selectedSimulations.length > 0 && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSimulations.map((simulation) => (
                          <TableRow key={simulation.id}>
                            <TableCell>{simulation.id.slice(-6)}</TableCell>
                            <TableCell>{simulation.name}</TableCell>
                            <TableCell>
                              <Chip
                                label="Sim"
                                size="small"
                                sx={{
                                  bgcolor: '#F5F6FF',
                                  color: '#444CE7',
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => removeSimulation(simulation)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Stack>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!isValid || isSubmitting}
              sx={{
                mt: 2,
                py: 1.5,
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
              {isSubmitting ? 'Creating...' : 'Create Module'}
            </Button>
            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submitError}
              </Alert>
            )}
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModuleDialog;