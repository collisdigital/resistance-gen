import { describe, it, expect } from 'vitest';
import { generateWorkout } from './workoutGenerator';
import type { WorkoutOptions } from './workoutGenerator';

describe('generateWorkout', () => {
  it('should generate requested number of exercises in Regular mode', () => {
    const options: WorkoutOptions = {
      bodyAreas: ['Chest', 'Back'],
      mode: 'Regular',
      count: 4
    };
    const workout = generateWorkout(options);
    const totalExercises = workout.reduce((acc, set) => acc + set.exercises.length, 0);

    expect(totalExercises).toBe(4);
    expect(workout.length).toBe(4);
    workout.forEach(set => {
      expect(set.type).toBe('Regular');
      expect(set.exercises.length).toBe(1);
    });
  });

  it('should generate requested number of exercises in Superset mode', () => {
    const options: WorkoutOptions = {
      bodyAreas: ['Chest', 'Back'], // Plenty of options
      mode: 'Superset',
      supersetType: 'Random',
      count: 4
    };
    const workout = generateWorkout(options);
    const totalExercises = workout.reduce((acc, set) => acc + set.exercises.length, 0);

    expect(totalExercises).toBe(4);
    // Should be 2 sets of 2
    expect(workout.length).toBe(2);
    workout.forEach(set => {
      expect(set.type).toBe('Superset');
      expect(set.exercises.length).toBe(2);
    });
  });

  it('should handle odd number of exercises in Superset mode', () => {
    const options: WorkoutOptions = {
      bodyAreas: ['Chest', 'Back'],
      mode: 'Superset',
      supersetType: 'Random',
      count: 3
    };
    const workout = generateWorkout(options);
    const totalExercises = workout.reduce((acc, set) => acc + set.exercises.length, 0);

    expect(totalExercises).toBe(3);
    // Should be 1 superset (2) + 1 regular (1) = 2 sets total
    expect(workout.length).toBe(2);
  });

  it('should filter by body area', () => {
    const options: WorkoutOptions = {
      bodyAreas: ['Legs'],
      mode: 'Regular',
      count: 5
    };
    const workout = generateWorkout(options);
    workout.forEach(set => {
      set.exercises.forEach(ex => {
        expect(ex.targetMuscle).toBe('Legs');
      });
    });
  });

  it('should respect Agonist superset logic', () => {
    const options: WorkoutOptions = {
      bodyAreas: ['Chest', 'Back', 'Legs'],
      mode: 'Superset',
      supersetType: 'Agonist',
      count: 4
    };
    const workout = generateWorkout(options);

    workout.forEach(set => {
      if (set.type === 'Superset') {
        const [ex1, ex2] = set.exercises;
        expect(ex1.targetMuscle).toBe(ex2.targetMuscle);
      }
    });
  });

  it('should respect Antagonist superset logic (Push/Pull)', () => {
    // Only pick Chest (Push) and Back (Pull) to ensure we can match
    const options: WorkoutOptions = {
      bodyAreas: ['Chest', 'Back'],
      mode: 'Superset',
      supersetType: 'Antagonist',
      count: 4
    };
    const workout = generateWorkout(options);

    workout.forEach(set => {
      if (set.type === 'Superset') {
        const [ex1, ex2] = set.exercises;
        // If one is Push, other should be Pull (based on our simple logic)
        if (ex1.type === 'Push') expect(ex2.type).toBe('Pull');
        if (ex1.type === 'Pull') expect(ex2.type).toBe('Push');
      }
    });
  });

  it('should return empty if no body areas selected', () => {
     const options: WorkoutOptions = {
      bodyAreas: [],
      mode: 'Regular',
      count: 5
    };
    const workout = generateWorkout(options);
    expect(workout.length).toBe(0);
  });

  it('should respect groupByStation logic', () => {
      const options: WorkoutOptions = {
        bodyAreas: ['Chest', 'Back'],
        mode: 'Regular',
        count: 6,
        groupByStation: true
      };

      const workout = generateWorkout(options);

      // Collect stations in order
      const stations = workout.flatMap(set => set.exercises.map(ex => ex.station));

      // Check if stations are grouped (i.e., minimal switching)
      let switches = 0;
      for (let i = 1; i < stations.length; i++) {
          if (stations[i] !== stations[i - 1]) {
              switches++;
          }
      }

      // With 6 exercises and maybe 2-3 stations, we expect very few switches.
      // If random, switches would be higher.
      // E.g. A A B B C C -> 2 switches.
      // E.g. A B A B A B -> 5 switches.

      // Given the logic exhausts a station before moving, switches should be roughly (NumStations - 1).
      // Available stations for Chest/Back are Free Weights, Cable, Bodyweight (3 stations).
      // So max switches should be 2 (unless a station is revisited which shouldn't happen with current logic).

      expect(switches).toBeLessThanOrEqual(3);
  });

  it('should respect groupByStation in supersets (strict matching)', () => {
      const options: WorkoutOptions = {
          bodyAreas: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'], // Use all to get variety
          mode: 'Superset',
          count: 10,
          groupByStation: true,
          supersetType: 'Random'
      };

      const workout = generateWorkout(options);

      workout.forEach(set => {
          if (set.type === 'Superset') {
              const [ex1, ex2] = set.exercises;
              expect(ex1.station).toBe(ex2.station);
          }
      });
  });
});
