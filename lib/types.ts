export const CONDITIONS = {
  M: "Mint (M)",
  NM: "Quase Nova (NM)",
  SP: "Levemente Jogada (SP)",
  MP: "Moderadamente Jogada (MP)",
  HP: "Muito Jogada (HP)",
  D: "Danificada (D)",
} as const;

export type Condition = keyof typeof CONDITIONS;
export type Status = "available" | "reserved" | "sold";

export const GAMES = { pokemon: "Pokémon", riftbound: "Riftbound" } as const;
export type Game = keyof typeof GAMES;
export const isGame = (s: string): s is Game => s in GAMES;

export const CATEGORIES = {
  single: "Carta avulsa",
  sealed: "Produto selado",
  accessory: "Acessório",
} as const;
export type Category = keyof typeof CATEGORIES;

export const LANGUAGES = ["Português", "Inglês", "Japonês", "Espanhol", "Outro"];

export interface Card {
  id: string;
  api_card_id: string | null;
  game: Game | null;
  category: Category;
  name: string;
  set_name: string | null;
  number: string | null;
  rarity: string | null;
  language: string;
  condition: Condition;
  is_foil: boolean;
  price: number;
  ref_price: number | null;
  quantity: number;
  status: Status;
  image_api_url: string | null;
  photo_urls: string[];
  notes: string | null;
  featured: boolean;
  created_at: string;
}

export const cardImage = (c: Pick<Card, "photo_urls" | "image_api_url">) =>
  c.photo_urls[0] ?? c.image_api_url ?? "/card-back.svg";
