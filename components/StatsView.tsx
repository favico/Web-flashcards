import React, { useMemo } from 'react';
import { Deck, ReviewLog } from '../types';
import { getReviewLogs } from '../services/storageService';

// Recharts is loaded via a script tag in index.html and exposed as a global
declare const Recharts: any;

interface StatsViewProps {
  decks: Deck[];
}

const StatsView: React.FC<StatsViewProps> = ({ decks }) => {
  const reviewLogs = useMemo(() => getReviewLogs(), []);

  const totalCards = useMemo(() => decks.reduce((sum, deck) => sum + deck.cards.length, 0), [decks]);
  const totalDecks = decks.length;
  const totalReviews = useMemo(() => reviewLogs.reduce((sum, log) => sum + log.count, 0), [reviewLogs]);

  const chartData = useMemo(() => {
    const last7Days: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        const log = reviewLogs.find(l => l.date === dateString);
        last7Days.push({
            date: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d),
            count: log ? log.count : 0
        });
    }
    return last7Days;
  }, [reviewLogs]);

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-dark-text-secondary text-sm font-medium">Total Decks</h3>
            <p className="text-3xl font-bold text-white mt-2">{totalDecks}</p>
        </div>
        <div className="bg-dark-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-dark-text-secondary text-sm font-medium">Total Cards</h3>
            <p className="text-3xl font-bold text-white mt-2">{totalCards}</p>
        </div>
        <div className="bg-dark-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-dark-text-secondary text-sm font-medium">Total Reviews</h3>
            <p className="text-3xl font-bold text-white mt-2">{totalReviews}</p>
        </div>
    </div>
  );

  // Handle race condition where the component renders before the script loads.
  if (typeof Recharts === 'undefined') {
    return (
        <div className="max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold text-white mb-6">Your Progress</h2>
             {renderStatsCards()}
             <div className="bg-dark-surface p-6 rounded-lg shadow-lg flex items-center justify-center" style={{ height: 324 }}>
                <p className="text-dark-text-secondary">Loading chart...</p>
             </div>
        </div>
    );
  }

  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = Recharts;

  return (
    <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Your Progress</h2>
        {renderStatsCards()}
        <div className="bg-dark-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Reviews This Week</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" allowDecals={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #4b5563',
                                color: '#d1d5db'
                            }}
                            labelStyle={{ color: '#9ca3af' }}
                        />
                        <Bar dataKey="count" fill="#4f46e5" name="Reviews" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default StatsView;