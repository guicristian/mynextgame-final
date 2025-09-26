// client/src/layouts/RootLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function RootLayout() {
  return (

    <div 
      className="min-h-screen bg-cover bg-center bg-fixed" 
      style={{ backgroundImage: "url('/images/background.jpg')" }} 
    >
      {/* Adicionamos uma camada semi-transparente para melhorar a legibilidade do conteúdo */}
      <div className="min-h-screen bg-black bg-opacity-60">
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default RootLayout;