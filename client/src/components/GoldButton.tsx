import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
  testId?: string;
}

export function GoldButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  className,
  type = 'button',
  testId,
}: GoldButtonProps) {
  const baseStyles = "relative px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "gold-gradient text-black font-semibold hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:scale-[0.98]",
    secondary: "bg-white/5 text-gold border border-gold/30 hover:bg-gold/10 hover:border-gold/50",
    outline: "bg-transparent text-gold border border-gold/40 hover:bg-gold/5 hover:border-gold/60",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={testId}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className={cn("flex items-center justify-center gap-2", loading && "opacity-0")}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </span>
      )}
      {variant === 'primary' && !disabled && (
        <motion.span
          className="absolute inset-0 shimmer pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      )}
    </motion.button>
  );
}
