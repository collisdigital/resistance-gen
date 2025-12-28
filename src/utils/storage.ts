import { WorkoutSet, WorkoutOptions } from './workoutGenerator';

export interface StorageData {
  workout: WorkoutSet[];
  config: WorkoutOptions;
}

export interface LoadedData {
  workout: WorkoutSet[] | null;
  config: WorkoutOptions | null;
}

export const loadWorkoutFromStorage = (): LoadedData => {
  const saved = localStorage.getItem('lastWorkout');
  if (!saved) {
    return { workout: null, config: null };
  }

  try {
    const parsed = JSON.parse(saved);

    // Check if it's the new format (has 'workout' and 'config' properties)
    if (parsed && typeof parsed === 'object' && 'workout' in parsed && 'config' in parsed) {
      return {
        workout: parsed.workout,
        config: parsed.config
      };
    }

    // Check if it's the old format (array of sets)
    if (Array.isArray(parsed)) {
      return {
        workout: parsed,
        config: null
      };
    }

    // Unknown format
    return { workout: null, config: null };
  } catch (e) {
    console.error("Failed to load workout", e);
    return { workout: null, config: null };
  }
};
