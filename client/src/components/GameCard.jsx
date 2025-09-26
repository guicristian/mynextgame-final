import React from 'react';

function GameCard({ game, onDelete, onEdit }) {
    // A imagem placeholder foi corrigida para um link funcional.
    const coverImage = game.cover || '/images/placeholder-cover.png';
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105">
            <img src={coverImage} alt={`Capa de ${game.name}`} className="w-full h-64 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold truncate">{game.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{game.platform || 'Plataforma não definida'}</p>
                
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold bg-gray-700 text-green-400 px-2 py-1 rounded-full self-start">
                        {game.status}
                    </span>
                    
                    {game.rating > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                            <i className="fas fa-star"></i>
                            <span className="font-bold text-lg">{game.rating}</span>
                        </div>
                    )}
                </div>

                {game.hoursPlayed > 0 && (
                    <p className="text-xs text-gray-500 mb-2">{game.hoursPlayed} horas jogadas</p>
                )}

                <div className="mt-auto flex gap-2">
                    <button 
                        onClick={() => onEdit(game)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded-lg transition duration-300 text-sm"
                    >
                       <i className="fas fa-pencil-alt mr-2"></i>Editar
                    </button>
                    <button 
                        onClick={() => onDelete(game._id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded-lg transition duration-300 text-sm"
                    >
                        <i className="fas fa-trash-alt mr-2"></i>Remover
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameCard;
