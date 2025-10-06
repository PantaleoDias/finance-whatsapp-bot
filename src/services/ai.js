import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Categorias padrão
const CATEGORIES = [
  'alimentação',
  'transporte',
  'lazer',
  'saúde',
  'moradia',
  'educação',
  'vestuário',
  'outros'
];

// Função para interpretar mensagem de gasto
export async function parseExpenseMessage(message) {
  try {
    const prompt = `Você é um assistente financeiro que interpreta mensagens sobre gastos em português brasileiro.

Sua tarefa é extrair as seguintes informações da mensagem do usuário:
1. **valor**: O valor em reais (apenas o número, sem R$ ou vírgulas)
2. **categoria**: Uma das categorias: ${CATEGORIES.join(', ')}
3. **descricao**: Uma descrição curta do gasto

Regras:
- Se a mensagem não contiver um valor numérico claro, retorne null
- Se não conseguir identificar a categoria, use "outros"
- A descrição deve ser curta e objetiva

Exemplos:
- "gastei 50 no almoço" → {"valor": 50, "categoria": "alimentação", "descricao": "almoço"}
- "200 reais mercado" → {"valor": 200, "categoria": "alimentação", "descricao": "mercado"}
- "uber 25" → {"valor": 25, "categoria": "transporte", "descricao": "uber"}
- "paguei 80 na academia" → {"valor": 80, "categoria": "saúde", "descricao": "academia"}
- "150 de luz" → {"valor": 150, "categoria": "moradia", "descricao": "luz"}

Mensagem do usuário: "${message}"

Retorne APENAS um JSON válido no formato: {"valor": number, "categoria": string, "descricao": string}
Se não conseguir interpretar, retorne: null`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text.trim();

    // Se a resposta for null
    if (content === 'null' || content === 'NULL') {
      return null;
    }

    // Tentar fazer parse do JSON
    const parsed = JSON.parse(content);

    // Validar resultado
    if (!parsed.valor || typeof parsed.valor !== 'number') {
      return null;
    }

    return {
      value: parsed.valor,
      category: parsed.categoria || 'outros',
      description: parsed.descricao || ''
    };

  } catch (error) {
    console.error('❌ Erro ao interpretar mensagem com IA:', error);
    return null;
  }
}

// Função de fallback sem IA (usando regex simples)
export function parseExpenseMessageFallback(message) {
  try {
    // Procurar por números no formato: 50, 50.00, 50,00
    const valueMatch = message.match(/(\d+)([.,](\d{2}))?/);

    if (!valueMatch) {
      return null;
    }

    // Extrair valor
    const value = parseFloat(valueMatch[0].replace(',', '.'));

    // Tentar identificar categoria por palavras-chave
    const lowerMessage = message.toLowerCase();
    let category = 'outros';

    if (lowerMessage.match(/almoço|jantar|comida|mercado|restaurante|lanche|café|pizza|hamburguer/)) {
      category = 'alimentação';
    } else if (lowerMessage.match(/uber|taxi|ônibus|metrô|gasolina|combustível|estacionamento/)) {
      category = 'transporte';
    } else if (lowerMessage.match(/cinema|show|festa|bar|jogo|streaming|netflix/)) {
      category = 'lazer';
    } else if (lowerMessage.match(/médico|remédio|farmácia|consulta|academia|dentista/)) {
      category = 'saúde';
    } else if (lowerMessage.match(/aluguel|luz|água|internet|condomínio|gás/)) {
      category = 'moradia';
    } else if (lowerMessage.match(/curso|livro|escola|faculdade|material/)) {
      category = 'educação';
    } else if (lowerMessage.match(/roupa|sapato|calça|camisa|vestido/)) {
      category = 'vestuário';
    }

    // Descrição: remover o valor e limpar
    let description = message.replace(valueMatch[0], '').trim();
    description = description.replace(/^(gastei|paguei|comprei|no|na|de|reais|r\$)/gi, '').trim();
    description = description || category;

    return {
      value,
      category,
      description
    };

  } catch (error) {
    console.error('❌ Erro no fallback de parsing:', error);
    return null;
  }
}

// Função principal que tenta IA primeiro e fallback depois
export async function interpretExpenseMessage(message) {
  // Tentar com IA
  const aiResult = await parseExpenseMessage(message);

  if (aiResult) {
    console.log('✅ Mensagem interpretada com IA:', aiResult);
    return aiResult;
  }

  // Fallback para regex simples
  console.log('⚠️ IA não conseguiu interpretar, usando fallback...');
  const fallbackResult = parseExpenseMessageFallback(message);

  if (fallbackResult) {
    console.log('✅ Mensagem interpretada com fallback:', fallbackResult);
    return fallbackResult;
  }

  console.log('❌ Não foi possível interpretar a mensagem');
  return null;
}
