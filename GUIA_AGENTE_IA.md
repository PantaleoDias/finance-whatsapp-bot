# 🤖 Guia do Agente de IA Inteligente

Este documento detalha todas as funcionalidades do **Agente de IA** do Finance WhatsApp Bot.

---

## 🎯 Visão Geral

O Agente de IA é um assistente financeiro pessoal inteligente que:
- Analisa seus gastos automaticamente
- Envia alertas proativos sobre suas metas
- Gera previsões e relatórios
- Responde perguntas em linguagem natural
- Oferece dicas personalizadas

---

## 💬 Comandos Disponíveis

### 1. `/analise` - Análise Inteligente Completa

**O que faz:**
- Analisa todos os seus gastos do mês
- Identifica padrões de comportamento
- Compara com suas metas e renda
- Calcula projeções para fim do mês
- Oferece recomendações práticas

**Quando usar:**
- Quando quiser entender melhor seus gastos
- Para receber insights sobre seu comportamento financeiro
- Antes de tomar decisões financeiras importantes

**Exemplo de resposta:**
```
📊 Visão Geral
Você gastou R$ 2.450,00 até agora (82% da meta). Com base no seu
ritmo atual, deve terminar o mês em R$ 3.150,00, ultrapassando
sua meta em R$ 150,00.

🔍 Padrões Identificados
- Gastos com alimentação aumentaram 30% em relação ao mês passado
- Você gasta mais nos finais de semana (média 40% maior)
- Categoria "lazer" está 15% acima da meta

⚠️ Alertas
- Alimentação: R$ 920,00 (meta: R$ 800,00) - ULTRAPASSADO
- Projeção indica estouro de R$ 150,00 no total mensal

📈 Projeção
Com o ritmo atual, você deve gastar R$ 3.150,00 até o fim do mês.

💡 Recomendações
1. Reduza gastos com delivery (R$ 450 este mês)
2. Considere levar marmita 3x por semana (economia de ~R$ 180/mês)
3. Limite gastos com lazer a R$ 200 até o fim do mês
```

---

### 2. `/previsao` - Previsão de Gastos

**O que faz:**
- Calcula projeção de gastos para fim do mês
- Analisa tendências atuais
- Identifica categorias em risco
- Sugere ajustes para bater as metas

**Quando usar:**
- Para saber se vai conseguir bater suas metas
- Para planejar os gastos dos próximos dias
- Quando quiser ajustar comportamento antes do fim do mês

**Exemplo de resposta:**
```
📈 Projeção Total
Com base nos seus gastos dos últimos 15 dias, você deve
terminar o mês gastando aproximadamente R$ 3.150,00.

📊 Por Categoria
- Alimentação: ~R$ 1.040,00 (meta: R$ 800) ⚠️
- Transporte: ~R$ 420,00 (meta: R$ 400) ✅
- Lazer: ~R$ 350,00 (meta: R$ 300) ⚠️

⚠️ Alertas
2 categorias devem ultrapassar a meta:
- Alimentação: excesso estimado de R$ 240
- Lazer: excesso estimado de R$ 50

💡 Sugestões
Para bater sua meta de R$ 3.000:
- Reduza R$ 150 em alimentação nos próximos 15 dias
- Evite gastos desnecessários com lazer
```

---

### 3. `/dicas` - Dicas Personalizadas

**O que faz:**
- Analisa seu perfil e padrão de gastos
- Gera 5-7 dicas práticas e específicas
- Calcula impacto financeiro de cada dica
- Prioriza ações mais efetivas

**Quando usar:**
- Quando quiser ideias para economizar
- Para identificar desperdícios
- Quando precisar reduzir gastos rapidamente

**Exemplo de resposta:**
```
💡 Dicas Personalizadas para Você

1. 🍕 Reduza delivery
   Você gastou R$ 450 com delivery este mês. Cozinhar em casa
   3x por semana pode economizar ~R$ 180/mês.
   Impacto: R$ 180/mês

2. ☕ Café da manhã em casa
   Gastos com cafeteria: R$ 120/mês. Prepare café em casa.
   Impacto: R$ 90/mês

3. 🚗 Use transporte público
   60% dos seus gastos com transporte são Uber. Considere
   ônibus/metrô para trajetos habituais.
   Impacto: R$ 80/mês

4. 🎬 Netflix em vez de cinema
   4 idas ao cinema este mês (R$ 240). Streaming é mais econômico.
   Impacto: R$ 160/mês

5. 🛒 Planeje compras no mercado
   Compras frequentes aumentam gastos. Faça lista e vá 1x/semana.
   Impacto: R$ 100/mês
```

---

### 4. `/relatorio` - Relatório Semanal

**O que faz:**
- Analisa gastos dos últimos 7 dias
- Compara com semanas anteriores
- Destaca pontos positivos e negativos
- Dá uma recomendação para a próxima semana

**Quando usar:**
- Para revisar a semana que passou
- Aos finais de semana para planejamento
- Quando quiser acompanhar evolução semanal

**Exemplo de resposta:**
```
📊 Relatório Semanal

📈 Resumo
Nos últimos 7 dias você gastou R$ 580,00 em 23 transações.
Média diária: R$ 82,86

🏆 Destaques
✅ Gastos com transporte 30% menores que semana passada
✅ Apenas 1 delivery (ótimo progresso!)
✅ Manteve-se dentro do orçamento diário

⚠️ Atenção
⚠️ Gastos com lazer aumentaram 45% (R$ 180 esta semana)
⚠️ 3 gastos acima de R$ 50 (mais do que o habitual)

💡 Recomendação
Continue evitando delivery! Para a próxima semana, tente
limitar gastos com lazer a R$ 100 para equilibrar o orçamento.
```

---

### 5. `/perguntar [pergunta]` - Conversação Natural

**O que faz:**
- Responde qualquer pergunta sobre suas finanças
- Usa todos os seus dados para contexto
- Explica de forma clara e objetiva

**Quando usar:**
- Quando tiver dúvidas específicas
- Para consultas personalizadas
- Para análises sob demanda

**Exemplos de perguntas:**

```
/perguntar quanto gastei com alimentação essa semana?
```
*Resposta:* "Você gastou R$ 245,00 com alimentação nos últimos 7 dias,
distribuído em 12 transações. Isso representa 42% dos seus gastos
semanais. A maior parte foi com delivery (R$ 130)."

```
/perguntar vou conseguir bater minha meta esse mês?
```
*Resposta:* "Com o ritmo atual, provavelmente não. Você já gastou
82% da meta com apenas 50% do mês decorrido. Para bater a meta,
precisaria limitar os próximos 15 dias a R$ 550 (média de R$ 36/dia)."

```
/perguntar onde posso economizar mais?
```
*Resposta:* "Suas maiores oportunidades de economia são:
1. Delivery (R$ 450 este mês) - economize R$ 180 cozinhando
2. Uber (R$ 280) - use transporte público e economize R$ 100
3. Cafeteria (R$ 120) - café em casa economiza R$ 90"

```
/perguntar qual foi meu maior gasto esse mês?
```
*Resposta:* "Seu maior gasto foi R$ 350,00 com 'Compras online'
na categoria vestuário, registrado no dia 08/01."

---

### 6. `/alertas` - Verificar Alertas

**O que faz:**
- Lista todos os alertas ativos
- Prioriza por urgência (crítico, atenção, info)
- Mostra status de cada meta

**Quando usar:**
- Para verificar situação atual das metas
- Após receber notificação automática
- Para acompanhamento diário

**Exemplo de resposta:**
```
🔔 Alertas Ativos (3)

1. 🚨 alimentação: limite ultrapassado!
   Gastos em alimentação: R$ 920,00 (meta: R$ 800,00)

2. ⚠️ geral: próximo do limite
   Você já gastou 85,5% da sua meta mensal. Faltam apenas
   R$ 435,00 para o limite.

3. 📊 Projeção de estouro
   Com o ritmo atual, você deve gastar R$ 3.150,00 até o
   fim do mês, ultrapassando sua meta em R$ 150,00.
```

---

## 🔔 Notificações Automáticas

O agente envia mensagens automaticamente **sem você pedir**:

### 1. Alertas de Meta (a cada 6 horas)

**Quando acontece:**
- A cada 6 horas o sistema verifica suas metas
- Envia notificação apenas se houver alertas críticos

**Exemplo:**
```
🚨 ALERTA FINANCEIRO 🚨

Você tem 2 alerta(s) importante(s):

1. 🚨 Meta mensal ultrapassada!
   Você gastou R$ 3.100,00 de uma meta de R$ 3.000,00.
   Considere reduzir gastos não essenciais.

2. 🚨 alimentação: limite ultrapassado!
   Gastos em alimentação: R$ 920,00 (meta: R$ 800,00)

Use /alertas para ver todos os alertas.
Use /dicas para receber recomendações personalizadas.
```

---

### 2. Resumo Diário (20h)

**Quando acontece:**
- Todo dia às 20h
- Apenas se houver gastos no dia

**Exemplo:**
```
🌙 RESUMO DO DIA

💰 Total gasto hoje: R$ 125,00
📝 Número de gastos: 5
📁 Categoria principal: alimentação (R$ 75,00)

📊 No mês até agora:
💰 Total: R$ 2.450,00
📅 Média diária: R$ 81,67

Use /analise para ver análise detalhada.
```

---

### 3. Relatório Semanal (segunda-feira 9h)

**Quando acontece:**
- Toda segunda-feira às 9h da manhã
- Resumo da semana anterior

**Exemplo:**
```
📊 RELATÓRIO SEMANAL AUTOMÁTICO

📈 Resumo
Na última semana você gastou R$ 580,00 em 23 transações.
Média diária: R$ 82,86

🏆 Destaques
✅ Excelente controle com delivery
✅ Gastos com transporte 30% menores

⚠️ Atenção
⚠️ Lazer aumentou 45%

💡 Recomendação
Continue o bom trabalho com delivery! Para esta semana,
foque em reduzir gastos com lazer para R$ 100.

Use /analise para uma análise mais completa.
```

---

## 🎓 Melhores Práticas

### Para aproveitar ao máximo o agente de IA:

1. **Configure metas realistas**
   - Use o dashboard para definir metas alcançáveis
   - Revise mensalmente

2. **Registre gastos imediatamente**
   - Quanto mais rápido registrar, melhores as análises
   - Facilita não esquecer nenhum gasto

3. **Use comandos regularmente**
   - `/analise` uma vez por semana
   - `/previsao` no meio do mês
   - `/dicas` quando precisar economizar

4. **Preste atenção nas notificações**
   - Alertas automáticos são baseados em risco real
   - Resumos diários ajudam a manter consciência

5. **Faça perguntas específicas**
   - O `/perguntar` é muito poderoso
   - Quanto mais específica a pergunta, melhor a resposta

6. **Revise relatórios semanais**
   - Segunda-feira de manhã você recebe o relatório
   - Use para planejar a semana

---

## 🔧 Configurações Recomendadas

No arquivo `data/config.json`:

```json
{
  "profile": {
    "name": "Seu Nome",
    "monthlyIncome": 5000,          // Sua renda mensal
    "whatsappGroupName": "Finance Bot"
  },
  "goals": {
    "totalMonthly": 3000,           // Meta total do mês (60% da renda)
    "byCategory": {
      "alimentação": 800,           // ~27% do total
      "transporte": 400,            // ~13% do total
      "lazer": 300,                 // ~10% do total
      "saúde": 200,                 // ~7% do total
      "moradia": 1000,              // ~33% do total
      "educação": 200,              // ~7% do total
      "vestuário": 150,             // ~5% do total
      "outros": 150                 // ~5% do total
    }
  }
}
```

**Dicas de metas:**
- Total mensal: 50-70% da renda líquida
- Alimentação: 25-35% do orçamento
- Moradia: 30-35% do orçamento
- Transporte: 10-15% do orçamento
- Lazer: 5-10% do orçamento

---

## 💡 Casos de Uso Comuns

### Cenário 1: Está no meio do mês e quer saber se está no caminho certo
```
1. Use /saldo para ver total gasto
2. Use /previsao para ver projeção
3. Se necessário, use /dicas para ajustar
```

### Cenário 2: Quer economizar mas não sabe onde
```
1. Use /analise para entender padrões
2. Use /dicas para receber sugestões
3. Use /perguntar onde posso economizar mais?
```

### Cenário 3: Recebeu alerta que ultrapassou meta
```
1. Use /alertas para ver detalhes
2. Use /analise para entender o que aconteceu
3. Use /dicas para corrigir próximo mês
```

### Cenário 4: Planejando o próximo mês
```
1. Revise /relatorio da última semana
2. Use /analise para ver mês completo
3. Ajuste metas no dashboard se necessário
```

---

## ❓ Perguntas Frequentes

**P: O agente envia muitas mensagens?**
R: Não. Apenas 1-2 alertas por dia quando crítico, mais resumo diário e relatório semanal.

**P: Posso desabilitar notificações automáticas?**
R: Sim, você pode comentar a linha `initializeSchedulers()` no `src/server.js`.

**P: As análises são precisas?**
R: Sim, baseadas em Claude AI (Sonnet 3.5), um dos melhores modelos do mercado.

**P: Quanto custa usar a IA?**
R: Você precisa de uma API key da Anthropic. Custo estimado: $0.05-0.15/dia de uso normal.

**P: A IA aprende com meu comportamento?**
R: Sim, quanto mais dados você fornecer, mais precisas e personalizadas são as análises.

**P: Posso usar em grupo com outras pessoas?**
R: Tecnicamente sim, mas é recomendado uso pessoal para análises mais precisas.

---

## 🚀 Próximos Passos

Depois de usar o agente por alguns dias:

1. ✅ Configure suas metas baseando-se nos primeiros insights
2. ✅ Experimente todos os comandos para conhecer as funcionalidades
3. ✅ Preste atenção nos padrões que a IA identifica
4. ✅ Use as dicas para fazer ajustes reais no comportamento
5. ✅ Acompanhe se as previsões estão se confirmando

---

**Desenvolvido com ❤️ usando Claude AI**
