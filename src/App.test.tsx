import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock scrollIntoView since it's not available in jsdom
Element.prototype.scrollIntoView = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByText('AX Workout Generator')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('generates a workout and allows clearing it', () => {
    render(<App />);

    // Initially, no workout should be displayed
    const initialMessage = screen.getByText(/Select your options and click Generate to start/i);
    expect(initialMessage).toBeInTheDocument();
    expect(screen.queryByText('CLEAR WORKOUT')).not.toBeInTheDocument();

    // Select a body area (Chest)
    const chestCheckbox = screen.getByLabelText('Chest');
    fireEvent.click(chestCheckbox);

    // Click Generate
    const generateBtn = screen.getByText('GENERATE WORKOUT');
    fireEvent.click(generateBtn);

    // Check if workout is displayed
    // "Set 1" should be visible
    expect(screen.getByText('Set 1')).toBeInTheDocument();

    // Check if Clear button is now visible
    const clearBtn = screen.getByText('CLEAR WORKOUT');
    expect(clearBtn).toBeInTheDocument();

    // Click Clear
    fireEvent.click(clearBtn);

    // Check if workout is gone
    expect(screen.queryByText('Set 1')).not.toBeInTheDocument();
    expect(screen.getByText(/Select your options and click Generate to start/i)).toBeInTheDocument();
    
    // Check if Clear button is gone
    expect(screen.queryByText('CLEAR WORKOUT')).not.toBeInTheDocument();
  });

  it('restores configuration from local storage', () => {
    // 1. Generate a workout with specific settings
    const { unmount } = render(<App />);

    // Select 'Superset' mode
    const supersetRadio = screen.getByLabelText('Superset');
    fireEvent.click(supersetRadio);

    // Select 'Agonist' type
    const supersetTypeSelect = screen.getByDisplayValue('Random'); // Initially Random
    fireEvent.change(supersetTypeSelect, { target: { value: 'Agonist' } });

    // Change count to 12
    const countInput = screen.getByDisplayValue('10');
    fireEvent.change(countInput, { target: { value: '12' } });

    // Select body area
    const chestCheckbox = screen.getByLabelText('Chest');
    fireEvent.click(chestCheckbox);

    // Generate
    fireEvent.click(screen.getByText('GENERATE WORKOUT'));

    // Verify workout is generated
    expect(screen.getByText('Set 1')).toBeInTheDocument();

    // 2. Unmount (simulate page close)
    unmount();

    // 3. Render again (simulate page reload)
    render(<App />);

    // Verify workout is restored
    expect(screen.getByText('Set 1')).toBeInTheDocument();

    // Verify configuration is restored
    const supersetRadioRestored = screen.getByLabelText('Superset');
    expect((supersetRadioRestored as HTMLInputElement).checked).toBe(true);

    const supersetTypeSelectRestored = screen.getByDisplayValue('Agonist (Same Muscle)');
    expect(supersetTypeSelectRestored).toBeInTheDocument();

    const countInputRestored = screen.getByDisplayValue('12');
    expect(countInputRestored).toBeInTheDocument();

    const chestCheckboxRestored = screen.getByLabelText('Chest');
    expect((chestCheckboxRestored as HTMLInputElement).checked).toBe(true);
  });

  it('handles exercise completion and persistence', () => {
      const { unmount } = render(<App />);

      // Generate workout
      fireEvent.click(screen.getByLabelText('Chest'));
      fireEvent.click(screen.getByText('GENERATE WORKOUT'));

      // Find first 'Complete' button
      const completeBtns = screen.getAllByText('Complete');
      const firstCompleteBtn = completeBtns[0];

      // Click complete
      fireEvent.click(firstCompleteBtn);

      // Verify it changes to 'Uncheck' (which implies it's now completed)
      // Note: In our logic, if it's completed, it collapses. To see 'Uncheck', we must expand it or it must be expanded.
      // But we just clicked it. If logic says collapsed on complete, the button might disappear until expanded.
      // Let's check if checkmark appears in the header (which is always visible)
      // The header has a checkmark if completed? No, the header of exercise has checkmark if completed.
      // "✓" text is present when completed.
      expect(screen.getByText('✓')).toBeInTheDocument();

      // Verify persistence
      unmount();
      render(<App />);

      // Should still have checkmark
      expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('collapses set when all exercises are complete', () => {
    render(<App />);

    // Generate workout with 1 exercise count to ensure 1 set = 1 exercise (Regular mode)
    fireEvent.click(screen.getByLabelText('Chest'));
    const countInput = screen.getByDisplayValue('10');
    fireEvent.change(countInput, { target: { value: '1' } });
    fireEvent.click(screen.getByText('GENERATE WORKOUT'));

    // Click complete on the only exercise
    const completeBtn = screen.getByText('Complete');
    fireEvent.click(completeBtn);

    // Now the set should be complete.
    // Set header should have checkmark.
    // Since there's only one checkmark (exercise) and one set checkmark, let's look for multiple or specific context.
    // The set header has a green checkmark when complete.
    // We can query by the green checkmark text or class.

    // Check for set completion indicator (Set 1 text becomes green)
    const setHeader = screen.getByText('Set 1');
    expect(setHeader).toHaveClass('text-green-700');
  });

  it('resets all exercises', () => {
     // Mock window.confirm
     window.confirm = vi.fn(() => true);

     render(<App />);

     fireEvent.click(screen.getByLabelText('Chest'));
     fireEvent.click(screen.getByText('GENERATE WORKOUT'));

     // Mark complete
     const completeBtn = screen.getAllByText('Complete')[0];
     fireEvent.click(completeBtn);
     expect(screen.queryByText('✓')).toBeInTheDocument();

     // Click Reset
     const resetLink = screen.getByText('Mark all exercises incomplete');
     fireEvent.click(resetLink);

     // Checkmark should be gone
     expect(screen.queryByText('✓')).not.toBeInTheDocument();
     expect(window.confirm).toHaveBeenCalled();
  });
});
