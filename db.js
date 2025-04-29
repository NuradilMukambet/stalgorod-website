const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stalgorod_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Функции для работы с пользователями
const userModel = {
    // Создание нового пользователя
    async createUser(username, email, passwordHash) {
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        return result.insertId;
    },

    // Получение пользователя по email
    async getUserByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    // Получение пользователя по username
    async getUserByUsername(username) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    },

    // Обновление информации о пользователе
    async updateUser(userId, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), userId];
        
        await pool.execute(
            `UPDATE users SET ${fields} WHERE id = ?`,
            values
        );
    },

    // Получение игр пользователя
    async getUserGames(userId) {
        const [rows] = await pool.execute(
            'SELECT * FROM user_games WHERE user_id = ?',
            [userId]
        );
        return rows;
    },

    // Добавление игры пользователю
    async addUserGame(userId, gameName) {
        const [result] = await pool.execute(
            'INSERT INTO user_games (user_id, game_name) VALUES (?, ?)',
            [userId, gameName]
        );
        return result.insertId;
    },

    // Обновление прогресса игры
    async updateGameProgress(gameId, progress) {
        await pool.execute(
            'UPDATE user_games SET progress = ?, last_played = CURRENT_TIMESTAMP WHERE id = ?',
            [progress, gameId]
        );
    },

    // Получение статистики игры
    async getGameStats(userId, gameId) {
        const [rows] = await pool.execute(
            'SELECT * FROM game_stats WHERE user_id = ? AND game_id = ?',
            [userId, gameId]
        );
        return rows[0];
    },

    // Обновление статистики игры
    async updateGameStats(userId, gameId, stats) {
        const fields = Object.keys(stats).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(stats), userId, gameId];
        
        await pool.execute(
            `UPDATE game_stats SET ${fields} WHERE user_id = ? AND game_id = ?`,
            values
        );
    },

    // Получение достижений пользователя
    async getUserAchievements(userId) {
        const [rows] = await pool.execute(
            `SELECT a.*, ua.earned_at 
             FROM achievements a 
             JOIN user_achievements ua ON a.id = ua.achievement_id 
             WHERE ua.user_id = ?`,
            [userId]
        );
        return rows;
    }
};

module.exports = {
    pool,
    userModel
}; 