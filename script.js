import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Конфигурация Firebase
const firebaseConfig = {
    // Здесь должны быть ваши реальные данные конфигурации Firebase
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const heroes = [
    'Описание героя 1',
    'Описание героя 2',
    'Описание героя 3',
    'Описание героя 4',
    'Описание героя 5',
    'Описание героя 6',
    'Описание героя 7',
    'Описание героя 8',
    'Описание героя 9',
    'Описание героя 10',
    'Описание героя 11',
    'Описание героя 12'
];

// Обработчик мобильного меню
document.querySelector('.mobile-menu-button').addEventListener('click', () => {
    document.querySelector('.nav').classList.toggle('active');
});

// Универсальные функции для работы с модальными окнами
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Обработчики для модального окна регистрации
document.querySelector('.register-button').addEventListener('click', () => showModal('registration-modal'));
document.querySelector('.close-btn').addEventListener('click', () => hideModal('registration-modal'));

// Обработчики для героев
document.querySelectorAll('.hero').forEach(hero => {
    hero.addEventListener('click', () => {
        const heroId = hero.dataset.hero;
        showHeroDescription(heroId);
    });
});

function showHeroDescription(heroId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'hero-modal';
    
    const content = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <img src="img/${heroId}.jpg" alt="Герой ${heroId}">
            <h3>Герой ${heroId}</h3>
            <p>${heroes[heroId - 1]}</p>
        </div>
    `;
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    modal.querySelector('.close-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Функция для обновления стрелок часов
function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    const secondDegrees = ((seconds / 60) * 360) + 90;
    const minuteDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
    const hourDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;

    const secondHand = document.querySelector('.second-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const hourHand = document.querySelector('.hour-hand');

    if (secondHand) secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    if (minuteHand) minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
    if (hourHand) hourHand.style.transform = `rotate(${hourDegrees}deg)`;
}

// Функция для обновления обратного отсчета
function updateCountdown() {
    const targetDate = new Date('2025-05-26T00:00:00').getTime();
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
        document.getElementById('countdown-timer').innerHTML = '<span class="countdown-digit">Игра уже вышла!</span>';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Валидация формы регистрации
function validateForm() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    let isValid = true;
    const errors = [];

    if (username.length < 3) {
        errors.push('Имя пользователя должно содержать минимум 3 символа');
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push('Введите корректный email адрес');
        isValid = false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        errors.push('Пароль должен содержать минимум 8 символов, включая буквы и цифры');
        isValid = false;
    }

    if (password !== confirmPassword) {
        errors.push('Пароли не совпадают');
        isValid = false;
    }

    const errorContainer = document.getElementById('error-container');
    if (!isValid) {
        errorContainer.innerHTML = errors.map(error => `<p class="error">${error}</p>`).join('');
        errorContainer.style.display = 'block';
    } else {
        errorContainer.style.display = 'none';
    }

    return isValid;
}

// Отправка формы регистрации
async function submitRegistration(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Регистрация...';

    try {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await addDoc(collection(db, "users"), {
            uid: userCredential.user.uid,
            username: username,
            email: email,
            createdAt: new Date()
        });

        showNotification('Регистрация успешно завершена!', 'success');
        hideModal('registration-modal');
        document.getElementById('registration-form').reset();
    } catch (error) {
        let errorMessage = 'Произошла ошибка при регистрации';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Этот email уже зарегистрирован';
        }
        showNotification(errorMessage, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Уведомления
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Восстановление выбранного языка
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
        updatePageLanguage(savedLanguage);
    }
    
    // Проверка существования изображений
    document.querySelectorAll('img').forEach(img => {
        checkImageExists(img.src).then(exists => {
            if (!exists) {
                img.src = 'img/placeholder.jpg';
            }
        });
    });
});

// Проверка существования изображения
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Функционал переключения языков
const languageButtons = document.querySelectorAll('.language-button');
const currentLanguage = localStorage.getItem('language') || 'ru';

// Установка начального языка
document.documentElement.lang = currentLanguage;
document.querySelector(`.language-button[data-lang="${currentLanguage}"]`).classList.add('active');

// Обработчики для кнопок переключения языка
languageButtons.forEach(button => {
    button.addEventListener('click', () => {
        const lang = button.dataset.lang;
        
        // Удаляем активный класс у всех кнопок
        languageButtons.forEach(btn => btn.classList.remove('active'));
        // Добавляем активный класс выбранной кнопке
        button.classList.add('active');
        
        // Сохраняем выбранный язык
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        
        // Здесь можно добавить логику для изменения текста на странице
        updatePageLanguage(lang);
    });
});

// Функция для обновления текста на странице
function updatePageLanguage(lang) {
    const translations = {
        ru: {
            'nav-home': 'Главная',
            'nav-about': 'О нас',
            'nav-contact': 'Контакты',
            'btn-login': 'Войти',
            'btn-register': 'Регистрация'
        },
        en: {
            'nav-home': 'Home',
            'nav-about': 'About',
            'nav-contact': 'Contact',
            'btn-login': 'Login',
            'btn-register': 'Register'
        }
    };

    // Обновляем текст на странице
    Object.keys(translations[lang]).forEach(key => {
        const elements = document.querySelectorAll(`[data-translate="${key}"]`);
        elements.forEach(element => {
            element.textContent = translations[lang][key];
        });
    });
}

// Инициализация языка при загрузке страницы
updatePageLanguage(currentLanguage);

// Добавляем обработчик скролла
window.addEventListener('scroll', handleScrollAnimation);

// Функционал модального окна регистрации
const registrationModal = document.querySelector('.registration-modal');
const btnRegister = document.querySelector('.btn-register');
const closeRegistration = document.querySelector('.close-registration');

// Открытие модального окна при нажатии на кнопку регистрации
btnRegister.addEventListener('click', (e) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    registrationModal.classList.add('active');
});

// Закрытие модального окна
closeRegistration.addEventListener('click', () => {
    registrationModal.classList.remove('active');
});

// Закрытие модального окна при клике вне его
window.addEventListener('click', (e) => {
    if (e.target === registrationModal) {
        registrationModal.classList.remove('active');
    }
});

// Обработка отправки формы регистрации
const registrationForm = document.querySelector('.registration-form');
registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Здесь можно добавить логику обработки регистрации
    registrationModal.classList.remove('active');
});

// Функции для работы с модальным окном регистрации
function openRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    modal.style.display = 'block';
}

function closeRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    modal.style.display = 'none';
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('registration-modal');
    if (event.target === modal) {
        closeRegistrationModal();
    }
}

// Обработка отправки формы регистрации
function submitRegistration(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        document.getElementById('error-container').innerHTML = 'Пароли не совпадают';
        return;
    }
    
    // Здесь можно добавить логику отправки данных на сервер
    console.log('Регистрация:', { username, email, password });
    
    // Закрываем модальное окно после успешной регистрации
    closeRegistrationModal();
}

// Функция для перевода контента
function translateContent(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// Обработчики для кнопок перевода
document.querySelectorAll('.language-button').forEach(button => {
    button.addEventListener('click', () => {
        const lang = button.getAttribute('data-lang');
        translateContent(lang);
        
        // Сохраняем выбранный язык
        localStorage.setItem('language', lang);
        
        // Обновляем активную кнопку
        document.querySelectorAll('.language-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    });
});

// При загрузке страницы устанавливаем сохраненный язык
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'ru';
    translateContent(savedLang);
    
    // Устанавливаем активную кнопку
    document.querySelectorAll('.language-button').forEach(button => {
        if (button.getAttribute('data-lang') === savedLang) {
            button.classList.add('active');
        }
    });
});
