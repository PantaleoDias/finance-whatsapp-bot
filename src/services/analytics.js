import { getCurrentMonthExpenses, getAllExpenses } from './excel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '../../data/config.json');

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

// Calcular total gasto no mês atual
export function getTotalMonthExpenses() {
  const expenses = getCurrentMonthExpenses();
  return expenses.reduce((sum, expense) => sum + (expense.Valor || 0), 0);
}

// Calcular gastos por categoria
export function getExpensesByCategory() {
  const expenses = getCurrentMonthExpenses();
  const byCategory = {};

  expenses.forEach(expense => {
    const category = expense.Categoria || 'outros';
    if (!byCategory[category]) {
      byCategory[category] = {
        total: 0,
        count: 0,
        expenses: []
      };
    }

    byCategory[category].total += expense.Valor || 0;
    byCategory[category].count += 1;
    byCategory[category].expenses.push(expense);
  });

  return byCategory;
}

// Comparar com metas configuradas
export function compareWithGoals() {
  const config = loadConfig();
  if (!config) {
    return { error: 'Configuração não encontrada' };
  }

  const totalSpent = getTotalMonthExpenses();
  const byCategory = getExpensesByCategory();

  const totalGoal = config.goals.totalMonthly || 0;
  const totalStatus = {
    goal: totalGoal,
    spent: totalSpent,
    remaining: totalGoal - totalSpent,
    percentage: totalGoal > 0 ? (totalSpent / totalGoal) * 100 : 0,
    status: getStatus(totalSpent, totalGoal)
  };

  const categoryStatus = {};
  Object.keys(config.goals.byCategory || {}).forEach(category => {
    const goal = config.goals.byCategory[category];
    const spent = byCategory[category]?.total || 0;

    categoryStatus[category] = {
      goal,
      spent,
      remaining: goal - spent,
      percentage: goal > 0 ? (spent / goal) * 100 : 0,
      status: getStatus(spent, goal)
    };
  });

  return {
    total: totalStatus,
    byCategory: categoryStatus
  };
}

// Função auxiliar para determinar status (ok, warning, exceeded)
function getStatus(spent, goal) {
  if (goal === 0) return 'no-goal';

  const percentage = (spent / goal) * 100;

  if (percentage < 80) return 'ok';
  if (percentage < 100) return 'warning';
  return 'exceeded';
}

// Identificar categorias que ultrapassaram o limite
export function getCategoriesOverBudget() {
  const comparison = compareWithGoals();

  if (comparison.error) return [];

  return Object.entries(comparison.byCategory)
    .filter(([_, data]) => data.status === 'exceeded')
    .map(([category, data]) => ({
      category,
      ...data
    }));
}

// Gerar insights
export function generateInsights() {
  const expenses = getCurrentMonthExpenses();
  const byCategory = getExpensesByCategory();
  const comparison = compareWithGoals();

  if (expenses.length === 0) {
    return {
      message: 'Nenhum gasto registrado este mês.',
      insights: []
    };
  }

  const insights = [];

  // Total gasto
  const totalSpent = getTotalMonthExpenses();
  insights.push(`Total gasto no mês: R$ ${totalSpent.toFixed(2)}`);

  // Maior gasto
  const maxExpense = expenses.reduce((max, expense) =>
    (expense.Valor > max.Valor ? expense : max), expenses[0]
  );
  insights.push(`Maior gasto: R$ ${maxExpense.Valor.toFixed(2)} em ${maxExpense.Descrição}`);

  // Categoria com mais gastos
  const categoryWithMostExpenses = Object.entries(byCategory)
    .sort((a, b) => b[1].total - a[1].total)[0];

  if (categoryWithMostExpenses) {
    insights.push(`Categoria com mais gastos: ${categoryWithMostExpenses[0]} (R$ ${categoryWithMostExpenses[1].total.toFixed(2)})`);
  }

  // Média diária
  const now = new Date();
  const dayOfMonth = now.getDate();
  const dailyAverage = totalSpent / dayOfMonth;
  insights.push(`Média diária: R$ ${dailyAverage.toFixed(2)}`);

  // Status das metas
  if (!comparison.error) {
    const overBudget = getCategoriesOverBudget();

    if (overBudget.length > 0) {
      insights.push(`⚠️ ${overBudget.length} categoria(s) ultrapassaram o limite: ${overBudget.map(c => c.category).join(', ')}`);
    } else {
      insights.push('✅ Todas as categorias estão dentro do limite');
    }

    // Projeção do mês
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedTotal = (totalSpent / dayOfMonth) * daysInMonth;

    if (comparison.total.goal > 0) {
      if (projectedTotal > comparison.total.goal) {
        insights.push(`📊 Projeção para o mês: R$ ${projectedTotal.toFixed(2)} (acima da meta de R$ ${comparison.total.goal.toFixed(2)})`);
      } else {
        insights.push(`📊 Projeção para o mês: R$ ${projectedTotal.toFixed(2)} (dentro da meta)`);
      }
    }
  }

  return {
    totalSpent,
    expenseCount: expenses.length,
    dailyAverage,
    insights
  };
}

// Obter dados para o dashboard
export function getDashboardData() {
  const expenses = getCurrentMonthExpenses();
  const byCategory = getExpensesByCategory();
  const comparison = compareWithGoals();
  const insights = generateInsights();

  // Preparar dados para gráfico de pizza
  const categoryChartData = Object.entries(byCategory).map(([category, data]) => ({
    name: category,
    value: data.total,
    count: data.count
  }));

  // Preparar dados para gráfico de linha (evolução diária)
  const dailyExpenses = {};
  expenses.forEach(expense => {
    const date = expense.Data;
    if (!dailyExpenses[date]) {
      dailyExpenses[date] = 0;
    }
    dailyExpenses[date] += expense.Valor || 0;
  });

  const lineChartData = Object.entries(dailyExpenses)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, total]) => ({
      date,
      total
    }));

  // Últimos gastos
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.Data) - new Date(a.Data))
    .slice(0, 10);

  // Dias restantes do mês
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - now.getDate();

  return {
    summary: {
      totalSpent: insights.totalSpent || 0,
      expenseCount: insights.expenseCount || 0,
      dailyAverage: insights.dailyAverage || 0,
      daysRemaining,
      goalsStatus: comparison.error ? null : comparison.total.status
    },
    categoryChart: categoryChartData,
    lineChart: lineChartData,
    recentExpenses,
    insights: insights.insights || [],
    goals: comparison.error ? null : comparison
  };
}
