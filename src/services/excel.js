import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_PATH = path.join(__dirname, '../../data/financas.xlsx');
const BACKUP_PATH = path.join(__dirname, '../../data/financas.backup.xlsx');

// Função para criar o arquivo Excel inicial melhorado
function createExcelFile() {
  try {
    const workbook = xlsx.utils.book_new();

  // ===== ABA 1: GASTOS =====
  const gastosHeaders = [
    ['Data', 'Hora', 'Mês/Ano', 'Categoria', 'Subcategoria', 'Valor', 'Descrição', 'Forma Pagamento', 'Parcelado', 'Parcelas', 'Tags', 'Observações', 'Método Registro']
  ];

  const gastosSheet = xlsx.utils.aoa_to_sheet(gastosHeaders);

  // Definir largura das colunas
  gastosSheet['!cols'] = [
    { wch: 12 },  // Data
    { wch: 8 },   // Hora
    { wch: 10 },  // Mês/Ano
    { wch: 15 },  // Categoria
    { wch: 15 },  // Subcategoria
    { wch: 12 },  // Valor
    { wch: 30 },  // Descrição
    { wch: 15 },  // Forma Pagamento
    { wch: 10 },  // Parcelado
    { wch: 10 },  // Parcelas
    { wch: 20 },  // Tags
    { wch: 30 },  // Observações
    { wch: 15 }   // Método Registro
  ];

  xlsx.utils.book_append_sheet(workbook, gastosSheet, 'Gastos');

  // ===== ABA 2: RECEITAS =====
  const receitasHeaders = [
    ['Data', 'Mês/Ano', 'Fonte', 'Categoria', 'Valor', 'Descrição', 'Tipo', 'Observações']
  ];

  const receitasSheet = xlsx.utils.aoa_to_sheet(receitasHeaders);
  receitasSheet['!cols'] = [
    { wch: 12 },  // Data
    { wch: 10 },  // Mês/Ano
    { wch: 20 },  // Fonte
    { wch: 15 },  // Categoria
    { wch: 12 },  // Valor
    { wch: 30 },  // Descrição
    { wch: 15 },  // Tipo
    { wch: 30 }   // Observações
  ];

  xlsx.utils.book_append_sheet(workbook, receitasSheet, 'Receitas');

  // ===== ABA 3: RESUMO MENSAL =====
  const now = new Date();
  const mesAtual = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const resumoData = [
    ['📊 RESUMO FINANCEIRO - ' + mesAtual.toUpperCase()],
    [],
    ['GASTOS'],
    ['Total de Gastos:', 0],
    ['Número de Transações:', 0],
    ['Ticket Médio:', 0],
    ['Maior Gasto:', 0],
    ['Menor Gasto:', 0],
    [],
    ['GASTOS POR CATEGORIA'],
    ['Categoria', 'Total', 'Quantidade', '% do Total'],
    ['Alimentação', 0, 0, '0%'],
    ['Transporte', 0, 0, '0%'],
    ['Lazer', 0, 0, '0%'],
    ['Saúde', 0, 0, '0%'],
    ['Moradia', 0, 0, '0%'],
    ['Educação', 0, 0, '0%'],
    ['Vestuário', 0, 0, '0%'],
    ['Outros', 0, 0, '0%'],
    [],
    ['FORMA DE PAGAMENTO'],
    ['Método', 'Total', 'Quantidade'],
    ['Débito', 0, 0],
    ['Crédito', 0, 0],
    ['Dinheiro', 0, 0],
    ['PIX', 0, 0],
    [],
    ['RECEITAS'],
    ['Total de Receitas:', 0],
    ['Número de Receitas:', 0],
    [],
    ['BALANÇO'],
    ['Receitas - Gastos:', 0],
    ['Status:', 'A calcular']
  ];

  const resumoSheet = xlsx.utils.aoa_to_sheet(resumoData);
  resumoSheet['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 }
  ];

  xlsx.utils.book_append_sheet(workbook, resumoSheet, 'Resumo Mensal');

  // ===== ABA 4: METAS =====
  const metasData = [
    ['🎯 CONFIGURAÇÃO DE METAS'],
    [],
    ['METAS MENSAIS'],
    ['Categoria', 'Meta (R$)', 'Gasto Real', 'Diferença', 'Status'],
    ['TOTAL MENSAL', 3000, 0, 0, '⏳ Aguardando'],
    ['Alimentação', 800, 0, 0, '⏳ Aguardando'],
    ['Transporte', 400, 0, 0, '⏳ Aguardando'],
    ['Lazer', 300, 0, 0, '⏳ Aguardando'],
    ['Saúde', 200, 0, 0, '⏳ Aguardando'],
    ['Moradia', 1000, 0, 0, '⏳ Aguardando'],
    ['Educação', 200, 0, 0, '⏳ Aguardando'],
    ['Vestuário', 150, 0, 0, '⏳ Aguardando'],
    ['Outros', 150, 0, 0, '⏳ Aguardando'],
    [],
    ['LEGENDA'],
    ['✅ Dentro da meta', '(até 80% da meta)'],
    ['⚠️ Atenção', '(80% a 100% da meta)'],
    ['❌ Meta ultrapassada', '(acima de 100%)']
  ];

  const metasSheet = xlsx.utils.aoa_to_sheet(metasData);
  metasSheet['!cols'] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 }
  ];

  xlsx.utils.book_append_sheet(workbook, metasSheet, 'Metas');

    // Salvar arquivo
    xlsx.writeFile(workbook, EXCEL_PATH);
    console.log('Planilha Excel melhorada criada com sucesso!');
    console.log('Abas criadas: Gastos | Receitas | Resumo Mensal | Metas');
  } catch (error) {
    console.error('Erro ao criar arquivo Excel:', error);
    throw error;
  }
}

// Função para garantir que o arquivo existe
function ensureFileExists() {
  const dataDir = path.dirname(EXCEL_PATH);

  // Criar diretório data se não existir
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Criar arquivo se não existir
  if (!fs.existsSync(EXCEL_PATH)) {
    createExcelFile();
  }
}

// Função para fazer backup antes de escrever
function createBackup() {
  if (fs.existsSync(EXCEL_PATH)) {
    fs.copyFileSync(EXCEL_PATH, BACKUP_PATH);
  }
}

// Adicionar um gasto
export function addExpense(expense) {
  try {
    ensureFileExists();
    createBackup();

    // Ler arquivo existente
    const workbook = xlsx.readFile(EXCEL_PATH);
    const worksheet = workbook.Sheets['Gastos'];

    // Converter para JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Adicionar novo gasto com campos melhorados
    const now = new Date();
    const newExpense = {
      'Data': expense.date || now.toISOString().split('T')[0],
      'Hora': now.toTimeString().split(' ')[0],
      'Mês/Ano': now.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
      'Categoria': expense.category || 'outros',
      'Subcategoria': expense.subcategory || '',
      'Valor': expense.value,
      'Descrição': expense.description || '',
      'Forma Pagamento': expense.paymentMethod || 'Não especificado',
      'Parcelado': expense.installment ? 'Sim' : 'Não',
      'Parcelas': expense.installments || '',
      'Tags': expense.tags || '',
      'Observações': expense.notes || '',
      'Método Registro': expense.method || 'WhatsApp Bot'
    };

    data.push(newExpense);

    // Converter de volta para planilha
    const newWorksheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets['Gastos'] = newWorksheet;

    // Salvar
    xlsx.writeFile(workbook, EXCEL_PATH);

    return { success: true, expense: newExpense };
  } catch (error) {
    console.error('❌ Erro ao adicionar gasto:', error);

    // Restaurar backup em caso de erro
    if (fs.existsSync(BACKUP_PATH)) {
      fs.copyFileSync(BACKUP_PATH, EXCEL_PATH);
    }

    return { success: false, error: error.message };
  }
}

// Obter todos os gastos
export function getAllExpenses() {
  try {
    ensureFileExists();

    const workbook = xlsx.readFile(EXCEL_PATH);
    const worksheet = workbook.Sheets['Gastos'];
    const data = xlsx.utils.sheet_to_json(worksheet);

    return data;
  } catch (error) {
    console.error('❌ Erro ao ler gastos:', error);
    return [];
  }
}

// Obter gastos por período
export function getExpensesByPeriod(startDate, endDate) {
  try {
    const allExpenses = getAllExpenses();

    const start = new Date(startDate);
    const end = new Date(endDate);

    return allExpenses.filter(expense => {
      const expenseDate = new Date(expense.Data);
      return expenseDate >= start && expenseDate <= end;
    });
  } catch (error) {
    console.error('❌ Erro ao filtrar gastos por período:', error);
    return [];
  }
}

// Obter gastos por categoria
export function getExpensesByCategory(category) {
  try {
    const allExpenses = getAllExpenses();

    return allExpenses.filter(expense =>
      expense.Categoria.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    console.error('❌ Erro ao filtrar gastos por categoria:', error);
    return [];
  }
}

// Obter gastos do mês atual
export function getCurrentMonthExpenses() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return getExpensesByPeriod(
    startOfMonth.toISOString().split('T')[0],
    endOfMonth.toISOString().split('T')[0]
  );
}

// Obter estatísticas básicas
export function getBasicStats() {
  try {
    const monthExpenses = getCurrentMonthExpenses();

    const total = monthExpenses.reduce((sum, expense) => sum + (expense.Valor || 0), 0);
    const count = monthExpenses.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average };
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    return { total: 0, count: 0, average: 0 };
  }
}
