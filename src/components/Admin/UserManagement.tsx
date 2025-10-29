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
  CheckCircle, 
  XCircle, 
  Ban, 
  MessageCircle, 
  Instagram, 
  ArrowLeft, 
  LogOut, 
  Calendar,
  Users as UsersIcon,
  Shield,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

interface UserProfile {
  user_id: string;
  email: string;
  username: string;
  is_approved: boolean;
  created_at: string;
  approved_at?: string;
}

export const UserManagement = () => {
  const { isAdmin, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionUser, setActionUser] = useState<{ id: string; action: 'approve' | 'reject' | 'suspend' } | null>(null);
  
  // Admin contact settings
  const [adminWhatsApp, setAdminWhatsApp] = useState('');
  const [adminInstagram, setAdminInstagram] = useState('');
  const [savingContacts, setSavingContacts] = useState(false);

  useEffect(() => {
    if (isAdmin && user) {
      fetchUsers();
      loadAdminContactInfo();
    }
  }, [isAdmin, user]);

  const loadAdminContactInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('admin_whatsapp, admin_instagram')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading admin contacts:', error);
        return;
      }
      
      if (data) {
        const profileData = data as any;
        setAdminWhatsApp(profileData.admin_whatsapp || '');
        setAdminInstagram(profileData.admin_instagram || '');
      }
    } catch (error) {
      console.error('Error loading admin contacts:', error);
    }
  };

  const saveAdminContactInfo = async () => {
    if (!user) return;
    
    setSavingContacts(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          admin_whatsapp: adminWhatsApp.trim(),
          admin_instagram: adminInstagram.trim()
        } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Kontak admin berhasil disimpan!');
    } catch (error) {
      console.error('Error saving admin contacts:', error);
      toast.error('Gagal menyimpan kontak admin');
    } finally {
      setSavingContacts(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, username, is_approved, created_at, approved_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pending = data?.filter(u => !u.is_approved) || [];
      const approved = data?.filter(u => u.is_approved) || [];

      setPendingUsers(pending);
      setApprovedUsers(approved);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat daftar user');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_approved: true,
          approved_by: authData.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'user',
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        throw roleError;
      }

      toast.success('User berhasil disetujui');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Gagal menyetujui user');
    } finally {
      setActionUser(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Auth delete error (may need service role key):', authError);
      }

      toast.success('User ditolak dan dihapus dari database');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Gagal menolak user');
    } finally {
      setActionUser(null);
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_approved: false,
          approved_by: null,
          approved_at: null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User berhasil di-suspend');
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Gagal suspend user');
    } finally {
      setActionUser(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-center text-muted-foreground">
              Anda tidak memiliki akses ke halaman ini
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 p-6 space-y-6 animate-fade-in-up">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-2xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Kelola user dan pengaturan sistem</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className="gap-2 hover:bg-red-500/10 hover:text-red-600 hover:border-red-600"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-600 animate-scale-in"
          onClick={() => window.scrollTo({ top: document.getElementById('pending-users')?.offsetTop || 0, behavior: 'smooth' })}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Pending Users</p>
                <p className="text-3xl font-bold text-white">{pendingUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 bg-gradient-to-br from-emerald-500 to-teal-600 animate-scale-in"
          style={{ animationDelay: '100ms' }}
          onClick={() => navigate('/admin/subscriptions')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Subscriptions</p>
                <p className="text-xl font-bold text-white">Kelola →</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 bg-gradient-to-br from-purple-500 to-pink-600 animate-scale-in"
          style={{ animationDelay: '200ms' }}
          onClick={() => window.scrollTo({ top: document.getElementById('admin-contact')?.offsetTop || 0, behavior: 'smooth' })}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Pengaturan</p>
                <p className="text-xl font-bold text-white">Kontak →</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg animate-fade-in-up">
          <CardContent className="pt-6 text-center">
            <Badge variant="secondary" className="mb-2 px-3 py-1 animate-pulse">Menunggu</Badge>
            <p className="text-4xl font-bold text-blue-600">{pendingUsers.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Pending Approval</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6 text-center">
            <Badge variant="default" className="mb-2 px-3 py-1">Aktif</Badge>
            <p className="text-4xl font-bold text-emerald-600">{approvedUsers.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Active Users</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="pt-6 text-center">
            <Badge variant="outline" className="mb-2 px-3 py-1">Total</Badge>
            <p className="text-4xl font-bold text-purple-600">{pendingUsers.length + approvedUsers.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Contact Settings */}
      <Card id="admin-contact" className="border-0 shadow-lg gradient-border animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageCircle className="h-6 w-6 text-primary" />
            Kontak Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin-whatsapp" className="text-base">
                <MessageCircle className="h-4 w-4 inline mr-2" />
                Nomor WhatsApp
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="admin-whatsapp"
                  value={adminWhatsApp}
                  onChange={(e) => setAdminWhatsApp(e.target.value)}
                  placeholder="628xx xxxx xxxx"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Format: 6281234567890 (tanpa tanda +)
              </p>
            </div>
            
            <div>
              <Label htmlFor="admin-instagram" className="text-base">
                <Instagram className="h-4 w-4 inline mr-2" />
                Username Instagram
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="admin-instagram"
                  value={adminInstagram}
                  onChange={(e) => setAdminInstagram(e.target.value)}
                  placeholder="username_anda"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tanpa simbol @ (contoh: username_anda)
              </p>
            </div>
          </div>

          <Button 
            onClick={saveAdminContactInfo} 
            disabled={savingContacts}
            className="w-full gradient-blue"
          >
            {savingContacts ? 'Menyimpan...' : 'Simpan Kontak Admin'}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card id="pending-users" className="border-0 shadow-lg animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-xl bg-red-500/10">
              <UsersIcon className="h-6 w-6 text-red-600" />
            </div>
            Menunggu Persetujuan
            {pendingUsers.length > 0 && (
              <Badge className="bg-red-500 text-white text-base px-3 py-1 animate-pulse">
                {pendingUsers.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Tidak ada user yang menunggu persetujuan</p>
              <p className="text-sm text-muted-foreground mt-2">Semua user sudah diproses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map((user) => (
                <Card
                  key={user.user_id}
                  className="border-2 border-red-200 bg-red-50/50 hover:shadow-lg transition-all"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                        <UsersIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          📅 {new Date(user.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        onClick={() => setActionUser({ id: user.user_id, action: 'approve' })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setActionUser({ id: user.user_id, action: 'reject' })}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Users */}
      <Card className="border-0 shadow-lg animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            User Aktif
            <Badge variant="outline" className="text-base px-3 py-1">
              {approvedUsers.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Belum ada user yang disetujui</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedUsers.map((user) => (
                <Card
                  key={user.user_id}
                  className="border-2 border-emerald-200 bg-emerald-50/50 hover:shadow-lg transition-all"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                          ✓ Aktif sejak {user.approved_at ? new Date(user.approved_at).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActionUser({ id: user.user_id, action: 'suspend' })}
                      className="w-full hover:bg-red-500/10 hover:text-red-600 hover:border-red-600"
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!actionUser} onOpenChange={() => setActionUser(null)}>
        <AlertDialogContent className="border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              {actionUser?.action === 'approve' && '✓ Setujui User?'}
              {actionUser?.action === 'reject' && '✗ Tolak & Hapus User?'}
              {actionUser?.action === 'suspend' && '⊘ Suspend User?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {actionUser?.action === 'approve' &&
                'User akan dapat login dan menggunakan aplikasi dengan akses penuh.'}
              {actionUser?.action === 'reject' &&
                'User akan dihapus permanen dari database dan tidak dapat login. Jika ingin mendaftar lagi, mereka harus menghubungi admin.'}
              {actionUser?.action === 'suspend' &&
                'User tidak akan dapat login sampai disetujui kembali oleh admin.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionUser?.action === 'approve') handleApprove(actionUser.id);
                if (actionUser?.action === 'reject') handleReject(actionUser.id);
                if (actionUser?.action === 'suspend') handleSuspend(actionUser.id);
              }}
              className={
                actionUser?.action === 'approve' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              }
            >
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};