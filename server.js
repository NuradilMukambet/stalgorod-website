const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const host = '0.0.0.0'; // Разрешаем подключения с любых IP

// Middleware
app.use(bodyParser.json());
app.use(express.static('.'));

// Разрешаем CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Создание базы данных
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the users database.');
});

// Создание таблицы пользователей
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Обработка регистрации
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Вставка пользователя в базу данных
        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        return res.status(400).json({ 
                            error: 'Пользователь с таким именем или email уже существует' 
                        });
                    }
                    return res.status(500).json({ error: 'Ошибка сервера' });
                }
                res.json({ 
                    success: true, 
                    message: 'Регистрация успешна',
                    userId: this.lastID 
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Запуск сервера
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
    console.log('You can access the server from other computers in your network');
}); 