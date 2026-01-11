import express from 'express';
import {
  getAllExpenses,
  getCurrentMonthExpenses,
  getExpensesByCategory as getExpensesByCat
} from '../services/excel.js';
import { getDashboardData } from '../services/analytics.js';
import {
  generateIntelligentAnalysis,
  answerFinancialQuestion,
  generateExpenseForecast,
  generatePersonalizedTips,
  generateWeeklyReport,
  checkAlerts
} from '../services/ai-advanced.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '../../data/config.json');

const router = express.Router();

// GET /api/expenses - retorna todos os gastos
router.get('/expenses', (req, res) => {
  try {
    const expenses = getAllExpenses();
    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/expenses/month - gastos do mês atual
router.get('/expenses/month', (req, res) => {
  try {
    const expenses = getCurrentMonthExpenses();
    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/expenses/category/:categoria - gastos por categoria
router.get('/expenses/category/:categoria', (req, res) => {
  try {
    const { categoria } = req.params;
    const expenses = getExpensesByCat(categoria);
    res.json({
      success: true,
      category: categoria,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/analytics - estatísticas e insights
router.get('/analytics', (req, res) => {
  try {
    const data = getDashboardData();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/config - configurações de metas e perfil
router.get('/config', (req, res) => {
  try {
    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/config - atualiza metas e perfil
router.post('/config', (req, res) => {
  try {
    const newConfig = req.body;

    // Validar estrutura básica
    if (!newConfig.profile || !newConfig.categories || !newConfig.goals) {
      return res.status(400).json({
        success: false,
        error: 'Configuração inválida. Campos obrigatórios: profile, categories, goals'
      });
    }

    // Salvar configuração
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf8');

    res.json({
      success: true,
      message: 'Configuração atualizada com sucesso',
      data: newConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/health - endpoint de verificação de saúde
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ROTAS DE IA AVANÇADA
// ============================================

// GET /api/ai/analysis - análise inteligente completa
router.get('/ai/analysis', async (req, res) => {
  try {
    const analysis = await generateIntelligentAnalysis();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/ai/question - responder pergunta em linguagem natural
router.post('/ai/question', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Campo "question" é obrigatório e deve ser uma string'
      });
    }

    const response = await answerFinancialQuestion(question);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/ai/forecast - previsão de gastos
router.get('/ai/forecast', async (req, res) => {
  try {
    const forecast = await generateExpenseForecast();
    res.json(forecast);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/ai/tips - dicas personalizadas
router.get('/ai/tips', async (req, res) => {
  try {
    const tips = await generatePersonalizedTips();
    res.json(tips);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/ai/weekly-report - relatório semanal
router.get('/ai/weekly-report', async (req, res) => {
  try {
    const report = await generateWeeklyReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/alerts - verificar alertas ativos
router.get('/alerts', (req, res) => {
  try {
    const alerts = checkAlerts();
    res.json({
      success: true,
      ...alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
