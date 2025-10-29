import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const FeedbackPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast.error('Silakan isi subjek dan pesan Anda');
      return;
    }

    if (!user) {
      toast.error('Anda harus login terlebih dahulu');
      return;
    }

    setLoading(true);
    
    try {
      // Get user profile for name and email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('feedbacks' as any)
        .insert({
          user_id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email,
          subject: subject.trim(),
          message: message.trim(),
        });

      if (error) throw error;

      toast.success('Kritik & saran berhasil dikirim! Terima kasih atas masukan Anda.');
      setSubject('');
      setMessage('');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      if (error.code === '42P01') {
        toast.error('Tabel feedbacks belum dibuat. Silakan jalankan migration database terlebih dahulu.');
      } else {
        toast.error('Gagal mengirim feedback. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-sm text-muted-foreground">Bantu kami menjadi lebih baik</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Sampaikan Pendapat Anda
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Kritik dan saran Anda sangat berharga untuk pengembangan aplikasi
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subjek</Label>
              <Input
                id="subject"
                placeholder="Misal: Saran fitur baru, Laporan bug, dll"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-xl border-2 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Pesan</Label>
              <Textarea
                id="message"
                placeholder="Tulis kritik, saran, atau masukan Anda di sini..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[200px] resize-none rounded-xl border-2 focus:border-primary"
                required
              />
              <p className="text-xs text-muted-foreground">
                {message.length} karakter
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-semibold"
              disabled={loading || !subject.trim() || !message.trim()}
            >
              {loading ? (
                'Mengirim...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Kritik & Saran
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="mt-4 border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tips:</strong> Jelaskan dengan detail agar kami bisa memahami dan meningkatkan layanan dengan lebih baik.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};