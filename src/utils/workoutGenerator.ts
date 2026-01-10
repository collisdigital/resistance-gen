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

  // Logic to select the next primary exercise
  // Returns { exercise: Exercise | null, updatedStationIndex: number }
  const selectNextExercise = (
    currentStationIndex: number,
    stationQueue: Station[]
  ): { exercise: Exercise | null, nextStationIndex: number } => {

    if (groupByStation) {
       let index = currentStationIndex;
       while (index < stationQueue.length) {
         const currentStation = stationQueue[index];
         const stationPool = availableExercises.filter(ex => ex.station === currentStation);
         const candidate = getRandomExercise(stationPool);

         if (candidate) {
           return { exercise: candidate, nextStationIndex: index };
         }
         // Station exhausted
         index++;
       }
       return { exercise: null, nextStationIndex: index };
    } else {
      return {
        exercise: getRandomExercise(availableExercises),
        nextStationIndex: 0
      };
    }
  };

  let exercisesAdded = 0;

  // Setup Station Queue
  let stationQueue: Station[] = [];
  if (groupByStation) {
      const stations = Array.from(new Set(availableExercises.map(ex => ex.station)));
      stationQueue = stations.sort(() => Math.random() - 0.5);
  }

  let currentStationIndex = 0;

  while (exercisesAdded < count) {
    const { exercise: first, nextStationIndex } = selectNextExercise(currentStationIndex, stationQueue);
    currentStationIndex = nextStationIndex;

    if (!first) break;

    // Determine if we add a superset or regular set
    let addedCount = 1;
    let newSet: WorkoutSet;

    if (mode === 'Superset' && exercisesAdded + 1 < count) {
       const second = findPair(first, supersetType || 'Random', !!groupByStation);

       if (second) {
         newSet = {
           id: `set-${Date.now()}-${exercisesAdded}`,
           exercises: [
             { ...first, isCompleted: false },
             { ...second, isCompleted: false }
           ],
           type: 'Superset'
         };
         addedCount = 2;
       } else {
         newSet = {
           id: `set-${Date.now()}-${exercisesAdded}`,
           exercises: [{ ...first, isCompleted: false }],
           type: 'Regular'
         };
       }
    } else {
      newSet = {
        id: `set-${Date.now()}-${exercisesAdded}`,
        exercises: [{ ...first, isCompleted: false }],
        type: 'Regular'
      };
    }

    workout.push(newSet);
    exercisesAdded += addedCount;
  }

  return workout;
};
