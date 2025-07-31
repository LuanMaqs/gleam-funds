-- Criar tipos ENUM
CREATE TYPE public.transaction_type AS ENUM ('Receita', 'Despesa');
CREATE TYPE public.category_type AS ENUM ('Receita', 'Despesa');

-- Tabela de perfis dos usuários (complementa auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  data_de_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de contas
CREATE TABLE public.contas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  saldo_inicial NUMERIC DEFAULT 0,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo category_type NOT NULL,
  cor TEXT NOT NULL,
  icone TEXT,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de transações
CREATE TABLE public.transacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo transaction_type NOT NULL,
  valor NUMERIC NOT NULL,
  data DATE NOT NULL,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
  conta_id UUID NOT NULL REFERENCES public.contas(id) ON DELETE RESTRICT,
  observacao TEXT,
  recorrente BOOLEAN DEFAULT FALSE,
  frequencia TEXT,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de metas financeiras
CREATE TABLE public.metas_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_limite NUMERIC NOT NULL,
  mes_ano TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_financeiras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas RLS para contas
CREATE POLICY "Users can view their own accounts" 
ON public.contas FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own accounts" 
ON public.contas FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own accounts" 
ON public.contas FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own accounts" 
ON public.contas FOR DELETE 
USING (auth.uid() = usuario_id);

-- Políticas RLS para categorias
CREATE POLICY "Users can view their own categories" 
ON public.categorias FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own categories" 
ON public.categorias FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own categories" 
ON public.categorias FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own categories" 
ON public.categorias FOR DELETE 
USING (auth.uid() = usuario_id);

-- Políticas RLS para transações
CREATE POLICY "Users can view their own transactions" 
ON public.transacoes FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transacoes FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transacoes FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transacoes FOR DELETE 
USING (auth.uid() = usuario_id);

-- Políticas RLS para metas financeiras
CREATE POLICY "Users can view their own goals" 
ON public.metas_financeiras FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own goals" 
ON public.metas_financeiras FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own goals" 
ON public.metas_financeiras FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own goals" 
ON public.metas_financeiras FOR DELETE 
USING (auth.uid() = usuario_id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nome', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Índices para performance
CREATE INDEX idx_contas_usuario ON public.contas(usuario_id);
CREATE INDEX idx_categorias_usuario ON public.categorias(usuario_id);
CREATE INDEX idx_transacoes_usuario ON public.transacoes(usuario_id);
CREATE INDEX idx_transacoes_data ON public.transacoes(data);
CREATE INDEX idx_metas_usuario ON public.metas_financeiras(usuario_id);
CREATE INDEX idx_metas_mes_ano ON public.metas_financeiras(mes_ano);