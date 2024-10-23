export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
}

export type PetAction = 'feed' | 'play' | 'rest';
