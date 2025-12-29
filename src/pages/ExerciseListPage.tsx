import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exercises } from '../data/exercises';
import type { BodyArea } from '../data/exercises';
import { useWorkout } from '../hooks/useWorkout';

export default function ExerciseListPage() {
  const navigate = useNavigate();
  const { addExerciseToWorkout, isExerciseInWorkout } = useWorkout();

  const [selectedBodyArea, setSelectedBodyArea] = useState<BodyArea | 'All'>('All');

  const areas: BodyArea[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Corrective'];

  const filteredExercises = exercises.filter(ex =>
    selectedBodyArea === 'All' || ex.targetMuscle === selectedBodyArea
  );

  const handleAddToWorkout = (exercise: typeof exercises[0]) => {
    addExerciseToWorkout(exercise);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
            <button
                onClick={() => void navigate('/')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
            >
                ← Back to Workout
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight text-red-600">Exercise Library</h1>
            <div className="w-24"></div> {/* Spacer for centering if needed, or just empty */}
        </header>

        {/* Filter Chips */}
        <div className="mb-8 overflow-x-auto pb-2">
            <div className="flex space-x-2">
                <button
                    onClick={() => setSelectedBodyArea('All')}
                    className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                        selectedBodyArea === 'All'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    All
                </button>
                {areas.map(area => (
                    <button
                        key={area}
                        onClick={() => setSelectedBodyArea(area)}
                        className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                            selectedBodyArea === area
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {area}
                    </button>
                ))}
            </div>
        </div>

        {/* Exercise List */}
        <div className="grid gap-4">
            {filteredExercises.map(exercise => {
                const isInWorkout = isExerciseInWorkout(exercise.id);

                return (
                    <div key={exercise.id} className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900">{exercise.name}</h3>
                                <span className="text-xs font-semibold text-white bg-gray-800 px-2 py-0.5 rounded">
                                    {exercise.targetMuscle}
                                </span>
                                {isInWorkout && (
                                    <span className="text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded ml-2">
                                        ADDED
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{exercise.description}</p>
                        </div>

                        <button
                            onClick={() => handleAddToWorkout(exercise)}
                            className={`shrink-0 px-4 py-2 rounded font-bold text-sm transition-colors ${
                                isInWorkout
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            {isInWorkout ? 'Add Again' : 'Add to Workout'}
                        </button>
                    </div>
                );
            })}

            {filteredExercises.length === 0 && (
                <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow">
                    No exercises found for this category.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
