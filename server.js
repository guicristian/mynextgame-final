// =================================================================
// 1. IMPORTAÇÕES
// =================================================================
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

// =================================================================
// 2. CONFIGURAÇÕES INICIAIS
// =================================================================
const app = express();
const PORT = process.env.PORT || 5000; // Usa a porta do ambiente ou 5000
const connectionString = process.env.MONGO_URI;

// =================================================================
// 3. MIDDLEWARES (Plugins do Servidor)
// =================================================================
// Configuração do CORS para permitir que o frontend (rodando em outra porta) se comunique com o backend
app.use(cors({
    origin: 'http://localhost:5173', // Endereço do nosso frontend em desenvolvimento (Vite)
    credentials: true, // Essencial para permitir o envio de cookies
}));
app.use(express.json()); // Permite que o servidor entenda JSON
app.use(cookieParser()); // Permite que o servidor leia cookies das requisições

// =================================================================
// 4. CONEXÃO COM O BANCO DE DADOS
// =================================================================
let db;
const client = new MongoClient(connectionString);

client.connect()
    .then(() => {
        console.log('✅ Conectado ao MongoDB Atlas');
        db = client.db('mynextgame-db'); // Define o nome do nosso banco de dados
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
    const token = req.cookies.token; // Pega o token do cookie
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona os dados do usuário (ex: userId) à requisição
        next(); // Permite que a requisição continue para a rota protegida
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
};

// =================================================================
// 6. ROTAS DA API
// =================================================================

app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios.' });

        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Este email já está em uso.' });

        const hashedPassword = await bcrypt.hash(password, 12);
        await db.collection('users').insertOne({ email, password: hashedPassword });
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

// --- Rotas de Jogos (Protegidas pelo Middleware verifyToken) ---
app.get('/api/games', verifyToken, async (req, res) => {
    try {
        // Busca apenas os jogos cujo userId corresponde ao do usuário logado
        const games = await db.collection('games').find({ userId: new ObjectId(req.user.userId) }).toArray();
        res.json(games);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar jogos.' });
    }
});

app.post('/api/games', verifyToken, async (req, res) => {
    try {
        const newGame = req.body;
        // Adiciona o ID do usuário logado ao novo jogo antes de salvar
        newGame.userId = new ObjectId(req.user.userId);
        await db.collection('games').insertOne(newGame);
        res.status(201).json({ message: 'Jogo adicionado com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao adicionar jogo.' });
    }
});

// --- Rota Proxy para a RAWG (Protegida) ---
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