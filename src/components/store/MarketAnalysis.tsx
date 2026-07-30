'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Globe,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  Target,
  ShoppingCart,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MarketData {
  totalMarketSize: string;
  gamingRevenue: string;
  streamingRevenue: string;
  digitalProductsGrowth: string;
  profitMargins: Record<string, { min: number; max: number; label: string }>;
  topProducts: { name: string; revenue: string; growth: string; margin: string }[];
  regionalDemand: { region: string; share: number; trend: string }[];
  bestBuys: {
    product: string;
    cost: string;
    sellPrice: string;
    margin: string;
    reason: string;
  }[];
}

const defaultData: MarketData = {
  totalMarketSize: '$522B',
  gamingRevenue: '$225.28B',
  streamingRevenue: '$204.77B',
  digitalProductsGrowth: '12.6%',
  profitMargins: {},
  topProducts: [],
  regionalDemand: [],
  bestBuys: [],
};

export function MarketAnalysis() {
  const [data, setData] = useState<MarketData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/market-analysis')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section id="mercado" className="w-full space-y-8">
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="gap-1.5 text-xs">
          <BarChart3 className="w-3.5 h-3.5" />
          Análisis de Mercado 2025-2026
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Estudio de Mercado: Productos Digitales
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Datos actualizados del mercado global de productos digitales. Tamaño del mercado, márgenes de ganancia y oportunidades de negocio.
        </p>
      </div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/30">
            <CardContent className="p-4 sm:p-6">
              <Globe className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-xs text-muted-foreground">Mercado Total</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700">{data.totalMarketSize}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +{data.digitalProductsGrowth} anual
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/30">
            <CardContent className="p-4 sm:p-6">
              <Target className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-xs text-muted-foreground">Gaming Digital</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-700">{data.gamingRevenue}</p>
              <p className="text-xs text-purple-600 mt-1">Crecimiento sostenido</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/30">
            <CardContent className="p-4 sm:p-6">
              <DollarSign className="w-8 h-8 text-red-600 mb-2" />
              <p className="text-xs text-muted-foreground">Streaming</p>
              <p className="text-xl sm:text-2xl font-bold text-red-700">{data.streamingRevenue}</p>
              <p className="text-xs text-red-600 mt-1">+18.2% crecimiento</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200/30">
            <CardContent className="p-4 sm:p-6">
              <TrendingUp className="w-8 h-8 text-amber-600 mb-2" />
              <p className="text-xs text-muted-foreground">Crecimiento</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-700">{data.digitalProductsGrowth}</p>
              <p className="text-xs text-amber-600 mt-1">Anual compuesto</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profit Margins */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Márgenes de Ganancia por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(data.profitMargins).map(([key, val]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{val.label}</span>
                    <span className="text-emerald-600 font-semibold">{val.min}-{val.max}%</span>
                  </div>
                  <Progress value={val.max} className="h-2.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Regional Demand */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Demanda por Región (2025-2026)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.regionalDemand.map((r) => (
                <div key={r.region} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{r.region}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.trend.startsWith('+') ? 'default' : 'secondary'} className="text-[10px] h-5">
                        {r.trend}
                      </Badge>
                      <span className="font-semibold w-8 text-right">{r.share}%</span>
                    </div>
                  </div>
                  <Progress value={r.share} className="h-2.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Productos Digitales Más Rentables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 font-medium text-muted-foreground">Producto</th>
                    <th className="text-right py-2.5 font-medium text-muted-foreground">Ingresos</th>
                    <th className="text-right py-2.5 font-medium text-muted-foreground">Crecimiento</th>
                    <th className="text-right py-2.5 font-medium text-muted-foreground">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3 text-right font-semibold">{p.revenue}</td>
                      <td className="py-3 text-right text-emerald-600 font-medium">{p.growth}</td>
                      <td className="py-3 text-right">
                        <Badge variant="outline" className="text-xs">{p.margin}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Best Buys - Reseller Opportunities */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Mejores Oportunidades de Reventa (Alto Margen)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Productos con mejor relación costo-beneficio para revender y obtener buena utilidad
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.bestBuys.map((item, i) => (
                <div key={i} className="rounded-lg border border-border/50 p-4 space-y-2 hover:border-primary/30 hover:bg-muted/20 transition-all">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm">{item.product}</h4>
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0 ml-2">
                      Margen {item.margin}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-red-500">Costo: {item.cost}</span>
                    <span className="text-emerald-600 font-medium">Venta: {item.sellPrice}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
