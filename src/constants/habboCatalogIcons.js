// IDs dos ícones do catálogo oficial do Habbo
// URL: https://images.habbo.com/c_images/catalogue/icon_<id>.png

export const HABBO_ICON_BASE = "https://images.habbo.com/c_images/catalogue"

export function getCatalogIconUrl(iconId) {
  if (iconId == null) return null
  return `${HABBO_ICON_BASE}/icon_${iconId}.png`
}

// Ícones organizados por tema com nome amigável para o usuário
export const CATALOG_ICONS = [
  // Decoração & Ambientes
  { id: 17, label: "Banheiro" },
  { id: 43, label: "Cozinha" },
  { id: 269, label: "Hospital" },
  { id: 130, label: "Escola" },
  { id: 240, label: "Prisão" },
  { id: 27, label: "Jornalismo" },
  { id: 23, label: "Urbano" },
  { id: 161, label: "Moderno" },
  { id: 242, label: "Sotão" },
  { id: 49, label: "Relax" },
  { id: 211, label: "Spa" },
  { id: 57, label: "Piscina" },

  // Natureza & Animais
  { id: 22, label: "Animais" },
  { id: 132, label: "Cavalos" },
  { id: 118, label: "Patos" },
  { id: 205, label: "Cheeps" },
  { id: 220, label: "Plantas" },
  { id: 153, label: "Planta-Monstro" },
  { id: 109, label: "Dragão" },
  { id: 260, label: "Jurássico" },

  // Estações & Datas
  { id: 168, label: "Natal" },
  { id: 91, label: "Ano Novo" },
  { id: 181, label: "Páscoa" },
  { id: 34, label: "Halloween" },
  { id: 144, label: "Amor" },
  { id: 21, label: "Festa Junina" },
  { id: 57, label: "Verão" },
  { id: 86, label: "Gélido" },
  { id: 176, label: "Carnaval" },
  { id: 143, label: "Ano Novo Chinês" },

  // Países & Culturas
  { id: 36, label: "Japão" },
  { id: 15, label: "China" },
  { id: 261, label: "Paris" },
  { id: 273, label: "Santorini" },
  { id: 12, label: "Alhambra" },
  { id: 18, label: "Bensalem" },
  { id: 233, label: "África" },
  { id: 54, label: "Bollywood" },
  { id: 59, label: "Austrália" },
  { id: 321, label: "Egito" },
  { id: 38, label: "Tribo Perdida" },
  { id: 171, label: "Maia" },
  { id: 208, label: "Viking" },

  // Esportes & Atividades
  { id: 56, label: "Esportes" },
  { id: 16, label: "Fórmula 1" },
  { id: 78, label: "Battle Banzai" },
  { id: 154, label: "Wobble Squabble" },
  { id: 266, label: "Olímpiadas" },

  // Cultura & Mídia
  { id: 33, label: "Cinema" },
  { id: 4, label: "Musical" },
  { id: 221, label: "Games" },
  { id: 51, label: "Fantasia" },
  { id: 175, label: "Shakespeare" },
  { id: 219, label: "Museu" },

  // Moda & Estilo
  { id: 74, label: "Moda" },
  { id: 131, label: "Boutique" },
  { id: 30, label: "Gótico" },

  // Especiais & Raros
  { id: 64, label: "Star/Fama" },
  { id: 237, label: "Jet Set" },
  { id: 137, label: "VIP" },
  { id: 184, label: "Conquistas" },
  { id: 209, label: "Diamantes" },
  { id: 178, label: "Duckets" },
  { id: 6, label: "Moedas" },
  { id: 213, label: "Promoções" },
  { id: 28, label: "NFT Habbo" },
  { id: 5, label: "Pixels" },

  // Fantasia & Místico
  { id: 200, label: "Gnomos" },
  { id: 190, label: "Pirata" },
  { id: 122, label: "Heróis" },
  { id: 230, label: "Harry Potter" },
  { id: 239, label: "Mad Science" },
  { id: 185, label: "Cristais Místicos" },
  { id: 254, label: "Ciberpunk" },
  { id: 287, label: "Cidade do Amanhã" },
  { id: 53, label: "Espacial" },
  { id: 164, label: "Nuvens" },

  // Outros úteis
  { id: 80, label: "Wired" },
  { id: 136, label: "Segurança" },
  { id: 215, label: "Profissões" },
  { id: 259, label: "Militar" },
  { id: 229, label: "Faroeste" },
  { id: 263, label: "Letras" },
  { id: 65, label: "Bots" },
  { id: 142, label: "Internet" },
  { id: 7, label: "Ecotron" },
  { id: 188, label: "Eleições" },
  { id: 50, label: "Bubble Juice" },
  { id: 166, label: "Lost Monkey" },
  { id: 264, label: "Staff" },
  { id: 141, label: "Niko" },
  { id: 180, label: "Donnie/Steampunk" },
  { id: 225, label: "Arquiteto" },
  { id: 227, label: "Habbo Palooza" },
  { id: 258, label: "Habbo 15 anos" },
  { id: 210, label: "Habbo Stories" },
  { id: 127, label: "Toa Toa" },
]