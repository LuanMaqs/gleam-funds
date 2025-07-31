# MyWallet - Controle Financeiro Pessoal

Um aplicativo moderno de controle financeiro pessoal construído com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

- **Autenticação**: Sistema de login e cadastro com Supabase
- **Dashboard**: Visão geral das finanças com cards informativos
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Tema Escuro/Claro**: Suporte a múltiplos temas
- **UI Moderna**: Componentes shadcn/ui com design elegante

## 🛠️ Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos
- **Supabase** - Backend como serviço
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado do servidor

## 📦 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd gleam-funds
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse o aplicativo**
   Abra [http://localhost:8080](http://localhost:8080) no seu navegador

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── ui/            # Componentes shadcn/ui
├── hooks/             # Hooks customizados
├── integrations/      # Integrações externas
│   └── supabase/     # Configuração do Supabase
├── pages/            # Páginas da aplicação
├── types/            # Definições de tipos TypeScript
└── lib/              # Utilitários e configurações
```

## 🎨 Design System

O projeto utiliza um sistema de design financeiro personalizado com:

- **Cores Primárias**: Verde financeiro (#22c55e)
- **Cores de Status**: 
  - Receitas: Verde (#16a34a)
  - Despesas: Vermelho (#dc2626)
  - Avisos: Amarelo (#ca8a04)
- **Gradientes**: Efeitos visuais elegantes
- **Sombras**: Sistema de elevação consistente

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Configure as variáveis de ambiente

## 📱 Responsividade

O aplicativo é totalmente responsivo e funciona em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🔐 Autenticação

O sistema de autenticação utiliza Supabase Auth com:
- Login com email/senha
- Cadastro de novos usuários
- Recuperação de senha
- Sessões persistentes

## 🎯 Próximas Funcionalidades

- [ ] Adicionar transações
- [ ] Categorização de despesas
- [ ] Relatórios e gráficos
- [ ] Metas financeiras
- [ ] Exportação de dados
- [ ] Notificações
- [ ] Backup automático

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para controle financeiro pessoal**
