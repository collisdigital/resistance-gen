import type { WorkoutSet, WorkoutOptions } from './workoutGenerator';

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
    const parsed = JSON.parse(saved) as unknown;

    // Check if it's the new format (has 'workout' and 'config' properties)
    if (
      parsed &&
      typeof parsed === 'object' &&
      'workout' in parsed &&
      'config' in parsed
    ) {
      // We need to be careful with type assertions here, but since we are parsing from storage,
      // we assume if the keys exist, it matches our shape or we let it fail later if malformed.
      // Ideally we would use Zod or similar validation, but for this simple app, casting is acceptable
      // if we do basic checks.
      const data = parsed as StorageData;
      return {
        workout: data.workout,
        config: data.config
      };
    }

    // Check if it's the old format (array of sets)
    if (Array.isArray(parsed)) {
      return {
        workout: parsed as WorkoutSet[],
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
