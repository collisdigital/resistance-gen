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
});