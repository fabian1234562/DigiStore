"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  TrendingUp,
  DollarSign,
  BarChart3,
  Zap,
  Bot,
  RefreshCw,
  Copy,
  CheckCircle2,
  Target,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clock,
  Globe,
  Package,
  Mail,
  MessageSquare,
  Loader2,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResearchResult {
  id: string;
  product: string;
  category: string;
  costPrice: string;
  sellPrice: string;
  margin: string;
  marginPct: number;
  demand: 'Alta' | 'Media' | 'Baja';
  competition: 'Baja' | 'Media' | 'Alta';
  reason: string;
  trend: string;
}

interface MarketingPost {
  id: string;
  platform: string;
  content: string;
  hashtags: string;
  product: string;
}

interface PriceAlert {
  id: string;
  product: string;
  currentPrice: number;
  suggestedPrice: number;
  competitorAvg: number;
  reason: string;
  action: 'subir' | 'bajar' | 'mantener';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [researching, setResearching] = useState(false);
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([]);
  const [generatingMarketing, setGeneratingMarketing] = useState(false);
  const [marketingPosts, setMarketingPosts] = useState<MarketingPost[]>([]);
  const [monitoring, setMonitoring] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const stats = [
    { label: 'Productos Activos', value: '24', change: '+3', up: true, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Ventas Hoy', value: '47', change: '+12%', up: true, icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Ingresos Hoy', value: '$387.50', change: '+18%', up: true, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
    { label: 'Usuarios Registrados', value: '1,284', change: '+89', up: true, icon: Users, color: 'text-purple-600 bg-purple-50' },
  ];

  const automationStatus = [
    { name: 'Investigador de Productos', status: 'active', lastRun: 'Hace 2 horas', nextRun: 'En 1 hora', icon: Search },
    { name: 'Generador de Marketing', status: 'active', lastRun: 'Hace 30 min', nextRun: 'En 4 horas', icon: Bot },
    { name: 'Monitor de Precios', status: 'active', lastRun: 'Hace 15 min', nextRun: 'En 45 min', icon: TrendingUp },
    { name: 'Notificaciones de Ventas', status: 'paused', lastRun: 'Hace 6 horas', nextRun: 'Pausado', icon: Mail },
    { name: 'Respuesta Automatica Clientes', status: 'active', lastRun: 'Hace 5 min', nextRun: 'Siempre activo', icon: MessageSquare },
  ];

  const handleResearch = async () => {
    setResearching(true);
    setResearchResults([]);
    await new Promise(r => setTimeout(r, 2500));
    const results: ResearchResult[] = [
      { id: 'r1', product: 'Cuenta Spotify Premium - 6 Meses', category: 'Streaming', costPrice: '$1.50', sellPrice: '$8.99', margin: '$7.49', marginPct: 83, demand: 'Alta', competition: 'Media', reason: 'Demanda estacional alta por promociones de Spotify. Se puede vender en paquetes de 3 y 6 meses.', trend: '+25% busquedas esta semana' },
      { id: 'r2', product: 'Robux 1700 - Roblox', category: 'Gaming', costPrice: '$5.20', sellPrice: '$9.99', margin: '$4.79', marginPct: 48, demand: 'Alta', competition: 'Baja', reason: 'Poco competidor directo en Latam. Mercado infantil enorme con recompra constante.', trend: '+40% busquedas en Latinoamerica' },
      { id: 'r3', product: 'Windows 11 Home - Clave OEM', category: 'Software', costPrice: '$1.80', sellPrice: '$6.99', margin: '$5.19', marginPct: 74, demand: 'Alta', competition: 'Media', reason: 'Nueva version de Windows generando demanda. Costo de adquisicion bajisimo en bulk.', trend: 'Estable con picos de demanda' },
      { id: 'r4', product: 'Tarjeta Apple - $50 USD', category: 'Gift Cards', costPrice: '$45.00', sellPrice: '$49.49', margin: '$4.49', marginPct: 9, demand: 'Alta', competition: 'Alta', reason: 'Volumen altisimo. Aunque margen bajo, las ventas compensan. Ideal para atraer trafico.', trend: '+15% ventas en navidad' },
      { id: 'r5', product: 'Canva Pro - 1 Ano', category: 'Suscripciones', costPrice: '$8.00', sellPrice: '$19.99', margin: '$11.99', marginPct: 60, demand: 'Media', competition: 'Baja', reason: 'Poco oferta en el mercado. Nicho de diseadores y emprendedores creciendo rapido.', trend: '+60% crecimiento interanual' },
      { id: 'r6', product: 'Cuenta Crunchyroll Premium - 3 Meses', category: 'Streaming', costPrice: '$2.00', sellPrice: '$7.49', margin: '$5.49', marginPct: 73, demand: 'Media', competition: 'Baja', reason: 'Boom del anime global. Poca competencia en espanol. Se puede ofecer bundle con Netflix.', trend: '+35% busquedas esta semana' },
      { id: 'r7', product: '2800 Monedas FC 25 - PS5', category: 'Gaming', costPrice: '$3.00', sellPrice: '$11.99', margin: '$8.99', marginPct: 75, demand: 'Alta', competition: 'Media', reason: 'Temporada alta de FIFA/EA FC. Jugadores compran monedas recurrentemente cada semana.', trend: 'Estacional - alta en fines de semana' },
      { id: 'r8', product: 'NordVPN - 2 Anos', category: 'Software', costPrice: '$18.00', sellPrice: '$39.99', margin: '$21.99', marginPct: 55, demand: 'Media', competition: 'Media', reason: 'Demanda constante por privacidad. Buen margen y ciclo de vida largo del cliente.', trend: 'Estable todo el ano' },
    ];
    setResearchResults(results);
    setResearching(false);
  };

  const handleGenerateMarketing = async () => {
    setGeneratingMarketing(true);
    setMarketingPosts([]);
    await new Promise(r => setTimeout(r, 2000));
    const posts: MarketingPost[] = [
      { id: 'm1', platform: 'Instagram', product: 'Netflix Premium - $3.99', content: 'Netflix Premium completo por solo $3.99 USD \n\n4K + 4 pantallas + sin anuncios \n\nEntrega instantanea 24/7', hashtags: '#Netflix #Streaming #Ofertas #DigiStore #PreciosBajos', product: 'Netflix Premium' },
      { id: 'm2', platform: 'TikTok', product: 'Windows 11 Pro - $8.99', content: 'Windows 11 Pro ORIGINAL por $8.99 ?? \n\nEl mismo Windows que cuesta $200 en la tienda oficial \n\nClave digital instantanea', hashtags: '#Windows11 #Tech #Oferta #SoftwareBarato #DigiStore', product: 'Windows 11 Pro' },
      { id: 'm3', platform: 'WhatsApp', product: 'Promo Bundle Gaming', content: 'PACK GAMING EN PROMO: \n\nV-Bucks 1000: $4.99 \nRobux 800: $3.99 \nGame Pass 1 mes: $4.99 \n\nLos 3 por solo $11.99 USD! \n\nEntrega al instante por este chat', hashtags: '', product: 'Bundle Gaming' },
      { id: 'm4', platform: 'Facebook', product: 'Spotify Premium 3 Meses', content: '3 MESES DE SPOTIFY PREMIUM por solo $4.99 USD \n\nSin anuncios | Descarga ilimitada | Calidad maxima \n\nMas de 195,000 clientes satisfechos \n\nEntrega automatica al instante', hashtags: '#Spotify #Musica #Oferta #Suscripcion #DigiStore', product: 'Spotify Premium' },
      { id: 'm5', platform: 'Instagram Story', product: 'Oferta Flash', content: 'OFERTA RELAMPAGO \n\nOffice 2024 completo: $12.49 \n(antes $249.99 - 95% descuento) \n\nWord + Excel + PowerPoint + Outlook \n\nLink en bio', hashtags: '#OfertaRelampago #MicrosoftOffice #Software', product: 'Office 2024' },
      { id: 'm6', platform: 'X (Twitter)', product: 'Discord Nitro 3 Meses', content: 'Discord Nitro 3 meses por $6.99 USD \n\nEmojis custom + Stickers globales + Stream en HD \n\nEl mejor precio del mercado. Entrega instantanea.', hashtags: '#Discord #Nitro #Gaming', product: 'Discord Nitro' },
    ];
    setMarketingPosts(posts);
    setGeneratingMarketing(false);
  };

  const handlePriceMonitor = async () => {
    setMonitoring(true);
    setPriceAlerts([]);
    await new Promise(r => setTimeout(r, 2000));
    const alerts: PriceAlert[] = [
      { id: 'p1', product: 'Netflix Premium - 1 Mes', currentPrice: 3.99, suggestedPrice: 3.49, competitorAvg: 3.29, reason: '3 competidores bajaron a $3.29. Nuestro precio esta $0.70 sobre el promedio. Podemos perder ventas.', action: 'bajar' },
      { id: 'p2', product: 'Windows 11 Pro', currentPrice: 8.99, suggestedPrice: 9.99, competitorAvg: 11.49, reason: 'El competidor principal subio a $11.49. Tenemos margen para subir y seguir siendo los mas baratos.', action: 'subir' },
      { id: 'p3', product: 'V-Bucks 1000', currentPrice: 4.99, suggestedPrice: 4.99, competitorAvg: 5.20, reason: 'Nuestro precio es el mas bajo del mercado. Mantener para seguir atrayendo clientes.', action: 'mantener' },
      { id: 'p4', product: 'VPN Premium 2 Anos', currentPrice: 29.99, suggestedPrice: 26.99, competitorAvg: 28.50, reason: 'Competidores en promedio a $28.50. Bajar a $26.99 nos posicionaria como la opcion mas barata.', action: 'bajar' },
      { id: 'p5', product: 'Xbox Game Pass Ultimate', currentPrice: 4.99, suggestedPrice: 5.49, reason: 'Demanda al 95% de capacidad. Podemos subir $0.50 sin afectar ventas significativamente.', action: 'subir', competitorAvg: 5.99 },
      { id: 'p6', product: 'Tarjeta Steam $50', currentPrice: 46.99, suggestedPrice: 46.99, competitorAvg: 47.20, reason: 'Margen bajo pero somos competitivos. Mantener para no sacrificar el poco margen que hay.', action: 'mantener', competitorAvg: 47.20 },
    ];
    setPriceAlerts(alerts);
    setMonitoring(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:block">DigiStore</span>
            </a>
            <Badge variant="outline" className="text-[10px]">ADMIN</Badge>
          </div>
          <a href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <Eye className="w-3.5 h-3.5" /> Ver Tienda
            </Button>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Panel de Automatizacion</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona y automatiza tu negocio de productos digitales</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${s.color}`}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      <div className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                        {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {s.change}
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                Estado de Automatizaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {automationStatus.map((a) => (
                  <div key={a.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <a.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{a.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground hidden sm:block">Ultima: {a.lastRun}</span>
                      <Badge variant={a.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-5">
                        {a.status === 'active' ? 'Activo' : 'Pausado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="research" className="gap-1.5 text-xs sm:text-sm">
                <Search className="w-3.5 h-3.5" /> Investigador
              </TabsTrigger>
              <TabsTrigger value="marketing" className="gap-1.5 text-xs sm:text-sm">
                <Bot className="w-3.5 h-3.5" /> Marketing
              </TabsTrigger>
              <TabsTrigger value="prices" className="gap-1.5 text-xs sm:text-sm">
                <TrendingUp className="w-3.5 h-3.5" /> Precios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="mt-4 space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Investigador de Productos con IA
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Busca productos digitales con alto margen de ganancia y baja competencia en tiempo real
                      </p>
                    </div>
                    <Button onClick={handleResearch} disabled={researching} className="gap-2 cursor-pointer shrink-0">
                      {researching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      {researching ? 'Investigando...' : 'Investigar Ahora'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AnimatePresence>
                {researchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <p className="text-sm text-muted-foreground">{researchResults.length} oportunidades encontradas - ordenadas por margen</p>
                    {researchResults.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className="border-border/50 hover:border-primary/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                              <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{r.product}</span>
                                  <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                                  {i === 0 && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Mejor Oportunidad</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{r.reason}</p>
                                <div className="flex items-center gap-2 text-[10px]">
                                  <span className={`px-2 py-0.5 rounded-full font-medium ${r.demand === 'Alta' ? 'bg-emerald-100 text-emerald-700' : r.demand === 'Media' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>Demanda: {r.demand}</span>
                                  <span className={`px-2 py-0.5 rounded-full font-medium ${r.competition === 'Baja' ? 'bg-emerald-100 text-emerald-700' : r.competition === 'Media' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>Competencia: {r.competition}</span>
                                  <span className="text-blue-600 font-medium">{r.trend}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 shrink-0">
                                <div className="text-right">
                                  <p className="text-[10px] text-muted-foreground">Costo</p>
                                  <p className="text-sm font-medium">{r.costPrice}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-muted-foreground">Venta</p>
                                  <p className="text-sm font-bold text-emerald-600">{r.sellPrice}</p>
                                </div>
                                <div className="text-right min-w-[60px]">
                                  <p className="text-[10px] text-muted-foreground">Margen</p>
                                  <p className="text-sm font-bold text-primary">{r.marginPct}%</p>
                                </div>
                                <div className="w-16">
                                  <Progress value={r.marginPct} className="h-2" />
                                </div>
                                <Button size="sm" variant="outline" className="gap-1 text-xs cursor-pointer">
                                  Agregar <ChevronRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="marketing" className="mt-4 space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-500" />
                        Generador de Marketing con IA
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Genera posts para Instagram, TikTok, WhatsApp, Facebook y mas con un clic
                      </p>
                    </div>
                    <Button onClick={handleGenerateMarketing} disabled={generatingMarketing} className="gap-2 cursor-pointer shrink-0">
                      {generatingMarketing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {generatingMarketing ? 'Generando...' : 'Generar Posts'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AnimatePresence>
                {marketingPosts.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {marketingPosts.map((post, i) => (
                      <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="border-border/50 h-full">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">{post.platform}</Badge>
                                <span className="text-xs text-muted-foreground">{post.product}</span>
                              </div>
                              <button onClick={() => handleCopy(post.content + (post.hashtags ? '\n' + post.hashtags : ''), post.id)} className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer">
                                {copiedId === post.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                              </button>
                            </div>
                            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed bg-muted/50 rounded-lg p-3">{post.content}</pre>
                            {post.hashtags && (
                              <p className="text-[10px] text-primary font-medium">{post.hashtags}</p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="prices" className="mt-4 space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Monitor Inteligente de Precios
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Compara precios con la competencia y recibe sugerencias de ajuste automatico
                      </p>
                    </div>
                    <Button onClick={handlePriceMonitor} disabled={monitoring} className="gap-2 cursor-pointer shrink-0">
                      {monitoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                      {monitoring ? 'Analizando...' : 'Analizar Precios'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AnimatePresence>
                {priceAlerts.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    {priceAlerts.map((alert, i) => (
                      <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className={`border-l-4 ${alert.action === 'bajar' ? 'border-l-amber-500' : alert.action === 'subir' ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">{alert.product}</span>
                                  {alert.action === 'bajar' && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] gap-1"><ArrowDownRight className="w-3 h-3" /> Bajar</Badge>}
                                  {alert.action === 'subir' && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] gap-1"><ArrowUpRight className="w-3 h-3" /> Subir</Badge>}
                                  {alert.action === 'mantener' && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Mantener</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">{alert.reason}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-center px-3">
                                  <p className="text-[10px] text-muted-foreground">Tu Precio</p>
                                  <p className="text-sm font-medium line-through">${alert.currentPrice.toFixed(2)}</p>
                                </div>
                                <div className="text-center px-3">
                                  <p className="text-[10px] text-muted-foreground">Competencia</p>
                                  <p className="text-sm font-medium">${alert.competitorAvg.toFixed(2)}</p>
                                </div>
                                <div className="text-center px-3">
                                  <p className="text-[10px] text-muted-foreground">Sugerido</p>
                                  <p className={`text-sm font-bold ${alert.action === 'subir' ? 'text-emerald-600' : alert.action === 'bajar' ? 'text-amber-600' : 'text-blue-600'}`}>${alert.suggestedPrice.toFixed(2)}</p>
                                </div>
                                <Button size="sm" variant="outline" className="gap-1 text-xs cursor-pointer">
                                  Aplicar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}