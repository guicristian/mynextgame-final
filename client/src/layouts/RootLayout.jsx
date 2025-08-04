// client/src/layouts/RootLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function RootLayout() {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />
      <main>
        {/* O <Outlet> é onde o React Router irá renderizar a página da rota atual (Login, Home, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;