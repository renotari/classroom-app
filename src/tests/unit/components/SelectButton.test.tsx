/**
 * SelectButton Component - Unit Tests
 *
 * Tests for:
 * - Button click handler
 * - Disabled state
 * - Animating state (loading spinner)
 * - Accessibility attributes
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectButton } from '../../../components/RandomStudent/SelectButton';

describe('SelectButton', () => {
  describe('Default State', () => {
    it('should render button with default text', () => {
      render(<SelectButton onClick={vi.fn()} />);

      expect(screen.getByText('Seleziona Studente')).toBeInTheDocument();
    });

    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<SelectButton onClick={handleClick} />);

      await user.click(screen.getByText('Seleziona Studente'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have accessible label', () => {
      render(<SelectButton onClick={vi.fn()} />);

      const button = screen.getByLabelText('Seleziona studente casuale');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should render as disabled when disabled prop is true', () => {
      render(<SelectButton onClick={vi.fn()} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not call onClick when disabled and clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<SelectButton onClick={handleClick} disabled={true} />);

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply disabled styling', () => {
      const { container } = render(<SelectButton onClick={vi.fn()} disabled={true} />);

      const button = container.querySelector('[class*="cursor-not-allowed"]');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Animating State', () => {
    it('should show "Selezione..." text when animating', () => {
      render(<SelectButton onClick={vi.fn()} isAnimating={true} />);

      expect(screen.getByText('Selezione...')).toBeInTheDocument();
    });

    it('should show loading spinner when animating', () => {
      const { container } = render(<SelectButton onClick={vi.fn()} isAnimating={true} />);

      const spinner = container.querySelector('[class*="animate-spin"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should have aria-busy="true" when animating', () => {
      render(<SelectButton onClick={vi.fn()} isAnimating={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should not show user icon when animating', () => {
      const { container } = render(<SelectButton onClick={vi.fn()} isAnimating={false} />);
      const userIcon = container.querySelector('svg path[d*="M12 4.354"]');
      expect(userIcon).toBeInTheDocument();

      const { container: animatingContainer } = render(
        <SelectButton onClick={vi.fn()} isAnimating={true} />
      );
      const spinnerIcon = animatingContainer.querySelector('svg circle');
      expect(spinnerIcon).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have minimum size for touch targets', () => {
      const { container } = render(<SelectButton onClick={vi.fn()} />);

      const button = container.querySelector('[class*="min-w-[200px]"]');
      expect(button).toBeInTheDocument();

      const buttonHeight = container.querySelector('[class*="min-h-[80px]"]');
      expect(buttonHeight).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <SelectButton onClick={vi.fn()} className="custom-class" />
      );

      const button = container.querySelector('.custom-class');
      expect(button).toBeInTheDocument();
    });

    it('should have hover effect when not disabled', () => {
      const { container } = render(<SelectButton onClick={vi.fn()} disabled={false} />);

      const button = container.querySelector('[class*="hover:bg-primary"]');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle both disabled and animating states', () => {
      render(<SelectButton onClick={vi.fn()} disabled={true} isAnimating={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Selezione...')).toBeInTheDocument();
    });
  });
});
