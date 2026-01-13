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
    primary: "gold-gradient text-black font-semibold hover:shadow-[0_0_30px_rgba(200,200,200,0.5)] active:scale-[0.98]",
    secondary: "bg-white/5 text-white border border-white/30 hover:bg-white/10 hover:border-white/50",
    outline: "bg-transparent text-white border border-white/40 hover:bg-white/5 hover:border-white/60",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={testId}
      whileHover={{ 
        scale: disabled ? 1 : 1.02,
        boxShadow: disabled ? undefined : ['0 0 0px rgba(200, 200, 200, 0)', '0 0 20px rgba(200, 200, 200, 0.4)', '0 0 0px rgba(200, 200, 200, 0)'],
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{
        boxShadow: { duration: 0.3 },
      }}
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
      
      {/* Enhanced glow effect for primary buttons */}
      {variant === 'primary' && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-white/10 blur-md -z-10"
          whileHover={{ opacity: 0.8 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}
