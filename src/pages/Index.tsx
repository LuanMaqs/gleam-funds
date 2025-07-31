import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, DollarSign, LogOut, User, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">MyWallet</h1>
              <p className="text-sm text-muted-foreground">Controle financeiro pessoal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              <User size={14} className="mr-1" />
              {user.email}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Saldo Total */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="text-primary" size={20} />
                <span>Saldo Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">R$ 2.450,00</div>
              <p className="text-sm text-muted-foreground mt-1">+12% este mês</p>
            </CardContent>
          </Card>

          {/* Receitas */}
          <Card className="bg-gradient-to-r from-income/10 to-income/5 border-income/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="text-income" size={20} />
                <span>Receitas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-income">R$ 3.200,00</div>
              <p className="text-sm text-muted-foreground mt-1">+8% este mês</p>
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card className="bg-gradient-to-r from-expense/10 to-expense/5 border-expense/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="text-expense" size={20} />
                <span>Despesas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-expense">R$ 750,00</div>
              <p className="text-sm text-muted-foreground mt-1">-5% este mês</p>
            </CardContent>
          </Card>

          {/* Economias */}
          <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="text-accent" size={20} />
                <span>Economias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">R$ 1.500,00</div>
              <p className="text-sm text-muted-foreground mt-1">Meta: R$ 2.000</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Ações Rápidas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 text-lg" variant="outline">
              <DollarSign className="mr-2" size={20} />
              Adicionar Receita
            </Button>
            <Button className="h-20 text-lg" variant="outline">
              <TrendingDown className="mr-2" size={20} />
              Registrar Despesa
            </Button>
            <Button className="h-20 text-lg" variant="outline">
              <Settings className="mr-2" size={20} />
              Configurações
            </Button>
          </div>
        </div>

        {/* Mensagem de Boas-vindas */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Bem-vindo ao MyWallet!</h3>
              <p className="text-muted-foreground">
                Este é um projeto em desenvolvimento. Em breve você terá acesso a todas as funcionalidades 
                de controle financeiro pessoal.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
