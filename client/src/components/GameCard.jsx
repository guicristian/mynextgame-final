import React from 'react';

function GameCard({ game, onDelete }) {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105">
            <img src={game.cover || 'https://via.placeholder.com/300x400'} alt={`Capa de ${game.name}`} className="w-full h-64 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold truncate">{game.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{game.platform}</p>
                <span className="text-xs font-semibold bg-gray-700 text-green-400 px-2 py-1 rounded-full self-start mb-4">
                    {game.status}
                </span>
                <div className="mt-auto">
                    <button 
                        onClick={() => onDelete(game._id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded-lg transition duration-300 text-sm"
                    >
                        <i className="fas fa-trash-alt mr-2"></i>
                        Remover
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameCard;