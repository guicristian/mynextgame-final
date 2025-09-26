// =================================================================
// 1. IMPORTAÇÕES
// =================================================================
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

// =================================================================
// 2. CONFIGURAÇÕES INICIAIS
// =================================================================
const app = express();
const PORT = process.env.PORT || 5000; // Usa a porta do ambiente ou 5000
const connectionString = process.env.MONGO_URI;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =================================================================
// 3. MIDDLEWARES (Plugins do Servidor)
// =================================================================
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, 
}));
app.use(express.json()); 
app.use(cookieParser()); 

// =================================================================
// 4. CONEXÃO COM O BANCO DE DADOS
// =================================================================
let db;
const client = new MongoClient(connectionString);

client.connect()
    .then(() => {
        console.log('✅ Conectado ao MongoDB Atlas');
        db = client.db('mynextgame-db'); 
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erro ao conectar ao MongoDB Atlas');
        console.error(err);
        process.exit(1);
    });

// =================================================================
// 5. MIDDLEWARE DE VERIFICAÇÃO DE TOKEN (O "Segurança" da API)
// =================================================================
const verifyToken = (req, res, next) => {
    const token = req.cookies.token; 
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
};

// =================================================================
// 6. ROTAS DA API
// =================================================================

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Nome de usuário, email e senha são obrigatórios.' });
        }
        const existingEmail = await db.collection('users').findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Este email já está em uso.' });
        }
        const existingUsername = await db.collection('users').findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Este nome de usuário já está em uso.' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        await db.collection('users').insertOne({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao registrar.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios.' });

        const user = await db.collection('users').findOne({ email });
        if (!user) return res.status(400).json({ message: 'Credenciais inválidas.' });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Credenciais inválidas.' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000 // 8 horas em milissegundos
        }).json({ message: 'Login bem-sucedido!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao fazer login.' });
    }
});

app.post('/api/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.status(200).json({ message: 'Logout bem-sucedido.' });
});

// ROTA PARA SOLICITAR A REDEFINIÇÃO DE SENHA
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            // Respondemos com sucesso mesmo se o email não existir para não revelar quais emails estão cadastrados
            return res.status(200).json({ message: 'Se um usuário com este email existir, um link de redefinição será enviado.' });
        }

        // Cria um token de redefinição com validade de 15 minutos
        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Envia o e-mail
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Redefinição de Senha - MyNextGame',
            html: `
                <p>Você solicitou uma redefinição de senha.</p>
                <p>Clique neste link para criar uma nova senha (válido por 15 minutos):</p>
                <a href="http://localhost:5173/reset-password/${resetToken}">Redefinir Senha</a>
            `
        });

        res.status(200).json({ message: 'Se um usuário com este email existir, um link de redefinição será enviado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// ROTA PARA EFETIVAMENTE REDEFINIR A SENHA
app.post('/api/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Verifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' });
        }

        // Criptografa a nova senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Atualiza a senha do usuário no banco de dados
        await db.collection('users').updateOne(
            { _id: new ObjectId(decoded.userId) },
            { $set: { password: hashedPassword } }
        );

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });
    } catch (error) {
        console.error(error);
        // Se o erro for de token expirado, envia uma mensagem clara
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Token expirado. Por favor, solicite um novo link.' });
        }
        res.status(500).json({ message: 'Erro no servidor ao redefinir a senha.' });
    }
});

//// Rotas Post Banco ////
app.post('/api/games', verifyToken, async (req, res) => {
    try {
        const {
            name,
            cover,
            rawgId,
            platform,
            status,
            rating,
            hoursPlayed,
            review,
            priority,
            startDate,
            endDate
        } = req.body;

        const newGame = {
            userId: new ObjectId(req.user.userId),
            addedAt: new Date(),
            name,
            cover,
            rawgId,
            platform,
            status,
            rating: Number(rating) || 0,
            hoursPlayed: Number(hoursPlayed) || 0,
            review,
            priority,
            startDate: startDate || null,
            endDate: endDate || null
        };
        
        await db.collection('games').insertOne(newGame);
        res.status(201).json({ message: 'Jogo adicionado com sucesso!' });
    } catch (err) {
        console.error("Erro ao adicionar jogo:", err);
        res.status(500).json({ message: 'Erro ao adicionar jogo.' });
    }
});

app.put('/api/games/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const filter = { _id: new ObjectId(id), userId: new ObjectId(req.user.userId) };
        
        const updateDoc = {
            $set: {
                platform: updates.platform,
                status: updates.status,
                hoursPlayed: Number(updates.hoursPlayed) || 0,
                rating: Number(updates.rating) || 0,
                review: updates.review,
                priority: updates.priority,
                startDate: updates.startDate || null,
                endDate: updates.endDate || null
            },
        };

        const result = await db.collection('games').updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Jogo não encontrado ou usuário não autorizado.' });
        }
        res.status(200).json({ message: 'Jogo atualizado com sucesso.' });
    } catch (err) {
        console.error("Erro ao atualizar jogo:", err);
        res.status(500).json({ message: 'Erro ao atualizar jogo.' });
    }
});

// Rota para DELETAR um jogo
app.delete('/api/games/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('games').deleteOne({
            _id: new ObjectId(id),
            userId: new ObjectId(req.user.userId) 
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Jogo não encontrado ou usuário não autorizado para deletar.' });
        }
        res.status(200).json({ message: 'Jogo deletado com sucesso.' });
    } catch (err) {

        console.error("Erro ao deletar jogo:", err);
        res.status(500).json({ message: 'Erro ao deletar jogo.' });
    }
});

/// ROTAS GET BANCO ///

// ROTA PARA BUSCAR DADOS DO PERFIL PÚBLICO E DASHBOARD
app.get('/api/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID de usuário inválido.' });
        }

        // 1. Buscar informações básicas do usuário
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } }); // Projeção para não enviar a senha
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // 2. Buscar todos os jogos deste usuário
        const games = await db.collection('games').find({ userId: new ObjectId(userId) }).toArray();

        // 3. Calcular as estatísticas no servidor
        const totalGames = games.length;
        const totalHours = games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0);
        const totalCompleted = games.filter(g => g.status === 'Zerado').length;
        const totalPlatinated = games.filter(g => g.status === 'Platinado').length;

        // 4. Preparar dados para os gráficos
        const gamesByStatus = games.reduce((acc, game) => {
            const status = game.status || 'Sem Status';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const gamesByPlatform = games.reduce((acc, game) => {
            const platform = game.platform || 'Não definida';
            if (platform.trim() !== '') {
                acc[platform] = (acc[platform] || 0) + 1;
            }
            return acc;
        }, {});

        // 5. Montar o objeto de resposta final
        const profileData = {
            user: {
                email: user.email,
                // Futuramente, podemos adicionar username, avatar, etc.
            },
            stats: {
                totalGames,
                totalHours,
                totalCompleted,
                totalPlatinated
            },
            charts: {
                gamesByStatus,
                gamesByPlatform,
            }
        };

        res.json(profileData);

    } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        res.status(500).json({ message: 'Erro no servidor ao buscar dados do perfil.' });
    }
});

app.get('/api/games', verifyToken, async (req, res) => {
    try {
        // Busca apenas os jogos cujo userId corresponde ao do usuário logado
        const games = await db.collection('games').find({ userId: new ObjectId(req.user.userId) }).toArray();
        res.json(games);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar jogos.' });
    }
});


// Rotas RAWG ///

// Rota para buscar detalhes de um jogo específico da RAWG API
app.get('/api/rawg/games/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error("Erro ao buscar detalhes do jogo na RAWG:", error);
        res.status(500).json({ message: 'Erro ao buscar detalhes do jogo na RAWG.' });
    }
});

// Rota para buscar jogos na API da RAWG com base em uma query de pesquisa
app.get('/api/search-rawg/:query', verifyToken, async (req, res) => {
    try {
        const { query } = req.params;
        const response = await axios.get('https://api.rawg.io/api/games', {
            params: { key: process.env.RAWG_API_KEY, search: query, page_size: 5 }
        });
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar na API da RAWG.' });
    }
});

// Rota para buscar os jogos mais populares (melhores notas no Metacritic)
app.get('/api/rawg/popular', verifyToken, async (req, res) => {
    try {
        const response = await axios.get('https://api.rawg.io/api/games', {
            params: {
                key: process.env.RAWG_API_KEY,
                ordering: '-metacritic', // Ordena por Metacritic, do maior para o menor
                page_size: 10 // Pega os 10 melhores
            }
        });
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar jogos populares na RAWG.' });
    }
});

// Rota para buscar lançamentos recentes (últimos 3 meses)
app.get('/api/rawg/recent', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        // Formata as datas para YYYY-MM-DD
        const formattedToday = today.toISOString().split('T')[0];
        const formattedThreeMonthsAgo = threeMonthsAgo.toISOString().split('T')[0];
        
        const response = await axios.get('https://api.rawg.io/api/games', {
            params: {
                key: process.env.RAWG_API_KEY,
                dates: `${formattedThreeMonthsAgo},${formattedToday}`, // Filtra por um intervalo de datas
                ordering: '-released', // Ordena por data de lançamento
                page_size: 10
            }
        });
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar lançamentos recentes na RAWG.' });
    }
});

// Rota para buscar vencedores do GOTY (proxy para jogos aclamados do último ano)
app.get('/api/rawg/goty', verifyToken, async (req, res) => {
    try {
        const lastYear = new Date().getFullYear() - 1;
        const response = await axios.get('https://api.rawg.io/api/games', {
            params: {
                key: process.env.RAWG_API_KEY,
                dates: `${lastYear}-01-01,${lastYear}-12-31`, // Filtra pelo ano anterior
                ordering: '-metacritic',
                page_size: 5 // Pega os 5 mais bem avaliados do ano anterior
            }
        });
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar vencedores do GOTY na RAWG.' });
    }
});

// ROTA PARA VERIFICAR O TOKEN E RETORNAR DADOS DO USUÁRIO
app.get('/api/verify-token', verifyToken, (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).json(req.user);
});

