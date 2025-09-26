import React from 'react';
import { motion } from 'framer-motion';

// A prop foi corrigida de 'onAdd' para 'onClick' para corresponder ao que o App.jsx envia.
function DiscoveryGameCard({ game, onClick }) {
    // A imagem placeholder foi corrigida para um link funcional.
    const coverImage = game.background_image || '/images/placeholder-cover.png';
    
    return (
        <motion.div 
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group cursor-pointer"
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{ duration: 0.2 }}
            // O card inteiro agora é clicável, chamando a função recebida na prop 'onClick'.
            onClick={() => onClick(game)}
        >
            <div className="relative">
                <img src={coverImage} alt={`Capa de ${game.name}`} className="w-full h-48 object-cover" />
            </div>
            <div className="p-4">
                <h3 className="text-md font-bold truncate text-white">{game.name}</h3>
                <p className="text-sm text-gray-400">Lançamento: {game.released}</p>
            </div>
        </motion.div>
    );
}

export default DiscoveryGameCard;
