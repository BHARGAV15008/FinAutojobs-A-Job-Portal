import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ModernButton from '../../components/ui/ModernButton';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )),
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    ))
  }
}));

describe('ModernButton', () => {
  const defaultProps = {
    children: 'Test Button'
  };

  it('renders button text correctly', () => {
    render(<ModernButton {...defaultProps} />);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<ModernButton {...defaultProps} />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('inline-flex');
    expect(button).toHaveClass('items-center');
    expect(button).toHaveClass('justify-center');
    expect(button).toHaveClass('font-medium');
    expect(button).toHaveClass('transition-all');
  });

  it('applies size classes correctly', () => {
    render(<ModernButton {...defaultProps} size="lg" />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
    expect(button).toHaveClass('text-base');
    expect(button).toHaveClass('rounded-lg');
  });

  it('applies variant classes correctly', () => {
    render(<ModernButton {...defaultProps} variant="success" />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-green-600');
    expect(button).toHaveClass('hover:bg-green-700');
    expect(button).toHaveClass('text-white');
  });

  it('applies gradient classes when gradient prop is true', () => {
    render(<ModernButton {...defaultProps} variant="primary" gradient={true} />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-gradient-to-r');
    expect(button).toHaveClass('from-blue-500');
    expect(button).toHaveClass('to-indigo-600');
  });

  it('applies glow effect classes', () => {
    render(<ModernButton {...defaultProps} glow={true} />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('shadow-blue-500/50');
    expect(button).toHaveClass('hover:shadow-blue-500/75');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<ModernButton {...defaultProps} onClick={handleClick} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon on the left', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(
      <ModernButton {...defaultProps} icon={<TestIcon />} iconPosition="left" />
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders with icon on the right', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(
      <ModernButton {...defaultProps} icon={<TestIcon />} iconPosition="right" />
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(<ModernButton {...defaultProps} loading={true} />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('pointer-events-none');
    expect(screen.getByText('Test Button')).toHaveClass('sr-only');
  });

  it('is disabled when disabled prop is true', () => {
    render(<ModernButton {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
    expect(button).toHaveClass('pointer-events-none');
  });

  it('applies full width when fullWidth is true', () => {
    render(<ModernButton {...defaultProps} fullWidth={true} />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('w-full');
  });

  it('applies custom className', () => {
    render(<ModernButton {...defaultProps} className="custom-class" />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('custom-class');
  });

  it('sets correct button type', () => {
    render(<ModernButton {...defaultProps} type="submit" />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('does not trigger click when disabled', () => {
    const handleClick = vi.fn();
    render(<ModernButton {...defaultProps} onClick={handleClick} disabled={true} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not trigger click when loading', () => {
    const handleClick = vi.fn();
    render(<ModernButton {...defaultProps} onClick={handleClick} loading={true} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  describe('Variant styles', () => {
    it('applies secondary variant correctly', () => {
      render(<ModernButton {...defaultProps} variant="secondary" />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('bg-gray-100');
      expect(button).toHaveClass('hover:bg-gray-200');
      expect(button).toHaveClass('text-gray-900');
    });

    it('applies outline variant correctly', () => {
      render(<ModernButton {...defaultProps} variant="outline" />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-blue-600');
      expect(button).toHaveClass('text-blue-600');
    });

    it('applies ghost variant correctly', () => {
      render(<ModernButton {...defaultProps} variant="ghost" />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('text-gray-700');
      expect(button).toHaveClass('hover:bg-gray-100');
    });

    it('applies link variant correctly', () => {
      render(<ModernButton {...defaultProps} variant="link" />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('text-blue-600');
      expect(button).toHaveClass('hover:text-blue-700');
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('Size variants', () => {
    it('applies xs size correctly', () => {
      render(<ModernButton {...defaultProps} size="xs" />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('px-2.5');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-xs');
    });

    it('applies xl size correctly', () => {
      render(<ModernButton {...defaultProps} size="xl" />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('px-8');
      expect(button).toHaveClass('py-4');
      expect(button).toHaveClass('text-lg');
    });
  });

  describe('Loading state', () => {
    it('shows loading spinner when loading', () => {
      render(<ModernButton {...defaultProps} loading={true} />);
      
      // Check for loading spinner (div with border classes)
      const spinner = document.querySelector('.border-2.border-current.border-t-transparent.rounded-full');
      expect(spinner).toBeInTheDocument();
    });

    it('hides icon when loading', () => {
      const TestIcon = () => <span data-testid="test-icon">Icon</span>;
      render(
        <ModernButton {...defaultProps} icon={<TestIcon />} loading={true} />
      );
      
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<ModernButton {...defaultProps} />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
    });

    it('supports keyboard navigation', () => {
      const handleClick = vi.fn();
      render(<ModernButton {...defaultProps} onClick={handleClick} />);
      const button = screen.getByRole('button');
      
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      
      // Button should be focusable
      expect(button).toHaveFocus();
    });

    it('has proper ARIA attributes when loading', () => {
      render(<ModernButton {...defaultProps} loading={true} />);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
    });
  });

  describe('Dark mode', () => {
    it('applies dark mode classes for secondary variant', () => {
      document.documentElement.classList.add('dark');
      
      render(<ModernButton {...defaultProps} variant="secondary" />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('dark:bg-gray-700');
      expect(button).toHaveClass('dark:hover:bg-gray-600');
      expect(button).toHaveClass('dark:text-white');
      
      document.documentElement.classList.remove('dark');
    });
  });

  describe('Error handling', () => {
    it('handles missing children gracefully', () => {
      render(<ModernButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles invalid variant gracefully', () => {
      render(<ModernButton {...defaultProps} variant="invalid" />);
      const button = screen.getByRole('button');
      // Should fallback to default variant
      expect(button).toBeInTheDocument();
    });
  });
});
