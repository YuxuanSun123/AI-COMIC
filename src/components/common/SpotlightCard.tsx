import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SpotlightCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
  spotlightColor?: string;
}

export default function SpotlightCard({ 
  children, 
  className, 
  spotlightColor = "rgba(124, 58, 237, 0.15)", // Default primary/purple color
  ...props 
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-xl overflow-hidden group h-full"
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-30"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <Card className={cn("relative h-full z-20 bg-card/80 backdrop-blur-sm border-border/60 transition-colors", className)} {...props}>
        {children}
      </Card>
    </motion.div>
  );
}
