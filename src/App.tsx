import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkoutProvider } from './context/WorkoutContext';
import WorkoutPage from './pages/WorkoutPage';
import ExerciseListPage from './pages/ExerciseListPage';

export default function App() {
  return (
    <WorkoutProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<WorkoutPage />} />
          <Route path="/exercises" element={<ExerciseListPage />} />
        </Routes>
      </BrowserRouter>
    </WorkoutProvider>
  );
}
