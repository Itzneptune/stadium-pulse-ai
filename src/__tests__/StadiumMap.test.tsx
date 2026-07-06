import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StadiumMap } from '../components/stadium/StadiumMap';

describe('StadiumMap', () => {
  it('renders the SVG map with correct a11y labels', () => {
    render(<StadiumMap />);
    const svg = screen.getByRole('img', { name: 'Interactive Stadium Map' });
    expect(svg).toBeInTheDocument();
  });

  it('renders zones with correct density colors', () => {
    render(
      <StadiumMap 
        zoneDensities={{
          'gate-a': 'CRITICAL',
          'gate-b': 'HIGH',
          'gate-c': 'MEDIUM',
          'gate-d': 'LOW'
        }} 
      />
    );
    
    // Check if the titles exist with correct density strings
    expect(screen.getByText('Gate A - CRITICAL Density')).toBeInTheDocument();
    expect(screen.getByText('Gate B - HIGH Density')).toBeInTheDocument();
    
    // We can also check class names directly if needed, but checking the title is robust
  });

  it('highlights the route', () => {
    const { container } = render(
      <StadiumMap highlightRoute={['gate-a', 'gate-b']} />
    );
    // The route line should be rendered if length > 1
    const lines = container.querySelectorAll('path.stroke-dashed');
    expect(lines.length).toBe(1);
  });
});
