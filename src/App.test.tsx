import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
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
});