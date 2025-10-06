import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

console.log('🔍 Teste de Diagnóstico do Bot\n');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('📱 QR CODE:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('✅ Bot conectado!\n');

  // Listar todos os chats
  const chats = await client.getChats();

  console.log('📋 GRUPOS DISPONÍVEIS:\n');
  chats.forEach((chat, index) => {
    if (chat.isGroup) {
      console.log(`${index + 1}. "${chat.name}" (ID: ${chat.id._serialized})`);
    }
  });

  console.log('\n💡 Copie o nome EXATO do seu grupo e cole em data/config.json');
  console.log('\nPressione Ctrl+C para sair');
});

client.on('message', async (message) => {
  const chat = await message.getChat();
  console.log(`\n📩 Mensagem recebida:`);
  console.log(`   De: ${chat.name || 'Contato Individual'}`);
  console.log(`   Tipo: ${chat.isGroup ? 'GRUPO' : 'Individual'}`);
  console.log(`   Texto: ${message.body}`);
});

client.initialize();
