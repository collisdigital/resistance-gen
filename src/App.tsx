import { useState, useEffect, useRef } from 'react';
import type { BodyArea } from './data/exercises';
import { generateWorkout } from './utils/workoutGenerator';
import type { WorkoutOptions, WorkoutSet } from './utils/workoutGenerator';
import { loadWorkoutFromStorage } from './utils/storage';

export default function App() {
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

  // State for generated workout
  const [workout, setWorkout] = useState<WorkoutSet[] | null>(initialData.workout);

  // State to track the config associated with the current workout (for saving)
  const [savedConfig, setSavedConfig] = useState<WorkoutOptions | null>(initialData.config);

  // State for mobile config panel visibility
  // Default to true if no workout, false if workout exists (for mobile UX)
  const [isConfigOpen, setIsConfigOpen] = useState(!initialData.workout);

  // Track collapse overrides for sets (true = force collapsed, false = force expanded, undefined = default)
  const [collapsedSets, setCollapsedSets] = useState<Record<string, boolean>>({});

  // Track expanded overrides for exercises (for when they are completed but user wants to see details/uncheck)
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
  // We need to track previous completion state to know when a set *becomes* complete
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
           // It just became complete. Scroll to next set if exists.
           const nextIndex = index + 1;
           if (nextIndex < workout.length) {
             const nextElement = setRefs.current[nextIndex];
             if (nextElement) {
               nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }
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

  const handleClear = () => {
    setWorkout(null);
    setSavedConfig(null);
    setIsConfigOpen(true); // Keep config open when cleared so user can generate new one
    setCollapsedSets({});
    setExpandedExercises({});
  };

  const handleGenerate = () => {
    if (selectedBodyAreas.length === 0) {
      alert("Please select at least one body area.");
      return;
    }
    const options: WorkoutOptions = {
      bodyAreas: selectedBodyAreas,
      mode,
      supersetType: mode === 'Superset' ? supersetType : undefined,
      count
    };
    const newWorkout = generateWorkout(options);
    setWorkout(newWorkout);
    setSavedConfig(options);
    // Collapse config panel on mobile after generation
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

            // If we are marking as incomplete, ensure it stays expanded if it was
            // (Though typically UI logic handles view state)
            return { ...ex, isCompleted: newCompleted };
          })
        };
      });
    });
  };

  const handleExerciseExpandToggle = (exerciseId: string) => {
    // If it's completed, toggle expansion.
    // If it's not completed, it's always expanded by default, so maybe this is just for collapsing?
    // User requirement: "Require expanding to uncheck".
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const handleSetExpandToggle = (setId: string, isSetComplete: boolean) => {
      setCollapsedSets(prev => {
          const override = prev[setId];
          const isCurrentlyCollapsed = override !== undefined ? override : isSetComplete;
          return {
              ...prev,
              [setId]: !isCurrentlyCollapsed
          };
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


  const areas: BodyArea[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-red-600 mb-2">AX Workout Generator</h1>
          <p className="text-gray-600">Train like an athlete. Generate your perfect workout.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mobile Toggle Button */}
          <div className="md:hidden mb-4">
             <button
               onClick={() => setIsConfigOpen(!isConfigOpen)}
               className="w-full bg-white p-3 rounded-lg shadow flex justify-between items-center text-gray-700 font-bold"
             >
               <span>{isConfigOpen ? 'Hide Configuration' : 'Show Configuration'}</span>
               <span className="text-xl">{isConfigOpen ? '−' : '+'}</span>
             </button>
          </div>

          {/* Configuration Panel */}
          <div className={`md:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit ${isConfigOpen ? 'block' : 'hidden md:block'}`}>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Configuration</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Body Areas</label>
              <div className="space-y-2">
                {areas.map(area => (
                  <label key={area} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-red-600 focus:ring-red-500"
                      checked={selectedBodyAreas.includes(area)}
                      onChange={() => toggleBodyArea(area)}
                      aria-label={area}
                    />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="Regular"
                    checked={mode === 'Regular'}
                    onChange={() => setMode('Regular')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Regular</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="Superset"
                    checked={mode === 'Superset'}
                    onChange={() => setMode('Superset')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Superset</span>
                </label>
              </div>
            </div>

            {mode === 'Superset' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Superset Type</label>
                <select
                  value={supersetType}
                  onChange={(e) => setSupersetType(e.target.value as 'Agonist' | 'Antagonist' | 'Random')}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 border p-2"
                >
                  <option value="Random">Random</option>
                  <option value="Agonist">Agonist (Same Muscle)</option>
                  <option value="Antagonist">Antagonist (Opposing)</option>
                </select>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Exercises</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 border p-2"
                min="1"
                max="50"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-bold transition-colors mb-3"
            >
              GENERATE WORKOUT
            </button>

            {workout && (
              <button
                onClick={handleClear}
                className="w-full bg-white text-red-600 border border-red-600 py-2 px-4 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-bold transition-colors"
              >
                CLEAR WORKOUT
              </button>
            )}
          </div>

          {/* Workout Display */}
          <div className="md:col-span-2 space-y-4">
            {!workout && (
               <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
                 Select your options and click Generate to start.
               </div>
            )}

            {workout?.length === 0 && (
               <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
                 No exercises found for the selected criteria. Try selecting more body areas.
               </div>
            )}

            {workout?.map((set, index) => {
              const isSetComplete = set.exercises.every(ex => ex.isCompleted);
              // Check for manual override:
              // if collapsedSets[set.id] is true -> force collapsed
              // if collapsedSets[set.id] is false -> force expanded
              // if undefined -> use default (isSetComplete)
              const override = collapsedSets[set.id];
              const isSetCollapsed = override !== undefined ? override : isSetComplete;

              return (
                <div
                  key={set.id}
                  ref={(el) => { setRefs.current[index] = el; }}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${isSetComplete ? 'border-green-500' : 'border-red-600'}`}
                >
                  <div
                    className={`bg-gray-50 px-4 py-2 border-b flex justify-between items-center cursor-pointer ${isSetComplete ? 'hover:bg-green-50' : ''}`}
                    onClick={() => handleSetExpandToggle(set.id, isSetComplete)}
                  >
                    <div className="flex items-center space-x-2">
                        <span className={`font-bold whitespace-nowrap ${isSetComplete ? 'text-green-700' : 'text-gray-700'}`}>Set {index + 1}</span>
                        {isSetCollapsed && (
                            <span className="text-sm text-gray-500 truncate ml-2">
                                - {set.exercises.map(ex => ex.name).join(', ')}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-xs uppercase tracking-wide font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {set.type}
                        </span>
                        {isSetComplete && (
                            <span className="text-green-600 font-bold text-lg">✓</span>
                        )}
                    </div>
                  </div>

                  {!isSetCollapsed && (
                    <div className="divide-y divide-gray-100">
                      {set.exercises.map((exercise) => {
                        const isExExpanded = expandedExercises[exercise.id];
                        // If complete, default to collapsed unless expanded
                        const isExCollapsed = exercise.isCompleted && !isExExpanded;

                        return (
                            <div key={exercise.id} className={`p-4 transition-all ${exercise.isCompleted ? 'bg-green-50/30' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div
                                    className={`flex-1 cursor-pointer ${exercise.isCompleted ? 'opacity-60' : ''}`}
                                    onClick={() => handleExerciseExpandToggle(exercise.id)}
                                >
                                    <div className="flex items-center space-x-2">
                                        {exercise.isCompleted && (
                                            <span className="text-green-600 font-bold">✓</span>
                                        )}
                                        <h3 className="text-lg font-bold text-gray-900">{exercise.name}</h3>
                                        <span className="text-xs font-semibold text-white bg-gray-800 px-2 py-1 rounded ml-2">
                                            {exercise.targetMuscle}
                                        </span>
                                    </div>
                                </div>

                                {(!exercise.isCompleted || isExExpanded) && (
                                    <button
                                        onClick={() => toggleExerciseCompletion(set.id, exercise.id)}
                                        className={`ml-4 px-3 py-1 text-sm font-bold rounded border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                                            exercise.isCompleted
                                            ? 'text-gray-500 border-gray-300 hover:bg-gray-100 focus:ring-gray-400'
                                            : 'text-green-600 border-green-600 hover:bg-green-50 focus:ring-green-500'
                                        }`}
                                    >
                                        {exercise.isCompleted ? 'Uncheck' : 'Complete'}
                                    </button>
                                )}
                            </div>

                            {!isExCollapsed && (
                                <>
                                    <p className={`text-gray-600 text-sm mb-3 ${exercise.isCompleted ? 'opacity-60' : ''}`}>{exercise.description}</p>

                                    <details className="group">
                                        <summary className="text-sm font-medium text-red-600 cursor-pointer hover:text-red-800 select-none">
                                        Show Tips
                                        </summary>
                                        <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1 pl-2">
                                        {exercise.tips.map((tip, i) => (
                                            <li key={i}>{tip}</li>
                                        ))}
                                        </ul>
                                    </details>
                                </>
                            )}
                            </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {workout && workout.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={resetAllExercises}
                        className="text-gray-500 hover:text-red-600 underline font-medium text-sm transition-colors"
                    >
                        Mark all exercises incomplete
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
