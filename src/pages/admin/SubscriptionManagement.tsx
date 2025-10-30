import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface UserSubscription {
  user_id: string;
  email: string;
  username: string;
  is_approved: boolean;
  created_at: string;
}

export const SubscriptionManagement = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSubscription | null>(null);
  const [duration, setDuration] = useState<string>('1');
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    if (isAdmin && user) {
      fetchUsers();
    }
  }, [isAdmin, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, username, is_approved, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const handleExtendSubscription = async () => {
    if (!selectedUser) return;
    setExtending(true);
    try {
      toast.info(`Subscription ${selectedUser.email} akan diperpanjang ${duration} bulan`);
      toast.info('Fitur subscription akan aktif setelah migration SQL dijalankan');
      setShowExtendDialog(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal memperpanjang subscription');
    } finally {
      setExtending(false);
    }
  };

  const getSubscriptionStatus = () => {
    return { status: 'Pending Setup', variant: 'secondary' as const, icon: Clock };
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="p-4 pt-6 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6 rounded-2xl shadow-lg mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin/users')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Manajemen Subscription</h1>
            <p className="text-xs sm:text-sm text-purple-100">Kelola trial dan perpanjangan subscription user</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 px-3 sm:px-4 text-center">
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Total</p>
            <p className="text-xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">{users.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 px-3 sm:px-4 text-center">
            <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">Aktif</p>
            <p className="text-xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">-</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Migration</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
          <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 px-3 sm:px-4 text-center">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium mb-1">Expired</p>
            <p className="text-xl sm:text-3xl font-bold text-red-700 dark:text-red-300">-</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Migration</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Input
          placeholder="🔍 Cari email atau username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 rounded-xl border-2"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Loading...
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Tidak ada user ditemukan</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => {
            const { status, variant, icon: StatusIcon } = getSubscriptionStatus();
            
            return (
              <Card key={user.user_id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    {/* User info */}
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.username || user.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <Badge variant={variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
                            <StatusIcon className="h-3 w-3" />
                            {status}
                          </Badge>
                          
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                            <Calendar className="h-2.5 w-2.5 mr-1" />
                            {formatDistanceToNow(new Date(user.created_at), { 
                              addSuffix: true, 
                              locale: localeId 
                            })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Select
                        value={duration}
                        onValueChange={setDuration}
                      >
                        <SelectTrigger className="h-9 flex-1 text-sm rounded-lg">
                          <SelectValue placeholder="Durasi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bulan</SelectItem>
                          <SelectItem value="2">2 Bulan</SelectItem>
                          <SelectItem value="3">3 Bulan</SelectItem>
                          <SelectItem value="6">6 Bulan</SelectItem>
                          <SelectItem value="12">1 Tahun</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowExtendDialog(true);
                        }}
                        size="sm"
                        className="h-9 px-3 rounded-lg"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-xs">Perpanjang</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      </div>

      {/* Extend Dialog */}
      <AlertDialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perpanjangan</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Perpanjang subscription untuk:</p>
              <p className="font-medium text-foreground">{selectedUser?.email}</p>
              <p>Durasi: <span className="font-medium text-foreground">{duration} bulan</span></p>
              <p className="text-xs text-muted-foreground mt-2">
                * Fitur ini membutuhkan migration SQL dijalankan terlebih dahulu
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={extending}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExtendSubscription}
              disabled={extending}
            >
              {extending ? 'Memproses...' : 'Perpanjang'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
