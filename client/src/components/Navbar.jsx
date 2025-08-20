// client/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useAuth(); // Pega o usuário e a função de logout
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redireciona para o login após o logout
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-green-500 hover:text-green-400 transition">
          <i className="fas fa-gamepad mr-2"></i> 
          MyNextGame
        </Link>

        <ul className="flex items-center space-x-6">
          {/* Renderização Condicional: muda o que é exibido com base no login */}
          {user ? (
            <>
              <li>
                <Link to="/minha-lista" className="hover:text-green-400 transition">
                  Minha Lista
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Olá, {user.email}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition">
                  Sair
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition">
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;