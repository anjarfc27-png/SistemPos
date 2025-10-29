import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  adminOnly?: boolean;
}

interface MoreMenuProps {
  items: MenuItem[];
  isAdmin: boolean;
}

export const MoreMenu = ({ items, isAdmin }: MoreMenuProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const visibleItems = items.filter(item => !item.adminOnly || isAdmin);

  if (visibleItems.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-0 shadow-sm overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <span className="font-semibold">Menu Lainnya</span>
            <ChevronRight
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                isOpen ? 'rotate-90' : ''
              }`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-2 px-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
