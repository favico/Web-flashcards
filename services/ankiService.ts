import { Deck, Card } from '../types';

let SQL: any = null;

const initDatabase = async (): Promise<any> => {
    if (SQL) return SQL;

    // The check for initSqlJs is now handled in the ImportDeck component.
    try {
        SQL = await (window as any).initSqlJs({
            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        return SQL;
    } catch (e) {
        console.error("Failed to initialize sql.js", e);
        throw new Error("Could not initialize the database engine. It may have failed to download.");
    }
};

export const parseApkgFile = async (file: File): Promise<Deck> => {
    // The check for JSZip is now handled in the ImportDeck component.
    
    await initDatabase();
    if (!SQL) {
        throw new Error("Database engine not initialized.");
    }
    
    try {
        const JSZip = (window as any).JSZip;
        const zip = await JSZip.loadAsync(file);
        const dbFile = zip.file('collection.anki2') || zip.file('collection.anki21');

        if (!dbFile) {
            throw new Error('Could not find collection.anki2 or collection.anki21 in the .apkg file.');
        }

        const dbData: Uint8Array = await dbFile.async('uint8array');
        const db: any = new SQL.Database(dbData);

        const stmt = db.prepare("SELECT flds FROM notes");
        
        const cards: Card[] = [];
        const now = new Date().toISOString();

        while (stmt.step()) {
            const row = stmt.get();
            const fields = (row[0] as string).split('\x1f');
            if (fields.length >= 2) {
                cards.push({
                    id: `card-${Date.now()}-${cards.length}`,
                    front: fields[0].replace(/<[^>]*>?/gm, ''), // Strip HTML tags
                    back: fields[1].replace(/<[^>]*>?/gm, ''), // Strip HTML tags
                    lastReviewed: null,
                    nextReview: now,
                    interval: 0,
                    easeFactor: 2.5,
                });
            }
        }

        stmt.free();
        db.close();
        
        if(cards.length === 0) {
            throw new Error("No valid flashcards found in the Anki deck.");
        }

        const deck: Deck = {
            id: `deck-${Date.now()}`,
            name: file.name.replace(/\.apkg$/, ''),
            cards: cards
        };

        return deck;

    } catch (error: any) {
        console.error("Error parsing .apkg file:", error);
        throw new Error(`Failed to parse .apkg file: ${error.message}`);
    }
};