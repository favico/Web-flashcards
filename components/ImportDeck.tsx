import React, { useState, useEffect } from 'react';
import { Deck } from '../types';
import { parseApkgFile } from '../services/ankiService';
import { DocumentArrowUpIcon, BookOpenIcon } from './Icons';

interface ImportDeckProps {
  onDeckCreated: (deck: Deck) => void;
}

const ImportDeck: React.FC<ImportDeckProps> = ({ onDeckCreated }) => {
  const [deckName, setDeckName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dependenciesLoaded, setDependenciesLoaded] = useState(false);
  const [dependencyError, setDependencyError] = useState<string | null>(null);

  useEffect(() => {
    const checkDependencies = () => {
      return typeof (window as any).JSZip !== 'undefined' && typeof (window as any).initSqlJs !== 'undefined';
    };

    if (checkDependencies()) {
      setDependenciesLoaded(true);
      return;
    }

    setDependencyError("Loading import libraries...");

    const interval = setInterval(() => {
      if (checkDependencies()) {
        setDependenciesLoaded(true);
        setDependencyError(null);
        clearInterval(interval);
      }
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!checkDependencies()) {
        setDependencyError("Import libraries failed to load. Please check your connection and refresh.");
      }
    }, 7000); // 7-second timeout

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!deckName) {
        setDeckName(file.name.replace(/\.apkg$/, ""));
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select an .apkg file to import.');
      return;
    }
    if (!deckName.trim()) {
        setError('Deck name cannot be empty.');
        return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const newDeck = await parseApkgFile(selectedFile);
      newDeck.name = deckName; // Allow user to override the name
      onDeckCreated(newDeck);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during import.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-dark-surface p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Import Anki Deck</h2>
      
      {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-6">{error}</div>}
      {dependencyError && <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded-md mb-6">{dependencyError}</div>}

      <div className="space-y-6">
        <div>
          <label htmlFor="deckName" className="block text-sm font-medium text-dark-text-secondary mb-2">Deck Name</label>
          <input
            type="text"
            id="deckName"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="e.g., Spanish Vocabulary"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-primary focus:outline-none"
            disabled={!dependenciesLoaded}
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">Anki File (.apkg)</label>
             <label htmlFor="file-upload" className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg  transition-colors ${dependenciesLoaded ? 'cursor-pointer hover:border-brand-primary hover:bg-gray-800' : 'cursor-not-allowed bg-gray-800/50'}`}>
                  <DocumentArrowUpIcon className="h-10 w-10 text-dark-text-secondary mb-2" />
                  <span className="font-medium text-dark-text-secondary">
                    {selectedFile ? selectedFile.name : 'Click to upload an .apkg file'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">Direct Anki deck import</span>
             </label>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".apkg" disabled={!dependenciesLoaded}/>
        </div>
        
        <div>
            <button
              onClick={handleImport}
              disabled={!dependenciesLoaded || isLoading || !selectedFile || !deckName}
              className="w-full flex items-center justify-center py-3 px-4 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-75 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing Deck...
                </>
              ) : (
                <>
                  <BookOpenIcon className="mr-2" />
                  Import Deck
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDeck;