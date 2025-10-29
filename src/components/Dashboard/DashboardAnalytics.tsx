import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useMemo } from 'react';
import { usePOSContext } from '@/contexts/POSContext';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export const DashboardAnalytics = () => {
  const { receipts, formatPrice } = usePOSContext();
  const [timeRange, setTimeRange] = useState<string>('1');

  const analyticsData = useMemo(() => {
    const months = parseInt(timeRange);
    const endDate = new Date();
    const startDate = subMonths(startOfMonth(endDate), months - 1);

    const monthsInterval = eachMonthOfInterval({ 
      start: startDate, 
      end: endOfMonth(endDate) 
    });

    const data = monthsInterval.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthReceipts = receipts.filter(r => {
        const receiptDate = new Date(r.timestamp);
        return receiptDate >= monthStart && receiptDate <= monthEnd && !r.isManual;
      });

      const revenue = monthReceipts.reduce((sum, r) => sum + r.total, 0);
      const profit = monthReceipts.reduce((sum, r) => sum + r.profit, 0);

      return {
        month: format(month, 'MMM yy', { locale: localeId }),
        revenue: Math.round(revenue),
        profit: Math.round(profit),
      };
    });

    // Ensure we always have data to display
    if (data.length === 0) {
      return [{ month: format(new Date(), 'MMM yy', { locale: localeId }), revenue: 0, profit: 0 }];
    }

    return data;
  }, [receipts, timeRange]);

  return (
    <Card className="border shadow-sm bg-card overflow-hidden animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            Analisis Penjualan
          </CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] sm:w-[140px] h-8 sm:h-9 rounded-xl border-2 hover:border-primary transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Bulan</SelectItem>
              <SelectItem value="2">2 Bulan</SelectItem>
              <SelectItem value="3">3 Bulan</SelectItem>
              <SelectItem value="6">6 Bulan</SelectItem>
              <SelectItem value="12">1 Tahun</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 rounded-lg -z-10" />
          <p className="text-xs sm:text-sm font-medium mb-3 text-muted-foreground">Pendapatan & Profit</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={analyticsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.2}
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                stroke="hsl(var(--border))"
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 9, fill: 'hsl(var(--foreground))' }}
                stroke="hsl(var(--border))"
                tickLine={false}
                width={35}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value.toString();
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number) => formatPrice(value)}
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                fill="url(#colorRevenue)"
                stroke="none"
              />
              <Area
                type="monotone"
                dataKey="profit"
                fill="url(#colorProfit)"
                stroke="none"
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(217 91% 60%)" 
                strokeWidth={3}
                name="Pendapatan"
                dot={{ 
                  r: 4, 
                  strokeWidth: 2, 
                  fill: 'hsl(var(--background))',
                  stroke: 'hsl(217 91% 60%)'
                }}
                activeDot={{ 
                  r: 6,
                  strokeWidth: 2,
                  fill: 'hsl(217 91% 60%)',
                  stroke: 'hsl(var(--background))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(142 76% 36%)" 
                strokeWidth={3}
                name="Profit"
                dot={{ 
                  r: 4,
                  strokeWidth: 2,
                  fill: 'hsl(var(--background))',
                  stroke: 'hsl(142 76% 36%)'
                }}
                activeDot={{ 
                  r: 6,
                  strokeWidth: 2,
                  fill: 'hsl(142 76% 36%)',
                  stroke: 'hsl(var(--background))'
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
