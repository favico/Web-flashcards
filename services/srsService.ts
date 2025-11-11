
import { Card, PerformanceRating } from '../types';
import { logReview } from './storageService';

const MIN_EASE_FACTOR = 1.3;

export const updateCard = (card: Card, rating: PerformanceRating): Card => {
  const now = new Date();
  let newInterval: number;
  let newEaseFactor: number;

  if (rating === PerformanceRating.Again) {
    newInterval = 1 / (24 * 60); // Reset to 1 minute, but for simplicity let's say 1 day for now
    newEaseFactor = Math.max(MIN_EASE_FACTOR, card.easeFactor - 0.2);
  } else {
    if (card.interval === 0) { // First time seeing card
      if (rating === PerformanceRating.Hard) newInterval = 1;
      else if (rating === PerformanceRating.Good) newInterval = 3;
      else newInterval = 5;
    } else {
      newInterval = card.interval * card.easeFactor;
    }
    
    if (rating === PerformanceRating.Hard) {
        newEaseFactor = Math.max(MIN_EASE_FACTOR, card.easeFactor - 0.15);
        newInterval *= 0.8; 
    } else if (rating === PerformanceRating.Good) {
        newEaseFactor = card.easeFactor;
    } else { // Easy
        newEaseFactor = card.easeFactor + 0.15;
        newInterval *= 1.5;
    }
  }

  const nextReviewDate = new Date(now.getTime() + Math.max(1, Math.round(newInterval)) * 24 * 60 * 60 * 1000);
  logReview();

  return {
    ...card,
    lastReviewed: now.toISOString(),
    nextReview: nextReviewDate.toISOString(),
    interval: Math.max(1, newInterval),
    easeFactor: newEaseFactor,
  };
};
