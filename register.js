document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorContainer = document.getElementById('error-container');

    // Очистка предыдущих ошибок
    errorContainer.innerHTML = '';
    errorContainer.className = '';

    // Валидация
    if (password !== confirmPassword) {
        showError('Пароли не совпадают');
        return;
    }

    if (password.length < 6) {
        showError('Пароль должен содержать минимум 6 символов');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка регистрации');
        }

        // Сохраняем токен
        localStorage.setItem('token', data.token);
        
        // Перенаправляем на страницу профиля
        window.location.href = 'profile.html';

    } catch (error) {
        showError(error.message);
    }
});

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = message;
    errorContainer.className = 'error-message';
} 