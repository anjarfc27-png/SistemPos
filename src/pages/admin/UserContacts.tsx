import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, MessageCircle, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface UserContact {
  user_id: string;
  email: string;
  username: string;
  whatsapp?: string;
  created_at: string;
  is_approved: boolean;
}

export const UserContacts = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        .select('user_id, email, username, created_at, is_approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data || []) as any);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.whatsapp?.includes(searchTerm)
  );

  const handleCopyWhatsApp = (whatsapp: string) => {
    navigator.clipboard.writeText(whatsapp);
    toast.success('Nomor WhatsApp disalin!');
  };

  const handleOpenWhatsApp = (whatsapp: string) => {
    window.open(`https://wa.me/${whatsapp}`, '_blank');
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="p-4 pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Kontak User</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Daftar nomor WhatsApp user</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 px-3 sm:px-4 text-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mb-0.5">Total User</p>
              <p className="text-xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">{users.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 px-3 sm:px-4 text-center">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 mb-0.5">WhatsApp</p>
              <p className="text-xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                {users.filter(u => u.whatsapp).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Input
          placeholder="🔍 Cari email, username, atau WhatsApp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 rounded-xl border-2"
        />

        {/* Users List */}
        <div className="space-y-3">
          {loading ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-sm text-muted-foreground">Loading...</p>
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
            filteredUsers.map((user) => (
              <Card key={user.user_id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-sm truncate">{user.username || user.email}</p>
                        {user.is_approved && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                            ✓ Aktif
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-2">{user.email}</p>
                      
                      {user.whatsapp ? (
                        <div className="space-y-2">
                          <Badge className="bg-green-600 hover:bg-green-700 text-xs px-2 py-0.5">
                            <MessageCircle className="h-2.5 w-2.5 mr-1" />
                            {user.whatsapp}
                          </Badge>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyWhatsApp(user.whatsapp!)}
                              className="h-8 px-3 text-xs rounded-lg flex-1"
                            >
                              Salin
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenWhatsApp(user.whatsapp!)}
                              className="h-8 px-3 text-xs rounded-lg flex-1 bg-green-600 hover:bg-green-700"
                            >
                              Chat
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                          Tidak ada WhatsApp
                        </Badge>
                      )}
                      
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Bergabung {formatDistanceToNow(new Date(user.created_at), { 
                          addSuffix: true, 
                          locale: localeId 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
