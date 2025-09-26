// client/src/pages/MyListPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import GameCard from '../components/GameCard';
import GameFormModal from '../components/GameFormModal'; // Importa o modal unificado

function MyListPage() {
    // Estados existentes
    const [myGames, setMyGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados para gerenciar o modal de edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGameToEdit, setCurrentGameToEdit] = useState(null);

    // Estado para controlar a ordenação da lista
    const [sortOrder, setSortOrder] = useState('recent');

    // Função para buscar os jogos do backend
    const fetchMyGames = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/games');
            // A API já retorna os mais recentes primeiro, então não precisamos ordenar aqui para o padrão 'recent'
            setMyGames(response.data);
        } catch (error) {
            console.error("Erro ao buscar a lista de jogos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect para chamar a função de busca quando a página carrega
    useEffect(() => {
        fetchMyGames();
    }, []);

    // Lógica para ordenar a lista de jogos usando useMemo para otimização
    const sortedGames = useMemo(() => {
        const sorted = [...myGames]; // Cria uma cópia para não modificar o estado original
        switch (sortOrder) {
            case 'rating':
                // Ordena pela nota, da maior para a menor
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'status':
                // Ordena pelo status em ordem alfabética
                sorted.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
                break;
            // 'recent' é o padrão e já vem ordenado do backend.
            default:
                return sorted;
        }
        return sorted;
    }, [myGames, sortOrder]); // Recalcula a ordenação apenas se a lista ou a ordem mudar

    // Função para deletar um jogo (lógica existente)
    const handleDeleteGame = async (gameId) => {
        try {
            await api.delete(`/api/games/${gameId}`);
            setMyGames(myGames.filter(game => game._id !== gameId));
        } catch (error) {
            console.error("Erro ao deletar o jogo:", error);
        }
    };

    // Funções para controlar o modal
    const handleEditClick = (game) => {
        setCurrentGameToEdit(game);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentGameToEdit(null);
    };

    const handleSave = () => {
        // Após salvar (criar ou editar), busca a lista atualizada do backend
        fetchMyGames();
    };

    if (isLoading) {
        return <div className="text-center p-10">Carregando sua lista...</div>;
    }

    return (
        <>
            <div className="container mx-auto p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-green-500 border-l-4 border-green-500 pl-4">Minha Lista de Jogos</h1>
                    {/* SELETOR DE ORDENAÇÃO */}
                    <div className="flex items-center gap-2">
                         <label htmlFor="sort" className="text-sm text-gray-400">Ordenar por:</label>
                         <select 
                             id="sort"
                             value={sortOrder}
                             onChange={e => setSortOrder(e.target.value)}
                             className="bg-gray-700 p-2 rounded border border-gray-600 focus:ring-green-500 focus:border-green-500"
                         >
                            <option value="recent">Adicionados Recentemente</option>
                            <option value="rating">Nota</option>
                            <option value="status">Status</option>
                         </select>
                    </div>
                </div>

                {sortedGames.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {/* Agora mapeamos a lista JÁ ORDENADA */}
                        {sortedGames.map(game => (
                            <GameCard 
                                key={game._id} 
                                game={game} 
                                onDelete={handleDeleteGame}
                                onEdit={handleEditClick} 
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">Você ainda não adicionou nenhum jogo à sua lista.</p>
                )}
            </div>

            {/* Renderiza o modal unificado, passando os estados e funções necessários */}
            <GameFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                game={currentGameToEdit}
            />
        </>
    );
}

export default MyListPage;