import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpModal from '../HelpModal';

describe('HelpModal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(<HelpModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<HelpModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('MeTTaCycle Explorer')).toBeInTheDocument();
    expect(screen.getByText('What is it?')).toBeInTheDocument();
    expect(screen.getByText('What do the elements mean?')).toBeInTheDocument();
  });

  it('should call onClose when clicking the overlay', () => {
    const onClose = vi.fn();
    render(<HelpModal isOpen={true} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('MeTTaCycle Explorer').closest('.modal-overlay')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking the "Got it" button', () => {
    const onClose = vi.fn();
    render(<HelpModal isOpen={true} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('Got it'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when clicking the modal content itself', () => {
    const onClose = vi.fn();
    render(<HelpModal isOpen={true} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('MeTTaCycle Explorer').closest('.modal-content')!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should display the correct explanation content', () => {
    render(<HelpModal isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('This is one block of events in a decentralized system.')).toBeInTheDocument();
    expect(screen.getByText('Node (rectangle) — an address (a participant)')).toBeInTheDocument();
    expect(screen.getByText('Arrow between nodes — an interaction in this block')).toBeInTheDocument();
  });
});