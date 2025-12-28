import { useState, useEffect } from 'react';
import type { BodyArea } from './data/exercises';
import { generateWorkout } from './utils/workoutGenerator';
import type { WorkoutOptions, WorkoutSet } from './utils/workoutGenerator';

export default function App() {
  // State for configuration
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<BodyArea[]>([]);
  const [mode, setMode] = useState<'Regular' | 'Superset'>('Regular');
  const [supersetType, setSupersetType] = useState<'Agonist' | 'Antagonist' | 'Random'>('Random');
  const [count, setCount] = useState<number>(10);

  // State for generated workout
  const [workout, setWorkout] = useState<WorkoutSet[] | null>(() => {
    const saved = localStorage.getItem('lastWorkout');
    if (saved) {
      try {
        return JSON.parse(saved) as WorkoutSet[];
      } catch (e) {
        console.error("Failed to load workout", e);
      }
    }
    return null;
  });

  // State for mobile config panel visibility
  // Default to true if no workout, false if workout exists (for mobile UX)
  const [isConfigOpen, setIsConfigOpen] = useState(!workout);

  // Save to local storage whenever workout changes
  useEffect(() => {
    if (workout) {
      localStorage.setItem('lastWorkout', JSON.stringify(workout));
    } else {
      localStorage.removeItem('lastWorkout');
    }
  }, [workout]);

  const toggleBodyArea = (area: BodyArea) => {
    setSelectedBodyAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleClear = () => {
    setWorkout(null);
    setIsConfigOpen(true); // Keep config open when cleared so user can generate new one
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
    // Collapse config panel on mobile after generation
    setIsConfigOpen(false);
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

            {workout?.map((set, index) => (
              <div key={set.id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-red-600">
                <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                  <span className="font-bold text-gray-700">Set {index + 1}</span>
                  <span className="text-xs uppercase tracking-wide font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {set.type}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {set.exercises.map((exercise) => (
                    <div key={exercise.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{exercise.name}</h3>
                        <span className="text-xs font-semibold text-white bg-gray-800 px-2 py-1 rounded">
                          {exercise.targetMuscle}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>

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
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
