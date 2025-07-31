import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingUp, TrendingDown, DollarSign, LogOut, User, BarChart3, Target, Zap, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(2450);
  const [despesas, setDespesas] = useState(750);
  const [economias, setEconomias] = useState(1500);
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [addSaldoOpen, setAddSaldoOpen] = useState(false);
  const [addDespesaOpen, setAddDespesaOpen] = useState(false);
  const [valorSaldo, setValorSaldo] = useState('');
  const [valorDespesa, setValorDespesa] = useState('');
  const [descricaoDespesa, setDescricaoDespesa] = useState('');
  const navigate = useNavigate();

  // Dados para o gráfico
  const chartData = [
    { name: 'Saldo Total', value: saldo, color: '#22c55e' },
    { name: 'Despesas', value: despesas, color: '#dc2626' },
    { name: 'Economias', value: economias, color: '#8b5cf6' },
  ];

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

  const handleAddSaldo = async () => {
    if (!valorSaldo || parseFloat(valorSaldo) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const valor = parseFloat(valorSaldo);
    const novoSaldo = saldo + valor;
    
    try {
      // Atualizar o estado primeiro para feedback imediato
      setSaldo(novoSaldo);
      setMovimentacoes(prev => [...prev, {
        id: Date.now(),
        tipo: 'adicionar',
        valor: valor,
        data: new Date(),
        descricao: 'Adição de saldo'
      }]);

      // Tentar salvar no banco de dados
      const { error } = await supabase
        .from('transacoes')
        .insert({
          tipo: 'Receita',
          valor: valor,
          data: new Date().toISOString().split('T')[0],
          categoria_id: '00000000-0000-0000-0000-000000000000',
          conta_id: '00000000-0000-0000-0000-000000000000',
          usuario_id: user.id,
          observacao: 'Adição de saldo'
        });

      if (error) {
        console.error('Erro ao salvar no banco:', error);
        // Se der erro no banco, não revertemos o estado para manter a UX
      }

      toast({
        title: "Saldo adicionado!",
        description: `R$ ${valor.toLocaleString('pt-BR')} adicionado com sucesso.`,
      });

      setValorSaldo('');
      setAddSaldoOpen(false);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao adicionar saldo",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAddDespesa = async () => {
    if (!valorDespesa || parseFloat(valorDespesa) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const valor = parseFloat(valorDespesa);
    const novaDespesa = despesas + valor;
    
    try {
      // Atualizar o estado primeiro para feedback imediato
      setDespesas(novaDespesa);
      setMovimentacoes(prev => [...prev, {
        id: Date.now(),
        tipo: 'despesa',
        valor: valor,
        data: new Date(),
        descricao: descricaoDespesa || 'Despesa registrada'
      }]);

      // Tentar salvar no banco de dados
      const { error } = await supabase
        .from('transacoes')
        .insert({
          tipo: 'Despesa',
          valor: valor,
          data: new Date().toISOString().split('T')[0],
          categoria_id: '00000000-0000-0000-0000-000000000000',
          conta_id: '00000000-0000-0000-0000-000000000000',
          usuario_id: user.id,
          observacao: descricaoDespesa || 'Despesa registrada'
        });

      if (error) {
        console.error('Erro ao salvar no banco:', error);
        // Se der erro no banco, não revertemos o estado para manter a UX
      }

      toast({
        title: "Despesa registrada!",
        description: `R$ ${valor.toLocaleString('pt-BR')} registrado como despesa.`,
      });

      setValorDespesa('');
      setDescricaoDespesa('');
      setAddDespesaOpen(false);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao registrar despesa",
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r min-h-screen">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">MyWallet</h1>
              <p className="text-sm text-muted-foreground">Controle financeiro</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Home className="mr-3" size={20} />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <DollarSign className="mr-3" size={20} />
              Saldo
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <BarChart3 className="mr-3" size={20} />
              Gráfico
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <TrendingUp className="mr-3" size={20} />
              Investimentos
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Target className="mr-3" size={20} />
              Objetivos
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <TrendingDown className="mr-3" size={20} />
              Despesas
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Zap className="mr-3" size={20} />
              Integrações
            </Button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">Visão geral das suas finanças</p>
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

        <main className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Saldo Total */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="text-primary" size={20} />
                  <span>Saldo Total</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">R$ {saldo.toLocaleString('pt-BR')}</div>
                <p className="text-sm text-muted-foreground mt-1">Saldo atual</p>
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
                <div className="text-3xl font-bold text-expense">R$ {despesas.toLocaleString('pt-BR')}</div>
                <p className="text-sm text-muted-foreground mt-1">Total de gastos</p>
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
                <div className="text-3xl font-bold text-accent">R$ {economias.toLocaleString('pt-BR')}</div>
                <p className="text-sm text-muted-foreground mt-1">Saldo disponível</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico Financeiro */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral Financeira</CardTitle>
                <CardDescription>
                  Distribuição do seu patrimônio financeiro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                        labelStyle={{ color: '#666' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Ações Rápidas</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Dialog open={addSaldoOpen} onOpenChange={setAddSaldoOpen}>
                <DialogTrigger asChild>
                  <Button className="h-20 text-lg" variant="outline">
                    <DollarSign className="mr-2" size={20} />
                    Adicionar Saldo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Saldo</DialogTitle>
                    <DialogDescription>
                      Digite o valor que deseja adicionar ao seu saldo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="valor-saldo">Valor (R$)</Label>
                      <Input
                        id="valor-saldo"
                        type="number"
                        placeholder="0,00"
                        value={valorSaldo}
                        onChange={(e) => setValorSaldo(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddSaldoOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddSaldo}>
                      Adicionar Saldo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={addDespesaOpen} onOpenChange={setAddDespesaOpen}>
                <DialogTrigger asChild>
                  <Button className="h-20 text-lg" variant="outline">
                    <TrendingDown className="mr-2" size={20} />
                    Registrar Despesa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Despesa</DialogTitle>
                    <DialogDescription>
                      Digite o valor e descrição da despesa.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="valor-despesa">Valor (R$)</Label>
                      <Input
                        id="valor-despesa"
                        type="number"
                        placeholder="0,00"
                        value={valorDespesa}
                        onChange={(e) => setValorDespesa(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao-despesa">Descrição</Label>
                      <Input
                        id="descricao-despesa"
                        placeholder="Ex: Alimentação, Transporte..."
                        value={descricaoDespesa}
                        onChange={(e) => setDescricaoDespesa(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddDespesaOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddDespesa}>
                      Registrar Despesa
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Movimentações Recentes */}
          {movimentacoes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Movimentações Recentes</h2>
              <div className="space-y-2">
                {movimentacoes.slice(-5).reverse().map((mov) => (
                  <Card key={mov.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${mov.tipo === 'adicionar' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-medium">{mov.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {mov.data.toLocaleDateString('pt-BR')} às {mov.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${mov.tipo === 'adicionar' ? 'text-green-600' : 'text-red-600'}`}>
                        {mov.tipo === 'adicionar' ? '+' : '-'} R$ {mov.valor.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

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
    </div>
  );
};

export default Index;
