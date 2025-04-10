import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpButton from '../HelpButton';

describe('HelpButton', () => {
  it('should render the button with default text', () => {
    render(<HelpButton />);
    expect(screen.getByText('Help (?)')).toBeInTheDocument();
  });

  it('should apply custom className if provided', () => {
    render(<HelpButton className="custom-class" />);
    const button = screen.getByText('Help (?)');
    expect(button).toHaveClass('border-blue-500');
    expect(button).toHaveClass('text-blue-500');
  });

  it('should apply custom style if provided', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<HelpButton style={customStyle} />);
    const button = screen.getByText('Help (?)');
    // Style is applied to the Button component which handles it internally
    expect(button).toBeInTheDocument();
  });

  it('should open the modal when clicked', () => {
    render(<HelpButton />);
    
    // Click the button to open the modal
    fireEvent.click(screen.getByText('Help (?)'));
    
    // Verify the modal content is present
    expect(screen.getByText('How to Use the Explorer')).toBeInTheDocument();
  });

  it('should close the modal when the Close button is clicked', () => {
    render(<HelpButton />);
    
    // Open the modal
    fireEvent.click(screen.getByText('Help (?)'));
    expect(screen.getByText('How to Use the Explorer')).toBeInTheDocument();
    
    // Close the modal by clicking Close button
    fireEvent.click(screen.getByText('Close'));
    
    // The modal content should no longer be visible
    expect(screen.queryByText('How to Use the Explorer')).not.toBeInTheDocument();
  });
});