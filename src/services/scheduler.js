import { checkAlerts, generateWeeklyReport } from './ai-advanced.js';
import { getClient } from '../bot/whatsapp.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, '../../data/config.json');

function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erro ao carregar configurações:', error);
    return null;
  }
}

// Função para enviar mensagem para o grupo
async function sendGroupMessage(message) {
  try {
    const client = getClient();
    if (!client) {
      console.log('⚠️ Cliente WhatsApp não está pronto');
      return false;
    }

    const config = loadConfig();
    const targetGroupName = config?.profile?.whatsappGroupName || 'Finance Bot';

    // Buscar todos os chats
    const chats = await client.getChats();

    // Encontrar o grupo correto
    const targetGroup = chats.find(chat =>
      chat.isGroup && chat.name.includes(targetGroupName)
    );

    if (!targetGroup) {
      console.log(`⚠️ Grupo "${targetGroupName}" não encontrado`);
      return false;
    }

    // Enviar mensagem
    await targetGroup.sendMessage(message);
    console.log('✅ Mensagem automática enviada para o grupo');
    return true;

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem automática:', error);
    return false;
  }
}

// Verificar alertas e enviar notificações (a cada 6 horas)
export function startAlertChecker() {
  // Verificar imediatamente na inicialização
  checkAndSendAlerts();

  // Depois verificar a cada 6 horas
  setInterval(checkAndSendAlerts, 6 * 60 * 60 * 1000);

  console.log('✅ Sistema de alertas automáticos iniciado (verifica a cada 6 horas)');
}

async function checkAndSendAlerts() {
  try {
    const alertsData = checkAlerts();

    if (!alertsData.hasAlerts) {
      console.log('✅ Nenhum alerta no momento');
      return;
    }

    // Filtrar apenas alertas de alta prioridade
    const highPriorityAlerts = alertsData.alerts.filter(a => a.priority === 'high');

    if (highPriorityAlerts.length === 0) {
      return;
    }

    let alertMessage = `🚨 *ALERTA FINANCEIRO* 🚨\n\n`;
    alertMessage += `Você tem ${highPriorityAlerts.length} alerta(s) importante(s):\n\n`;

    highPriorityAlerts.forEach((alert, index) => {
      alertMessage += `${index + 1}. ${alert.title}\n${alert.message}\n\n`;
    });

    alertMessage += `Use /alertas para ver todos os alertas.\nUse /dicas para receber recomendações personalizadas.`;

    await sendGroupMessage(alertMessage);

  } catch (error) {
    console.error('❌ Erro ao verificar e enviar alertas:', error);
  }
}

// Enviar relatório semanal (toda segunda-feira às 9h)
export function startWeeklyReportScheduler() {
  // Calcular quando será a próxima segunda-feira às 9h
  const now = new Date();
  const nextMonday = new Date(now);

  // Calcular dias até a próxima segunda-feira
  const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7;
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0);

  // Se já passou das 9h da segunda-feira, agendar para a próxima semana
  if (nextMonday < now) {
    nextMonday.setDate(nextMonday.getDate() + 7);
  }

  const msUntilNextMonday = nextMonday - now;

  // Agendar primeiro relatório
  setTimeout(() => {
    sendWeeklyReportToGroup();

    // Depois repetir a cada 7 dias
    setInterval(sendWeeklyReportToGroup, 7 * 24 * 60 * 60 * 1000);

  }, msUntilNextMonday);

  console.log(`✅ Relatório semanal agendado para ${nextMonday.toLocaleString('pt-BR')}`);
}

async function sendWeeklyReportToGroup() {
  try {
    console.log('📊 Gerando relatório semanal automático...');

    const report = await generateWeeklyReport();

    if (!report.success) {
      console.log('⚠️ Não foi possível gerar relatório semanal');
      return;
    }

    const message = `📊 *RELATÓRIO SEMANAL AUTOMÁTICO*\n\n${report.report}\n\n_Use /analise para uma análise mais completa._`;

    await sendGroupMessage(message);

  } catch (error) {
    console.error('❌ Erro ao enviar relatório semanal:', error);
  }
}

// Enviar resumo diário (todo dia às 20h)
export function startDailySummaryScheduler() {
  // Calcular horário para o próximo resumo (20h)
  const now = new Date();
  const nextSummary = new Date(now);
  nextSummary.setHours(20, 0, 0, 0);

  // Se já passou das 20h, agendar para amanhã
  if (nextSummary < now) {
    nextSummary.setDate(nextSummary.getDate() + 1);
  }

  const msUntilNextSummary = nextSummary - now;

  // Agendar primeiro resumo
  setTimeout(() => {
    sendDailySummaryToGroup();

    // Depois repetir a cada 24 horas
    setInterval(sendDailySummaryToGroup, 24 * 60 * 60 * 1000);

  }, msUntilNextSummary);

  console.log(`✅ Resumo diário agendado para ${nextSummary.toLocaleString('pt-BR')}`);
}

async function sendDailySummaryToGroup() {
  try {
    const { getTotalMonthExpenses, getExpensesByCategory } = await import('./analytics.js');
    const { getCurrentMonthExpenses } = await import('./excel.js');

    const expenses = getCurrentMonthExpenses();
    const today = new Date().toISOString().split('T')[0];

    // Filtrar gastos de hoje
    const todayExpenses = expenses.filter(e => e.Data === today);

    if (todayExpenses.length === 0) {
      console.log('✅ Nenhum gasto hoje, resumo não enviado');
      return;
    }

    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.Valor, 0);
    const monthTotal = getTotalMonthExpenses();
    const byCategory = getExpensesByCategory();

    // Categoria com mais gastos hoje
    const todayByCategory = {};
    todayExpenses.forEach(e => {
      const cat = e.Categoria || 'outros';
      if (!todayByCategory[cat]) todayByCategory[cat] = 0;
      todayByCategory[cat] += e.Valor;
    });

    const topCategory = Object.entries(todayByCategory)
      .sort((a, b) => b[1] - a[1])[0];

    let message = `🌙 *RESUMO DO DIA*\n\n`;
    message += `💰 Total gasto hoje: R$ ${todayTotal.toFixed(2)}\n`;
    message += `📝 Número de gastos: ${todayExpenses.length}\n`;

    if (topCategory) {
      message += `📁 Categoria principal: ${topCategory[0]} (R$ ${topCategory[1].toFixed(2)})\n`;
    }

    message += `\n📊 *No mês até agora:*\n`;
    message += `💰 Total: R$ ${monthTotal.toFixed(2)}\n`;

    const now = new Date();
    const dayOfMonth = now.getDate();
    const dailyAverage = monthTotal / dayOfMonth;
    message += `📅 Média diária: R$ ${dailyAverage.toFixed(2)}\n`;

    message += `\n_Use /analise para ver análise detalhada._`;

    await sendGroupMessage(message);

  } catch (error) {
    console.error('❌ Erro ao enviar resumo diário:', error);
  }
}

// Inicializar todos os schedulers
export function initializeSchedulers() {
  console.log('⏰ Inicializando agendamentos automáticos...');

  // Aguardar 10 segundos para garantir que o bot está conectado
  setTimeout(() => {
    startAlertChecker();
    startWeeklyReportScheduler();
    startDailySummaryScheduler();
    console.log('✅ Todos os agendamentos automáticos foram iniciados');
  }, 10000);
}
