import React, { createContext, useContext, useState, useCallback } from 'react';

export type Lang = 'en' | 'pt';

type Translations = typeof en;

const en = {
  nav: {
    home: 'Home',
    play: 'Play',
    leaderboard: 'Leaderboard',
    admin: 'Admin',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    pts: 'pts',
  },
  home: {
    tagline: 'Can you crack the vault?',
    subtitle: 'Test your wit across four levels of cryptographic riddles — from classic enigmas to steganography, Morse code, and PGP ciphers.',
    startPlaying: 'Start Playing',
    viewLeaderboard: 'View Leaderboard',
    loginToPlay: 'Login to Play',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    ultimate: 'Ultimate',
    easyDesc: 'Classic riddles and wordplay for sharp minds.',
    mediumDesc: 'Logic puzzles and lateral thinking challenges.',
    hardDesc: 'Morse code, ciphers, binary, and hex encoding.',
    ultimateDesc: 'Steganography, Vigenère chains, PGP armoring and beyond.',
    pts: 'pts each',
  },
  lobby: {
    title: 'Choose Your Challenge',
    subtitle: 'Select a difficulty level to begin your journey through the vault.',
    solved: 'Solved',
    locked: 'Locked',
    available: 'Available',
    selectLevel: 'Select a difficulty level above to see the riddles.',
    noRiddles: 'No riddles found for this difficulty.',
    attempts: 'attempts',
    solve: 'Solve',
    review: 'Review',
    points: 'pts',
  },
  riddle: {
    hint: 'Hint',
    showHint: 'Show Hint',
    hideHint: 'Hide Hint',
    submitAnswer: 'Submit Answer',
    yourAnswer: 'Your answer...',
    correct: 'Correct!',
    incorrect: 'Incorrect answer. Keep thinking...',
    alreadySolved: 'Already solved!',
    backToLobby: 'Back to Lobby',
    attempts: 'Attempts',
    points: 'pts',
    tooManyAttempts: 'Too many attempts. Please wait a minute before trying again.',
  },
  leaderboard: {
    title: 'Leaderboard',
    subtitle: 'The greatest minds in the vault.',
    rank: 'Rank',
    player: 'Player',
    points: 'Points',
    empty: 'No players yet. Be the first!',
  },
  login: {
    title: 'Access the Vault',
    username: 'Username',
    password: 'Password',
    submit: 'Login',
    noAccount: "Don't have an account?",
    register: 'Register here',
    error: 'Invalid credentials',
  },
  register: {
    title: 'Join the Vault',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    submit: 'Register',
    hasAccount: 'Already have an account?',
    login: 'Login here',
  },
  admin: {
    title: 'Admin Dashboard',
    stats: 'Stats',
    players: 'Players',
    riddles: 'Riddles',
    totalPlayers: 'Total Players',
    totalRiddles: 'Total Riddles',
    totalSolves: 'Total Solves',
    banUser: 'Ban',
    unbanUser: 'Unban',
    resetProgress: 'Reset Progress',
    editPoints: 'Edit Points',
    save: 'Save',
    cancel: 'Cancel',
    role: 'Role',
    makeAdmin: 'Make Admin',
    makePlayer: 'Make Player',
    answer: 'Answer',
    active: 'Active',
    inactive: 'Inactive',
  },
  difficulty: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    ultimate: 'Ultimate',
  },
};

const pt: Translations = {
  nav: {
    home: 'Início',
    play: 'Jogar',
    leaderboard: 'Classificação',
    admin: 'Admin',
    login: 'Entrar',
    register: 'Registar',
    logout: 'Sair',
    pts: 'pts',
  },
  home: {
    tagline: 'Consegues abrir o cofre?',
    subtitle: 'Testa o teu raciocínio em quatro níveis de enigmas criptográficos — desde charadas clássicas a esteganografia, código Morse e cifras PGP.',
    startPlaying: 'Começar a Jogar',
    viewLeaderboard: 'Ver Classificação',
    loginToPlay: 'Entrar para Jogar',
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    ultimate: 'Extremo',
    easyDesc: 'Charadas clássicas e jogos de palavras para mentes ágeis.',
    mediumDesc: 'Puzzles de lógica e desafios de pensamento lateral.',
    hardDesc: 'Código Morse, cifras, binário e codificação hexadecimal.',
    ultimateDesc: 'Esteganografia, cadeias Vigenère, armadura PGP e muito mais.',
    pts: 'pts cada',
  },
  lobby: {
    title: 'Escolhe o Teu Desafio',
    subtitle: 'Seleciona um nível de dificuldade para iniciar a tua jornada pelo cofre.',
    solved: 'Resolvido',
    locked: 'Bloqueado',
    available: 'Disponível',
    selectLevel: 'Seleciona um nível de dificuldade acima para ver os enigmas.',
    noRiddles: 'Nenhum enigma encontrado para esta dificuldade.',
    attempts: 'tentativas',
    solve: 'Resolver',
    review: 'Rever',
    points: 'pts',
  },
  riddle: {
    hint: 'Dica',
    showHint: 'Mostrar Dica',
    hideHint: 'Esconder Dica',
    submitAnswer: 'Submeter Resposta',
    yourAnswer: 'A tua resposta...',
    correct: 'Correto!',
    incorrect: 'Resposta incorreta. Continua a pensar...',
    alreadySolved: 'Já resolvido!',
    backToLobby: 'Voltar ao Lobby',
    attempts: 'Tentativas',
    points: 'pts',
    tooManyAttempts: 'Demasiadas tentativas. Aguarda um minuto antes de tentar novamente.',
  },
  leaderboard: {
    title: 'Classificação',
    subtitle: 'As maiores mentes do cofre.',
    rank: 'Posição',
    player: 'Jogador',
    points: 'Pontos',
    empty: 'Ainda não há jogadores. Sê o primeiro!',
  },
  login: {
    title: 'Aceder ao Cofre',
    username: 'Nome de utilizador',
    password: 'Palavra-passe',
    submit: 'Entrar',
    noAccount: 'Ainda não tens conta?',
    register: 'Registar aqui',
    error: 'Credenciais inválidas',
  },
  register: {
    title: 'Junta-te ao Cofre',
    username: 'Nome de utilizador',
    email: 'Email',
    password: 'Palavra-passe',
    submit: 'Registar',
    hasAccount: 'Já tens conta?',
    login: 'Entrar aqui',
  },
  admin: {
    title: 'Painel de Administração',
    stats: 'Estatísticas',
    players: 'Jogadores',
    riddles: 'Enigmas',
    totalPlayers: 'Total de Jogadores',
    totalRiddles: 'Total de Enigmas',
    totalSolves: 'Total de Resoluções',
    banUser: 'Banir',
    unbanUser: 'Desbanir',
    resetProgress: 'Resetar Progresso',
    editPoints: 'Editar Pontos',
    save: 'Guardar',
    cancel: 'Cancelar',
    role: 'Função',
    makeAdmin: 'Tornar Admin',
    makePlayer: 'Tornar Jogador',
    answer: 'Resposta',
    active: 'Ativo',
    inactive: 'Inativo',
  },
  difficulty: {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    ultimate: 'Extremo',
  },
};

const TRANSLATIONS: Record<Lang, Translations> = { en, pt };

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'en';
  });

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('lang', l);
    setLangState(l);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
