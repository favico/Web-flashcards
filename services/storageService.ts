
import { Deck, ReviewLog } from '../types';

const DECKS_KEY = 'flashcardDecks';
const REVIEW_LOGS_KEY = 'flashcardReviewLogs';

export const getDecks = (): Deck[] => {
  try {
    const decksJson = localStorage.getItem(DECKS_KEY);
    return decksJson ? JSON.parse(decksJson) : [];
  } catch (error) {
    console.error("Error parsing decks from localStorage", error);
    return [];
  }
};

export const saveDecks = (decks: Deck[]): void => {
  try {
    const decksJson = JSON.stringify(decks);
    localStorage.setItem(DECKS_KEY, decksJson);
  } catch (error) {
    console.error("Error saving decks to localStorage", error);
  }
};

export const getReviewLogs = (): ReviewLog[] => {
    try {
        const logsJson = localStorage.getItem(REVIEW_LOGS_KEY);
        return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
        console.error("Error parsing review logs from localStorage", error);
        return [];
    }
};

export const saveReviewLogs = (logs: ReviewLog[]): void => {
    try {
        const logsJson = JSON.stringify(logs);
        localStorage.setItem(REVIEW_LOGS_KEY, logsJson);
    } catch (error) {
        console.error("Error saving review logs to localStorage", error);
    }
};

export const logReview = () => {
    const today = new Date().toISOString().split('T')[0];
    const logs = getReviewLogs();
    const todayLog = logs.find(log => log.date === today);

    if (todayLog) {
        todayLog.count++;
    } else {
        logs.push({ date: today, count: 1 });
    }
    saveReviewLogs(logs);
};
