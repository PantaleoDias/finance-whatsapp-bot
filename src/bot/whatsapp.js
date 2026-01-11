import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { interpretExpenseMessage } from '../services/ai.js';
import { addExpense, getCurrentMonthExpenses } from '../services/excel.js';
import { getTotalMonthExpenses, getExpensesByCategory } from '../services/analytics.js';
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

let client;
let targetGroupName;

// Função para carregar configurações
function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erro ao carregar configurações:', error);
    return null;
  }
}

// Inicializar bot do WhatsApp
export function initWhatsAppBot() {
  const config = loadConfig();
  targetGroupName = config?.profile?.whatsappGroupName || process.env.WHATSAPP_GROUP_NAME || 'Controle Financeiro';

  console.log('🤖 Iniciando bot do WhatsApp...');
  console.log(`📱 Grupo a monitorar: "${targetGroupName}"`);

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  // Gerar QR Code
  client.on('qr', (qr) => {
    console.log('\n📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:\n');
    qrcode.generate(qr, { small: true });
  });

  // Bot conectado
  client.on('ready', () => {
    console.log('✅ Bot do WhatsApp conectado e pronto!');
  });

  // Escutar mensagens
  client.on('message', async (message) => {
    try {
      // Obter chat
      const chat = await message.getChat();

      // Verificar se é o grupo correto
      if (!chat.isGroup || !chat.name.includes(targetGroupName)) {
        return;
      }

      const messageBody = message.body.trim();

      // Comandos especiais
      if (messageBody.startsWith('/')) {
        await handleCommand(message, messageBody);
        return;
      }

      // Tentar interpretar como gasto
      await handleExpenseMessage(message, messageBody);

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  });

  // Inicializar
  client.initialize();

  return client;
}

// Processar mensagem de gasto
async function handleExpenseMessage(message, messageBody) {
  try {
    // Interpretar mensagem
    const expense = await interpretExpenseMessage(messageBody);

    if (!expense) {
      // Não foi possível interpretar (ignorar silenciosamente)
      return;
    }

    // Adicionar ao Excel
    const result = addExpense({
      value: expense.value,
      category: expense.category,
      description: expense.description,
      date: new Date().toISOString().split('T')[0],
      method: 'WhatsApp'
    });

    if (result.success) {
      // Enviar confirmação
      const confirmMessage = `✅ *Gasto registrado!*\n\n` +
        `💰 Valor: R$ ${expense.value.toFixed(2)}\n` +
        `📁 Categoria: ${expense.category}\n` +
        `📝 Descrição: ${expense.description}`;

      await message.reply(confirmMessage);
      console.log('✅ Gasto registrado:', expense);
    } else {
      await message.reply('❌ Erro ao registrar gasto. Tente novamente.');
    }

  } catch (error) {
    console.error('❌ Erro ao processar gasto:', error);
    await message.reply('❌ Erro ao processar mensagem.');
  }
}

// Processar comandos
async function handleCommand(message, command) {
  try {
    const lowerCommand = command.toLowerCase();

    // Comando: /saldo
    if (lowerCommand === '/saldo') {
      const total = getTotalMonthExpenses();
      const expenses = getCurrentMonthExpenses();

      const now = new Date();
      const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      const responseMessage = `📊 *Saldo de ${monthName}*\n\n` +
        `💰 Total gasto: R$ ${total.toFixed(2)}\n` +
        `📝 Número de gastos: ${expenses.length}\n` +
        `📅 Média diária: R$ ${(total / now.getDate()).toFixed(2)}`;

      await message.reply(responseMessage);
      return;
    }

    // Comando: /categorias
    if (lowerCommand === '/categorias') {
      const byCategory = getExpensesByCategory();

      let responseMessage = `📁 *Gastos por categoria*\n\n`;

      const sortedCategories = Object.entries(byCategory)
        .sort((a, b) => b[1].total - a[1].total);

      if (sortedCategories.length === 0) {
        responseMessage += 'Nenhum gasto registrado este mês.';
      } else {
        sortedCategories.forEach(([category, data]) => {
          responseMessage += `▪️ *${category}*: R$ ${data.total.toFixed(2)} (${data.count} gastos)\n`;
        });
      }

      await message.reply(responseMessage);
      return;
    }

    // Comando: /analise
    if (lowerCommand === '/analise' || lowerCommand === '/análise') {
      await message.reply('🤖 Gerando análise inteligente... aguarde um momento...');

      const analysis = await generateIntelligentAnalysis();

      if (analysis.success) {
        await message.reply(analysis.analysis);
      } else {
        await message.reply(`❌ ${analysis.message || 'Erro ao gerar análise.'}`);
      }
      return;
    }

    // Comando: /previsao
    if (lowerCommand === '/previsao' || lowerCommand === '/previsão') {
      await message.reply('🔮 Gerando previsão... aguarde um momento...');

      const forecast = await generateExpenseForecast();

      if (forecast.success) {
        await message.reply(forecast.forecast);
      } else {
        await message.reply(`❌ ${forecast.message || 'Erro ao gerar previsão.'}`);
      }
      return;
    }

    // Comando: /dicas
    if (lowerCommand === '/dicas') {
      await message.reply('💡 Gerando dicas personalizadas... aguarde um momento...');

      const tips = await generatePersonalizedTips();

      if (tips.success) {
        await message.reply(tips.tips);
      } else {
        await message.reply('❌ Erro ao gerar dicas.');
      }
      return;
    }

    // Comando: /relatorio
    if (lowerCommand === '/relatorio' || lowerCommand === '/relatório') {
      await message.reply('📊 Gerando relatório semanal...');

      const report = await generateWeeklyReport();

      if (report.success) {
        await message.reply(report.report);
      } else {
        await message.reply(`❌ ${report.message || 'Erro ao gerar relatório.'}`);
      }
      return;
    }

    // Comando: /alertas
    if (lowerCommand === '/alertas') {
      const alertsData = checkAlerts();

      if (!alertsData.hasAlerts) {
        await message.reply('✅ *Tudo certo!*\n\nNenhum alerta no momento. Continue assim! 🎉');
        return;
      }

      let alertMessage = `🔔 *Alertas Ativos (${alertsData.count})*\n\n`;

      alertsData.alerts.forEach((alert, index) => {
        alertMessage += `${index + 1}. ${alert.title}\n${alert.message}\n\n`;
      });

      await message.reply(alertMessage);
      return;
    }

    // Comando: /perguntar [pergunta]
    if (lowerCommand.startsWith('/perguntar ')) {
      const question = command.substring(11).trim();

      if (!question) {
        await message.reply('❓ Por favor, faça uma pergunta.\n\nExemplo: /perguntar quanto gastei com alimentação essa semana?');
        return;
      }

      await message.reply('🤔 Analisando sua pergunta...');

      const response = await answerFinancialQuestion(question);

      if (response.success) {
        await message.reply(response.answer);
      } else {
        await message.reply('❌ Não consegui responder sua pergunta. Tente reformular.');
      }
      return;
    }

    // Comando: /ajuda
    if (lowerCommand === '/ajuda' || lowerCommand === '/help') {
      const helpMessage = `🤖 *Comandos disponíveis*\n\n` +
        `📝 *Registrar gastos:*\n` +
        `▪️ "gastei 50 no almoço"\n` +
        `▪️ "200 reais mercado"\n` +
        `▪️ "uber 25"\n\n` +
        `💬 *Comandos básicos:*\n` +
        `▪️ /saldo - Total gasto no mês\n` +
        `▪️ /categorias - Gastos por categoria\n` +
        `▪️ /alertas - Verificar alertas\n\n` +
        `🤖 *Comandos inteligentes (IA):*\n` +
        `▪️ /analise - Análise completa com IA\n` +
        `▪️ /previsao - Previsão para fim do mês\n` +
        `▪️ /dicas - Dicas personalizadas\n` +
        `▪️ /relatorio - Relatório semanal\n` +
        `▪️ /perguntar [pergunta] - Pergunte qualquer coisa\n\n` +
        `▪️ /ajuda - Mostra esta mensagem`;

      await message.reply(helpMessage);
      return;
    }

  } catch (error) {
    console.error('❌ Erro ao processar comando:', error);
    await message.reply('❌ Erro ao processar comando.');
  }
}

// Função para obter o cliente (útil para testes)
export function getClient() {
  return client;
}

// Função para desconectar (útil para encerramento limpo)
export async function disconnectBot() {
  if (client) {
    await client.destroy();
    console.log('🔌 Bot do WhatsApp desconectado');
  }
}
