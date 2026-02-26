const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb, closeDb } = require('./db');
const { hashAnswer } = require('../utils/answerHash');
const { createStegoImage } = require('../utils/steganography');

const IMAGES_DIR = path.join(__dirname, '../../assets/images');

const RIDDLES = [
  // ─── EASY ────────────────────────────────────────────────────────────────────
  {
    title: 'The Voice of Wind', title_pt: 'A Voz do Vento',
    description: 'I speak without a mouth and hear without ears.\nI have no body, but I come alive with the wind.\nWhat am I?',
    description_pt: 'Falo sem boca e ouço sem orelhas.\nNão tenho corpo, mas ganho vida com o vento.\nO que sou eu?',
    difficulty: 'easy', answer: 'echo', answer_pt: 'eco',
    hint: 'You have heard me in mountains, canyons, and empty halls.',
    hint_pt: 'Já me ouviste em montanhas, cânions e corredores vazios.',
    points_reward: 10, order_index: 1,
  },
  {
    title: 'Trail of the Wanderer', title_pt: 'O Rasto do Caminhante',
    description: 'The more you take, the more you leave behind.\nWhat am I?',
    description_pt: 'Quanto mais dás, mais deixas para trás.\nO que sou eu?',
    difficulty: 'easy', answer: 'footsteps', answer_pt: 'passos',
    hint: 'Think about what you leave on the ground as you walk.',
    hint_pt: 'Pensa no que deixas no chão enquanto caminhas.',
    points_reward: 10, order_index: 2,
  },
  {
    title: 'A World Without Life', title_pt: 'Um Mundo Sem Vida',
    description: 'I have cities, but no houses live there.\nI have mountains, but no trees grow there.\nI have water, but no fish swim there.\nWhat am I?',
    description_pt: 'Tenho cidades, mas nenhuma casa vive lá.\nTenho montanhas, mas nenhuma árvore cresce lá.\nTenho água, mas nenhum peixe nada lá.\nO que sou eu?',
    difficulty: 'easy', answer: 'map', answer_pt: 'mapa',
    hint: 'Explorers use me to navigate the real world.',
    hint_pt: 'Os exploradores usam-me para navegar no mundo real.',
    points_reward: 10, order_index: 3,
  },
  {
    title: 'The Invisible Weight', title_pt: 'O Peso Invisível',
    description: 'I am lighter than a feather,\nyet the strongest man cannot hold me for five minutes.\nWhat am I?',
    description_pt: 'Sou mais leve do que uma pena,\nmas o homem mais forte não me consegue segurar por cinco minutos.\nO que sou eu?',
    difficulty: 'easy', answer: 'breath', answer_pt: 'respiração',
    hint: 'You do it thousands of times a day without thinking.',
    hint_pt: 'Fazes isso milhares de vezes por dia sem pensar.',
    points_reward: 10, order_index: 4,
  },
  {
    title: 'Hands Without Applause', title_pt: 'Mãos Sem Aplauso',
    description: 'I have hands, but I cannot clap.\nI have a face, but I cannot smile.\nI tell the truth, but I never speak.\nWhat am I?',
    description_pt: 'Tenho ponteiros, mas não posso aplaudir.\nTenho mostrador, mas não consigo sorrir.\nDigo a verdade, mas nunca falo.\nO que sou eu?',
    difficulty: 'easy', answer: 'clock', answer_pt: 'relógio',
    hint: 'Look at the wall and it will tell you the answer.',
    hint_pt: 'Olha para a parede e ela dir-te-á a resposta.',
    points_reward: 10, order_index: 5,
  },
  // ─── MEDIUM ──────────────────────────────────────────────────────────────────
  {
    title: 'The Captive Worker', title_pt: 'O Trabalhador Cativo',
    description: 'I am taken from a mine and shut in a wooden case,\nfrom which I am never released,\nand yet I am used by almost every person.\nWhat am I?',
    description_pt: 'Sou retirado de uma mina e fechado numa caixa de madeira,\nda qual nunca sou libertado,\ne no entanto sou usado por quase todas as pessoas.\nO que sou eu?',
    difficulty: 'medium', answer: 'pencil', answer_pt: 'lápis',
    hint: 'Writers, artists, and students rely on me. My core is not metal.',
    hint_pt: 'Escritores, artistas e estudantes dependem de mim. O meu núcleo não é metal.',
    points_reward: 25, order_index: 6,
  },
  {
    title: 'Head and Tail', title_pt: 'Cara ou Coroa',
    description: 'I have a head, and I have a tail,\nbut I have no body in between.\nKings and presidents carry my face.\nWhat am I?',
    description_pt: 'Tenho cara e tenho coroa,\nmas não tenho corpo entre elas.\nReis e presidentes levam a minha face.\nO que sou eu?',
    difficulty: 'medium', answer: 'coin', answer_pt: 'moeda',
    hint: 'You flip me to make decisions. I live in your pocket.',
    hint_pt: 'Lanças-me ao ar para tomar decisões. Vivo no teu bolso.',
    points_reward: 25, order_index: 7,
  },
  {
    title: 'The Unwanted Gift', title_pt: 'O Presente Indesejado',
    description: 'The man who makes it does not need it.\nThe man who buys it does not want it.\nThe man who uses it does not know it.\nWhat is it?',
    description_pt: 'O homem que o faz não precisa dele.\nO homem que o compra não o quer.\nO homem que o usa não o conhece.\nO que é?',
    difficulty: 'medium', answer: 'coffin', answer_pt: 'caixão',
    hint: 'This object marks the very end of a journey.',
    hint_pt: 'Este objeto marca o fim de uma jornada.',
    points_reward: 25, order_index: 8,
  },
  {
    title: 'The Eternal Promise', title_pt: 'A Promessa Eterna',
    description: 'I can be given, yet I am kept.\nI can be broken, yet I am never held.\nI cost nothing to make but mean everything to keep.\nWhat am I?',
    description_pt: 'Posso ser dado, mas também guardado.\nPosso ser quebrado, mas nunca segurado.\nNada custa a fazer, mas significa tudo manter.\nO que sou eu?',
    difficulty: 'medium', answer: 'word', answer_pt: 'palavra',
    hint: 'A promise, a vow, an oath — all synonyms for what I am.',
    hint_pt: 'Uma promessa, um voto, um juramento — todos sinónimos do que sou.',
    points_reward: 25, order_index: 9,
  },
  {
    title: 'The Faithful Servant', title_pt: 'O Servo Fiel',
    description: 'I shrink smaller every time you use me,\nyet I serve you most faithfully when I am almost gone.\nI bring light to darkness and warmth to cold.\nWhat am I?',
    description_pt: 'Encolho cada vez que me usas,\nmas sirvo-te mais fielmente quando quase desapareço.\nTrago luz às trevas e calor ao frio.\nO que sou eu?',
    difficulty: 'medium', answer: 'candle', answer_pt: 'vela',
    hint: 'A dinner table favourite. Made of wax. Burns from the top.',
    hint_pt: 'Um favorito das mesas de jantar. Feita de cera. Arde pelo topo.',
    points_reward: 25, order_index: 10,
  },
  // ─── HARD ─────────────────────────────────────────────────────────────────────
  {
    title: 'Intercepted Signal', title_pt: 'Sinal Interceptado',
    description: 'A distress call was intercepted from the deep ocean.\nThe transmission was corrupted — only dots and dashes survived.\nDecode the Morse code to find the hidden word:\n\n  -- -.-- ... - . .-. -.--\n\nWhat was the distress call?',
    description_pt: 'Um pedido de socorro foi interceptado do oceano profundo.\nA transmissão estava corrompida — apenas pontos e traços sobreviveram.\nDecifra o código Morse para encontrar a palavra escondida:\n\n  -- -.-- ... - . .-. -.--\n\nQual era o pedido de socorro?',
    difficulty: 'hard', answer: 'mystery', answer_pt: 'mistério',
    hint: 'Morse code: each letter is separated by a space. Use a Morse alphabet chart to decode letter by letter.',
    hint_pt: 'Código Morse: cada letra é separada por um espaço. Usa uma tabela Morse para decifrar letra a letra.',
    points_reward: 50, order_index: 11,
  },
  {
    title: 'The Roman Order', title_pt: 'A Ordem Romana',
    description: 'A Roman general encrypted his battle orders so the enemy could not read them.\nHis cipher: shift every letter 13 positions forward in the alphabet.\nThe encrypted order reads: FUNQBJ\n\nWhat was the original order?',
    description_pt: 'Um general romano encriptou as suas ordens de batalha.\nA sua cifra: avança cada letra 13 posições no alfabeto.\nA ordem encriptada é: FUNQBJ\n\nQual era a ordem original?',
    difficulty: 'hard', answer: 'shadow', answer_pt: 'sombra',
    hint: 'ROT-13 is its own inverse. Apply the same shift to decode. F→S, U→H, N→A...',
    hint_pt: 'ROT-13 é o seu próprio inverso. Aplica o mesmo deslocamento. F→S, U→H, N→A...',
    points_reward: 50, order_index: 12,
  },
  {
    title: 'The Vigenère Lock', title_pt: 'O Cadeado Vigenère',
    description: 'A message was locked using a Vigenère cipher.\nThe encryption key is: CIPHER\nThe encrypted text is: JMPYX\n\nDecrypt the message. What is hidden within?',
    description_pt: 'Uma mensagem foi bloqueada com uma cifra de Vigenère.\nA chave de encriptação é: CIPHER\nO texto encriptado é: JMPYX\n\nDecifra a mensagem. O que está escondido?',
    difficulty: 'hard', answer: 'heart', answer_pt: 'coração',
    hint: 'Vigenère decryption: J-C=H, M-I=E, P-P=A, Y-H=R, X-E=T',
    hint_pt: 'Decifração Vigenère: J-C=H, M-I=E, P-P=A, Y-H=R, X-E=T',
    points_reward: 50, order_index: 13,
  },
  {
    title: 'The Binary Whisper', title_pt: 'O Sussurro Binário',
    description: 'A machine speaks only in ones and zeros.\nListen carefully to what it says:\n\n  01000110  01001001  01010010  01000101\n\nEach group of 8 bits is one ASCII character.\nWhat word is the machine whispering?',
    description_pt: 'Uma máquina fala apenas em uns e zeros.\nOuve com atenção:\n\n  01000110  01001001  01010010  01000101\n\nCada grupo de 8 bits é um caractere ASCII.\nQue palavra está a máquina a sussurrar?',
    difficulty: 'hard', answer: 'fire', answer_pt: 'fogo',
    hint: 'Convert each 8-bit binary to decimal, then ASCII. 01000110 = 70 = F',
    hint_pt: 'Converte cada binário de 8 bits para decimal, depois ASCII. 01000110 = 70 = F',
    points_reward: 50, order_index: 14,
  },
  {
    title: 'Hexadecimal Scripture', title_pt: 'Escritura Hexadecimal',
    description: 'An ancient programmer carved this sequence into stone:\n\n  4C  49  47  48  54\n\nEach pair of hexadecimal digits represents one ASCII character.\nWhat word was carved?',
    description_pt: 'Um programador antigo gravou esta sequência em pedra:\n\n  4C  49  47  48  54\n\nCada par de dígitos hexadecimais representa um caractere ASCII.\nQue palavra foi gravada?',
    difficulty: 'hard', answer: 'light', answer_pt: 'luz',
    hint: 'Convert hex to decimal: 4C=76=L, 49=73=I, 47=71=G, 48=72=H, 54=84=T',
    hint_pt: 'Converte de hexadecimal: 4C=76=L, 49=73=I, 47=71=G, 48=72=H, 54=84=T',
    points_reward: 50, order_index: 15,
  },
  // ─── ULTIMATE ─────────────────────────────────────────────────────────────────
  {
    title: 'The Painted Secret', title_pt: 'O Segredo Pintado',
    description: 'This image appears to be nothing more than a serene digital landscape.\nBut hidden within its pixels lies a secret name.\n\nThe truth is concealed in the Least Significant Bit (LSB) of the red channel.\nThe first 8 pixels encode the message length (as a binary byte).\nEach subsequent pixel\'s red channel LSB holds one bit of the secret.\n\nDownload the image and extract the hidden word. What is it?',
    description_pt: 'Esta imagem parece ser apenas uma paisagem digital serena.\nMas escondido nos seus píxeis está um nome secreto.\n\nA verdade está oculta no Bit Menos Significativo (LSB) do canal vermelho.\nOs primeiros 8 píxeis codificam o comprimento da mensagem.\nO LSB do canal vermelho de cada píxel seguinte contém um bit do segredo.\n\nDescarrega a imagem e extrai a palavra escondida. Qual é?',
    difficulty: 'ultimate', answer: 'phoenix', answer_pt: 'fénix',
    hint: 'Python: from PIL import Image; img=Image.open("riddle_16.png"); px=list(img.getdata()); length=int("".join([str(p[0]&1) for p in px[:8]]),2); bits="".join([str(p[0]&1) for p in px[8:8+length*8]]); print("".join([chr(int(bits[i:i+8],2)) for i in range(0,len(bits),8)]))',
    hint_pt: 'Python: from PIL import Image; img=Image.open("riddle_16.png"); px=list(img.getdata()); length=int("".join([str(p[0]&1) for p in px[:8]]),2); bits="".join([str(p[0]&1) for p in px[8:8+length*8]]); print("".join([chr(int(bits[i:i+8],2)) for i in range(0,len(bits),8)]))',
    image_path: 'riddle_16.png', points_reward: 100, order_index: 16,
  },
  {
    title: 'The Ghost Chain', title_pt: 'A Cadeia Fantasma',
    description: 'Two ciphers. One answer.\n\nStep 1 — Decode this Morse code transmission:\n  --. .... --- ... -\nThe decoded word is your Vigenère key.\n\nStep 2 — Use that key to decrypt this Vigenère cipher:\n  GIMKL\n\nWhat is the final hidden word?',
    description_pt: 'Duas cifras. Uma resposta.\n\nPasso 1 — Decifra esta transmissão Morse:\n  --. .... --- ... -\nA palavra decifrada é a tua chave Vigenère.\n\nPasso 2 — Usa essa chave para decifrar: GIMKL\n\nQual é a palavra final escondida?',
    difficulty: 'ultimate', answer: 'abyss', answer_pt: 'abismo',
    hint: 'Step 1: --. =G, .... =H, --- =O, ... =S, - =T → key=GHOST\nStep 2: Vigenère decrypt GIMKL with GHOST → ABYSS',
    hint_pt: 'Passo 1: --. =G, .... =H, --- =O, ... =S, - =T → chave=GHOST\nPasso 2: Decifra GIMKL com GHOST → ABYSS',
    points_reward: 100, order_index: 17,
  },
  {
    title: 'The Armored Message', title_pt: 'A Mensagem Blindada',
    description: 'A message arrived in a format resembling PGP armoring:\n\n-----BEGIN ENCRYPTED MESSAGE-----\nRU5JR01B\n-----END ENCRYPTED MESSAGE-----\n\nThe "encryption" used here is the most fundamental encoding scheme in computing.\nWhat word is hidden in the armored payload?',
    description_pt: 'Uma mensagem chegou num formato semelhante a armadura PGP:\n\n-----BEGIN ENCRYPTED MESSAGE-----\nRU5JR01B\n-----END ENCRYPTED MESSAGE-----\n\nA "encriptação" usada aqui é o esquema de codificação mais fundamental da computação.\nQue palavra está escondida?',
    difficulty: 'ultimate', answer: 'enigma', answer_pt: 'enigma',
    hint: 'PGP uses Base64. Decode "RU5JR01B": Python: base64.b64decode("RU5JR01B") | Browser: atob("RU5JR01B")',
    hint_pt: 'PGP usa Base64. Descodifica "RU5JR01B": Python: base64.b64decode("RU5JR01B") | Browser: atob("RU5JR01B")',
    points_reward: 100, order_index: 18,
  },
  {
    title: 'The Hidden Verse', title_pt: 'O Verso Escondido',
    description: 'A poet hid a secret inside this verse.\nThe message does not lie in the meaning of the words — it hides in their structure.\n\n─────────────────────────────────────────\nCountless stars fill the night sky above,\nIn ancient codes and ciphers, wisdom lies,\nPiercing the veil of secrets, we seek truth,\nHidden in plain sight, the message calls,\nEach letter holds a key to unlock more,\nRevelations come to those who dare to look.\n─────────────────────────────────────────\n\nWhat is the hidden word?',
    description_pt: 'Um poeta escondeu um segredo neste verso.\nA mensagem não está no significado — está na estrutura.\n\n─────────────────────────────────────────\nCountless stars fill the night sky above,\nIn ancient codes and ciphers, wisdom lies,\nPiercing the veil of secrets, we seek truth,\nHidden in plain sight, the message calls,\nEach letter holds a key to unlock more,\nRevelations come to those who dare to look.\n─────────────────────────────────────────\n\nQual é a palavra escondida?',
    difficulty: 'ultimate', answer: 'cipher', answer_pt: 'cifra',
    hint: 'Look at the first letter of each line top to bottom. This is called an acrostic.',
    hint_pt: 'Olha para a primeira letra de cada linha, de cima para baixo. Chama-se acróstico.',
    points_reward: 100, order_index: 19,
  },
  {
    title: 'The Final Lock', title_pt: 'O Cadeado Final',
    description: 'You have reached the last cipher. Beyond this door lies true glory.\n\nA message was scrambled using a Rail Fence cipher with exactly 2 rails.\nDecrypt this to claim your prize:\n\n  LGNEED\n\nWhat is the word that guards the final door?',
    description_pt: 'Chegaste à última cifra. Para além desta porta encontra-se a verdadeira glória.\n\nUma mensagem foi misturada usando uma cifra Rail Fence com 2 trilhos.\nDecifra isto para reclamar o teu prémio:\n\n  LGNEED\n\nQual é a palavra que guarda a porta final?',
    difficulty: 'ultimate', answer: 'legend', answer_pt: 'lenda',
    hint: 'Rail Fence 2 rails: top pos 0,2,4=L,G,N / bottom pos 1,3,5=E,E,D → interleave → LEGEND',
    hint_pt: 'Rail Fence 2 trilhos: topo pos 0,2,4=L,G,N / fundo pos 1,3,5=E,E,D → intercala → LEGEND',
    points_reward: 100, order_index: 20,
  },
];

async function seed() {
  const pool = getDb();

  const adminPassword = bcrypt.hashSync('Admin@1234', 12);
  await pool.query(`
    INSERT INTO users (username, email, password_hash, role, points)
    VALUES ($1, $2, $3, 'admin', 0)
    ON CONFLICT (username) DO NOTHING
  `, ['admin', 'admin@riddlevault.com', adminPassword]);

  for (const r of RIDDLES) {
    await pool.query(`
      INSERT INTO riddles
        (title, title_pt, description, description_pt, difficulty,
         answer_hash, answer_plain, answer_hash_pt, answer_plain_pt,
         hint, hint_pt, image_path, points_reward, order_index, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,1)
      ON CONFLICT (order_index) DO UPDATE SET
        title_pt = EXCLUDED.title_pt,
        description_pt = EXCLUDED.description_pt,
        answer_hash_pt = EXCLUDED.answer_hash_pt,
        answer_plain_pt = EXCLUDED.answer_plain_pt,
        hint_pt = EXCLUDED.hint_pt
    `, [
      r.title, r.title_pt, r.description, r.description_pt, r.difficulty,
      hashAnswer(r.answer), r.answer,
      hashAnswer(r.answer_pt), r.answer_pt,
      r.hint, r.hint_pt,
      r.image_path || null, r.points_reward, r.order_index,
    ]);
  }

  const stegoRiddle = RIDDLES.find(r => r.image_path === 'riddle_16.png');
  if (stegoRiddle) {
    const imgPath = require('path').join(IMAGES_DIR, 'riddle_16.png');
    createStegoImage('PHOENIX', imgPath);
  }

  console.log('✔  Database seeded successfully.');
  console.log('   Admin credentials → username: admin  |  password: Admin@1234');
}

if (require.main === module) {
  seed().then(() => closeDb()).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { seed };
