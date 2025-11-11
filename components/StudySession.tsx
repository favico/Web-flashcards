import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Deck, Card, PerformanceRating } from '../types';
import { updateCard } from '../services/srsService';

interface StudySessionProps {
  deck: Deck;
  onFinish: (updatedDeck: Deck) => void;
}

const StudySession: React.FC<StudySessionProps> = ({ deck, onFinish }) => {
  const [updatedDeck, setUpdatedDeck] = useState<Deck>(JSON.parse(JSON.stringify(deck)));
  const [isFlipped, setIsFlipped] = useState(false);

  const dueCards = useMemo(() => {
    const now = new Date().toISOString();
    return updatedDeck.cards
      .filter(card => card.nextReview <= now)
      .sort((a,b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  }, [updatedDeck]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCard = useMemo(() => {
    return dueCards.length > 0 ? dueCards[currentIndex] : null;
  }, [dueCards, currentIndex]);
  
  const handleRating = useCallback((rating: PerformanceRating) => {
    if (!currentCard) return;

    const updatedCard = updateCard(currentCard, rating);
    const newCards = updatedDeck.cards.map(c => c.id === updatedCard.id ? updatedCard : c);

    setUpdatedDeck(prevDeck => ({...prevDeck, cards: newCards}));

    if (rating === PerformanceRating.Again) {
      // Move to end of queue to see again soon
      // This is a simplified approach. A real SRS would re-insert it intelligently.
      // For now, we'll just proceed to the next unique card.
    }
    
    setIsFlipped(false);
    if(currentIndex >= dueCards.length - 1) {
        // End of session
    } else {
        setCurrentIndex(prev => prev + 1);
    }
  }, [currentCard, updatedDeck, currentIndex, dueCards.length]);

  if (!currentCard) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white">Congratulations!</h2>
        <p className="mt-2 text-dark-text-secondary">You've finished all due cards in this deck for now.</p>
        <button
          onClick={() => onFinish(updatedDeck)}
          className="mt-8 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary transition-colors"
        >
          Back to Decks
        </button>
      </div>
    );
  }

  const ratingButtons = [
    { label: 'Again', rating: PerformanceRating.Again, color: 'bg-red-600 hover:bg-red-700' },
    { label: 'Hard', rating: PerformanceRating.Hard, color: 'bg-yellow-600 hover:bg-yellow-700' },
    { label: 'Good', rating: PerformanceRating.Good, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Easy', rating: PerformanceRating.Easy, color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto">
       <div className="text-dark-text-secondary mb-4">
        {currentIndex + 1} / {dueCards.length}
      </div>
      <div className="w-full flex-grow flex items-center justify-center [perspective:1000px]">
        <div
          className={`w-full h-80 transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="absolute w-full h-full [backface-visibility:hidden] bg-dark-surface rounded-lg shadow-2xl flex items-center justify-center p-6 cursor-pointer">
            <p className="text-2xl md:text-3xl text-center text-white">{currentCard.front}</p>
          </div>
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gray-800 rounded-lg shadow-2xl flex items-center justify-center p-6 cursor-pointer">
            <p className="text-2xl md:text-3xl text-center text-white">{currentCard.back}</p>
          </div>
        </div>
      </div>
      
      <div className="w-full mt-8">
        {isFlipped ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ratingButtons.map(({ label, rating, color }) => (
              <button
                key={label}
                onClick={() => handleRating(rating)}
                className={`py-4 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 ${color}`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full py-4 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-secondary transition-colors"
          >
            Show Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default StudySession;