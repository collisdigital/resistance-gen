import { describe, it, expect } from 'vitest';
import { exercises } from './exercises';

describe('Exercise Data', () => {
  it('should have valid exercises', () => {
    expect(exercises.length).toBeGreaterThan(0);
    exercises.forEach(exercise => {
      expect(exercise.id).toBeDefined();
      expect(exercise.name).toBeDefined();
      expect(exercise.targetMuscle).toBeDefined();
      expect(exercise.description).toBeDefined();
      expect(exercise.tips).toBeDefined();
      expect(exercise.type).toBeDefined();
    });
  });

  it('should have unique IDs', () => {
    const ids = exercises.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid muscle groups', () => {
    const validMuscles = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Corrective'];
    exercises.forEach(exercise => {
      expect(validMuscles).toContain(exercise.targetMuscle);
      if (exercise.secondaryMuscles) {
        exercise.secondaryMuscles.forEach(m => {
          expect(validMuscles).toContain(m);
        });
      }
    });
  });
});
