import React, { createContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { BodyArea } from '../data/exercises';
import { generateWorkout } from '../utils/workoutGenerator';
import type { WorkoutOptions, WorkoutSet } from '../utils/workoutGenerator';
import { loadWorkoutFromStorage } from '../utils/storage';
import type { Exercise } from '../data/exercises';

interface WorkoutContextType {
  // Config State
  selectedBodyAreas: BodyArea[];
  toggleBodyArea: (area: BodyArea) => void;
  mode: 'Regular' | 'Superset';
  setMode: (mode: 'Regular' | 'Superset') => void;
  supersetType: 'Agonist' | 'Antagonist' | 'Random';
  setSupersetType: (type: 'Agonist' | 'Antagonist' | 'Random') => void;
  count: number;
  setCount: (count: number) => void;
  groupByStation: boolean;
  setGroupByStation: (group: boolean) => void;
  isConfigOpen: boolean;
  setIsConfigOpen: (isOpen: boolean) => void;

  // Workout State
  workout: WorkoutSet[] | null;
  generate: () => void;
  clear: () => void;
  toggleExerciseCompletion: (setId: string, exerciseId: string) => void;
  resetAllExercises: () => void;
  addExerciseToWorkout: (exercise: Exercise) => void;
  isExerciseInWorkout: (exerciseId: string) => boolean;

  // UI State that persists with workout logic
  collapsedSets: Record<string, boolean>;
  setCollapsedSets: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedExercises: Record<string, boolean>;
  setExpandedExercises: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  // Load initial data from storage once
  const [initialData] = useState(() => loadWorkoutFromStorage());

  // State for configuration - initialize with loaded config if available
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<BodyArea[]>(
    initialData.config?.bodyAreas || []
  );
  const [mode, setMode] = useState<'Regular' | 'Superset'>(
    initialData.config?.mode || 'Regular'
  );
  const [supersetType, setSupersetType] = useState<'Agonist' | 'Antagonist' | 'Random'>(
    initialData.config?.supersetType || 'Random'
  );
  const [count, setCount] = useState<number>(
    initialData.config?.count || 10
  );
  const [groupByStation, setGroupByStation] = useState<boolean>(
    initialData.config?.groupByStation || false
  );

  // State for generated workout
  const [workout, setWorkout] = useState<WorkoutSet[] | null>(initialData.workout);

  // State to track the config associated with the current workout (for saving)
  const [savedConfig, setSavedConfig] = useState<WorkoutOptions | null>(initialData.config);

  // State for mobile config panel visibility
  const [isConfigOpen, setIsConfigOpen] = useState(!initialData.workout);

  // Track collapse overrides for sets
  const [collapsedSets, setCollapsedSets] = useState<Record<string, boolean>>({});

  // Track expanded overrides for exercises
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});

  // Refs for sets to handle scrolling
  const setRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Save to local storage whenever workout changes
  useEffect(() => {
    if (workout && savedConfig) {
      const data = {
        workout,
        config: savedConfig
      };
      localStorage.setItem('lastWorkout', JSON.stringify(data));
    } else if (!workout) {
      localStorage.removeItem('lastWorkout');
    }
  }, [workout, savedConfig]);

  // Effect to handle auto-scrolling
  const prevCompletedSetsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!workout) {
      prevCompletedSetsRef.current = new Set();
      return;
    }

    const currentCompletedSets = new Set<string>();
    workout.forEach((set, index) => {
      const isSetComplete = set.exercises.every(ex => ex.isCompleted);
      if (isSetComplete) {
        currentCompletedSets.add(set.id);

        // Check if it WAS NOT complete before
        if (!prevCompletedSetsRef.current.has(set.id)) {
           const element = setRefs.current[index];
           if (element) {
             element.scrollIntoView({ behavior: 'smooth', block: 'start' });
           }
        }
      }
    });

    prevCompletedSetsRef.current = currentCompletedSets;
  }, [workout]);


  const toggleBodyArea = (area: BodyArea) => {
    setSelectedBodyAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const clear = () => {
    setWorkout(null);
    setSavedConfig(null);
    setIsConfigOpen(true);
    setCollapsedSets({});
    setExpandedExercises({});
  };

  const generate = () => {
    if (selectedBodyAreas.length === 0) {
      alert("Please select at least one body area.");
      return;
    }
    const options: WorkoutOptions = {
      bodyAreas: selectedBodyAreas,
      mode,
      supersetType: mode === 'Superset' ? supersetType : undefined,
      count,
      groupByStation
    };
    const newWorkout = generateWorkout(options);
    setWorkout(newWorkout);
    setSavedConfig(options);
    setIsConfigOpen(false);
    setCollapsedSets({});
    setExpandedExercises({});
  };

  const toggleExerciseCompletion = (setId: string, exerciseId: string) => {
    if (!workout) return;

    setWorkout(prevWorkout => {
      if (!prevWorkout) return null;
      return prevWorkout.map(set => {
        if (set.id !== setId) return set;
        return {
          ...set,
          exercises: set.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            const newCompleted = !ex.isCompleted;
            return { ...ex, isCompleted: newCompleted };
          })
        };
      });
    });
  };

  const resetAllExercises = () => {
    if (!workout) return;
    if (window.confirm("Are you sure you want to mark all exercises as incomplete?")) {
      setWorkout(prevWorkout => {
        if (!prevWorkout) return null;
        return prevWorkout.map(set => ({
          ...set,
          exercises: set.exercises.map(ex => ({ ...ex, isCompleted: false }))
        }));
      });
      setCollapsedSets({});
      setExpandedExercises({});
    }
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
      // Logic to add exercise
      // If no workout, create one with basic config
      if (!workout) {
          const newSet: WorkoutSet = {
              id: `set-${Date.now()}`,
              exercises: [{ ...exercise, isCompleted: false }],
              type: 'Regular'
          };
          setWorkout([newSet]);
          // We need a config to save persistence, even if we are overriding.
          // We'll use the current active config state if available, or defaults.
          // The user said: "treat as an override that doesn't affect the generator settings."
          // But we need 'savedConfig' to be non-null for persistence to trigger in the effect.
          if (!savedConfig) {
             setSavedConfig({
                 bodyAreas: selectedBodyAreas.length > 0 ? selectedBodyAreas : [exercise.targetMuscle],
                 mode: mode,
                 supersetType: supersetType,
                 count: count,
                 groupByStation: groupByStation
             });
          }
      } else {
          // Append to end
          const newSet: WorkoutSet = {
              id: `set-${Date.now()}`,
              exercises: [{ ...exercise, isCompleted: false }],
              type: 'Regular'
          };
          setWorkout([...workout, newSet]);
      }
  };

  const isExerciseInWorkout = (exerciseId: string) => {
      if (!workout) return false;
      return workout.some(set => set.exercises.some(ex => ex.id === exerciseId));
  };

  return (
    <WorkoutContext.Provider value={{
      selectedBodyAreas, toggleBodyArea,
      mode, setMode,
      supersetType, setSupersetType,
      count, setCount,
      groupByStation, setGroupByStation,
      isConfigOpen, setIsConfigOpen,
      workout, generate, clear,
      toggleExerciseCompletion, resetAllExercises,
      addExerciseToWorkout, isExerciseInWorkout,
      collapsedSets, setCollapsedSets,
      expandedExercises, setExpandedExercises,
      setRefs
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export { WorkoutContext };
