import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  withGlow?: boolean;
}

export function GlassPanel({ children, className, withGlow = true }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-panel rounded-2xl p-8 md:p-10 relative",
        withGlow && "gold-glow",
        className
      )}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        {/* Minimal glass effect for clarity */}
        <div className="absolute inset-0 rounded-2xl border border-white/15 backdrop-blur-xl" />
      </div>
      {children}
    </motion.div>
  );
}
