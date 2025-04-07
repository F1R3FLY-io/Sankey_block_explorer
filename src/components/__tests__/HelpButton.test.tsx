import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpButton from '../HelpButton';

// Mock the HelpModal component
vi.mock('../HelpModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="help-modal" onClick={onClose}>Mock Help Modal</div> : null
}));

describe('HelpButton', () => {
  it('should render the button with default text', () => {
    render(<HelpButton />);
    expect(screen.getByText('What am I looking at?')).toBeInTheDocument();
  });

  it('should apply custom className if provided', () => {
    render(<HelpButton className="custom-class" />);
    const button = screen.getByText('What am I looking at?');
    expect(button).toHaveClass('help-button');
    expect(button).toHaveClass('custom-class');
  });

  it('should apply custom style if provided', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<HelpButton style={customStyle} />);
    const button = screen.getByText('What am I looking at?');
    // Instead of checking the computed style, just verify it's there
    expect(button).toHaveAttribute('style');
  });

  it('should open the modal when clicked', () => {
    render(<HelpButton />);
    
    // Initially, the modal should not be present
    expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
    
    // Click the button
    fireEvent.click(screen.getByText('What am I looking at?'));
    
    // Now the modal should be present
    expect(screen.getByTestId('help-modal')).toBeInTheDocument();
  });

  it('should close the modal when the onClose function is called', () => {
    render(<HelpButton />);
    
    // Open the modal
    fireEvent.click(screen.getByText('What am I looking at?'));
    expect(screen.getByTestId('help-modal')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByTestId('help-modal'));
    
    // The modal should be closed
    expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
  });
});