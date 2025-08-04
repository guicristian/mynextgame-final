
import React, { useState } from 'react'; // Adiciona o useState
import { Link, useNavigate } from 'react-router-dom'; // Adiciona o useNavigate


function LoginPage() {

const navigate = useNavigate(); 

    // Cria um "estado" para cada campo do formulário e para a mensagem de erro
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); 

    const handleSubmit = async (event) => {
    event.preventDefault(); // Impede o recarregamento padrão da página
    setError(null); // Limpa erros antigos

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Não foi possível fazer o login.');
        }

        navigate('/');

    } catch (err) {
        setError(err.message);
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