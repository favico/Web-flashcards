
export interface Card {
  id: string;
  front: string;
  back: string;
  lastReviewed: string | null;
  nextReview: string;
  interval: number; // in days
  easeFactor: number;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
}

export enum PerformanceRating {
  Again = 0,
  Hard = 1,
  Good = 2,
  Easy = 3,
}

export interface ReviewLog {
    date: string; // YYYY-MM-DD
    count: number;
}
