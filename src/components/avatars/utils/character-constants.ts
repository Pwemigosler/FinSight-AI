
import { CharacterData } from "../CharacterOption";
import { characterImages } from "./avatar-utils";

// Default character options with their descriptions and paths
export const defaultCharacters: CharacterData[] = [
  {
    id: "fin",
    name: "Fin",
    thumbnailUrl: characterImages.fin,
    description: "Your friendly robot financial assistant with expertise in budgeting and investment strategies."
  },
  {
    id: "luna",
    name: "Luna",
    thumbnailUrl: characterImages.luna,
    description: "A tech-savvy assistant who specializes in investment strategies and market trends."
  },
  {
    id: "oliver",
    name: "Oliver",
    thumbnailUrl: characterImages.oliver,
    description: "A detail-oriented character who helps with expense tracking and financial planning."
  },
  {
    id: "zoe",
    name: "Zoe",
    thumbnailUrl: characterImages.zoe,
    description: "An energetic advisor focused on helping you reach your financial goals."
  }
];
