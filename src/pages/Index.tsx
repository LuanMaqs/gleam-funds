import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingUp, TrendingDown, DollarSign, LogOut, User, BarChart3, Target, Zap, Home, PiggyBank } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(2450);
  const [despesas, setDespesas] = useState(750);
  const [economias, setEconomias] = useState(1500);
  const [metaEconomias, setMetaEconomias] = useState(2000);
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [addSaldoOpen, setAddSaldoOpen] = useState(false);
  const [addDespesaOpen, setAddDespesaOpen] = useState(false);
  const [addEconomiasOpen, setAddEconomiasOpen] = useState(false);
  const [valorSaldo, setValorSaldo] = useState('');
  const [valorDespesa, setValorDespesa] = useState('');
  const [valorEconomias, setValorEconomias] = useState('');
  const [novaMeta, setNovaMeta] = useState('');
  const [descricaoDespesa, setDescricaoDespesa] = useState('');
  const [tipoEconomias, setTipoEconomias] = useState<'adicionar' | 'retirar'>('adicionar');
  const [tipoSaldo, setTipoSaldo] = useState<'adicionar' | 'retirar'>('adicionar');
  const navigate = useNavigate();

  // Dados para o gráfico
  const chartData = [
    { name: 'Saldo em Conta', value: saldo, color: '#22c55e' },
    { name: 'Despesas', value: despesas, color: '#dc2626' },
    { name: 'Investimentos', value: economias, color: '#8b5cf6' },
  ];

  // Calcular saldo + investimentos
  const saldoMaisInvestimentos = saldo + economias;

  // Função para formatar valores em Euro
  const formatarEuro = (valor: number) => {
    return `€ ${valor.toLocaleString('pt-PT', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Função para salvar dados no localStorage
  const salvarDadosLocal = (novoSaldo: number, novasDespesas: number, novasEconomias: number, novaMeta: number) => {
    const dados = {
      saldo: novoSaldo,
      despesas: novasDespesas,
      economias: novasEconomias,
      metaEconomias: novaMeta,
      timestamp: Date.now()
    };
    localStorage.setItem('mywallet_dados', JSON.stringify(dados));
  };

  // Função para carregar dados do localStorage
  const carregarDadosLocal = () => {
    const dadosSalvos = localStorage.getItem('mywallet_dados');
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        // Verificar se os dados não são muito antigos (mais de 30 dias)
        const trintaDias = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - dados.timestamp < trintaDias) {
          setSaldo(dados.saldo || 2450);
          setDespesas(dados.despesas || 750);
          setEconomias(dados.economias || 1500);
          setMetaEconomias(dados.metaEconomias || 2000);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
      }
    }
  };

  // Função para carregar dados do banco
  const carregarDadosBanco = async () => {
    if (!user) return;

    try {
      // Carregar transações do usuário
      const { data: transacoes, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao carregar transações:', error);
        return;
      }

      if (transacoes && transacoes.length > 0) {
        let saldoCalculado = 2450;
        let despesasCalculadas = 750;
        let economiasCalculadas = 1500;
        const movimentacoesBanco: any[] = [];

        transacoes.forEach((transacao) => {
          const valor = parseFloat(String(transacao.valor));
          const observacao = transacao.observacao || '';

          if (transacao.tipo === 'Receita') {
            if (observacao.includes('Adição de saldo')) {
              saldoCalculado += valor;
            } else if (observacao.includes('Adição de economias')) {
              economiasCalculadas += valor;
            }
          } else if (transacao.tipo === 'Despesa') {
            if (observacao.includes('Despesa registrada')) {
              despesasCalculadas += valor;
            } else if (observacao.includes('Retirada de economias')) {
              economiasCalculadas -= valor;
            } else if (observacao.includes('Retirada de saldo')) {
              saldoCalculado -= valor;
            }
          }

          // Adicionar à lista de movimentações
          movimentacoesBanco.push({
            id: transacao.id,
            tipo: observacao.includes('Adição de saldo') ? 'adicionar' :
                  observacao.includes('Retirada de saldo') ? 'retirar-saldo' :
                  observacao.includes('Adição de economias') ? 'economias' :
                  observacao.includes('Retirada de economias') ? 'retirar-economias' : 'despesa',
            valor: valor,
            data: new Date(transacao.data),
            descricao: observacao
          });
        });

        setSaldo(saldoCalculado);
        setDespesas(despesasCalculadas);
        setEconomias(economiasCalculadas);
        setMovimentacoes(movimentacoesBanco);

        // Salvar no localStorage
        salvarDadosLocal(saldoCalculado, despesasCalculadas, economiasCalculadas, metaEconomias);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do banco:', error);
    }
  };

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

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      carregarDadosLocal(); // Primeiro carrega do localStorage para feedback rápido
      carregarDadosBanco(); // Depois carrega do banco para sincronizar
    }
  }, [user]);

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
    
    if (tipoSaldo === 'retirar' && valor > saldo) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente para retirar este valor.",
        variant: "destructive",
      });
      return;
    }

    const novoSaldo = tipoSaldo === 'adicionar' ? saldo + valor : saldo - valor;
    
    try {
      // Atualizar o estado primeiro para feedback imediato
      setSaldo(novoSaldo);
      const novaMovimentacao = {
        id: Date.now(),
        tipo: tipoSaldo === 'adicionar' ? 'adicionar' : 'retirar-saldo',
        valor: valor,
        data: new Date(),
        descricao: tipoSaldo === 'adicionar' ? 'Adição de saldo' : 'Retirada de saldo'
      };
      setMovimentacoes(prev => [...prev, novaMovimentacao]);

      // Salvar no localStorage
      salvarDadosLocal(novoSaldo, despesas, economias, metaEconomias);

      // Tentar salvar no banco de dados
      const { error } = await supabase
        .from('transacoes')
        .insert({
          tipo: tipoSaldo === 'adicionar' ? 'Receita' : 'Despesa',
          valor: valor,
          data: new Date().toISOString().split('T')[0],
          categoria_id: '00000000-0000-0000-0000-000000000000',
          conta_id: '00000000-0000-0000-0000-000000000000',
          usuario_id: user.id,
          observacao: tipoSaldo === 'adicionar' ? 'Adição de saldo' : 'Retirada de saldo'
        });

      if (error) {
        console.error('Erro ao salvar no banco:', error);
        // Se der erro no banco, não revertemos o estado para manter a UX
      }

      toast({
        title: tipoSaldo === 'adicionar' ? "Saldo adicionado!" : "Saldo retirado!",
        description: `${formatarEuro(valor)} ${tipoSaldo === 'adicionar' ? 'adicionado ao' : 'retirado do'} saldo.`,
      });

      setValorSaldo('');
      setTipoSaldo('adicionar');
      setAddSaldoOpen(false);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao gerenciar saldo",
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
      const novaMovimentacao = {
        id: Date.now(),
        tipo: 'despesa',
        valor: valor,
        data: new Date(),
        descricao: descricaoDespesa || 'Despesa registrada'
      };
      setMovimentacoes(prev => [...prev, novaMovimentacao]);

      // Salvar no localStorage
      salvarDadosLocal(saldo, novaDespesa, economias, metaEconomias);

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
        description: `${formatarEuro(valor)} registrado como despesa.`,
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

  const handleAddEconomias = async () => {
    if (!valorEconomias || parseFloat(valorEconomias) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const valor = parseFloat(valorEconomias);
    
    if (tipoEconomias === 'retirar' && valor > economias) {
      toast({
        title: "Valor insuficiente",
        description: "Você não tem investimentos suficientes para retirar este valor.",
        variant: "destructive",
      });
      return;
    }

    const novasEconomias = tipoEconomias === 'adicionar' ? economias + valor : economias - valor;
    
    try {
      // Atualizar o estado primeiro para feedback imediato
      setEconomias(novasEconomias);
      const novaMovimentacao = {
        id: Date.now(),
        tipo: tipoEconomias === 'adicionar' ? 'economias' : 'retirar-economias',
        valor: valor,
        data: new Date(),
        descricao: tipoEconomias === 'adicionar' ? 'Adição de investimentos' : 'Retirada de investimentos'
      };
      setMovimentacoes(prev => [...prev, novaMovimentacao]);

      // Salvar no localStorage
      salvarDadosLocal(saldo, despesas, novasEconomias, metaEconomias);

      // Tentar salvar no banco de dados
      const { error } = await supabase
        .from('transacoes')
        .insert({
          tipo: tipoEconomias === 'adicionar' ? 'Receita' : 'Despesa',
          valor: valor,
          data: new Date().toISOString().split('T')[0],
          categoria_id: '00000000-0000-0000-0000-000000000000',
          conta_id: '00000000-0000-0000-0000-000000000000',
          usuario_id: user.id,
          observacao: tipoEconomias === 'adicionar' ? 'Adição de investimentos' : 'Retirada de investimentos'
        });

      if (error) {
        console.error('Erro ao salvar no banco:', error);
        // Se der erro no banco, não revertemos o estado para manter a UX
      }

      toast({
        title: tipoEconomias === 'adicionar' ? "Investimentos adicionados!" : "Investimentos retirados!",
        description: `${formatarEuro(valor)} ${tipoEconomias === 'adicionar' ? 'adicionado aos' : 'retirado dos'} investimentos.`,
      });

      setValorEconomias('');
      setTipoEconomias('adicionar');
      setAddEconomiasOpen(false);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao gerenciar investimentos",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAtualizarMeta = () => {
    if (!novaMeta || parseFloat(novaMeta) <= 0) {
      toast({
        title: "Meta inválida",
        description: "Digite uma meta válida maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const novaMetaValor = parseFloat(novaMeta);
    setMetaEconomias(novaMetaValor);
    
    // Salvar no localStorage
    salvarDadosLocal(saldo, despesas, economias, novaMetaValor);
    
    toast({
      title: "Meta atualizada!",
      description: `Nova meta definida: ${formatarEuro(novaMetaValor)}`,
    });

    setNovaMeta('');
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
          <div className="grid gap-6 md:grid-cols-4">
            {/* Saldo + Investimentos */}
            <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="text-success" size={20} />
                  <span>Saldo + Investimentos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{formatarEuro(saldoMaisInvestimentos)}</div>
                <p className="text-sm text-muted-foreground mt-1">Patrimônio total</p>
              </CardContent>
            </Card>

            {/* Saldo em Conta */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="text-primary" size={20} />
                  <span>Saldo em Conta</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{formatarEuro(saldo)}</div>
                <p className="text-sm text-muted-foreground mt-1">Saldo disponível</p>
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
                <div className="text-3xl font-bold text-expense">{formatarEuro(despesas)}</div>
                <p className="text-sm text-muted-foreground mt-1">Total de gastos</p>
              </CardContent>
            </Card>

            {/* Investimentos */}
            <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="text-accent" size={20} />
                  <span>Investimentos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{formatarEuro(economias)}</div>
                <p className="text-sm text-muted-foreground mt-1">Meta: {formatarEuro(metaEconomias)}</p>
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
                        formatter={(value: number) => [formatarEuro(value), 'Valor']}
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
            <div className="grid gap-4 md:grid-cols-3">
              <Dialog open={addSaldoOpen} onOpenChange={setAddSaldoOpen}>
                <DialogTrigger asChild>
                  <Button className="h-20 text-lg" variant="outline">
                    <DollarSign className="mr-2" size={20} />
                    Gerenciar Saldo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerenciar Saldo</DialogTitle>
                    <DialogDescription>
                      Adicione ou retire dinheiro do seu saldo em conta.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Operação</Label>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          type="button"
                          variant={tipoSaldo === 'adicionar' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTipoSaldo('adicionar')}
                        >
                          Adicionar
                        </Button>
                        <Button
                          type="button"
                          variant={tipoSaldo === 'retirar' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTipoSaldo('retirar')}
                        >
                          Retirar
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="valor-saldo">
                        Valor para {tipoSaldo === 'adicionar' ? 'Adicionar' : 'Retirar'} Saldo (€)
                      </Label>
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
                      {tipoSaldo === 'adicionar' ? 'Adicionar' : 'Retirar'} Saldo
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
                      <Label htmlFor="valor-despesa">Valor (€)</Label>
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

              <Dialog open={addEconomiasOpen} onOpenChange={setAddEconomiasOpen}>
                <DialogTrigger asChild>
                  <Button className="h-20 text-lg" variant="outline">
                    <TrendingUp className="mr-2" size={20} />
                    Gerenciar Investimentos
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerenciar Investimentos</DialogTitle>
                    <DialogDescription>
                      Adicione ou retire investimentos e defina uma nova meta.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Operação</Label>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          type="button"
                          variant={tipoEconomias === 'adicionar' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTipoEconomias('adicionar')}
                        >
                          Adicionar
                        </Button>
                        <Button
                          type="button"
                          variant={tipoEconomias === 'retirar' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTipoEconomias('retirar')}
                        >
                          Retirar
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="valor-economias">
                        Valor para {tipoEconomias === 'adicionar' ? 'Adicionar' : 'Retirar'} Investimentos (€)
                      </Label>
                      <Input
                        id="valor-economias"
                        type="number"
                        placeholder="0,00"
                        value={valorEconomias}
                        onChange={(e) => setValorEconomias(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nova-meta">Nova Meta de Investimentos (€)</Label>
                      <Input
                        id="nova-meta"
                        type="number"
                        placeholder={metaEconomias.toString()}
                        value={novaMeta}
                        onChange={(e) => setNovaMeta(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddEconomiasOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddEconomias}>
                      {tipoEconomias === 'adicionar' ? 'Adicionar' : 'Retirar'} Investimentos
                    </Button>
                    <Button onClick={handleAtualizarMeta} variant="secondary">
                      Atualizar Meta
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
                        <div className={`w-3 h-3 rounded-full ${
                          mov.tipo === 'adicionar' ? 'bg-green-500' : 
                          mov.tipo === 'retirar-saldo' ? 'bg-red-500' :
                          mov.tipo === 'economias' ? 'bg-purple-500' : 
                          mov.tipo === 'retirar-economias' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{mov.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {mov.data.toLocaleDateString('pt-PT')} às {mov.data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        mov.tipo === 'adicionar' ? 'text-green-600' : 
                        mov.tipo === 'retirar-saldo' ? 'text-red-600' :
                        mov.tipo === 'economias' ? 'text-purple-600' : 
                        mov.tipo === 'retirar-economias' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {mov.tipo === 'adicionar' || mov.tipo === 'economias' ? '+' : '-'} {formatarEuro(mov.valor)}
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