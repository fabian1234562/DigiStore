'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LogIn, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export function AuthDialog() {
  const { authOpen, setAuthOpen, setUser } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const reset = () => { setError(''); setSuccess(''); setPassword(''); };

  const handleLogin = async () => {
    setLoading(true); reset();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) { setUser(data.user); setAuthOpen(false); reset(); }
      else setError(data.error);
    } catch { setError('Error de conexión'); }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true); reset();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Cuenta creada. Iniciando sesión...');
        setTimeout(() => {
          setUser(data.user); setAuthOpen(false); reset(); setName('');
        }, 1200);
      } else setError(data.error);
    } catch { setError('Error de conexión'); }
    setLoading(false);
  };

  return (
    <Dialog open={authOpen} onOpenChange={(o) => { setAuthOpen(o); reset(); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <Tabs defaultValue="login" onValueChange={(v) => { setMode(v as 'login' | 'register'); reset(); setName(''); }}>
          <div className="px-6 pt-6 pb-0">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1 gap-2">
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1 gap-2">
                <User className="w-4 h-4" /> Registrarse
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="login" className="px-6 pb-6 pt-4 space-y-4 mt-0">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Bienvenido de vuelta</DialogTitle>
            </DialogHeader>
            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
            {success && <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg"><CheckCircle2 className="w-4 h-4" />{success}</div>}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full gap-2 cursor-pointer" onClick={handleLogin} disabled={loading || !email || !password}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Entrar
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <button onClick={() => setMode('register')} className="text-primary underline cursor-pointer">Regístrate aquí</button>
            </p>
          </TabsContent>

          <TabsContent value="register" className="px-6 pb-6 pt-4 space-y-4 mt-0">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Crear Cuenta</DialogTitle>
            </DialogHeader>
            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
            {success && <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg"><CheckCircle2 className="w-4 h-4" />{success}</div>}
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contraseña (mínimo 6 caracteres)</Label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full gap-2 cursor-pointer" onClick={handleRegister} disabled={loading || !name || !email || !password}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />} Crear Cuenta
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => setMode('login')} className="text-primary underline cursor-pointer">Inicia sesión</button>
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}