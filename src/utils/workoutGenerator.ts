import { exercises } from '../data/exercises';
import type { Exercise, BodyArea, ExerciseType, Station } from '../data/exercises';

export interface WorkoutOptions {
  bodyAreas: BodyArea[];
  mode: 'Regular' | 'Superset';
  supersetType?: 'Agonist' | 'Antagonist' | 'Random';
  count: number;
  groupByStation?: boolean;
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
  const { bodyAreas, mode, supersetType, count, groupByStation } = options;

  // Filter exercises based on selected body areas
  const availableExercises = exercises.filter(ex =>
    bodyAreas.includes(ex.targetMuscle)
  );

  // If no exercises found, return empty
  if (availableExercises.length === 0) return [];

  const workout: WorkoutSet[] = [];
  const selectedIndices = new Set<number>();

  // Helper to get random exercise from a specific pool
  const getRandomExercise = (pool: Exercise[]): Exercise | null => {
    // Filter out already selected exercises
    const unselectedPool = pool.filter(ex => !selectedIndices.has(exercises.indexOf(ex)));

    if (unselectedPool.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * unselectedPool.length);
    const exercise = unselectedPool[randomIndex];
    selectedIndices.add(exercises.indexOf(exercise));
    return exercise;
  };

  // Helper to find pair for superset
  const findPair = (first: Exercise, type: 'Agonist' | 'Antagonist' | 'Random', stationConstraints: boolean): Exercise | null => {
     let pool: Exercise[] = [];

     // 1. Filter by superset type logic
     if (type === 'Agonist') {
       pool = availableExercises.filter(ex => ex.targetMuscle === first.targetMuscle && ex.id !== first.id);
     } else if (type === 'Antagonist') {
       const opposingMap: Record<ExerciseType, ExerciseType[]> = {
         'Push': ['Pull'],
         'Pull': ['Push'],
         'Legs': ['Legs'],
         'Core': ['Core'],
         'Corrective': ['Corrective'],
         'Other': ['Other']
       };
       const targets = opposingMap[first.type] || [];
       pool = availableExercises.filter(ex => targets.includes(ex.type));

       if (pool.length === 0) {
         pool = availableExercises.filter(ex => ex.targetMuscle !== first.targetMuscle);
       }
     } else {
       // Random
       pool = availableExercises.filter(ex => ex.id !== first.id);
     }

     // 2. Apply Station Constraint if enabled
     if (stationConstraints) {
         // Strict grouping: must be same station
         pool = pool.filter(ex => ex.station === first.station);
     }

     return getRandomExercise(pool);
  };

  let exercisesAdded = 0;

  // Logic for Station-Based Generation
  // We determine a sequence of stations and exhaust them one by one (or as much as needed)
  let stationQueue: Station[] = [];

  if (groupByStation) {
      // Get unique stations from available exercises
      const stations = Array.from(new Set(availableExercises.map(ex => ex.station)));
      // Shuffle stations
      stationQueue = stations.sort(() => Math.random() - 0.5);
  }

  // Current working pool (defaults to all if not grouped)
  let currentStationIndex = 0;

  while (exercisesAdded < count) {
    if (groupByStation) {
        // Find a station that has available exercises
        let first = null;

        // Try current station, if exhausted move to next
        while (currentStationIndex < stationQueue.length) {
            const currentStation = stationQueue[currentStationIndex];
            const stationPool = availableExercises.filter(ex => ex.station === currentStation);

            // Try to pick one
            first = getRandomExercise(stationPool);

            if (first) {
                // Found one in this station
                break;
            } else {
                // This station is exhausted, move to next
                currentStationIndex++;
            }
        }

        if (!first) break; // All stations exhausted

        // Logic continues with 'first' selected...
        // But wait, the loop below expects to call getRandomExercise again?
        // I need to restructure slightly to use the 'first' I just found.

        // Let's inline the rest here for clarity or refactor.
        // Actually, let's keep the structure: identify 'first', then find 'second'.

        handleSelection(first);

    } else {
        // Standard random selection
        const first = getRandomExercise(availableExercises);
        if (!first) break;
        handleSelection(first);
    }
  }

  function handleSelection(first: Exercise) {
      if (mode === 'Superset' && exercisesAdded + 1 < count) {
         const second = findPair(first, supersetType || 'Random', !!groupByStation);

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
           workout.push({
             id: `set-${Date.now()}-${exercisesAdded}`,
             exercises: [{ ...first, isCompleted: false }],
             type: 'Regular'
           });
           exercisesAdded += 1;
         }
      } else {
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
