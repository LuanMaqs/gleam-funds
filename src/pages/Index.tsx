import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingUp, TrendingDown, DollarSign, LogOut, User, BarChart3, Target, Zap, Home, PiggyBank, FileText } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'saldo' | 'grafico' | 'investimentos' | 'objetivos' | 'despesas' | 'integracoes' | 'relatorios'>('dashboard');
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
  const salvarDadosLocal = (novoSaldo: number, novasDespesas: number, novasEconomias: number, novaMeta: number, novasMovimentacoes?: any[]) => {
    const dados = {
      saldo: novoSaldo,
      despesas: novasDespesas,
      economias: novasEconomias,
      metaEconomias: novaMeta,
      movimentacoes: novasMovimentacoes || movimentacoes,
      timestamp: Date.now()
    };
    localStorage.setItem('mywallet_dados', JSON.stringify(dados));
    console.log('Dados salvos no localStorage:', dados);
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
          console.log('Carregando dados do localStorage:', dados);
          setSaldo(dados.saldo || 2450);
          setDespesas(dados.despesas || 750);
          setEconomias(dados.economias || 1500);
          setMetaEconomias(dados.metaEconomias || 2000);
          
          // Carregar movimentações se existirem
          if (dados.movimentacoes && Array.isArray(dados.movimentacoes)) {
            // Converter as datas de string para Date
            const movimentacoesComDatas = dados.movimentacoes.map((mov: any) => ({
              ...mov,
              data: new Date(mov.data)
            }));
            setMovimentacoes(movimentacoesComDatas);
            console.log('Movimentações carregadas do localStorage:', movimentacoesComDatas);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
      }
    } else {
      console.log('Nenhum dado encontrado no localStorage');
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

      // Carregar dados do localStorage para comparar
      const dadosSalvos = localStorage.getItem('mywallet_dados');
      let dadosLocal: any = null;
      if (dadosSalvos) {
        try {
          dadosLocal = JSON.parse(dadosSalvos);
        } catch {}
      }

      if (transacoes && transacoes.length > 0) {
        // Usar os valores atuais como base
        let saldoCalculado = saldo;
        let despesasCalculadas = despesas;
        let economiasCalculadas = economias;
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
            } else if (observacao.includes('Retirada de despesa')) {
              despesasCalculadas -= valor;
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
                  observacao.includes('Retirada de economias') ? 'retirar-economias' :
                  observacao.includes('Retirada de despesa') ? 'retirar-despesa' :
                  'despesa',
            valor: valor,
            data: new Date(transacao.data),
            descricao: observacao
          });
        });

        // Só atualizar se os valores calculados forem diferentes dos do localStorage
        const deveAtualizar = !dadosLocal ||
          saldoCalculado !== dadosLocal.saldo ||
          despesasCalculadas !== dadosLocal.despesas ||
          economiasCalculadas !== dadosLocal.economias ||
          (dadosLocal.movimentacoes && dadosLocal.movimentacoes.length !== movimentacoesBanco.length);

        if (deveAtualizar) {
          setSaldo(saldoCalculado);
          setDespesas(despesasCalculadas);
          setEconomias(economiasCalculadas);
          setMovimentacoes(movimentacoesBanco);
          // Salvar no localStorage
          salvarDadosLocal(saldoCalculado, despesasCalculadas, economiasCalculadas, metaEconomias, movimentacoesBanco);
        } else {
          // Não sobrescreve o localStorage, apenas mantém o que já está
          // Se quiser, pode atualizar só as movimentações se quiser garantir sincronismo
          // setMovimentacoes(movimentacoesBanco);
        }
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
      // Aguardar um pouco antes de carregar do banco para evitar conflitos
      setTimeout(() => {
        carregarDadosBanco(); // Depois carrega do banco para sincronizar
      }, 100);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      // NÃO limpar localStorage aqui!
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
      salvarDadosLocal(novoSaldo, despesas, economias, metaEconomias, [...movimentacoes, novaMovimentacao]);

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
    
    if (tipoSaldo === 'retirar' && valor > saldo) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente para retirar este valor.",
        variant: "destructive",
      });
      return;
    }

    const novaDespesa = tipoSaldo === 'adicionar' ? despesas + valor : despesas - valor;
    
    try {
      // Atualizar o estado primeiro para feedback imediato
      setDespesas(novaDespesa);
      const novaMovimentacao = {
        id: Date.now(),
        tipo: tipoSaldo === 'adicionar' ? 'despesa' : 'retirar-despesa',
        valor: valor,
        data: new Date(),
        descricao: tipoSaldo === 'adicionar' ? (descricaoDespesa || 'Despesa registrada') : (descricaoDespesa || 'Retirada de despesa')
      };
      setMovimentacoes(prev => [...prev, novaMovimentacao]);

      // Salvar no localStorage
      salvarDadosLocal(saldo, novaDespesa, economias, metaEconomias, [...movimentacoes, novaMovimentacao]);

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
          observacao: tipoSaldo === 'adicionar' ? (descricaoDespesa || 'Despesa registrada') : (descricaoDespesa || 'Retirada de despesa')
        });

      if (error) {
        console.error('Erro ao salvar no banco:', error);
        // Se der erro no banco, não revertemos o estado para manter a UX
      }

      toast({
        title: tipoSaldo === 'adicionar' ? "Despesa registrada!" : "Despesa retirada!",
        description: tipoSaldo === 'adicionar' 
          ? `${formatarEuro(valor)} registrado como despesa.`
          : `${formatarEuro(valor)} retirado das despesas.`,
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
      salvarDadosLocal(saldo, despesas, novasEconomias, metaEconomias, [...movimentacoes, novaMovimentacao]);

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
    salvarDadosLocal(saldo, despesas, economias, novaMetaValor, movimentacoes);
    
    toast({
      title: "Meta atualizada!",
      description: `Nova meta definida: ${formatarEuro(novaMetaValor)}`,
    });

    setNovaMeta('');
  };

  const [investimentos, setInvestimentos] = useState(() => {
    const saved = localStorage.getItem('mywallet_investimentos');
    return saved ? JSON.parse(saved) : [];
  });
  const [novoInvestimento, setNovoInvestimento] = useState('');
  const [plataformaInvestimento, setPlataformaInvestimento] = useState('');

  const adicionarInvestimento = () => {
    if (!novoInvestimento || !plataformaInvestimento) return;
    const novo = {
      id: Date.now(),
      nome: novoInvestimento,
      plataforma: plataformaInvestimento,
      data: new Date(),
    };
    const atualizados = [...investimentos, novo];
    setInvestimentos(atualizados);
    localStorage.setItem('mywallet_investimentos', JSON.stringify(atualizados));
    setNovoInvestimento('');
    setPlataformaInvestimento('');
  };

  const [objetivos, setObjetivos] = useState(() => {
    const saved = localStorage.getItem('mywallet_objetivos');
    return saved ? JSON.parse(saved) : [];
  });
  const [novoObjetivo, setNovoObjetivo] = useState('');
  const [valorObjetivo, setValorObjetivo] = useState('');
  const [linkObjetivo, setLinkObjetivo] = useState('');

  const adicionarObjetivo = () => {
    if (!novoObjetivo || !valorObjetivo) return;
    const novo = {
      id: Date.now(),
      nome: novoObjetivo,
      valor: parseFloat(valorObjetivo),
      link: linkObjetivo,
      data: new Date(),
    };
    const atualizados = [...objetivos, novo];
    setObjetivos(atualizados);
    localStorage.setItem('mywallet_objetivos', JSON.stringify(atualizados));
    setNovoObjetivo('');
    setValorObjetivo('');
    setLinkObjetivo('');
  };

  const totalInvestido = investimentos.reduce((acc, inv) => acc + (inv.valor || 0), 0);

  const toggleConcluirObjetivo = (id: number) => {
    const atualizados = objetivos.map(obj =>
      obj.id === id ? { ...obj, concluido: !obj.concluido } : obj
    );
    setObjetivos(atualizados);
    localStorage.setItem('mywallet_objetivos', JSON.stringify(atualizados));
  };
  const excluirObjetivo = (id: number) => {
    const atualizados = objetivos.filter(obj => obj.id !== id);
    setObjetivos(atualizados);
    localStorage.setItem('mywallet_objetivos', JSON.stringify(atualizados));
  };

  const [filtroMes, setFiltroMes] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const data = new Date(mov.data);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}` === filtroMes;
  });

  const agrupadasPorDia = movimentacoesFiltradas.reduce((acc, mov) => {
    const data = new Date(mov.data);
    const dia = data.toLocaleDateString('pt-PT');
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(mov);
    return acc;
  }, {} as Record<string, any[]>);
  const diasOrdenados = Object.keys(agrupadasPorDia).sort((a, b) => {
    const [d1, m1, y1] = a.split('/').map(Number);
    const [d2, m2, y2] = b.split('/').map(Number);
    return new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
  });

  const [keysN8n, setKeysN8n] = useState(() => {
    const saved = localStorage.getItem('mywallet_n8n_keys');
    return saved ? JSON.parse(saved) : [];
  });
  const [novaKey, setNovaKey] = useState('');

  const adicionarKeyN8n = () => {
    if (!novaKey) return;
    const atualizadas = [...keysN8n, novaKey];
    setKeysN8n(atualizadas);
    localStorage.setItem('mywallet_n8n_keys', JSON.stringify(atualizadas));
    setNovaKey('');
  };
  const removerKeyN8n = (key: string) => {
    const atualizadas = keysN8n.filter(k => k !== key);
    setKeysN8n(atualizadas);
    localStorage.setItem('mywallet_n8n_keys', JSON.stringify(atualizadas));
  };

  const [despesasFixas, setDespesasFixas] = useState(() => {
    const saved = localStorage.getItem('mywallet_despesas_fixas');
    return saved ? JSON.parse(saved) : [];
  });
  const [despesasTemp, setDespesasTemp] = useState(() => {
    const saved = localStorage.getItem('mywallet_despesas_temp');
    return saved ? JSON.parse(saved) : [];
  });
  const [novaDespesaNome, setNovaDespesaNome] = useState('');
  const [novaDespesaValor, setNovaDespesaValor] = useState('');
  const [tipoNovaDespesa, setTipoNovaDespesa] = useState<'fixa' | 'temporaria'>('fixa');

  const adicionarNovaDespesa = () => {
    if (!novaDespesaNome || !novaDespesaValor) return;
    const nova = {
      id: Date.now(),
      nome: novaDespesaNome,
      valor: parseFloat(novaDespesaValor),
      data: new Date(),
    };
    if (tipoNovaDespesa === 'fixa') {
      const atualizadas = [...despesasFixas, nova];
      setDespesasFixas(atualizadas);
      localStorage.setItem('mywallet_despesas_fixas', JSON.stringify(atualizadas));
    } else {
      const atualizadas = [...despesasTemp, nova];
      setDespesasTemp(atualizadas);
      localStorage.setItem('mywallet_despesas_temp', JSON.stringify(atualizadas));
    }
    setNovaDespesaNome('');
    setNovaDespesaValor('');
  };
  const excluirDespesaFixa = (id: number) => {
    const atualizadas = despesasFixas.filter(d => d.id !== id);
    setDespesasFixas(atualizadas);
    localStorage.setItem('mywallet_despesas_fixas', JSON.stringify(atualizadas));
  };
  const excluirDespesaTemp = (id: number) => {
    const atualizadas = despesasTemp.filter(d => d.id !== id);
    setDespesasTemp(atualizadas);
    localStorage.setItem('mywallet_despesas_temp', JSON.stringify(atualizadas));
  };

  const toggleConcluirDespesaTemp = (id: number) => {
    const atualizadas = despesasTemp.map(d =>
      d.id === id ? { ...d, concluida: !d.concluida } : d
    );
    setDespesasTemp(atualizadas);
    localStorage.setItem('mywallet_despesas_temp', JSON.stringify(atualizadas));
  };

  const [editandoDespesaFixa, setEditandoDespesaFixa] = useState<number | null>(null);
  const [editNomeFixa, setEditNomeFixa] = useState('');
  const [editValorFixa, setEditValorFixa] = useState('');
  const [editandoDespesaTemp, setEditandoDespesaTemp] = useState<number | null>(null);
  const [editNomeTemp, setEditNomeTemp] = useState('');
  const [editValorTemp, setEditValorTemp] = useState('');

  const iniciarEdicaoFixa = (d: any) => {
    setEditandoDespesaFixa(d.id);
    setEditNomeFixa(d.nome);
    setEditValorFixa(String(d.valor));
  };
  const salvarEdicaoFixa = (id: number) => {
    const atualizadas = despesasFixas.map(d =>
      d.id === id ? { ...d, nome: editNomeFixa, valor: parseFloat(editValorFixa) } : d
    );
    setDespesasFixas(atualizadas);
    localStorage.setItem('mywallet_despesas_fixas', JSON.stringify(atualizadas));
    setEditandoDespesaFixa(null);
    setEditNomeFixa('');
    setEditValorFixa('');
  };
  const cancelarEdicaoFixa = () => {
    setEditandoDespesaFixa(null);
    setEditNomeFixa('');
    setEditValorFixa('');
  };
  const iniciarEdicaoTemp = (d: any) => {
    setEditandoDespesaTemp(d.id);
    setEditNomeTemp(d.nome);
    setEditValorTemp(String(d.valor));
  };
  const salvarEdicaoTemp = (id: number) => {
    const atualizadas = despesasTemp.map(d =>
      d.id === id ? { ...d, nome: editNomeTemp, valor: parseFloat(editValorTemp) } : d
    );
    setDespesasTemp(atualizadas);
    localStorage.setItem('mywallet_despesas_temp', JSON.stringify(atualizadas));
    setEditandoDespesaTemp(null);
    setEditNomeTemp('');
    setEditValorTemp('');
  };
  const cancelarEdicaoTemp = () => {
    setEditandoDespesaTemp(null);
    setEditNomeTemp('');
    setEditValorTemp('');
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
            <Button 
              variant={currentPage === 'dashboard' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              size="lg"
              onClick={() => setCurrentPage('dashboard')}
            >
              <Home className="mr-3" size={20} />
              Dashboard
            </Button>
            <Button 
              variant={currentPage === 'saldo' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              size="lg"
              onClick={() => setCurrentPage('saldo')}
            >
              <DollarSign className="mr-3" size={20} />
              Saldo
            </Button>
            <Button 
              variant={currentPage === 'grafico' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              size="lg"
              onClick={() => setCurrentPage('grafico')}
            >
              <BarChart3 className="mr-3" size={20} />
              Gráfico
            </Button>
            <Button 
              variant={currentPage === 'investimentos' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              size="lg"
              onClick={() => setCurrentPage('investimentos')}
            >
              <TrendingUp className="mr-3" size={20} />
              Investimentos
            </Button>
            <Button 
              variant={currentPage === 'objetivos' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              size="lg"
              onClick={() => setCurrentPage('objetivos')}
            >
              <Target className="mr-3" size={20} />
              Objetivos
            </Button>
            <Button 
              variant={currentPage === 'despesas' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              size="lg"
              onClick={() => setCurrentPage('despesas')}
            >
              <TrendingDown className="mr-3" size={20} />
              Despesas
            </Button>
            <Button 
              variant={currentPage === 'relatorios' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              size="lg"
              onClick={() => setCurrentPage('relatorios')}
            >
              <FileText className="mr-3" size={20} />
              Relatórios
            </Button>
            <Button 
              variant={currentPage === 'integracoes' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              size="lg"
              onClick={() => setCurrentPage('integracoes')}
            >
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
              <h2 className="text-2xl font-bold">
                {currentPage === 'dashboard' && 'Dashboard'}
                {currentPage === 'saldo' && 'Saldo'}
                {currentPage === 'grafico' && 'Gráfico'}
                {currentPage === 'investimentos' && 'Investimentos'}
                {currentPage === 'objetivos' && 'Objetivos'}
                {currentPage === 'despesas' && 'Despesas'}
                {currentPage === 'relatorios' && 'Relatórios'}
                {currentPage === 'integracoes' && 'Integrações'}
              </h2>
              <p className="text-muted-foreground">
                {currentPage === 'dashboard' && 'Visão geral das suas finanças'}
                {currentPage === 'saldo' && 'Gerencie seu saldo em conta'}
                {currentPage === 'grafico' && 'Visualize seus dados financeiros'}
                {currentPage === 'investimentos' && 'Gerencie seus investimentos'}
                {currentPage === 'objetivos' && 'Defina e acompanhe seus objetivos'}
                {currentPage === 'despesas' && 'Controle suas despesas'}
                {currentPage === 'relatorios' && 'Relatórios detalhados'}
                {currentPage === 'integracoes' && 'Conecte com outros serviços'}
              </p>
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
          {/* Cards e ações rápidas só no dashboard */}
          {currentPage === 'dashboard' && (
            <>
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
              {/* Gráfico também no dashboard */}
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
                    Gerenciar Despesas
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerenciar Despesas</DialogTitle>
                    <DialogDescription>
                      Adicione ou retire despesas e defina uma descrição.
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
                      <Label htmlFor="valor-despesa">
                            Valor para {tipoSaldo === 'adicionar' ? 'Adicionar' : 'Retirar'} Despesa (€)
                      </Label>
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
                          {tipoSaldo === 'adicionar' ? 'Adicionar' : 'Retirar'} Despesa
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
            </>
          )}

          {/* Gráfico na página de gráfico */}
          {currentPage === 'grafico' && (
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
          )}

          {/* Movimentações Recentes - só no dashboard */}
          {currentPage === 'dashboard' && movimentacoes.length > 0 && (
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
                          mov.tipo === 'despesa' ? 'bg-red-500' :
                          mov.tipo === 'retirar-despesa' ? 'bg-orange-500' :
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
                        mov.tipo === 'despesa' ? 'text-red-600' :
                        mov.tipo === 'retirar-despesa' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {mov.tipo === 'adicionar' || mov.tipo === 'economias' || mov.tipo === 'despesa' ? '+' : '-'} {formatarEuro(mov.valor)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Mensagem de Boas-vindas - REMOVIDA */}

          {/* Saldo */}
          {currentPage === 'saldo' && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Movimentações de Saldo</h2>
              {movimentacoes.filter(mov => mov.tipo === 'adicionar' || mov.tipo === 'retirar-saldo').length > 0 ? (
                <div className="space-y-2">
                  {movimentacoes
                    .filter(mov => mov.tipo === 'adicionar' || mov.tipo === 'retirar-saldo')
                    .slice().reverse()
                    .map((mov) => (
                      <Card key={mov.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              mov.tipo === 'adicionar' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <p className="font-medium">{mov.descricao}</p>
                              <p className="text-sm text-muted-foreground">
                                {mov.data.toLocaleDateString('pt-PT')} às {mov.data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
                          </div>
                          <div className={`font-bold ${
                            mov.tipo === 'adicionar' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {mov.tipo === 'adicionar' ? '+' : '-'} {formatarEuro(mov.valor)}
                          </div>
                        </div>
          </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma movimentação de saldo encontrada.</p>
              )}
            </div>
          )}

          {/* Investimentos */}
          {currentPage === 'investimentos' && (
            <div className="mt-8 max-w-xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Investimentos</h2>
              <div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-4">
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Nome do investimento"
                  value={novoInvestimento}
                  onChange={e => setNovoInvestimento(e.target.value)}
                />
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Plataforma"
                  value={plataformaInvestimento}
                  onChange={e => setPlataformaInvestimento(e.target.value)}
                />
                <button
                  className="bg-primary text-white px-4 py-2 rounded font-semibold"
                  onClick={adicionarInvestimento}
                  disabled={!novoInvestimento || !plataformaInvestimento}
                >
                  Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {investimentos.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum investimento cadastrado.</p>
                ) : (
                  investimentos.slice().reverse().map(inv => (
                    <Card key={inv.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{inv.nome}</p>
                          <p className="text-sm text-muted-foreground">{inv.plataforma}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(inv.data).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Objetivos */}
          {currentPage === 'objetivos' && (
            <div className="mt-8 max-w-xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Objetivos</h2>
              <div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-4">
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Nome do objetivo"
                  value={novoObjetivo}
                  onChange={e => setNovoObjetivo(e.target.value)}
                />
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Valor (€)"
                  type="number"
                  value={valorObjetivo}
                  onChange={e => setValorObjetivo(e.target.value)}
                />
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Link (opcional)"
                  value={linkObjetivo}
                  onChange={e => setLinkObjetivo(e.target.value)}
                />
                <button
                  className="bg-primary text-white px-4 py-2 rounded font-semibold"
                  onClick={adicionarObjetivo}
                  disabled={!novoObjetivo || !valorObjetivo}
                >
                  Adicionar
                </button>
              </div>
              <div className="mb-4">
                <span className="font-semibold">Total investido:</span> {formatarEuro(totalInvestido)}
              </div>
              <div className="space-y-2">
                {objetivos.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum objetivo cadastrado.</p>
                ) : (
                  objetivos.slice().reverse().map(obj => (
                    <Card key={obj.id} className={`p-4 ${obj.concluido ? 'bg-green-50' : ''}` }>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${obj.concluido ? 'line-through text-green-700' : ''}`}>{obj.nome}</p>
                          <p className={`text-sm text-muted-foreground ${obj.concluido ? 'line-through' : ''}`}>{formatarEuro(obj.valor)}</p>
                          {obj.link && (
                            <a href={obj.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Ver link</a>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-muted-foreground">
                            {new Date(obj.data).toLocaleDateString('pt-PT')}
                          </div>
                          <div className="flex gap-2">
                            <button
                              className={`px-2 py-1 rounded text-xs font-semibold ${obj.concluido ? 'bg-gray-300 text-gray-700' : 'bg-green-500 text-white'}`}
                              onClick={() => toggleConcluirObjetivo(obj.id)}
                            >
                              {obj.concluido ? 'Desfazer' : 'Concluir'}
                            </button>
                            <button
                              className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white"
                              onClick={() => excluirObjetivo(obj.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Despesas */}
          {currentPage === 'despesas' && (
            <div className="mt-8 max-w-xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Despesas</h2>
              <div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-4 items-end">
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Nome da despesa"
                  value={novaDespesaNome}
                  onChange={e => setNovaDespesaNome(e.target.value)}
                />
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Valor (€)"
                  type="number"
                  value={novaDespesaValor}
                  onChange={e => setNovaDespesaValor(e.target.value)}
                />
                <select
                  className="border rounded px-3 py-2"
                  value={tipoNovaDespesa}
                  onChange={e => setTipoNovaDespesa(e.target.value as 'fixa' | 'temporaria')}
                >
                  <option value="fixa">Fixa</option>
                  <option value="temporaria">Temporária</option>
                </select>
                <button
                  className="bg-primary text-white px-4 py-2 rounded font-semibold"
                  onClick={adicionarNovaDespesa}
                  disabled={!novaDespesaNome || !novaDespesaValor}
                >
                  Adicionar
                </button>
              </div>
              <div className="mb-8">
                <h3 className="font-semibold mb-2">Despesas Fixas</h3>
                {despesasFixas.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma despesa fixa cadastrada.</p>
                ) : (
                  despesasFixas.slice().reverse().map(d => (
                    <Card key={d.id} className="p-4 flex items-center justify-between">
                      {editandoDespesaFixa === d.id ? (
                        <>
                          <div className="flex flex-col gap-2 flex-1">
                            <input
                              className="border rounded px-2 py-1 mb-1"
                              value={editNomeFixa}
                              onChange={e => setEditNomeFixa(e.target.value)}
                            />
                            <input
                              className="border rounded px-2 py-1"
                              type="number"
                              value={editValorFixa}
                              onChange={e => setEditValorFixa(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white"
                              onClick={() => salvarEdicaoFixa(d.id)}
                              disabled={!editNomeFixa || !editValorFixa}
                            >
                              Salvar
                            </button>
                            <button
                              className="px-2 py-1 rounded text-xs font-semibold bg-gray-300 text-gray-700"
                              onClick={cancelarEdicaoFixa}
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="font-medium">{d.nome}</p>
                            <p className="text-sm text-muted-foreground">{formatarEuro(d.valor)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="px-2 py-1 rounded text-xs font-semibold bg-blue-500 text-white"
                              onClick={() => iniciarEdicaoFixa(d)}
                            >
                              Editar
                            </button>
                            <button
                              className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white"
                              onClick={() => excluirDespesaFixa(d.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </>
                      )}
                    </Card>
                  ))
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Despesas Temporárias</h3>
                {despesasTemp.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma despesa temporária cadastrada.</p>
                ) : (
                  despesasTemp.slice().reverse().map(d => (
                    <Card key={d.id} className={`p-4 flex items-center justify-between ${d.concluida ? 'bg-green-50' : ''}`}>
                      {editandoDespesaTemp === d.id ? (
                        <>
                          <div className="flex flex-col gap-2 flex-1">
                            <input
                              className="border rounded px-2 py-1 mb-1"
                              value={editNomeTemp}
                              onChange={e => setEditNomeTemp(e.target.value)}
                            />
                            <input
                              className="border rounded px-2 py-1"
                              type="number"
                              value={editValorTemp}
                              onChange={e => setEditValorTemp(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white"
                              onClick={() => salvarEdicaoTemp(d.id)}
                              disabled={!editNomeTemp || !editValorTemp}
                            >
                              Salvar
                            </button>
                            <button
                              className="px-2 py-1 rounded text-xs font-semibold bg-gray-300 text-gray-700"
                              onClick={cancelarEdicaoTemp}
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className={`font-medium ${d.concluida ? 'line-through text-green-700' : ''}`}>{d.nome}</p>
                            <p className={`text-sm text-muted-foreground ${d.concluida ? 'line-through' : ''}`}>{formatarEuro(d.valor)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className={`px-2 py-1 rounded text-xs font-semibold ${d.concluida ? 'bg-gray-300 text-gray-700' : 'bg-green-500 text-white'}`}
                              onClick={() => toggleConcluirDespesaTemp(d.id)}
                            >
                              {d.concluida ? 'Desfazer' : 'Concluir'}
                            </button>
                            <button
                              className="px-2 py-1 rounded text-xs font-semibold bg-blue-500 text-white"
                              onClick={() => iniciarEdicaoTemp(d)}
                            >
                              Editar
                            </button>
                            <button
                              className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white"
                              onClick={() => excluirDespesaTemp(d.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Relatórios */}
          {currentPage === 'relatorios' && (
            <div className="mt-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Relatórios</h2>
              <div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                <label className="font-semibold">Filtrar por mês:</label>
                <input
                  type="month"
                  className="border rounded px-3 py-2"
                  value={filtroMes}
                  onChange={e => setFiltroMes(e.target.value)}
                />
              </div>
              {movimentacoesFiltradas.length === 0 ? (
                <p className="text-muted-foreground">Não houve movimentação neste mês.</p>
              ) : (
                diasOrdenados.map(dia => (
                  <div key={dia} className="mb-6">
                    <h3 className="font-semibold mb-2">{dia}</h3>
                    <div className="space-y-2">
                      {agrupadasPorDia[dia].map(mov => (
                        <Card key={mov.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                mov.tipo === 'adicionar' ? 'bg-green-500' : 
                                mov.tipo === 'retirar-saldo' ? 'bg-red-500' :
                                mov.tipo === 'economias' ? 'bg-purple-500' : 
                                mov.tipo === 'retirar-economias' ? 'bg-orange-500' :
                                mov.tipo === 'despesa' ? 'bg-red-500' :
                                mov.tipo === 'retirar-despesa' ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}></div>
                              <div>
                                <p className="font-medium">{mov.descricao}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(mov.data).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className={`font-bold ${
                              mov.tipo === 'adicionar' || mov.tipo === 'economias' || mov.tipo === 'despesa' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {mov.tipo === 'adicionar' || mov.tipo === 'economias' || mov.tipo === 'despesa' ? '+' : '-'} {formatarEuro(mov.valor)}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Integrações */}
          {currentPage === 'integracoes' && (
            <div className="mt-8 max-w-xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Integrações n8n</h2>
              <div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-4">
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Cole sua key do n8n aqui"
                  value={novaKey}
                  onChange={e => setNovaKey(e.target.value)}
                />
                <button
                  className="bg-primary text-white px-4 py-2 rounded font-semibold"
                  onClick={adicionarKeyN8n}
                  disabled={!novaKey}
                >
                  Adicionar Key
                </button>
              </div>
              <div className="space-y-2">
                {keysN8n.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma key cadastrada.</p>
                ) : (
                  keysN8n.map((key, idx) => (
                    <Card key={key + idx} className="p-4 flex items-center justify-between">
                      <span className="break-all text-xs md:text-sm">{key}</span>
                      <button
                        className="ml-4 px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white"
                        onClick={() => removerKeyN8n(key)}
                      >
                        Remover
                      </button>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;