import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-blue-600'
}: StatsCardProps) => {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(numericValue)) {
      const duration = 1000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(value.replace(/[0-9.,]+/, Math.floor(current).toLocaleString('id-ID')));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);
  
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="pt-3 pb-2.5 px-2.5 sm:pt-4 sm:pb-3 sm:px-6">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate pr-1">{title}</p>
          <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} flex-shrink-0`}>
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </div>
        <p className="text-sm sm:text-lg md:text-2xl font-bold text-foreground mb-0.5 sm:mb-1 truncate">{displayValue}</p>
        {trend && !trend.includes('vs kemarin') && (
          <div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground">
            {trend.includes('+') ? (
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
            ) : trend.includes('-') ? (
              <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600 flex-shrink-0" />
            ) : null}
            <p className="text-[9px] sm:text-xs truncate">{trend}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
