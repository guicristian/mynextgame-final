import axios from 'axios';

// Cria uma instância do Axios pré-configurada
const api = axios.create({
    // Lê a URL base do nosso arquivo .env do frontend
    baseURL: import.meta.env.VITE_API_BASE_URL,
    // Garante que os cookies sejam enviados em cada requisição
    withCredentials: true,
});

export default api;