/**
 * Pastorais da Capela — textos originais da comunidade (reaproveitados do site atual).
 * Conteúdo fixo no código; raramente muda. Fotos em /public/img/pastorais/<slug>/.
 */

export interface Pastoral {
  slug: string;
  nome: string;
  lema: string;
  descricao: string;
  icon: string; // chave do ícone (ver componente Icon)
  photos: string[]; // primeira = capa; demais aparecem na galeria da pastoral
  fit?: 'cover' | 'contain'; // 'contain' para logos/cartazes (não corta)
}

const base = (slug: string, n: number) => `/img/pastorais/${slug}/${n}.jpg`;

export const PASTORAIS: Pastoral[] = [
  {
    slug: 'catequese',
    nome: 'Catequese',
    lema: 'Semeando a Palavra nos corações.',
    descricao:
      'A Catequese acompanha crianças, jovens e adultos no caminho da iniciação à vida cristã, preparando-os para os sacramentos e para uma caminhada de fé ativa e consciente.',
    icon: 'book',
    photos: [base('catequese', 1), base('catequese', 2)],
  },
  {
    slug: 'coroinhas-cerimoniarios',
    nome: 'Coroinhas e Cerimoniários',
    lema: 'A beleza do serviço no altar.',
    descricao:
      'Com zelo, reverência e alegria, nossas crianças, jovens e adultos auxiliam o sacerdote e coordenam os ritos sagrados, garantindo que as nossas celebrações aconteçam com harmonia e profundo respeito à liturgia.',
    icon: 'candle',
    photos: [base('coroinhas-cerimoniarios', 1)],
  },
  {
    slug: 'dizimistas',
    nome: 'Dizimistas',
    lema: 'A gratidão que sustenta a nossa obra.',
    descricao:
      'A equipe do Dízimo conscientiza sobre a importância da partilha generosa, essencial para a manutenção do nosso templo e para o sustento das obras sociais e de evangelização da paróquia.',
    icon: 'hands',
    photos: [base('dizimistas', 1)],
    fit: 'contain',
  },
  {
    slug: 'legiao-de-maria',
    nome: 'Legião de Maria',
    lema: 'Sob o patrocínio de Nossa Senhora.',
    descricao:
      'O grupo Legião de Maria da nossa Capela é um grupo de oração e evangelização. Nossas reuniões semanais são dedicadas à oração do Terço e ao planejamento de visitas apostólicas às famílias e enfermos da nossa comunidade.',
    icon: 'rosary',
    photos: [base('legiao-de-maria', 1)],
  },
  {
    slug: 'liturgia',
    nome: 'Liturgia',
    lema: 'A beleza do nosso encontro com Cristo.',
    descricao:
      'A equipe de Liturgia prepara e anima as nossas santas missas e celebrações, garantindo que todos os ritos aconteçam com zelo, reverência e muita participação da assembleia.',
    icon: 'chalice',
    photos: [base('liturgia', 1)],
  },
  {
    slug: 'ministros',
    nome: 'Ministros',
    lema: 'Servidores do altar e da esperança.',
    descricao:
      'Os ministros auxiliam na distribuição da Eucaristia durante as missas e têm a missão especial de levar a comunhão e a Palavra de Deus aos enfermos e idosos em suas casas.',
    icon: 'cross',
    photos: [base('ministros', 1)],
  },
  {
    slug: 'musica',
    nome: 'Música',
    lema: 'Quem canta, reza duas vezes.',
    descricao:
      'Nossos músicos e corais dedicam seus dons para animar as celebrações, conduzindo a comunidade à oração por meio do louvor e da arte.',
    icon: 'music',
    photos: [base('musica', 1), base('musica', 2), base('musica', 3), base('musica', 4)],
  },
  {
    slug: 'pascom',
    nome: 'PASCOM',
    lema: 'Evangelizar além das paredes da igreja.',
    descricao:
      'A Pascom é responsável por conectar nossa paróquia através das redes sociais, do nosso site e dos avisos, levando a mensagem de Cristo a todos os lugares.',
    icon: 'broadcast',
    photos: [base('pascom', 1), base('pascom', 2)],
    fit: 'contain',
  },
  {
    slug: 'social',
    nome: 'Social',
    lema: 'A fé transformada em obras.',
    descricao:
      'Atuamos diretamente na caridade, oferecendo amparo espiritual e material (como a distribuição de alimentos) às famílias e pessoas em situação de vulnerabilidade na nossa comunidade.',
    icon: 'heart',
    photos: [base('social', 1)],
  },
];
