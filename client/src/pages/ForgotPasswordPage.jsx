// client/src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await api.post('/api/forgot-password', { email });
            setMessage(response.data.message);
        } catch {
            setMessage('Ocorreu um erro. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-4">Esqueceu a Senha?</h1>
                <p className="text-gray-400 text-center mb-8">Digite seu e-mail para receber um link de redefinição.</p>
                <form onSubmit={handleSubmit}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Seu e-mail" className="w-full p-3 bg-gray-700 rounded mb-6" required />
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">Enviar Link</button>
                </form>
                {message && <p className="text-center mt-4 text-green-400">{message}</p>}
                <p className="text-center mt-6"><Link to="/login" className="text-gray-400 hover:underline">Voltar para o Login</Link></p>
            </div>
        </div>
    );
}
export default ForgotPasswordPage;