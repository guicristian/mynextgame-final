// client/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import zxcvbn from 'zxcvbn'; // Importa a biblioteca de força de senha

function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    
    // Estados do formulário
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Novos estados para a validação da senha
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        uppercase: false,
        specialChar: false,
    });
    
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // useEffect para analisar a senha em tempo real
    useEffect(() => {
        // Analisa a força com zxcvbn (ela retorna uma pontuação de 0 a 4)
        const strengthResult = zxcvbn(password);
        setPasswordStrength(strengthResult.score);

        // Verifica os requisitos específicos
        setPasswordChecks({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]); // Roda toda vez que a senha muda

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        // Validações antes do envio
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.specialChar) {
            setError('A senha não atende a todos os requisitos de segurança.');
            return;
        }

        try {
            await register(username, email, password);
            setSuccess('Conta criada com sucesso! Você será redirecionado para o login.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar conta.');
        }
    };

    // Função para determinar a cor e a largura da barra de força
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
                    <h1 className="text-3xl font-bold text-green-400">Criar sua conta</h1>
                    <p className="text-gray-400 mt-2">Crie uma senha forte para proteger seus jogos!</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campos de Nome de usuário e Email (sem alterações) */}
                    <div className="relative">
                        <i className="fas fa-user absolute top-3 left-4 text-gray-400"></i>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nome de usuário" className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>
                    <div className="relative">
                         <i className="fas fa-envelope absolute top-3 left-4 text-gray-400"></i>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>

                    {/* Campo Senha com a Barra de Força */}
                    <div>
                        <div className="relative">
                            <i className="fas fa-lock absolute top-3 left-4 text-gray-400"></i>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                        </div>
                        {/* Barra de Força */}
                        {password.length > 0 && (
                            <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
                                <div className={`h-1.5 rounded-full transition-all duration-300 ${strengthBarProps.color}`} style={{ width: strengthBarProps.width }}></div>
                            </div>
                        )}
                    </div>
                    
                    {/* Campo Confirmar Senha */}
                    <div className="relative">
                        <i className="fas fa-lock absolute top-3 left-4 text-gray-400"></i>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar senha" className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>

                    {/* Checklist de Requisitos da Senha */}
                    <div className="text-xs text-gray-400 space-y-1">
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
                        Criar conta
                    </button>
                </form>

                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                {success && <p className="text-green-500 text-center mt-4">{success}</p>}
                
                <p className="text-center text-gray-400 text-sm mt-6">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-green-400 hover:underline font-semibold">Entrar</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;