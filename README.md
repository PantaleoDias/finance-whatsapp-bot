# 💰 Finance WhatsApp Bot

Sistema automatizado que conecta um bot de WhatsApp a uma planilha Excel local para registrar gastos pessoais via mensagens de texto, com dashboard web para visualizar gráficos e configurar metas.

## 📋 Funcionalidades

### Bot do WhatsApp
- ✅ Conecta ao WhatsApp via QR Code
- ✅ Monitora grupo específico para registrar gastos
- ✅ Interpreta mensagens em linguagem natural usando Claude AI
- ✅ Registra automaticamente gastos em planilha Excel
- ✅ Comandos: `/saldo`, `/categorias`, `/ajuda`

### Dashboard Web
- 📊 Visualização de gastos com gráficos interativos
- 🎯 Configuração de metas por categoria
- 👤 Gerenciamento de perfil e categorias personalizadas
- 📈 Insights e análises automáticas
- 🔄 Atualização automática a cada 30 segundos

### Recursos Técnicos
- 💾 Armazenamento local em Excel (.xlsx)
- 🤖 Processamento de linguagem natural com Claude AI
- 🔒 Backup automático antes de cada alteração
- 📱 Interface responsiva com Tailwind CSS

## 🚀 Instalação

### Pré-requisitos
- Node.js 16+ instalado
- Conta Anthropic com API Key
- WhatsApp instalado no celular

### Passo 1: Clonar/Navegar para o projeto

```bash
cd finance-whatsapp-bot
```

### Passo 2: Instalar dependências do backend

```bash
npm install
```

### Passo 3: Instalar dependências do dashboard

```bash
cd dashboard
npm install
cd ..
```

### Passo 4: Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da API Anthropic:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
PORT=3000
WHATSAPP_GROUP_NAME=Controle Financeiro
```

Para obter sua API Key:
1. Acesse: https://console.anthropic.com/
2. Crie uma conta ou faça login
3. Vá em "API Keys" e gere uma nova chave

### Passo 5: Configurar perfil inicial (opcional)

Edite o arquivo `data/config.json` para personalizar:
- Nome do usuário
- Renda mensal
- Nome do grupo do WhatsApp
- Categorias de gastos
- Metas de gasto

## 🎯 Como Usar

### 1. Iniciar o servidor backend (com bot do WhatsApp)

```bash
npm start
```

Ou em modo desenvolvimento (com auto-reload):

```bash
npm run dev
```

Você verá:
1. O servidor iniciando na porta 3000
2. Um QR Code no terminal
3. **Escaneie o QR Code com seu WhatsApp** (WhatsApp > Configurações > Aparelhos conectados > Conectar aparelho)
4. Aguarde a mensagem "✅ Bot do WhatsApp conectado e pronto!"

### 2. Iniciar o dashboard web

Em outro terminal:

```bash
npm run dashboard
```

O dashboard abrirá em: http://localhost:5173

### 3. Criar grupo no WhatsApp

1. Crie um grupo no WhatsApp
2. Nome o grupo com o nome configurado (padrão: "Controle Financeiro")
3. Adicione apenas você mesmo (ou pessoas que compartilham as finanças)

### 4. Registrar gastos

Envie mensagens no grupo do WhatsApp:

```
gastei 50 no almoço
200 reais mercado
uber 25
80 de academia
```

O bot automaticamente:
- Interpretará a mensagem
- Identificará valor, categoria e descrição
- Registrará na planilha Excel
- Enviará confirmação no grupo

### 5. Usar comandos

```
/saldo - Mostra total gasto no mês
/categorias - Lista gastos por categoria
/ajuda - Mostra comandos disponíveis
```

## 📊 Dashboard

Acesse http://localhost:5173 para visualizar:

### Página Dashboard
- **Cards de resumo**: Total gasto, número de gastos, média diária, dias restantes
- **Status das metas**: Indicador visual de progresso
- **Gráfico de pizza**: Distribuição de gastos por categoria
- **Gráfico de linha**: Evolução dos gastos ao longo do mês
- **Insights**: Análises automáticas dos seus gastos
- **Últimos gastos**: Tabela com os 10 gastos mais recentes

### Página Metas
- Configure limite de gasto total mensal
- Defina metas por categoria
- Indicadores visuais: ✅ ok, ⚠️ atenção, ❌ ultrapassou

### Página Perfil
- Configure nome e renda mensal
- Altere o nome do grupo monitorado
- Adicione/remova categorias personalizadas
- Informações sobre uso do bot

## 📁 Estrutura do Projeto

```
finance-whatsapp-bot/
├── data/
│   ├── financas.xlsx          # Planilha com gastos (gerada automaticamente)
│   └── config.json            # Configurações, metas e perfil
├── src/
│   ├── bot/
│   │   └── whatsapp.js        # Bot do WhatsApp
│   ├── services/
│   │   ├── excel.js           # Gerenciamento da planilha Excel
│   │   ├── ai.js              # Processamento com Claude AI
│   │   └── analytics.js       # Cálculos e estatísticas
│   ├── api/
│   │   └── routes.js          # Endpoints da API REST
│   └── server.js              # Servidor Express
├── dashboard/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx  # Página principal
│   │   │   ├── Charts.jsx     # Gráficos
│   │   │   ├── Goals.jsx      # Configuração de metas
│   │   │   └── Profile.jsx    # Perfil do usuário
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── package.json
├── .env                       # Variáveis de ambiente (criar a partir do .env.example)
└── README.md
```

## 🔧 API Endpoints

- `GET /api/health` - Verificação de saúde da API
- `GET /api/expenses` - Retorna todos os gastos
- `GET /api/expenses/month` - Gastos do mês atual
- `GET /api/expenses/category/:categoria` - Gastos por categoria
- `GET /api/analytics` - Estatísticas e insights completos
- `GET /api/config` - Configurações de metas e perfil
- `POST /api/config` - Atualiza metas e perfil

## 💡 Exemplos de Uso

### Mensagens aceitas pelo bot:

```
✅ gastei 50 no almoço
✅ 200 reais mercado
✅ uber 25
✅ paguei 80 na academia
✅ 150 de luz
✅ 45.50 pizza
✅ comprei roupa 120
```

### Categorias padrão:

- alimentação
- transporte
- lazer
- saúde
- moradia
- educação
- vestuário
- outros

## 🐛 Solução de Problemas

### Bot não conecta ao WhatsApp
- Verifique se escaneou o QR Code corretamente
- Tente deletar a pasta `.wwebjs_auth` e reconectar
- Certifique-se de ter uma conexão estável com a internet

### Bot não registra gastos
- Verifique se o nome do grupo está correto em `data/config.json`
- Certifique-se de que a API Key da Anthropic está configurada
- Veja os logs do servidor para identificar erros

### Dashboard não carrega dados
- Verifique se o servidor backend está rodando na porta 3000
- Abra http://localhost:3000/api/health para verificar se a API está funcionando
- Verifique o console do navegador para erros

### Erro ao salvar na planilha
- Verifique se a pasta `data/` existe
- Certifique-se de que não há outro programa abrindo o arquivo Excel
- Veja se há um arquivo `financas.backup.xlsx` para recuperação

## 📝 Notas Importantes

- O bot usa **armazenamento local** - todos os dados ficam no seu computador
- A planilha Excel é criada automaticamente na primeira execução
- **Backup automático**: antes de cada escrita, um backup é criado
- O bot usa **Claude AI** para interpretar mensagens, mas possui **fallback** com regex caso a API falhe
- O dashboard atualiza automaticamente a cada 30 segundos

## 🔐 Segurança

- Mantenha sua `ANTHROPIC_API_KEY` em segredo
- Não compartilhe o arquivo `.env`
- Os dados são armazenados apenas localmente
- Nenhuma informação é enviada para servidores externos (exceto a API da Anthropic para processamento de texto)

## 🛠️ Stack Técnica

**Backend:**
- Node.js + Express
- whatsapp-web.js
- xlsx (SheetJS)
- Anthropic Claude API

**Frontend:**
- React
- Vite
- Tailwind CSS
- Recharts
- Axios

## 📄 Licença

Este projeto é de uso pessoal e educacional.

## 🤝 Contribuições

Sinta-se à vontade para personalizar o código conforme suas necessidades!

---

**Desenvolvido com ❤️ para ajudar no controle financeiro pessoal**
