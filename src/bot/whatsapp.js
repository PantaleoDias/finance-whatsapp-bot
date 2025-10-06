import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { interpretExpenseMessage } from '../services/ai.js';
import { addExpense, getCurrentMonthExpenses } from '../services/excel.js';
import { getTotalMonthExpenses, getExpensesByCategory } from '../services/analytics.js';
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

    // Comando: /ajuda
    if (lowerCommand === '/ajuda' || lowerCommand === '/help') {
      const helpMessage = `🤖 *Comandos disponíveis*\n\n` +
        `📝 Para registrar gastos, envie mensagens como:\n` +
        `▪️ "gastei 50 no almoço"\n` +
        `▪️ "200 reais mercado"\n` +
        `▪️ "uber 25"\n\n` +
        `💬 *Comandos especiais:*\n` +
        `▪️ /saldo - Mostra total gasto no mês\n` +
        `▪️ /categorias - Lista gastos por categoria\n` +
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
