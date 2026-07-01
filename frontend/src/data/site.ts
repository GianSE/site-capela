/**
 * Informações institucionais da Capela.
 * Conteúdo que raramente muda — fica no código (não no admin).
 */

export const CAPELA = {
  nome: 'Capela Nossa Senhora de Fátima',
  nomeCurto: 'Capela N. S. de Fátima',
  paroquia: 'Paróquia Nossa Senhora Rainha dos Apóstolos',
  endereco: 'Av. Gralha Azul, 25 — Jardim Nova Esperança',
  cidade: 'Fazenda Rio Grande — PR',
  telefone: '(43) 3523-2816',
  telefoneLink: 'tel:+554335232816',
  // Atualize com o WhatsApp real da capela/secretaria, se houver:
  whatsapp: '',
  instagram: 'https://www.instagram.com/capela_nossa_senhorafatima/',
  instagramHandle: '@capela_nossa_senhorafatima',
  facebook: 'https://www.facebook.com/share/18RJAjnsbZ/',
  // Embed do Google Maps (endereço pesquisável)
  mapsQuery: 'Av. Gralha Azul, 25 - Jardim Nova Esperança',
} as const;

export const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Pastorais', to: '/pastorais' },
  { label: 'Eventos', to: '/eventos' },
  { label: 'Avisos', to: '/avisos' },
  { label: 'Galeria', to: '/galeria' },
  { label: 'Contato', to: '/contato' },
] as const;

/** Frase/versículo para o rodapé. */
export const VERSICULO =
  'Eis aqui a serva do Senhor; faça-se em mim segundo a tua palavra. (Lc 1,38)';
