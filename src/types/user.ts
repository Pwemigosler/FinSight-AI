
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  hasCompletedSetup?: boolean;
  avatarSettings?: {
    zoom: number;
    position: {
      x: number;
      y: number;
    };
  };
}
