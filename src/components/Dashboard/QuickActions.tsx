import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Action {
  title: string;
  icon: LucideIcon;
  path: string;
  gradientFrom: string;
  gradientTo: string;
}

interface QuickActionsProps {
  actions: Action[];
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Card
            key={action.path}
            onClick={() => navigate(action.path)}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 overflow-hidden animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`p-6 flex flex-col items-center justify-center gap-4 min-h-[160px] bg-gradient-to-br ${action.gradientFrom} ${action.gradientTo} relative`}>
              <div className="absolute inset-0 bg-white/5 animate-shimmer"></div>
              <div className="p-5 rounded-3xl bg-white/20 backdrop-blur-sm shadow-lg relative z-10">
                <Icon className="h-10 w-10 text-white" />
              </div>
              <span className="font-bold text-white text-center text-lg relative z-10">{action.title}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
