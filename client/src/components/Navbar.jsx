// client/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-500 hover:text-green-400 transition">
          <i className="fas fa-gamepad mr-2"></i> 
          MyNextGame
        </Link>

        {/* Links de Navegação */}
        <ul className="flex items-center space-x-6">
          <li>
            <Link to="/minha-lista" className="hover:text-green-400 transition">
              Minha Lista
            </Link>
          </li>
          <li>
            <Link to="/login" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition">
              Login
            </Link>
          </li>
        </ul>

      </nav>
    </header>
  );
}

export default Navbar;