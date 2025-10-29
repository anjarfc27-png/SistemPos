import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { usePOSContext } from '@/contexts/POSContext';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { MoreMenu } from '@/components/Dashboard/MoreMenu';
import { DashboardAnalytics } from '@/components/Dashboard/DashboardAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Package,
  BarChart3,
  FileText,
  Settings,
  Users,
  LogOut,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';

export const Dashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { currentStore } = useStore();
  const { receipts, formatPrice } = usePOSContext();
  const navigate = useNavigate();

  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayReceipts = receipts.filter(r => {
      const receiptDate = new Date(r.timestamp).toDateString();
      return receiptDate === today && !r.isManual && !r.id.startsWith('MNL-');
    });
    
    const revenue = todayReceipts.reduce((sum, r) => sum + r.total, 0);
    const profit = todayReceipts.reduce((sum, r) => sum + r.profit, 0);
    const transactions = todayReceipts.length;
    
    return { revenue, profit, transactions };
  }, [receipts]);

  // Removed automatic redirect - users should explicitly choose where to go

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const quickActions = [
    { 
      title: 'Kasir POS', 
      icon: ShoppingCart, 
      path: '/pos',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600'
    },
    { 
      title: 'PPOB', 
      icon: Package, 
      path: '/ppob',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-600'
    },
  ];

  const moreMenuItems = [
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: FileText, label: 'Laporan', path: '/reports' },
    { icon: Settings, label: 'Pengaturan', path: '/settings' },
    { icon: MessageSquare, label: 'Kritik & Saran', path: '/feedback', adminOnly: false },
    { icon: Users, label: 'Kelola User', path: '/admin/users', adminOnly: true },
    { icon: Calendar, label: 'Kelola Subscription', path: '/admin/subscriptions', adminOnly: true },
    { icon: MessageSquare, label: 'Lihat Feedback', path: '/admin/feedbacks', adminOnly: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 pb-20 space-y-4 sm:space-y-6 safe-top safe-bottom animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border bg-card shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{currentStore?.name || 'Sistem Kasir'}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Stats Cards - For all users */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatsCard 
          title="Pendapatan" 
          value={formatPrice(todayStats.revenue)} 
          icon={DollarSign} 
          trend={todayStats.revenue > 0 ? "Hari ini" : undefined}
          gradientFrom="from-blue-500" 
          gradientTo="to-blue-600" 
        />
        <StatsCard 
          title="Profit" 
          value={formatPrice(todayStats.profit)} 
          icon={DollarSign} 
          trend={todayStats.profit > 0 ? "Hari ini" : undefined}
          gradientFrom="from-emerald-500" 
          gradientTo="to-emerald-600" 
        />
        <StatsCard 
          title="Transaksi" 
          value={todayStats.transactions.toString()} 
          icon={ShoppingCart} 
          trend="Hari ini" 
          gradientFrom="from-violet-500" 
          gradientTo="to-violet-600" 
        />
      </div>

      {/* Quick Action Cards - POS & PPOB */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground px-1">Aksi Cepat</h2>
        <QuickActions actions={quickActions} />
      </div>

      {/* Analytics Section - For all users */}
      <DashboardAnalytics />

      {/* Additional Menu Items */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground px-1">Menu Lainnya</h2>
        <div className="grid grid-cols-2 gap-2">
          {moreMenuItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <Button
                key={item.path}
                variant="outline"
                className="h-auto py-3 justify-start gap-3"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
