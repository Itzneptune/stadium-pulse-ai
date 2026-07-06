import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AskPulse } from '../components/chat/AskPulse';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'Test response', route: [] }),
  })
) as jest.Mock;

describe('AskPulse', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    Element.prototype.scrollIntoView = jest.fn(); // Mock scrollIntoView
  });

  it('renders initial state correctly', () => {
    render(<AskPulse onRouteReceived={jest.fn()} accessibilityMode={false} setAccessibilityMode={jest.fn()} />);
    
    // Check initial message
    expect(screen.getByText(/Hi! I am StadiumPulse/i)).toBeInTheDocument();
    
    // Check input and button
    const input = screen.getByLabelText('Ask Pulse a question');
    expect(input).toBeInTheDocument();
    
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toBeDisabled(); // Should be disabled initially
  });

  it('enables submit button when typing', () => {
    render(<AskPulse onRouteReceived={jest.fn()} accessibilityMode={false} setAccessibilityMode={jest.fn()} />);
    
    const input = screen.getByLabelText('Ask Pulse a question');
    const sendButton = screen.getByLabelText('Send message');
    
    fireEvent.change(input, { target: { value: 'Where is the food?' } });
    expect(sendButton).not.toBeDisabled();
  });

  it('submits message and shows response', async () => {
    render(<AskPulse onRouteReceived={jest.fn()} accessibilityMode={false} setAccessibilityMode={jest.fn()} />);
    
    const input = screen.getByLabelText('Ask Pulse a question');
    const sendButton = screen.getByLabelText('Send message');
    
    fireEvent.change(input, { target: { value: 'Where is Gate B?' } });
    fireEvent.click(sendButton);

    // Verify user message is displayed immediately
    expect(screen.getByText('Where is Gate B?')).toBeInTheDocument();
    expect(input).toHaveValue('');

    // Wait for the mock API response to be rendered
    await waitFor(() => {
      expect(screen.getByText('Test response')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
  });

  it('shows error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));
    render(<AskPulse onRouteReceived={jest.fn()} accessibilityMode={false} setAccessibilityMode={jest.fn()} />);
    
    const input = screen.getByLabelText('Ask Pulse a question');
    const sendButton = screen.getByLabelText('Send message');
    
    fireEvent.change(input, { target: { value: 'Where is Gate B?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Sorry, I am having trouble connecting right now.')).toBeInTheDocument();
    });
  });

  it('toggles accessibility mode', () => {
    const setAcc = jest.fn();
    render(<AskPulse onRouteReceived={jest.fn()} accessibilityMode={false} setAccessibilityMode={setAcc} />);
    
    const toggle = screen.getByTitle('Toggle Accessibility Routing');
    fireEvent.click(toggle);
    
    expect(setAcc).toHaveBeenCalledWith(true);
  });

  it('does not submit when input is empty', () => {
    render(<AskPulse onRouteReceived={jest.fn()} accessibilityMode={false} setAccessibilityMode={jest.fn()} />);
    
    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);
    
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
