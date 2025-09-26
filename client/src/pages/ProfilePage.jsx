// client/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Componente para um card de estatística reutilizável
const StatCard = ({ title, value, icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
        <i className={`${icon} text-3xl text-green-400`}></i>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

function ProfilePage() {
    const { userId } = useParams(); // Pega o ID do usuário da URL
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/api/profile/${userId}`);
                setProfileData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Erro ao carregar perfil.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (isLoading) {
        return <div className="text-center p-10">Carregando perfil...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    if (!profileData) return null;

    // Prepara os dados para os gráficos
    const statusData = Object.entries(profileData.charts.gamesByStatus).map(([name, value]) => ({ name, value }));
    const platformData = Object.entries(profileData.charts.gamesByPlatform).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

    return (
        <div className="container mx-auto p-4 md:p-6 text-white">
            <header className="mb-8">
                <h1 className="text-4xl font-bold">Perfil Gamer</h1>
                <p className="text-lg text-gray-400">{profileData.user.email}</p>
            </header>

            {/* Seção de Estatísticas Chave */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Total de Jogos" value={profileData.stats.totalGames} icon="fas fa-gamepad" />
                <StatCard title="Horas Totais" value={`${profileData.stats.totalHours}h`} icon="fas fa-hourglass-half" />
                <StatCard title="Jogos Zerados" value={profileData.stats.totalCompleted} icon="fas fa-check-circle" />
                <StatCard title="Platinados" value={profileData.stats.totalPlatinated} icon="fas fa-trophy" />
            </section>

            {/* Seção de Gráficos (Dashboard) */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Status */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Jogos por Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico de Plataformas */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Jogos por Plataforma</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={platformData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis type="number" stroke="#A0AEC0"/>
                            <YAxis type="category" dataKey="name" width={80} stroke="#A0AEC0"/>
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}}/>
                            <Bar dataKey="value" fill="#00C49F" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
}

export default ProfilePage;