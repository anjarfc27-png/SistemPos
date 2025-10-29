import { Input } from './input';
import { forwardRef } from 'react';

interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | number;
  onChange?: (value: string) => void;
}

export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const formatNumber = (val: string) => {
      // Remove all non-digit characters
      const numbers = val.replace(/\D/g, '');
      // Add thousand separators
      return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formattedValue = formatNumber(inputValue);
      onChange?.(formattedValue);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PriceInput.displayName = 'PriceInput';
