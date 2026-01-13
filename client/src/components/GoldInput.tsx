import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GoldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  testId?: string;
}

export const GoldInput = forwardRef<HTMLInputElement, GoldInputProps>(
  ({ className, label, error, testId, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/80 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          data-testid={testId}
          className={cn(
            "w-full px-5 py-4 rounded-xl",
            "bg-white/5 border border-white/20",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20",
            "transition-all duration-300",
            error && "border-destructive/50 focus:border-destructive focus:ring-destructive/20",
            props.disabled && "opacity-50 cursor-not-allowed bg-white/[0.02]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

GoldInput.displayName = 'GoldInput';
