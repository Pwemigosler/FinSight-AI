
export type AvatarState = 
  | "idle" 
  | "speaking" 
  | "thinking" 
  | "happy" 
  | "confused" 
  | "tip";

export interface PixarAvatarProps {
  state: AvatarState;
  characterId?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
}
