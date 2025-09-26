
import React, { useState   } from 'react'; // Adiciona o useState
import { Link, useNavigate } from 'react-router-dom'; // Adiciona o useNavigate

import { useAuth } from '../context/AuthContext.jsx';


function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth(); // Pega a função de login do contexto

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        try {
            await login(email, password); // Usa a função de login do contexto
            navigate('/'); // Navega para a home em caso de sucesso
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao fazer login.');
        }
    };

  return (

    
    
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        
        {/* Cabeçalho CORRIGIDO */}
        <div className="text-center mb-8">
          
          <div className="flex justify-center items-center mb-2">
            <i className="fas fa-gamepad text-3xl text-green-500 mr-3"></i>
            <h1 className="text-3xl font-bold text-green-500">MyNextGame</h1>
          </div>
          
          <p className="text-gray-400">Faça login para acessar sua lista</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
         
          {/* Campo de Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              id="email"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="seu@email.com"
              value={email} // O valor do input é o estado 'email'
              onChange={(e) => setEmail(e.target.value)} // Quando o usuário digita, atualiza o estado
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
              value={password} // O valor do input é o estado 'password'
              onChange={(e) => setPassword(e.target.value)} // Quando o usuário digita, atualiza o estado
            />
          </div>

          <div className="text-right mb-6">
                    <Link to="/forgot-password" className="text-sm text-gray-400 hover:underline">
                        Esqueceu a senha?
                    </Link>
           </div>

          {/* Botão de Login */}
          <button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Entrar
          </button>
        </form>

        {/* Exibe mensagem de erro se houver */}
        {error && (
            <p className="text-red-500 text-center mt-4">{error}</p>
        )}
        
        {/* Link para se registrar */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-green-400 hover:underline">
            Registre-se
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;