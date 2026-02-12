import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/api';
import Layout from './components/Layout';
import LoginView from './views/LoginView';
import SurveyListView from './views/SurveyListView';
import SetupView from './views/SetupView';
import CaptureView from './views/CaptureView';
import ReviewView from './views/ReviewView';
import TemplateView from './views/TemplateView';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SurveyListView />} />
          <Route path="survey/new" element={<SetupView />} />
          <Route path="survey/:id/setup" element={<SetupView />} />
          <Route path="survey/:surveyId/capture" element={<CaptureView />} />
          <Route path="survey/:surveyId/review" element={<ReviewView />} />
          <Route path="template" element={<TemplateView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
