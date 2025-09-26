import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api'; // IMPORTA NOSSO SERVIÇO DE API


// 1. Cria o Context


// 2. Cria o Provedor (o "roteador")
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para saber se estamos verificando o login

  // Este efeito roda uma vez quando o app carrega para verificar se já existe um login válido
  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Nós vamos criar essa rota no backend
        const response = await api.get('/api/verify-token');
        setUser(response.data); // Se o token for válido, guarda os dados do usuário
      } catch (error) {
        console.error("Falha na verificação de token:", error.response?.data?.message || error.message);
        setUser(null); // Se o token for inválido ou não existir, o usuário é nulo
      } finally {
        setLoading(false); // Termina o carregamento
      }
    };
    verifyUser();
  }, []);

  // Função de login que os componentes poderão chamar
  const login = async (email, password) => {
    const response = await api.post('/api/login', { email, password });
    // Após o login, verificamos novamente para pegar os dados do usuário
    const verifyResponse = await api.get('/api/verify-token');
    setUser(verifyResponse.data);
    return response;
  };

  // Função de logout
  const logout = async () => {
await api.post('/api/logout');
    setUser(null);
  };

const register = async (username, email, password) => {
    return await api.post('/api/register', { username, email, password });
};

  // O valor que será compartilhado com todos os componentes "conectados"
const value = { user, login, logout, register, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
