import { Prayer, Psalm, GuidedAudio, Novena } from './types';

export const STATIC_PRAYERS: Prayer[] = [
  {
    id: 'protecao_arcanjo',
    title: 'Oração de Proteção de São Miguel Arcanjo',
    category: 'protecao',
    intro: 'Uma das mais poderosas orações de proteção contra as adversidades do dia a dia e investidas espirituais negativas.',
    text: [
      'São Miguel Arcanjo, defendei-nos no combate, sede o nosso refúgio contra as maldades e ciladas do demônio.',
      'Ordene-lhe Deus, instantemente o pedimos, e vós, príncipe da milícia celeste, pelo divino poder, precipitai no inferno a satanás e a todos os espíritos malignos, que andam pelo mundo para perder as almas.',
      'Que a vossa espada de luz corte toda amarra de ansiedade, todo laço invisível que tenta prender os meus passos, e que sob o vosso escudo eu encontre a santa e contínua proteção para mim e para toda a minha família. Amém.'
    ],
    source: 'Tradição Cristã'
  },
  {
    id: 'protecao_lar',
    title: 'Oração de Selamento e Bênção do Lar',
    category: 'protecao',
    intro: 'Para abençoar as portas, janelas, relacionamentos familiares e blindar a casa contra energias pesadas e discórdia.',
    text: [
      'Visita, Senhor, esta casa e afasta dela todas as ciladas do inimigo. Habitem nela os Teus santos anjos para nos guardar na paz, e a Tua santa bênção esteja sempre conosco.',
      'Sela com o Teu sangue redentor cada parede, cada porta de entrada e cada pessoa que aqui vive. Que não haja espaço para intrigas, desânimo ou perturbação noturna.',
      'Concede-nos um sono tranquilo e reparador, sabendo que as Tuas asas nos cobrem e a Tua providência vela pelo nosso amanhã. Amém.'
    ],
    source: 'Devocionário Cristão'
  },
  {
    id: 'prosperidade_providencia',
    title: 'Súplica à Divina Providência por Provisão e Paz',
    category: 'prosperidade',
    intro: 'Para momentos de escassez, preocupações financeiras e busca de novas portas profissionais.',
    text: [
      'Deus da vida e de toda providência, Tu que alimentas as aves do céu e vestes os lírios do campo com soberana beleza, olha para as minhas necessidades materiais e espirituais.',
      'Eu coloco em Tuas mãos os meus boletos, os meus compromissos, a minha busca por trabalho e abundância honesta. Abre portas onde o mundo diz que há apenas paredes.',
      'Que a minha mente se encha de ideias inspiradas, dedicação e coragem, e que o fantasma da escassez saia da minha mente. Confio que a Tua providência nunca falhará e que terei o pão de cada dia com dignidade. Amém.'
    ],
    source: 'Salmo de Provisão'
  },
  {
    id: 'cura_interior_angustia',
    title: 'Oração de Cura das Feridas da Alma e Angústia',
    category: 'cura_interior',
    intro: 'Para aliviar o cansaço do coração que carrega tudo sozinho, trazendo refrigério divino para traumas e ansiedade.',
    text: [
      'Senhor Jesus, Tu que disseste \"Vinde a mim todos vós que estais cansados e sobrecarregados, e eu vos aliviarei\", eu venho agora colocar-me sob o Teu olhar amoroso.',
      'Cura o meu coração das feridas do passado, das rejeições sofridas, das palavras duras que se fincaram em minha alma e do medo constante de falhar. Tira de mim esse peso que não me pertence.',
      'Derrama o bálsamo do Teu Espírito Santo sobre a minha mente, acalmando meus pensamentos acelerados. Que eu aprenda a repousar no Teu colo e a ser curado pelo Teu amor infinito. Amém.'
    ]
  },
  {
    id: 'restauracao_familiar',
    title: 'Oração de Restauração das Relações e Perdão',
    category: 'restauracao',
    intro: 'Para trazer restauração emocional e reatar laços quebrados na família ou laços românticos.',
    text: [
      'Pai Celestial, fonte de todo amor e reconciliação, coloco diante de Ti as feridas dos meus relacionamentos. Cura as marcas deixadas pela incompreensão, pela raiva e pelo orgulho.',
      'Dá-me a graça da humildade para pedir perdão e a generosidade de perdoar de coração, libertando-me do veneno do ressentimento.',
      'Restabelece o diálogo onde há silêncio penoso, reconstrói a confiança onde houve quebra, e faz com que a paciência mútua reine em nossas vidas sob a luz do Teu amor. Amém.'
    ]
  },
  {
    id: 'fortalecimento_fe',
    title: 'Oração para Renovação do Vigor Espiritual e Força',
    category: 'fortalecimento',
    intro: 'Ideal para quando nos sentimos espiritualmente fracos, cansados ou com a chama da fé enfraquecida.',
    text: [
      'Senhor, há dias em que as minhas forças parecem esgotadas e a dúvida sussurra ao meu ouvido que nada vai mudar. Renova a minha fé neste momento de oração.',
      'Sê a minha rocha inabalável. Lembra-me de que as Tuas promessas são reais e eternas. Mesmo quando não vejo o Teu agir físico, sei que Tu trabalhas em silêncio por mim.',
      'Concede-me a armadura da perseverança, levanta a minha cabeça e faz-me caminhar com a certeza de que a vitória já está reservada para os que esperam em Ti. Amém.'
    ],
    source: 'Profeta Isaías'
  }
];

export const STATIC_PSALMS: Psalm[] = [
  {
    id: 'psalm_91',
    number: 91,
    title: 'A Promessa Invisível do Altíssimo (O Escudo da Fé)',
    theme: 'Proteção Absoluta contra Perigos e Ansiedades',
    verses: [
      { number: 1, text: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.' },
      { number: 2, text: 'Direi do Senhor: Ele é o meu refúgio e a minha fortaleza, o meu Deus, em quem confio.' },
      { number: 3, text: 'Porque ele te livrará do laço do passarinheiro, e da peste perniciosa.' },
      { number: 4, text: 'Ele te cobrirá com as suas penas, e debaixo das suas asas te confiarás; a sua verdade será o teu escudo e broquel.' },
      { number: 5, text: 'Não terás medo do terror de noite nem da seta que voa de dia,' },
      { number: 6, text: 'Nem da peste que anda na escuridão, nem da mortandade que assola ao meio-dia.' },
      { number: 7, text: 'Mil cairão ao teu lado, e dez mil à tua direita, mas não chegará a ti.' },
      { number: 11, text: 'Porque aos seus anjos dará ordem a teu respeito, para te guardarem em todos os teus caminhos.' }
    ],
    reflection: 'O Salmo 91 não é meramente um amuleto poético; é uma confissão profunda de abrigo voluntário. Habitar no esconderijo significa render a ansiedade do controle diário à soberania de Deus. Nos instantes de profundo silêncio da escuridão interior ou no tumulto diurno, o Criador garante comissionar mensageiros angélicos específicos para conduzir os seus pés.'
  },
  {
    id: 'psalm_23',
    number: 23,
    title: 'O Pastor do Refrigério (O Descanso da Alma Cansada)',
    theme: 'Provisão, Orientação e Cura do Cansaço Emocional',
    verses: [
      { number: 1, text: 'O Senhor é o meu pastor, nada me faltará.' },
      { number: 2, text: 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.' },
      { number: 3, text: 'Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.' },
      { number: 4, text: 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.' },
      { number: 5, text: 'Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.' },
      { number: 6, text: 'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias.' }
    ],
    reflection: 'O Pastor de nossas almas sabe exatamente quando o nosso coração cansa de carregar tudo sozinho. Note que Ele não apenas nos aconselha a descansar, mas nos \"faz deitar\" em verdes pastos e cura a nossa exaustão conduzindo-nos por margens sossegadas.'
  },
  {
    id: 'psalm_121',
    number: 121,
    title: 'O Guarda Que Não Adormece (A Socorro da Noite de Insônia)',
    theme: 'Socorro Presente e Renovação das Forças Contra o Medo',
    verses: [
      { number: 1, text: 'Elevo os meus olhos para os montes; de onde me virá o socorro?' },
      { number: 2, text: 'O meu socorro vem do Senhor, que fez os céus e a terra.' },
      { number: 3, text: 'Não deixará vacilar o teu pé; aquele que te guarda não tosquenejará.' },
      { number: 4, text: 'Eis que não tosquenejará nem dormirá o guarda de Israel.' },
      { number: 5, text: 'O Senhor é quem te guarda; o Senhor é a tua sombra à tua direita.' },
      { number: 6, text: 'O sol não te molestará de dia nem a lua de noite.' },
      { number: 7, text: 'O Senhor te guardará de todo o mal; guardará a tua alma.' },
      { number: 8, text: 'O Senhor guardará a tua entrada e a tua saída, desde agora e para sempre.' }
    ],
    reflection: 'Muitas vezes, nas noites sem dormir, olhamos para as nossas dificuldades imaginando que estamos abandonados ao acaso. O Salmo 121 nos traz a doce e reconfortante lembrança de que o Guarda da nossa vida é incansável e permanente.'
  }
];

export const GUIDED_AUDIOS: GuidedAudio[] = [
  {
    id: 'audio_1',
    title: 'Refrigério para a Ansiedade e Pensamentos Acelerados',
    duration: '8:00',
    description: 'Um momento de silêncio na alma. Acompanhe uma técnica de respiração sagrada com notas suaves de harpa cristã e piano orando pela paz na mente.',
    focus: 'Especialmente útil para reduzir o estresse, palpitações de ansiedade e fobias do amanhã.',
    audioMode: 'anxiety'
  },
  {
    id: 'audio_2',
    title: 'Indução ao Sono Reparador sob Proteção dos Anjos',
    duration: '12:00',
    description: 'Para noites de insônia crônica. Uma oração contínua de repouso embalada por sons sutis de chuva suave e ruído natural de vento leve, unindo passagens sagradas de sono.',
    focus: 'Ideal para vencer a mente inquieta no meio da noite e dormir profundamente sob repouso sagrado.',
    audioMode: 'sleep'
  },
  {
    id: 'audio_3',
    title: 'Fortalecimento de Fé e Cura de Feridas Interiores',
    duration: '10:00',
    description: 'Ideal para restaurar mágoas, angústias, sensação de abandono e restaurar o vigor de alma com fundo de cântico gregoriano clássico espiritual.',
    focus: 'Cura interior, desabafo emocional silencioso e reatar o elo com a esperança divina.',
    audioMode: 'inner_peace'
  }
];

export const STATIC_NOVENAS: Novena[] = [
  {
    id: 'novena_nossa_senhora',
    title: 'Novena de Nossa Senhora Desatadora dos Nós',
    description: 'Inspirada em desatar as amarras mais complicadas de nossa vida: finanças destruídas, portas misteriosamente fechadas, casamentos em ruínas ou ansiedade que cega.',
    target: 'Causas impossíveis, amarras emocionais e financeiras estruturais',
    days: [
      {
        dayNum: 1,
        title: 'Dia 1 — Conduzindo Meus Nós aos Pés de Maria',
        prayer: 'Querida Mãe, coloco em tuas mãos benignas as amarras de ansiedade e insegurança que têm travado a minha vida espiritual. Tu que desatas os nós de perplexidade, roga por mim.',
        contemplation: 'Contemple hoje o nó do MEDO DO FUTURO sendo desfeito pelas mãos amorosas que servem a Deus.'
      },
      {
        dayNum: 2,
        title: 'Dia 2 — O Nó da Ira e da Falta de Perdão',
        prayer: 'Mãe amável, ajuda-me a perdoar aqueles que me causaram feridas íntimas. Retira do meu peito o ressentimento, que é um nó pesado que drena a minha saúde e as portas da abundância.',
        contemplation: 'Reflita sobre alguém que você precisa libertar com o perdão generoso hoje.'
      },
      {
        dayNum: 3,
        title: 'Dia 3 — O Nó das Portas Financeiras Fechadas',
        prayer: 'Senhora do silêncio, intercede junto a Teu Filho Jesus para desatar esse nó da dívida, do orçamento escasso e das portas profissionais trancadas. Abastece meu lar com dignidade.',
        contemplation: 'Confie na Divina Providência que provê para o passarinho e providenciará para ti.'
      },
      {
        dayNum: 4,
        title: 'Dia 4 — O Nó das Doenças Físicas e Emocionais',
        prayer: 'Mãe Consoladora, afasta de mim as dores físicas e, principalmente, as dores da mente — depressão, pânico e noites sem dormir. Devolve o brilho aos meus olhos.',
        contemplation: 'Repouse sob o manto protetor sabendo que a saúde é um dom de Deus que se reergue.'
      },
      {
        dayNum: 5,
        title: 'Dia 5 — O Nó das Ruínas nos Relacionamentos',
        prayer: 'Desatadora dos Nós, desata as discussões desnecessárias no meu matrimônio e na minha família. Que os julgamentos frios deem lugar ao abraço e à união abençoada.',
        contemplation: 'Dê um passo de paz no seu lar hoje, respondendo com amor e mansidão.'
      },
      {
        dayNum: 6,
        title: 'Dia 6 — O Nó do Desânimo e da Falta de Fé',
        prayer: 'Estrela da manhã, desata o nó do cansaço espiritual, de achar que as orações não surtem efeito. Reacende em meu peito a chama viva do Espírito Santo.',
        contemplation: 'Escreva ou mentalize um milagre de restauração que você crê acontecer.'
      },
      {
        dayNum: 7,
        title: 'Dia 7 — O Nó das Vocações e Escolhas Erradas',
        prayer: 'Mãe compassiva, desata as dúvidas sobre qual rumo tomar. Ilumina a minha inteligência para que eu escolha sempre o caminho da verdade, da retidão e da paz profunda.',
        contemplation: 'Acalme a mente e peça um sinal de paz antes de tomar decisões drásticas hoje.'
      },
      {
        dayNum: 8,
        title: 'Dia 8 — O Nó Vícios e Amarras Ocultas',
        prayer: 'Que as amarras espirituais do inimigo, os vícios da carne ou da mente, e pensamentos intrusivos sejam totalmente pulverizados pela força protetora e santa do teu olhar maternal.',
        contemplation: 'Declare-se livre e vitorioso por Cristo sobre qualquer dependência emocional ou física.'
      },
      {
        dayNum: 9,
        title: 'Dia 9 — Celebração da Libertação e Acolhimento',
        prayer: 'Mãe amada, os nós foram levados! Agradeço por tua escuta fiel e me entrego plenamente para caminhar sob a luz e proteção de Jesus todos os dias da minha jornada.',
        contemplation: 'Agradeça do fundo do seu ser e celebre a paz reconstituída.'
      }
    ]
  }
];
