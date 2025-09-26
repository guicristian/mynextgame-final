// client/src/components/GameFormModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function GameFormModal({ game, isOpen, onClose, onSave }) {
    // Estado para os dados do formulário
    const [formData, setFormData] = useState({
        platform: '',
        status: 'Planejo jogar',
        rating: 0,
        hoursPlayed: '',
        review: '',
        priority: 'Média',
        startDate: '',
        endDate: ''
    });

    // Estado para guardar detalhes extras do jogo, buscados da RAWG
    const [rawgDetails, setRawgDetails] = useState(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    // Efeito para preencher o formulário e buscar detalhes extras
    useEffect(() => {
        if (game && isOpen) {
            // Preenche o formulário com dados existentes ou valores padrão
            setFormData({
                platform: game.platform || '',
                status: game.status || 'Planejo jogar',
                rating: game.rating || 0,
                hoursPlayed: game.hoursPlayed || '',
                review: game.review || '',
                priority: game.priority || 'Média',
                startDate: game.startDate ? game.startDate.split('T')[0] : '',
                endDate: game.endDate ? game.endDate.split('T')[0] : ''
            });

            // Se for um jogo da RAWG (tem rawgId e não _id), busca detalhes adicionais
            if (game.rawgId && !game._id) {
                setIsFetchingDetails(true);
                api.get(`/api/rawg/games/${game.rawgId}`)
                    .then(response => {
                        setRawgDetails(response.data);
                    })
                    .catch(error => {
                        console.error("Erro ao buscar detalhes da RAWG:", error);
                        setRawgDetails(null); // Limpa detalhes em caso de erro
                    })
                    .finally(() => {
                        setIsFetchingDetails(false);
                    });
            } else {
                setRawgDetails(null); // Limpa detalhes se não for um novo jogo da RAWG
            }
        } else if (!isOpen) {
            // Limpa os estados quando o modal é fechado
            setRawgDetails(null);
            setIsFetchingDetails(false);
        }
    }, [game, isOpen]); // Depende do 'game' e 'isOpen'

    if (!isOpen) return null; // Não renderiza nada se o modal não estiver aberto

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const gameData = {
                ...game,
                ...formData,
                rating: Number(formData.rating),
                hoursPlayed: Number(formData.hoursPlayed)
            };

            if (game._id) {
                await api.put(`/api/games/${game._id}`, gameData);
            } else {
                await api.post('/api/games', gameData);
            }
            
            onSave();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar o jogo:", error);
            alert("Ocorreu um erro ao salvar o jogo.");
        }
    };

   const ratingOptions = [
        { value: 0, label: 'Sem nota' },
        { value: 10, label: '(10) Obra Prima' },
        { value: 9, label: '(9) Bonzão' },
        { value: 8, label: '(8) Muito Bom' },
        { value: 7, label: '(7) Bom' },
        { value: 6, label: '(6) Maneirinho' },
        { value: 5, label: '(5) Mediano' },
        { value: 4, label: '(4) Ruim' },
        { value: 3, label: '(3) Muito Ruim' },
        { value: 2, label: '(2) Horrível' },
        { value: 1, label: '(1) Cocozão' }
    ];

    const coverImage = rawgDetails?.background_image || game?.cover || 'https://placehold.co/120x80/2D3748/A0AEC0?text=No+Cover';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto transform scale-95 animate-fade-in">
                
                {/* Cabeçalho do Modal Aprimorado */}
               <div className="p-6 flex items-start gap-5 border-b border-gray-700">
                    <img src={coverImage} alt={game.name} className="w-28 h-28 object-cover rounded-lg shadow-lg flex-shrink-0" />
                    <div className="flex-grow">
                        <h2 className="text-3xl font-extrabold text-green-400">
                            {game._id ? 'Editar Jogo' : 'Adicionar à Minha Lista'}
                        </h2>
                        <h3 className="text-2xl font-bold text-white mt-1">{game.name}</h3>
                        
                        {/* Detalhes do Jogo (Gêneros, Lançamento, Desenvolvedora) */}
                        {isFetchingDetails ? (
                            <p className="text-gray-400 text-sm mt-2">Carregando detalhes...</p>
                        ) : rawgDetails ? (
                            <div className="text-sm text-gray-400 mt-2 space-y-1">
                                {rawgDetails.genres?.length > 0 && (
                                    <p><strong className="text-gray-300">Gêneros:</strong> {rawgDetails.genres.map(g => g.name).join(', ')}</p>
                                )}
                                {rawgDetails.released && (
                                    <p><strong className="text-gray-300">Lançamento:</strong> {rawgDetails.released}</p>
                                )}
                                {rawgDetails.developers?.length > 0 && (
                                    <p><strong className="text-gray-300">Desenvolvedora:</strong> {rawgDetails.developers[0].name}</p>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
                
                {/* Corpo do Formulário */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Campo Plataforma */}
                        <div>
                            <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-1">
                                <i className="fas fa-gamepad mr-2 text-green-400"></i>Plataforma
                            </label>
                            <input 
                                type="text" 
                                name="platform" 
                                value={formData.platform} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                                placeholder="Ex: PC, PlayStation 5"
                            />
                        </div>
                        {/* Campo Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                                <i className="fas fa-play-circle mr-2 text-green-400"></i>Status
                            </label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none transition-all custom-select" // custom-select para estilizar a seta
                            >
                                <option value="Planejo jogar">Planejo jogar</option>
                                <option value="Jogando">Jogando</option>
                                <option value="Dando um tempo">Dando um tempo</option>
                                <option value="Zerado">Zerado</option>
                                <option value="Platinado">Platinado</option>
                                <option value="Dropei">Dropei</option>
                            </select>
                        </div>
                        {/* Campo Nota */}
                         <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">
                                <i className="fas fa-star mr-2 text-yellow-400"></i>Nota
                            </label>
                            <select 
                                name="rating" 
                                value={formData.rating} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none transition-all custom-select"
                            >
                                {ratingOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        {/* Campo Prioridade */}
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
                                <i className="fas fa-fire mr-2 text-red-400"></i>Prioridade
                            </label>
                            <select 
                                name="priority" 
                                value={formData.priority} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none transition-all custom-select"
                            >
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                            </select>
                        </div>
                         {/* Campo Data de Início */}
                         <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                                <i className="fas fa-calendar-alt mr-2 text-purple-400"></i>Data de Início
                            </label>
                            <input 
                                type="date" 
                                name="startDate" 
                                value={formData.startDate} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                            />
                        </div>
                        {/* Campo Data de Término */}
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                                <i className="fas fa-calendar-check mr-2 text-blue-400"></i>Data de Término
                            </label>
                            <input 
                                type="date" 
                                name="endDate" 
                                value={formData.endDate} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                            />
                        </div>
                         {/* Campo Horas Jogadas */}
                         <div className="md:col-span-2">
                            <label htmlFor="hoursPlayed" className="block text-sm font-medium text-gray-300 mb-1">
                                <i className="fas fa-hourglass-half mr-2 text-orange-400"></i>Horas Jogadas
                            </label>
                            <input 
                                type="number" 
                                name="hoursPlayed" 
                                value={formData.hoursPlayed} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                                placeholder="0"
                            />
                        </div>
                        {/* Campo Review */}
                        <div className="md:col-span-2">
                            <label htmlFor="review" className="block text-sm font-medium text-gray-300 mb-1">
                                <i className="fas fa-comment-dots mr-2 text-teal-400"></i>Sua Review
                            </label>
                            <textarea 
                                name="review" 
                                value={formData.review} 
                                onChange={handleChange} 
                                rows="4" 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y transition-all" 
                                placeholder="Compartilhe suas impressões sobre o jogo..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-4 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center"
                        >
                            <i className="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center"
                        >
                            <i className="fas fa-save mr-2"></i>Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GameFormModal;