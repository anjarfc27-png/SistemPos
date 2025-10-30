import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MessageCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface SubscriptionInfo {
  subscription_end: string | null;
  subscription_plan: string;
  last_active: string;
  whatsapp: string | null;
  is_expired: boolean;
}

export const SubscriptionBanner = () => {
  const { user, isAdmin } = useAuth();
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !isAdmin) {
      fetchSubscriptionInfo();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const fetchSubscriptionInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Column subscription_end belum ada, set default values
      // Akan aktif setelah migration dijalankan
      if (data) {
        setSubInfo({
          subscription_end: null, // Akan diisi setelah migration
          subscription_plan: 'free',
          last_active: new Date().toISOString(),
          whatsapp: null,
          is_expired: false
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Admin tidak perlu lihat banner
  if (isAdmin || loading || !subInfo) {
    return null;
  }

  // Tidak ada subscription end = free/unlimited
  if (!subInfo.subscription_end) {
    return null;
  }

  const daysRemaining = Math.ceil(
    (new Date(subInfo.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Jika sudah expired
  if (subInfo.is_expired) {
    return (
      <Alert className="mb-4 border-red-500 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="font-semibold text-red-900">Subscription Anda Telah Berakhir</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-red-800">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Berakhir: {new Date(subInfo.subscription_end).toLocaleDateString('id-ID')}
              </span>
              {subInfo.whatsapp && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  WA: {subInfo.whatsapp}
                </span>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              if (subInfo.whatsapp) {
                const message = encodeURIComponent('Halo, saya ingin memperpanjang subscription.');
                window.open(`https://wa.me/${subInfo.whatsapp}?text=${message}`, '_blank');
              }
            }}
          >
            Perpanjang Sekarang
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Warning jika kurang dari 7 hari
  if (daysRemaining <= 7) {
    return (
      <Alert className="mb-4 border-orange-500 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="font-semibold text-orange-900">Subscription Akan Segera Berakhir</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-orange-800">
              <Badge variant="outline" className="border-orange-500 text-orange-700">
                {daysRemaining} hari lagi
              </Badge>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(subInfo.subscription_end).toLocaleDateString('id-ID')}
              </span>
              {subInfo.last_active && (
                <span className="flex items-center gap-1 text-xs">
                  Terakhir aktif: {formatDistanceToNow(new Date(subInfo.last_active), { 
                    addSuffix: true, 
                    locale: localeId 
                  })}
                </span>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            className="border-orange-500 text-orange-700 hover:bg-orange-100"
            onClick={() => {
              if (subInfo.whatsapp) {
                const message = encodeURIComponent('Halo, saya ingin memperpanjang subscription.');
                window.open(`https://wa.me/${subInfo.whatsapp}?text=${message}`, '_blank');
              }
            }}
          >
            Perpanjang
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Info normal jika masih banyak waktu
  return (
    <Alert className="mb-4 border-blue-500 bg-blue-50">
      <Calendar className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-blue-800">
          <Badge className="bg-blue-600">
            {subInfo.subscription_plan.toUpperCase()}
          </Badge>
          <span>Aktif hingga: {new Date(subInfo.subscription_end).toLocaleDateString('id-ID')}</span>
          <span className="text-xs text-blue-600">
            ({daysRemaining} hari lagi)
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
};
