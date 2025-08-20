// client/src/pages/MyListPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Nosso serviço de API
import GameCard from '../components/GameCard'; // O componente de card que vamos criar/ajustar

function MyListPage() {
    // Estado para guardar a lista de jogos do usuário
    const [myGames, setMyGames] = useState([]);
    // Estado para controlar o carregamento
    const [isLoading, setIsLoading] = useState(true);

    // Função para buscar os jogos do backend
    const fetchMyGames = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/games');
            setMyGames(response.data);
        } catch (error) {
            console.error("Erro ao buscar a lista de jogos:", error);
            // Você pode adicionar um estado de erro aqui para exibir na tela
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect para chamar a função de busca quando a página carrega
    useEffect(() => {
        fetchMyGames();
    }, []); // O array vazio garante que rode apenas uma vez

    // Função para deletar um jogo
    const handleDeleteGame = async (gameId) => {
        try {
            await api.delete(`/api/games/${gameId}`);
            // Atualiza a lista no frontend removendo o jogo deletado, sem precisar recarregar
            setMyGames(myGames.filter(game => game._id !== gameId));
        } catch (error) {
            console.error("Erro ao deletar o jogo:", error);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Carregando sua lista...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-green-500 mb-6 border-l-4 border-green-500 pl-4">Minha Lista de Jogos</h1>

            {myGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {myGames.map(game => (
                        // Passamos a função de deletar para cada card
                        <GameCard key={game._id} game={game} onDelete={handleDeleteGame} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">Você ainda não adicionou nenhum jogo à sua lista.</p>
            )}
        </div>
    );
}

export default MyListPage;