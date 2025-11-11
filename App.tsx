
import React, { useState, useCallback, useMemo } from 'react';
import { Deck } from './types';
import { getDecks, saveDecks } from './services/storageService';
import DeckList from './components/DeckList';
import StudySession from './components/StudySession';
import ImportDeck from './components/ImportDeck';
import StatsView from './components/StatsView';
import { BookOpenIcon, ChartBarIcon, PlusCircleIcon, ArrowLeftIcon } from './components/Icons';

type View = 'DECK_LIST' | 'STUDY' | 'IMPORT' | 'STATS';

const App: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>(getDecks());
  const [currentView, setCurrentView] = useState<View>('DECK_LIST');
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);

  const updateDecks = useCallback((newDecks: Deck[]) => {
    saveDecks(newDecks);
    setDecks(newDecks);
  }, []);

  const handleSelectDeck = (deck: Deck) => {
    setActiveDeck(deck);
    setCurrentView('STUDY');
  };

  const handleAddDeck = (newDeck: Deck) => {
    const newDecks = [...decks, newDeck];
    updateDecks(newDecks);
    setCurrentView('DECK_LIST');
  };
  
  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
      const newDecks = decks.filter(d => d.id !== deckId);
      updateDecks(newDecks);
    }
  };

  const handleSessionFinish = (updatedDeck: Deck) => {
    const newDecks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d);
    updateDecks(newDecks);
    setCurrentView('DECK_LIST');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'STUDY':
        return activeDeck && <StudySession deck={activeDeck} onFinish={handleSessionFinish} />;
      case 'IMPORT':
        return <ImportDeck onDeckCreated={handleAddDeck} />;
      case 'STATS':
        return <StatsView decks={decks}/>;
      case 'DECK_LIST':
      default:
        return <DeckList decks={decks} onSelectDeck={handleSelectDeck} onDeleteDeck={handleDeleteDeck} onGoToImport={() => setCurrentView('IMPORT')} />;
    }
  };
  
  const navItems = [
      { view: 'DECK_LIST', label: 'Decks', icon: <BookOpenIcon /> },
      { view: 'IMPORT', label: 'Import', icon: <PlusCircleIcon /> },
      { view: 'STATS', label: 'Stats', icon: <ChartBarIcon /> },
  ] as const;

  const headerTitle = useMemo(() => {
    if (currentView === 'STUDY' && activeDeck) return activeDeck.name;
    const item = navItems.find(item => item.view === currentView);
    return item ? item.label : "Gemini Flashcards";
  }, [currentView, activeDeck]);

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
      <header className="bg-dark-surface p-4 shadow-md sticky top-0 z-10 flex items-center">
        {currentView !== 'DECK_LIST' ? (
           <button onClick={() => setCurrentView('DECK_LIST')} className="mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors">
             <ArrowLeftIcon />
           </button>
        ) : <div className="w-10 mr-4"></div>}
        <h1 className="text-xl font-bold text-white">{headerTitle}</h1>
      </header>

      <main className="flex-grow p-4 md:p-8">
        {renderContent()}
      </main>

      <nav className="bg-dark-surface sticky bottom-0 p-2 shadow-inner md:hidden">
        <div className="flex justify-around">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors w-24 ${currentView === item.view ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
