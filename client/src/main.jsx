// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

// Importações
import RootLayout from './layouts/RootLayout';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const router = createBrowserRouter([
  {
    // A rota "pai" agora é o nosso layout
    path: "/",
    element: <RootLayout />,
    // As páginas são "filhas" do layout e serão renderizadas dentro do <Outlet>
    children: [
      {
        index: true, // A rota "/" exata renderizará o App (nossa futura Home)
        element: <App />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/register",
        element: <RegisterPage />
      },
      // Adicione aqui a rota para a lista de jogos no futuro
      // {
      //   path: "/minha-lista",
      //   element: <MyListPage />
      // }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);