import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export const FeedbackManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewed: 0, resolved: 0 });

  useEffect(() => {
    if (isAdmin) {
      fetchFeedbacks();
    }
  }, [isAdmin]);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedbacks' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedbacks((data || []) as unknown as Feedback[]);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = (data as any)?.filter((f: any) => f.status === 'pending').length || 0;
      const reviewed = (data as any)?.filter((f: any) => f.status === 'reviewed').length || 0;
      const resolved = (data as any)?.filter((f: any) => f.status === 'resolved').length || 0;
      
      setStats({ total, pending, reviewed, resolved });
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      if (error.code === '42P01') {
        toast.error('Tabel feedbacks belum dibuat. Silakan jalankan migration database.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'pending' | 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('feedbacks' as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Status berhasil diupdate');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300"><AlertCircle className="h-3 w-3 mr-1" />Ditinjau</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>;
      default:
        return null;
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Kritik & Saran</h1>
          <p className="text-sm text-muted-foreground">Kelola feedback dari user</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
            <p className="text-xs text-muted-foreground">Ditinjau</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">Selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedbacks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada feedback dari user</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="border-0 shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{feedback.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feedback.name} • {feedback.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(feedback.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  {getStatusBadge(feedback.status)}
                </div>
                
                <p className="text-sm mb-4 bg-muted/50 p-3 rounded-lg">
                  {feedback.message}
                </p>
                
                <div className="flex gap-2 flex-wrap">
                  {feedback.status !== 'reviewed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(feedback.id, 'reviewed')}
                      className="h-8 text-xs"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Tandai Ditinjau
                    </Button>
                  )}
                  {feedback.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(feedback.id, 'resolved')}
                      className="h-8 text-xs text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tandai Selesai
                    </Button>
                  )}
                  {feedback.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(feedback.id, 'pending')}
                      className="h-8 text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Kembalikan ke Pending
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};