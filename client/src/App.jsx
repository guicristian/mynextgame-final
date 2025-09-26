import React, { useState, useEffect } from 'react';
import api from './services/api.js';
import GameCarousel from './components/GameCarousel.jsx';
import GameFormModal from './components/GameFormModal.jsx';


function App() {
    // Estados para armazenar as listas de jogos de cada seção
    const [popularGames, setPopularGames] = useState([]);
    const [recentGames, setRecentGames] = useState([]);
    const [gotyGames, setGotyGames] = useState([]);
    const [myRecentGames, setMyRecentGames] = useState([]);
    
    // Estado para controlar a exibição do loading
    const [isLoading, setIsLoading] = useState(true);

    // Estados para gerenciar o modal de adição/edição de jogos
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [popular, recent, goty, myGames] = await Promise.all([
                api.get('/api/rawg/popular'),
                api.get('/api/rawg/recent'),
                api.get('/api/rawg/goty'),
                api.get('/api/games') // Rota para os jogos do próprio usuário
            ]);

            setPopularGames(popular.data);
            setRecentGames(recent.data);
            setGotyGames(goty.data);
            // Pega os 5 jogos mais recentes da lista do usuário para exibir na Home
            setMyRecentGames(myGames.data.slice(0, 5));

        } catch (error) {
            console.error("Erro ao buscar os jogos da Home Page:", error);
            // Em um aplicativo real, aqui poderíamos definir um estado de erro para exibir uma mensagem ao usuário.
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect para chamar a função de busca de dados assim que o componente for montado.
    // O array de dependências vazio `[]` garante que isso rode apenas uma vez.
    useEffect(() => {
        fetchAllData();
    }, []);

    /**
     * Manipulador de evento para quando um card de jogo na seção de descoberta é clicado.
     * @param {object} rawgGame - O objeto do jogo vindo da API da RAWG.
     */
    const handleCardClick = (rawgGame) => {
        // Formata o objeto do jogo da RAWG para o nosso modelo de dados antes de abrir o modal.
        const gameData = {
            name: rawgGame.name,
            cover: rawgGame.background_image,
            rawgId: rawgGame.id
        };
        setSelectedGame(gameData); // Define o jogo que será passado para o modal
        setIsModalOpen(true);     // Abre o modal
    };

    // Função para fechar o modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGame(null); // Limpa o jogo selecionado
    };

    // Função que será chamada pelo modal após um jogo ser salvo com sucesso.
    // Ela simplesmente busca os dados novamente para atualizar a seção "Adicionados Recentemente".
    const handleSave = () => {
        fetchAllData();
    };
    
    // Se os dados ainda estão carregando, exibe uma mensagem de loading.
    if (isLoading) {
        return <div className="text-center p-10 text-xl text-gray-400">Carregando a galáxia de jogos...</div>;
    }

    return (
        // Usamos um Fragment (<>) para poder renderizar a página e o modal no mesmo nível.
        <>
            <div className="container mx-auto p-4 md:p-6">
                {/* Renderiza cada carrossel de jogos, passando os dados e a função de clique. */}
                <GameCarousel title="Mais Populares" games={popularGames} onCardClick={handleCardClick} />
                <GameCarousel title="Lançamentos Recentes" games={recentGames} onCardClick={handleCardClick} />
                <GameCarousel title="Campeões do Ano Anterior" games={gotyGames} onCardClick={handleCardClick} />
                
                {/* O carrossel de "Meus Jogos" é diferente.
                  Ele usa o `GameCard` normal (que será criado ou ajustado depois) e não o `DiscoveryGameCard`.
                  Por enquanto, vamos passá-lo para um carrossel que não tem a função de clique para adicionar.
                */}
                {myRecentGames.length > 0 && (
                    <GameCarousel title="Adicionados Recentemente por Você" games={myRecentGames} />
                )}
            </div>

            {/* Renderiza o modal unificado. 
              Ele só será visível na tela se `isModalOpen` for verdadeiro.
            */}
            <GameFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                game={selectedGame}
            />
        </>
    );
}

export default App;

