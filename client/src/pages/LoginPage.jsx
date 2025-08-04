import React from 'react';
import { Link } from 'react-router-dom'; 

function LoginPage() {
  return (
    // Div principal que envolve todo o conteúdo da página
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      
      {/* O card do formulário */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-500">MyNextGame</h1>
          <p className="text-gray-400 mt-2">Faça login para acessar sua lista</p>
        </div>

        {/* Formulário */}
        <form>
          {/* Campo de Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              id="email"
              // Estilização do input com Tailwind:
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="seu@email.com"
            />
          </div>

          {/* Campo de Senha */}
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Senha</label>
            <input 
              type="password" 
              id="password"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {/* Botão de Login */}
          <button 
            type="submit"
            // Estilização do botão:
            // - w-full: Largura total
            // - bg-green-600: Cor de fundo
            // - hover:bg-green-700: Cor de fundo ao passar o mouse
            // - transition duration-300: Efeito suave de transição
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Entrar
          </button>
        </form>

        {/* Link para se registrar */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Não tem uma conta?{' '}
          {/* Usamos o componente <Link> do React Router para uma navegação de SPA */}
          <Link to="/register" className="text-green-400 hover:underline">
            Registre-se
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;