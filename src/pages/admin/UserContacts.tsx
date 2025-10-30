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
    <div className="min-h-screen bg-background p-4 space-y-4 safe-top safe-bottom">
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
          <h1 className="text-2xl font-bold">Kontak User</h1>
          <p className="text-sm text-muted-foreground">Daftar nomor WhatsApp konsumen</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total User</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-emerald-600">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Dengan WhatsApp</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.whatsapp).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-pink-600">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Hasil Pencarian</p>
                <p className="text-2xl font-bold text-white">{filteredUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari email, username, atau nomor WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Loading...
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Tidak ada user ditemukan
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.user_id} className="border-0 shadow-md hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg">{user.username}</span>
                      {user.is_approved ? (
                        <Badge className="bg-green-500">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    
                    {user.whatsapp ? (
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span className="font-mono font-semibold text-green-700">
                          {user.whatsapp}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Belum menambahkan WhatsApp
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Bergabung {formatDistanceToNow(new Date(user.created_at), { 
                        addSuffix: true, 
                        locale: localeId 
                      })}
                    </p>
                  </div>
                  
                  {user.whatsapp && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyWhatsApp(user.whatsapp!)}
                      >
                        Salin
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleOpenWhatsApp(user.whatsapp!)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
