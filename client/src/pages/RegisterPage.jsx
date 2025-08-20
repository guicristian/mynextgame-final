// client/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            await register(email, password);
            setSuccess('Conta criada com sucesso! Você será redirecionado para o login.');
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Espera 2 segundos antes de redirecionar
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar conta.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-2">
                        <i className="fas fa-gamepad text-3xl text-green-500 mr-3"></i> 
                        <h1 className="text-3xl font-bold text-green-500">Criar Conta</h1>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* Campos de email e senha (similares ao LoginPage) */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Senha</label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                        Registrar
                    </button>
                </form>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                {success && <p className="text-green-500 text-center mt-4">{success}</p>}
                <p className="text-center text-gray-400 text-sm mt-6">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-green-400 hover:underline">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;