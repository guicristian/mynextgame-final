// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import './index.css';

// Importações
import RootLayout from './layouts/RootLayout.jsx';
import App from './App.jsx';//home
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MyListPage from './pages/MyListPage.jsx';


const router = createBrowserRouter([
  {
    // A rota "pai" agora é o nosso layout
    path: "/",
    element: <RootLayout />,
    // As páginas são "filhas" do layout e serão renderizadas dentro do <Outlet>
    children: [
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/register",
        element: <RegisterPage />
      },
      {
        element: <ProtectedRoute />, // O "segurança" fica aqui
        children: [
          {
            index: true, // A rota "/" exata agora está protegida
            element: <App />
          },
          {
            path: "/minha-lista", 
            element: <MyListPage />
          }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos tudo com o AuthProvider */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);