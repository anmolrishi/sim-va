import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ThemeProvider from './theme/ThemeProvider';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Lazy load components
const Login = React.lazy(() => import('./components/Login'));
const Register = React.lazy(() => import('./components/Register'));
const TraineeDashboard = React.lazy(() =>
  import('./components/dashboard/trainee/TraineeDashboard')
);
const TrainingPlanPage = React.lazy(() =>
  import('./components/dashboard/trainee/TrainingPlanPage')
);
const TrainingPlanDetailsPage = React.lazy(() =>
  import('./components/dashboard/trainee/TrainingPlanDetailsPage')
);
const PlaybackPage = React.lazy(() =>
  import('./components/dashboard/trainee/PlaybackPage')
);
const PlaybackDetailPage = React.lazy(() =>
  import('./components/dashboard/trainee/playback/PlaybackDetailPage')
);
const ManageSimulationsPage = React.lazy(() =>
  import('./components/dashboard/trainee/manage/ManageSimulationsPage')
);
const GenerateScript = React.lazy(() =>
  import('./components/dashboard/trainee/manage/generate/GenerateScript')
);
const SimulationAttemptPage = React.lazy(() =>
  import('./components/dashboard/trainee/SimulationAttemptPage')
);
const ManageTrainingPlanPage = React.lazy(() =>
  import('./components/dashboard/trainee/manage/ManageTrainingPlanPage')
);
const AssignSimulationsPage = React.lazy(() =>
  import('./components/dashboard/trainee/AssignSimulationsPage')
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/unauthorized"
                  element={
                    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                      <h1 className="text-2xl font-bold text-gray-800">
                        Unauthorized Access
                      </h1>
                    </div>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['trainee']} path="/dashboard">
                      <TraineeDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/training"
                  element={
                    <ProtectedRoute allowedRoles={['trainee']} path="/training">
                      <TrainingPlanPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/training/:id"
                  element={
                    <ProtectedRoute allowedRoles={['trainee']} path="/training">
                      <TrainingPlanDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/playback"
                  element={
                    <ProtectedRoute allowedRoles={['trainee']} path="/playback">
                      <PlaybackPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/playback/:id"
                  element={
                    <ProtectedRoute allowedRoles={['trainee']} path="/playback">
                      <PlaybackDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-simulations"
                  element={
                    <ProtectedRoute allowedRoles={['trainee']} path="/manage-simulations">
                      <ManageSimulationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generate-scripts"
                  element={
                    <ProtectedRoute allowedRoles={['trainee']} path="/manage-simulations">
                      <GenerateScript />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/simulation/:id/attempt" 
                  element={
                     <ProtectedRoute allowedRoles={['trainee']} path="/training">
                      <SimulationAttemptPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/manage-training-plan" 
                  element={
                     <ProtectedRoute allowedRoles={['trainee']} path="/manage-training-plan">
                      <ManageTrainingPlanPage />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/assign-simulations"
                  element={
                    <ProtectedRoute allowedRoles={['trainee']} path="/assign-simulations">
                      <AssignSimulationsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Layout>
        </Router>        
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;