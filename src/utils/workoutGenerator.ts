import { exercises } from '../data/exercises';
import type { Exercise, BodyArea, ExerciseType } from '../data/exercises';

export interface WorkoutOptions {
  bodyAreas: BodyArea[];
  mode: 'Regular' | 'Superset';
  supersetType?: 'Agonist' | 'Antagonist' | 'Random';
  count: number;
}

export interface WorkoutExercise extends Exercise {
  isCompleted: boolean;
}

export interface WorkoutSet {
  id: string;
  exercises: WorkoutExercise[];
  type: 'Regular' | 'Superset';
}

export const generateWorkout = (options: WorkoutOptions): WorkoutSet[] => {
  const { bodyAreas, mode, supersetType, count } = options;

  // Filter exercises based on selected body areas
  const availableExercises = exercises.filter(ex =>
    bodyAreas.includes(ex.targetMuscle)
  );

  // If no exercises found, return empty
  if (availableExercises.length === 0) return [];

  const workout: WorkoutSet[] = [];
  const selectedIndices = new Set<number>();

  // Helper to get random exercise
  const getRandomExercise = (pool: Exercise[]): Exercise | null => {
    // Filter out already selected exercises from the pool *if possible*
    // Ideally we want unique exercises in the whole workout
    const unselectedPool = pool.filter(ex => !selectedIndices.has(exercises.indexOf(ex)));

    // If we ran out of unique exercises, we might have to reuse (or stop)
    // For now, let's try to keep them unique.
    if (unselectedPool.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * unselectedPool.length);
    const exercise = unselectedPool[randomIndex];
    selectedIndices.add(exercises.indexOf(exercise));
    return exercise;
  };

  // Helper to find pair for superset
  const findPair = (first: Exercise, type: 'Agonist' | 'Antagonist' | 'Random'): Exercise | null => {
     let pool: Exercise[] = [];

     if (type === 'Agonist') {
       // Same muscle group
       pool = availableExercises.filter(ex => ex.targetMuscle === first.targetMuscle && ex.id !== first.id);
     } else if (type === 'Antagonist') {
       // Opposing muscle groups (simplified logic)
       // Push vs Pull, etc.
       const opposingMap: Record<ExerciseType, ExerciseType[]> = {
         'Push': ['Pull'],
         'Pull': ['Push'],
         'Legs': ['Legs'], // Legs usually superset with legs or core? Let's say Legs.
         'Core': ['Core'],
         'Corrective': ['Corrective'],
         'Other': ['Other']
       };
       const targets = opposingMap[first.type] || [];
       pool = availableExercises.filter(ex => targets.includes(ex.type));

       // Fallback: if no direct antagonist found, maybe just different muscle?
       if (pool.length === 0) {
         pool = availableExercises.filter(ex => ex.targetMuscle !== first.targetMuscle);
       }
     } else {
       // Random
       pool = availableExercises.filter(ex => ex.id !== first.id);
     }

     return getRandomExercise(pool);
  };

  // Loop until we reach the count
  // Note: 'count' is total exercises.
  // If Regular, we need 'count' sets of 1.
  // If Superset, we need 'count / 2' sets of 2.

  let exercisesAdded = 0;

  while (exercisesAdded < count) {
    // Pick first exercise
    const first = getRandomExercise(availableExercises);
    if (!first) break; // No more exercises available

    if (mode === 'Superset' && exercisesAdded + 1 < count) {
       // Try to find a pair
       const second = findPair(first, supersetType || 'Random');

       if (second) {
         workout.push({
           id: `set-${Date.now()}-${exercisesAdded}`,
           exercises: [
             { ...first, isCompleted: false },
             { ...second, isCompleted: false }
           ],
           type: 'Superset'
         });
         exercisesAdded += 2;
       } else {
         // Could not find pair, add as regular or skip?
         // Let's add as regular for now to fill the quota
         workout.push({
           id: `set-${Date.now()}-${exercisesAdded}`,
           exercises: [{ ...first, isCompleted: false }],
           type: 'Regular' // Fallback
         });
         exercisesAdded += 1;
       }
    } else {
      // Regular mode or last odd exercise
      workout.push({
        id: `set-${Date.now()}-${exercisesAdded}`,
        exercises: [{ ...first, isCompleted: false }],
        type: 'Regular'
      });
      exercisesAdded += 1;
    }
  }

  return workout;
};
