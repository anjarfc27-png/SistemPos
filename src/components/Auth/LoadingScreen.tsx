import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

export const LoadingScreen = ({ message = 'Memuat...', progress = 0 }: LoadingScreenProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center animate-fade-in">
        {/* Logo with pulse animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
              K
            </div>
          </div>
        </div>

        {/* Loading message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {message}{dots}
          </h2>
          <p className="text-sm text-muted-foreground">
            Mohon tunggu sebentar
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>
      </Card>
    </div>
  );
};
