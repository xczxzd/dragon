import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-indigo-900/50 backdrop-blur-sm shadow-lg border-b border-purple-800 sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center shadow-lg">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.375 3.375 0 0014 18.442V21.75a1.5 1.5 0 01-3 0v-3.308c0-.944-.39-1.838-1.03-2.488l-.548-.547z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">
                            PRISMA<span className="text-fuchsia-400"> IA</span> Trader
                        </h1>
                    </div>
                    <div className="text-xs text-purple-400 font-mono">
                        v1.0.0
                    </div>
                </div>
            </div>
        </header>
    );
};
