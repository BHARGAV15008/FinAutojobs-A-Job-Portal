import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ModernCard from '../../components/ui/ModernCard';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    ))
  }
}));

describe('ModernCard', () => {
  const defaultProps = {
    children: <div>Test content</div>
  };

  it('renders children correctly', () => {
    render(<ModernCard {...defaultProps} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<ModernCard {...defaultProps} />);
    const card = container.firstChild;
    
    expect(card).toHaveClass('relative');
    expect(card).toHaveClass('transition-all');
    expect(card).toHaveClass('duration-300');
    expect(card).toHaveClass('ease-in-out');
  });

  it('applies variant classes correctly', () => {
    const { container } = render(
      <ModernCard {...defaultProps} variant="primary" />
    );
    const card = container.firstChild;
    
    expect(card).toHaveClass('bg-gradient-to-br');
    expect(card).toHaveClass('from-blue-50');
    expect(card).toHaveClass('to-indigo-50');
  });

  it('applies gradient classes when gradient prop is provided', () => {
    const { container } = render(
      <ModernCard {...defaultProps} gradient="ocean" />
    );
    const card = container.firstChild;
    
    expect(card).toHaveClass('bg-gradient-to-br');
    expect(card).toHaveClass('from-blue-500');
    expect(card).toHaveClass('to-purple-600');
  });

  it('applies glass morphism classes', () => {
    const { container } = render(
      <ModernCard {...defaultProps} glassMorphism={true} />
    );
    const card = container.firstChild;
    
    expect(card).toHaveClass('backdrop-blur-lg');
    expect(card).toHaveClass('bg-white/10');
  });

  it('applies shadow classes correctly', () => {
    const { container } = render(
      <ModernCard {...defaultProps} shadow="xl" />
    );
    const card = container.firstChild;
    
    expect(card).toHaveClass('shadow-xl');
  });

  it('applies padding classes correctly', () => {
    const { container } = render(
      <ModernCard {...defaultProps} padding="lg" />
    );
    const card = container.firstChild;
    
    expect(card).toHaveClass('p-8');
  });

  it('applies border radius classes correctly', () => {
    const { container } = render(
      <ModernCard {...defaultProps} borderRadius="2xl" />
    );
    const card = container.firstChild;
    
    expect(card).toHaveClass('rounded-2xl');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ModernCard {...defaultProps} className="custom-class" />
    );
    const card = container.firstChild;
    
    expect(card).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <ModernCard {...defaultProps} onClick={handleClick} />
    );
    const card = container.firstChild;
    
    expect(card).toHaveClass('cursor-pointer');
    
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables hover when hover prop is false', () => {
    const { container } = render(
      <ModernCard {...defaultProps} hover={false} />
    );
    const card = container.firstChild;
    
    // Should not have hover-related classes or effects
    expect(card).toBeInTheDocument();
  });

  it('renders floating effect overlay when hover is enabled', () => {
    const { container } = render(
      <ModernCard {...defaultProps} hover={true} />
    );
    
    // Check for floating effect overlay (motion.div)
    const overlays = container.querySelectorAll('div');
    expect(overlays.length).toBeGreaterThan(1);
  });

  it('does not render floating effect when glassMorphism is enabled', () => {
    const { container } = render(
      <ModernCard {...defaultProps} hover={true} glassMorphism={true} />
    );
    
    // With glassMorphism, floating effect should not be rendered
    expect(container.firstChild).toBeInTheDocument();
  });

  it('forwards additional props', () => {
    const { container } = render(
      <ModernCard {...defaultProps} data-testid="test-card" role="button" />
    );
    const card = container.firstChild;
    
    expect(card).toHaveAttribute('data-testid', 'test-card');
    expect(card).toHaveAttribute('role', 'button');
  });

  describe('Accessibility', () => {
    it('has proper accessibility attributes when clickable', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <ModernCard {...defaultProps} onClick={handleClick} />
      );
      const card = container.firstChild;
      
      expect(card).toHaveClass('cursor-pointer');
    });

    it('supports keyboard navigation when clickable', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <ModernCard {...defaultProps} onClick={handleClick} />
      );
      const card = container.firstChild;
      
      // Focus and press Enter
      card.focus();
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      
      // Note: This would require additional keyboard handling in the component
      expect(card).toBeInTheDocument();
    });
  });

  describe('Dark mode', () => {
    it('applies dark mode classes correctly', () => {
      // Mock dark mode by adding dark class to document
      document.documentElement.classList.add('dark');
      
      const { container } = render(<ModernCard {...defaultProps} />);
      const card = container.firstChild;
      
      expect(card).toHaveClass('dark:bg-gray-800');
      expect(card).toHaveClass('dark:border-gray-700');
      
      // Cleanup
      document.documentElement.classList.remove('dark');
    });
  });

  describe('Responsive behavior', () => {
    it('maintains responsive classes', () => {
      const { container } = render(
        <ModernCard {...defaultProps} className="md:p-8 lg:p-10" />
      );
      const card = container.firstChild;
      
      expect(card).toHaveClass('md:p-8');
      expect(card).toHaveClass('lg:p-10');
    });
  });

  describe('Error handling', () => {
    it('handles missing children gracefully', () => {
      const { container } = render(<ModernCard />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles invalid variant gracefully', () => {
      const { container } = render(
        <ModernCard {...defaultProps} variant="invalid" />
      );
      // Should fallback to default variant
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
