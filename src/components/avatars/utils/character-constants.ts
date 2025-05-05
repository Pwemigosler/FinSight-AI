
import { CharacterData } from "../CharacterOption";
import { characterImages } from "./avatar-utils";

// Ensure paths include the full local URL for login page
const getFullThumbnailPath = (characterId: string): string => {
  return `/characters/${characterImages[characterId as keyof typeof characterImages]}`;
};

// Default character options with their descriptions and paths
export const defaultCharacters: CharacterData[] = [
  {
    id: "fin",
    name: "Fin",
    thumbnailUrl: getFullThumbnailPath("fin"),
    description: "Your friendly robot financial assistant with expertise in budgeting and investment strategies."
  },
  {
    id: "luna",
    name: "Luna",
    thumbnailUrl: getFullThumbnailPath("luna"),
    description: "A tech-savvy assistant who specializes in investment strategies and market trends."
  },
  {
    id: "oliver",
    name: "Oliver",
    thumbnailUrl: getFullThumbnailPath("oliver"),
    description: "A detail-oriented character who helps with expense tracking and financial planning."
  },
  {
    id: "zoe",
    name: "Zoe",
    thumbnailUrl: getFullThumbnailPath("zoe"),
    description: "An energetic advisor focused on helping you reach your financial goals."
  }
];
