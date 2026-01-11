import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { getCurrentMonthExpenses, getAllExpenses } from './excel.js';
import { getExpensesByCategory, compareWithGoals } from './analytics.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, '../../data/config.json');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erro ao carregar configurações:', error);
    return null;
  }
}

// Função para gerar análise inteligente completa
export async function generateIntelligentAnalysis() {
  try {
    const config = loadConfig();
    const expenses = getCurrentMonthExpenses();
    const byCategory = getExpensesByCategory();
    const goals = compareWithGoals();

    if (expenses.length === 0) {
      return {
        success: false,
        message: 'Nenhum gasto registrado este mês para análise.'
      };
    }

    const totalSpent = expenses.reduce((sum, e) => sum + e.Valor, 0);
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Preparar contexto para a IA
    const context = {
      periodo: `${dayOfMonth} dias de ${daysInMonth} no mês`,
      totalGasto: totalSpent,
      rendaMensal: config?.profile?.monthlyIncome || 0,
      metaMensal: config?.goals?.totalMonthly || 0,
      gastosPorCategoria: Object.entries(byCategory).map(([cat, data]) => ({
        categoria: cat,
        total: data.total,
        quantidade: data.count,
        meta: config?.goals?.byCategory?.[cat] || 0
      })),
      statusMetas: goals.error ? null : {
        totalStatus: goals.total.status,
        categoriasExcedidas: Object.entries(goals.byCategory)
          .filter(([_, data]) => data.status === 'exceeded')
          .map(([cat]) => cat)
      }
    };

    const prompt = `Você é um assistente financeiro pessoal altamente inteligente. Analise os dados financeiros abaixo e forneça insights profundos, padrões identificados e recomendações práticas.

📊 **Dados Financeiros:**
${JSON.stringify(context, null, 2)}

🎯 **Sua tarefa:**
1. Identifique padrões de comportamento financeiro
2. Compare gastos com renda e metas
3. Destaque categorias problemáticas
4. Faça projeções realistas para fim do mês
5. Dê recomendações práticas e acionáveis

📝 **Formato da resposta:**
Responda em português brasileiro, de forma clara, objetiva e amigável. Use emojis para facilitar a leitura.

Estruture sua análise em:
- 📊 **Visão Geral**: Resumo da situação atual
- 🔍 **Padrões Identificados**: Comportamentos observados
- ⚠️ **Alertas**: Pontos de atenção urgentes
- 📈 **Projeção**: Previsão para fim do mês
- 💡 **Recomendações**: 3-5 ações práticas para melhorar

Seja direto e útil. O usuário confia em você para ajudá-lo a alcançar suas metas financeiras.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const analysis = response.content[0].text;

    return {
      success: true,
      analysis,
      context
    };

  } catch (error) {
    console.error('❌ Erro ao gerar análise inteligente:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para responder perguntas em linguagem natural
export async function answerFinancialQuestion(question) {
  try {
    const config = loadConfig();
    const expenses = getCurrentMonthExpenses();
    const allExpenses = getAllExpenses();
    const byCategory = getExpensesByCategory();
    const goals = compareWithGoals();

    // Preparar contexto completo
    const context = {
      gastosDoMes: expenses.length,
      totalGasto: expenses.reduce((sum, e) => sum + e.Valor, 0),
      categorias: Object.entries(byCategory).map(([cat, data]) => ({
        nome: cat,
        total: data.total,
        quantidade: data.count
      })),
      metas: config?.goals,
      rendaMensal: config?.profile?.monthlyIncome || 0,
      ultimosGastos: expenses.slice(-5).map(e => ({
        valor: e.Valor,
        categoria: e.Categoria,
        descricao: e.Descrição,
        data: e.Data
      }))
    };

    const prompt = `Você é um assistente financeiro pessoal. O usuário fez a seguinte pergunta sobre suas finanças:

❓ **Pergunta:** "${question}"

📊 **Dados disponíveis:**
${JSON.stringify(context, null, 2)}

Responda de forma clara, objetiva e útil. Use dados concretos para embasar sua resposta. Seja amigável e use emojis para facilitar a leitura.

Se a pergunta não puder ser respondida com os dados disponíveis, explique educadamente o que falta.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return {
      success: true,
      answer: response.content[0].text,
      question
    };

  } catch (error) {
    console.error('❌ Erro ao responder pergunta:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para gerar previsão de gastos
export async function generateExpenseForecast() {
  try {
    const config = loadConfig();
    const expenses = getCurrentMonthExpenses();
    const byCategory = getExpensesByCategory();

    if (expenses.length === 0) {
      return {
        success: false,
        message: 'Dados insuficientes para previsão.'
      };
    }

    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - dayOfMonth;

    const totalSpent = expenses.reduce((sum, e) => sum + e.Valor, 0);
    const dailyAverage = totalSpent / dayOfMonth;

    const context = {
      diasDecorridos: dayOfMonth,
      diasRestantes: daysRemaining,
      totalGasto: totalSpent,
      mediaDiaria: dailyAverage,
      metaMensal: config?.goals?.totalMonthly || 0,
      categorias: Object.entries(byCategory).map(([cat, data]) => ({
        categoria: cat,
        gastoAtual: data.total,
        meta: config?.goals?.byCategory?.[cat] || 0
      }))
    };

    const prompt = `Você é um analista financeiro especializado em previsões. Analise os dados abaixo e faça uma previsão realista para o fim do mês.

📊 **Dados:**
${JSON.stringify(context, null, 2)}

🎯 **Sua tarefa:**
1. Calcule a projeção de gasto total para o fim do mês
2. Faça projeções por categoria
3. Compare com as metas estabelecidas
4. Identifique riscos de estourar o orçamento
5. Sugira ajustes necessários

📝 **Formato da resposta:**
Seja claro e objetivo. Use:
- 📈 **Projeção Total**: Valor estimado para fim do mês
- 📊 **Por Categoria**: Projeções por categoria
- ⚠️ **Alertas**: Categorias em risco
- 💡 **Sugestões**: Como ajustar para bater as metas

Use emojis e seja prático.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return {
      success: true,
      forecast: response.content[0].text,
      simpleProjection: {
        total: dailyAverage * daysInMonth,
        daysRemaining,
        currentTotal: totalSpent
      }
    };

  } catch (error) {
    console.error('❌ Erro ao gerar previsão:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para gerar dicas personalizadas
export async function generatePersonalizedTips() {
  try {
    const config = loadConfig();
    const expenses = getCurrentMonthExpenses();
    const byCategory = getExpensesByCategory();
    const goals = compareWithGoals();

    const context = {
      perfil: {
        renda: config?.profile?.monthlyIncome || 0,
        metaMensal: config?.goals?.totalMonthly || 0
      },
      gastoAtual: expenses.reduce((sum, e) => sum + e.Valor, 0),
      categorias: Object.entries(byCategory).map(([cat, data]) => ({
        categoria: cat,
        total: data.total,
        meta: config?.goals?.byCategory?.[cat] || 0
      })),
      categoriasProblematicas: Object.entries(goals.byCategory || {})
        .filter(([_, data]) => data.status === 'exceeded')
        .map(([cat]) => cat)
    };

    const prompt = `Você é um coach financeiro pessoal. Com base nos dados abaixo, dê dicas práticas e personalizadas para ajudar o usuário a economizar e atingir suas metas.

📊 **Perfil Financeiro:**
${JSON.stringify(context, null, 2)}

🎯 **Sua tarefa:**
Forneça 5-7 dicas práticas, específicas e acionáveis. Cada dica deve:
- Ser fácil de implementar
- Estar relacionada aos dados reais do usuário
- Ter impacto concreto nas finanças

📝 **Formato:**
Liste as dicas numeradas, cada uma com:
- Um emoji relevante
- Um título curto
- Uma explicação breve (2-3 linhas)
- Impacto estimado quando possível

Seja motivador, realista e prático. Evite dicas genéricas.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return {
      success: true,
      tips: response.content[0].text
    };

  } catch (error) {
    console.error('❌ Erro ao gerar dicas:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para gerar relatório semanal
export async function generateWeeklyReport() {
  try {
    const expenses = getCurrentMonthExpenses();

    // Filtrar gastos da última semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.Data);
      return expenseDate >= oneWeekAgo;
    });

    if (weekExpenses.length === 0) {
      return {
        success: false,
        message: 'Nenhum gasto na última semana.'
      };
    }

    const totalWeek = weekExpenses.reduce((sum, e) => sum + e.Valor, 0);
    const byCategory = {};

    weekExpenses.forEach(e => {
      const cat = e.Categoria || 'outros';
      if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0 };
      byCategory[cat].total += e.Valor;
      byCategory[cat].count += 1;
    });

    const context = {
      periodo: 'últimos 7 dias',
      totalGasto: totalWeek,
      numeroGastos: weekExpenses.length,
      mediaDiaria: totalWeek / 7,
      categorias: Object.entries(byCategory).map(([cat, data]) => ({
        categoria: cat,
        total: data.total,
        quantidade: data.count
      }))
    };

    const prompt = `Você é um assistente financeiro. Gere um relatório semanal resumido e útil com base nos dados abaixo.

📊 **Dados da Semana:**
${JSON.stringify(context, null, 2)}

📝 **Formato do relatório:**
- 📈 **Resumo**: Visão geral da semana
- 🏆 **Destaques**: Pontos positivos
- ⚠️ **Atenção**: Pontos a melhorar
- 💡 **Recomendação**: Uma ação prática para a próxima semana

Seja breve, motivador e útil. Use emojis.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return {
      success: true,
      report: response.content[0].text,
      stats: context
    };

  } catch (error) {
    console.error('❌ Erro ao gerar relatório semanal:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para verificar alertas e gerar notificações
export function checkAlerts() {
  try {
    const config = loadConfig();
    const expenses = getCurrentMonthExpenses();
    const goals = compareWithGoals();
    const alerts = [];

    if (goals.error) {
      return { alerts: [], hasAlerts: false };
    }

    // Alerta: Meta total ultrapassada
    if (goals.total.status === 'exceeded') {
      alerts.push({
        type: 'danger',
        category: 'geral',
        title: '🚨 Meta mensal ultrapassada!',
        message: `Você gastou R$ ${goals.total.spent.toFixed(2)} de uma meta de R$ ${goals.total.goal.toFixed(2)}. Considere reduzir gastos não essenciais.`,
        priority: 'high'
      });
    }

    // Alerta: Próximo de ultrapassar meta total (80-100%)
    if (goals.total.status === 'warning') {
      alerts.push({
        type: 'warning',
        category: 'geral',
        title: '⚠️ Atenção: próximo do limite!',
        message: `Você já gastou ${goals.total.percentage.toFixed(1)}% da sua meta mensal. Faltam apenas R$ ${goals.total.remaining.toFixed(2)} para o limite.`,
        priority: 'medium'
      });
    }

    // Alertas por categoria
    Object.entries(goals.byCategory || {}).forEach(([category, data]) => {
      if (data.status === 'exceeded') {
        alerts.push({
          type: 'danger',
          category,
          title: `🚨 ${category}: limite ultrapassado!`,
          message: `Gastos em ${category}: R$ ${data.spent.toFixed(2)} (meta: R$ ${data.goal.toFixed(2)})`,
          priority: 'high'
        });
      } else if (data.status === 'warning') {
        alerts.push({
          type: 'warning',
          category,
          title: `⚠️ ${category}: próximo do limite`,
          message: `Você já gastou ${data.percentage.toFixed(1)}% da meta em ${category}. Restam R$ ${data.remaining.toFixed(2)}.`,
          priority: 'medium'
        });
      }
    });

    // Alerta: Projeção indica que vai ultrapassar
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const totalSpent = expenses.reduce((sum, e) => sum + e.Valor, 0);
    const projection = (totalSpent / dayOfMonth) * daysInMonth;

    if (projection > goals.total.goal && goals.total.status !== 'exceeded') {
      alerts.push({
        type: 'info',
        category: 'previsao',
        title: '📊 Projeção de estouro',
        message: `Com o ritmo atual, você deve gastar R$ ${projection.toFixed(2)} até o fim do mês, ultrapassando sua meta em R$ ${(projection - goals.total.goal).toFixed(2)}.`,
        priority: 'medium'
      });
    }

    return {
      alerts,
      hasAlerts: alerts.length > 0,
      count: alerts.length
    };

  } catch (error) {
    console.error('❌ Erro ao verificar alertas:', error);
    return { alerts: [], hasAlerts: false, error: error.message };
  }
}
