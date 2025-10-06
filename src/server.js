import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './api/routes.js';
import { initWhatsAppBot } from './bot/whatsapp.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use('/api', apiRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Finance WhatsApp Bot API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      expenses: '/api/expenses',
      monthExpenses: '/api/expenses/month',
      categoryExpenses: '/api/expenses/category/:categoria',
      analytics: '/api/analytics',
      config: '/api/config'
    }
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Finance WhatsApp Bot - Servidor iniciado!');
  console.log('='.repeat(50));
  console.log(`📡 API rodando em: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:5173 (após iniciar o dashboard)`);
  console.log('='.repeat(50));

  // Inicializar bot do WhatsApp
  console.log('\n🤖 Iniciando bot do WhatsApp...\n');
  initWhatsAppBot();
});

// Tratamento de encerramento
process.on('SIGINT', () => {
  console.log('\n\n👋 Encerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Encerrando servidor...');
  process.exit(0);
});
