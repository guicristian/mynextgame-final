// client/src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import zxcvbn from 'zxcvbn'; // Importa a biblioteca de força de senha

function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    // Estados do formulário
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Estados para validação de senha (reutilizados da página de registro)
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        uppercase: false,
        specialChar: false,
    });
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // useEffect para analisar a senha em tempo real
    useEffect(() => {
        const strengthResult = zxcvbn(password);
        setPasswordStrength(strengthResult.score);

        setPasswordChecks({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validações antes de enviar
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.specialChar) {
            setError('A nova senha não atende a todos os requisitos de segurança.');
            return;
        }

        try {
            const response = await api.post(`/api/reset-password/${token}`, { password });
            setMessage(response.data.message + ' Você será redirecionado para o login em 3 segundos.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao redefinir a senha.');
        }
    };

    // Função para a barra de força (reutilizada da página de registro)
    const getStrengthBarProps = () => {
        switch (passwordStrength) {
            case 0: return { width: '20%', color: 'bg-red-500' };
            case 1: return { width: '40%', color: 'bg-red-500' };
            case 2: return { width: '60%', color: 'bg-yellow-500' };
            case 3: return { width: '80%', color: 'bg-green-500' };
            case 4: return { width: '100%', color: 'bg-green-500' };
            default: return { width: '0%', color: 'bg-gray-700' };
        }
    };
    
    const strengthBarProps = getStrengthBarProps();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-green-400">Crie uma Nova Senha</h1>
                    <p className="text-gray-400 mt-2">Sua nova senha deve ser forte e segura.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo Nova Senha com a Barra de Força */}
                    <div>
                        <div className="relative">
                            <i className="fas fa-lock absolute top-3 left-4 text-gray-400"></i>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="Nova senha"
                                className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                                required 
                            />
                        </div>
                        {password.length > 0 && (
                            <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
                                <div className={`h-1.5 rounded-full transition-all duration-300 ${strengthBarProps.color}`} style={{ width: strengthBarProps.width }}></div>
                            </div>
                        )}
                    </div>
                    
                    {/* Campo Confirmar Nova Senha */}
                    <div className="relative">
                        <i className="fas fa-lock absolute top-3 left-4 text-gray-400"></i>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            placeholder="Confirme a nova senha"
                            className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                            required 
                        />
                    </div>

                    {/* Checklist de Requisitos da Senha */}
                    <div className="text-xs text-gray-400 space-y-1 pt-2">
                        <p className={passwordChecks.length ? 'text-green-400' : ''}>
                            <i className={`fas ${passwordChecks.length ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                            Pelo menos 8 caracteres
                        </p>
                        <p className={passwordChecks.uppercase ? 'text-green-400' : ''}>
                            <i className={`fas ${passwordChecks.uppercase ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                            Uma letra maiúscula
                        </p>
                        <p className={passwordChecks.specialChar ? 'text-green-400' : ''}>
                            <i className={`fas ${passwordChecks.specialChar ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                            Um caractere especial (!, @, #, etc.)
                        </p>
                    </div>

                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                        Redefinir Senha
                    </button>
                </form>

                {message && <p className="text-center mt-4 text-green-400">{message}</p>}
                {error && <p className="text-center mt-4 text-red-500">{error}</p>}
            </div>
        </div>
    );
}

export default ResetPasswordPage;