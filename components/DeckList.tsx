
import React from 'react';
import { Deck } from '../types';
import { BookOpenIcon, PlusCircleIcon, TrashIcon } from './Icons';

interface DeckListProps {
  decks: Deck[];
  onSelectDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onGoToImport: () => void;
}

const DeckList: React.FC<DeckListProps> = ({ decks, onSelectDeck, onDeleteDeck, onGoToImport }) => {
  const getDueCardsCount = (deck: Deck) => {
    const now = new Date().toISOString();
    return deck.cards.filter(card => card.nextReview <= now).length;
  };
  
  if (decks.length === 0) {
    return (
        <div className="text-center text-dark-text-secondary py-16">
            <BookOpenIcon className="mx-auto h-16 w-16" />
            <h2 className="mt-4 text-xl font-semibold">No Decks Found</h2>
            <p className="mt-2">Click the button below to import your first deck.</p>
            <button
              onClick={onGoToImport}
              className="mt-6 inline-flex items-center px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-75 transition-colors"
            >
              <PlusCircleIcon className="mr-2 h-5 w-5" />
              Import Deck
            </button>
        </div>
    )
  }

  return (
    <div className="relative pb-24 md:pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {decks.map(deck => {
          const dueCount = getDueCardsCount(deck);
          return (
            <div key={deck.id} className="bg-dark-surface rounded-lg shadow-lg flex flex-col overflow-hidden">
              <div className="p-6 flex-grow">
                <h2 className="text-xl font-bold text-white truncate">{deck.name}</h2>
                <p className="text-dark-text-secondary mt-2">{deck.cards.length} cards</p>
                <div className={`mt-4 text-sm font-medium px-3 py-1 rounded-full inline-block ${dueCount > 0 ? 'bg-indigo-500 text-white' : 'bg-gray-600 text-dark-text'}`}>
                  {dueCount} cards due
                </div>
              </div>
              <div className="bg-gray-800 p-4 flex justify-between items-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteDeck(deck.id); }}
                  className="p-2 text-dark-text-secondary hover:text-red-500 rounded-full transition-colors"
                  aria-label="Delete deck"
                >
                  <TrashIcon />
                </button>
                <button
                  onClick={() => onSelectDeck(deck)}
                  disabled={dueCount === 0}
                  className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-75 transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
                >
                  Study
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onGoToImport}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 bg-brand-secondary hover:bg-brand-primary text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary z-20"
        aria-label="Import new deck"
      >
        <PlusCircleIcon />
      </button>
    </div>
  );
};

export default DeckList;
