import React from 'react';
// Importa os dois tipos de cards que este carrossel pode renderizar.
import DiscoveryGameCard from './DiscoveryGameCard.jsx';
import GameCard from './GameCard.jsx';

/**
 * Componente de Carrossel genérico e reutilizável.
 * @param {string} title - O título da seção a ser exibido.
 * @param {array} games - A lista de objetos de jogo.
 * @param {string} cardType - 'discovery' ou 'userList', para decidir qual card renderizar.
 * @param {object} ...cardProps - Quaisquer outras props (como onCardClick, onEdit) a serem passadas para os componentes de card.
 */
function GameCarousel({ title, games, cardType = 'discovery', ...cardProps }) {
    // Se não houver jogos na lista, o componente não renderiza nada.
    if (!games || games.length === 0) {
        return null;
    }

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-green-500 mb-4 border-l-4 border-green-500 pl-4">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {games.map(game => {
                    // Lógica para decidir qual tipo de card renderizar com base na prop 'cardType'
                    if (cardType === 'userList') {
                        return (
                            <GameCard 
                                key={game._id} // Jogos da nossa DB usam '_id' como chave única.
                                game={game} 
                                {...cardProps} // Passa props como onEdit e onDelete para o card.
                            />
                        );
                    }
                    
                    // O padrão ('discovery') é renderizar o DiscoveryGameCard.
                    return (
                        <DiscoveryGameCard 
                            key={game.id} // Jogos da API da RAWG usam 'id' como chave única.
                            game={game} 
                            onClick={cardProps.onCardClick} // Passa a prop onCardClick para o card.
                        />
                    );
                })}
            </div>
        </section>
    );
}

export default GameCarousel;