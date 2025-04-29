// Проверка авторизации
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        await loadUserProfile();
        await loadRecentGames();
        await loadRecentAchievements();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError('Не удалось загрузить данные профиля');
    }
});

// Загрузка профиля пользователя
async function loadUserProfile() {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки профиля');
        }

        const data = await response.json();
        
        // Обновление информации на странице
        document.getElementById('username').textContent = data.username;
        document.getElementById('user-email').textContent = data.email;
        document.getElementById('member-since').textContent = `Участник с: ${new Date(data.created_at).toLocaleDateString()}`;
        document.getElementById('user-avatar').src = data.avatar_url || 'img/default-avatar.png';
        document.getElementById('total-play-time').textContent = `${Math.floor(data.total_play_time / 60)} часов`;
        document.getElementById('achievements-count').textContent = `${data.achievements_count}/100`;
        document.getElementById('user-level').textContent = calculateLevel(data.total_play_time);
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        throw error;
    }
}

// Загрузка недавних игр
async function loadRecentGames() {
    try {
        const response = await fetch('/api/profile/games', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки игр');
        }

        const games = await response.json();
        const gamesGrid = document.getElementById('recent-games');
        
        games.forEach(game => {
            const gameCard = createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });
    } catch (error) {
        console.error('Ошибка загрузки игр:', error);
        throw error;
    }
}

// Загрузка недавних достижений
async function loadRecentAchievements() {
    try {
        const response = await fetch('/api/profile/achievements', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки достижений');
        }

        const achievements = await response.json();
        const achievementsGrid = document.getElementById('recent-achievements');
        
        achievements.forEach(achievement => {
            const achievementCard = createAchievementCard(achievement);
            achievementsGrid.appendChild(achievementCard);
        });
    } catch (error) {
        console.error('Ошибка загрузки достижений:', error);
        throw error;
    }
}

// Создание карточки игры
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
        <img src="${game.image_url || 'img/default-game.png'}" alt="${game.game_name}">
        <h3>${game.game_name}</h3>
        <p>Прогресс: ${game.progress}%</p>
        <p>Последний запуск: ${new Date(game.last_played).toLocaleDateString()}</p>
    `;
    return card;
}

// Создание карточки достижения
function createAchievementCard(achievement) {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.innerHTML = `
        <img src="${achievement.icon_url || 'img/default-achievement.png'}" alt="${achievement.name}">
        <h3>${achievement.name}</h3>
        <p>${achievement.description}</p>
        <p>Получено: ${new Date(achievement.earned_at).toLocaleDateString()}</p>
    `;
    return card;
}

// Расчет уровня игрока
function calculateLevel(playTime) {
    // Простая формула для расчета уровня
    return Math.floor(Math.sqrt(playTime / 60)) + 1;
}

// Обработчик изменения аватара
document.getElementById('change-avatar').addEventListener('click', async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            
            try {
                const response = await fetch('/api/profile/avatar', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки аватара');
                }

                const data = await response.json();
                document.getElementById('user-avatar').src = data.avatar_url;
            } catch (error) {
                console.error('Ошибка загрузки аватара:', error);
                showError('Не удалось загрузить аватар');
            }
        }
    };
    
    input.click();
});

// Обработчик выхода
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

// Функция отображения ошибок
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
} 