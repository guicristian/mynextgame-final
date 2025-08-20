import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { user, loading } = useAuth(); // Pega o usuário e o estado de carregamento do nosso contexto

  console.debug("Status da Rota Protegida:", { isLoading: loading, userObject: user });

  // Se ainda estamos verificando se o usuário está logado, mostramos uma mensagem de carregamento
  if (loading) {
    return <div>Carregando...</div>;
  }

  // Se não houver usuário após o carregamento, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se houver um usuário, renderiza a página filha (o conteúdo protegido)
  return <Outlet />;
}

export default ProtectedRoute;