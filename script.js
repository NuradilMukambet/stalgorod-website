import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const heroesCircle = document.getElementById('heroes-circle');

// Получаем элементы для модального окна
const registrationModal = document.getElementById('registration-modal');
const openRegistrationBtn = document.querySelector('.open-registration');
const closeRegistrationBtn = document.querySelector('.close-btn');

// Функция для открытия модального окна
openRegistrationBtn.addEventListener('click', function(event) {
    event.preventDefault(); // Предотвращаем переход по ссылке
    registrationModal.style.display = 'flex'; // Показываем окно
});

// Функция для закрытия модального окна
function closeRegistration() {
    registrationModal.style.display = 'none'; // Скрываем окно
}

// Закрытие модального окна при клике вне окна
window.addEventListener('click', function(event) {
    if (event.target === registrationModal) {
        closeRegistration();
    }
});

// Создаем круг с героями
heroes.forEach((hero, index) => {
    const heroDiv = document.createElement('div');
    heroDiv.className = 'hero';

    // Позиционирование вокруг часов
    const angle = (index * (360 / heroes.length)); // Угол в градусах
    const radius = 125; // Радиус, на котором будут размещены персонажи

    // Преобразуем угол в радианы
    const radians = angle * (Math.PI / 180);

    // Вычисляем координаты
    const top = 50 + (radius * Math.sin(radians)); // Y-координата
    const left = 50 + (radius * Math.cos(radians)); // X-координата

    heroDiv.style.position = 'absolute';
    heroDiv.style.top = `${top}%`;
    heroDiv.style.left = `${left}%`;
    
    // Если есть изображение, добавляем его
    const img = document.createElement('img');
    img.src = `img/${index + 1}.jpg`; // Укажите путь к изображению
    img.alt = `Герой ${index + 1}`;
    
    heroDiv.appendChild(img);
    heroDiv.onclick = () => showDescription(hero);
    
    heroesCircle.appendChild(heroDiv);
});

// Функция для отображения описания героя
function showDescription(description) {
    const descriptionBox = document.querySelector('.description');
    descriptionBox.innerText = description; // Заменяем на ваше описание
    descriptionBox.style.display = 'block'; // Отображаем описание
}

// Функция для скрытия описания
function hideDescription() {
    const descriptionBox = document.querySelector('.description');
    descriptionBox.style.display = 'none';
}

// Добавим обработчик клика вне описания, чтобы скрыть его
document.addEventListener('click', (event) => {
    const descriptionBox = document.querySelector('.description');
    if (!descriptionBox.contains(event.target) && event.target.className !== 'hero') {
        hideDescription();
    }
});

// Функция для отсчета времени
function startCountdown(targetDate) {
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById("countdown-timer").innerHTML = "Время вышло!";
            clearInterval(timerInterval);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("countdown-timer").innerHTML =
            `${days}д ${hours}ч ${minutes}м ${seconds}с`;
    }

    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 1000);
}

// Укажи свою дату (ГОД, МЕСЯЦ (0-11), ДЕНЬ, ЧАСЫ, МИНУТЫ, СЕКУНДЫ)
const countdownDate = new Date(2025, 5, 26, 12, 0, 0).getTime(); // 1 июня 2025, 12:00
startCountdown(countdownDate);

// Функция для анимации обновления цифры таймера
function updateCountdown(digitElement, newValue) {
    if (digitElement.textContent !== newValue) {
        digitElement.setAttribute("data-next", newValue);
        digitElement.classList.add("animating");

        setTimeout(() => {
            digitElement.textContent = newValue;
            digitElement.classList.remove("animating");
        }, 500);
    }
}

// Пример обновления секунд
setInterval(() => {
    let seconds = new Date().getSeconds();
    let digits = document.querySelectorAll(".countdown-digit");
    let sec1 = Math.floor(seconds / 10);
    let sec2 = seconds % 10;

    updateCountdown(digits[3], sec1);
    updateCountdown(digits[4], sec2);
}, 1000);

// Улучшенная валидация формы
function validateForm() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    let isValid = true;
    const errors = [];

    // Проверка имени пользователя
    if (username.length < 3) {
        errors.push('Имя пользователя должно содержать минимум 3 символа');
        isValid = false;
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push('Введите корректный email адрес');
        isValid = false;
    }

    // Проверка пароля
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        errors.push('Пароль должен содержать минимум 8 символов, включая буквы и цифры');
        isValid = false;
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        errors.push('Пароли не совпадают');
        isValid = false;
    }

    // Показываем ошибки
    const errorContainer = document.getElementById('error-container');
    if (!isValid) {
        errorContainer.innerHTML = errors.map(error => `<p class="error">${error}</p>`).join('');
        errorContainer.style.display = 'block';
    } else {
        errorContainer.style.display = 'none';
    }

    return isValid;
}

// Обновленная функция отправки формы
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

        // Создаем пользователя в Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Сохраняем дополнительную информацию
        await addDoc(collection(db, "users"), {
            uid: userCredential.user.uid,
            username: username,
            email: email,
            createdAt: new Date()
        });

        // Показываем сообщение об успехе
        showNotification('Регистрация успешно завершена!', 'success');
        closeRegistration();
        document.getElementById('registration-form').reset();
    } catch (error) {
        let errorMessage = 'Произошла ошибка при регистрации';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Пользователь с таким email уже существует';
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Функция для показа уведомлений
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
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Функция для обновления стрелок часов
function updateClock() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Вычисляем углы для стрелок
    const hourDegrees = (hours * 30) + (minutes / 2); // 30 градусов в час (360/12)
    const minuteDegrees = minutes * 6; // 6 градусов в минуту (360/60)
    const secondDegrees = seconds * 6; // 6 градусов в секунду (360/60)

    // Обновляем положение стрелок
    document.querySelector('.hour-hand').style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;
    document.querySelector('.minute-hand').style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
    document.querySelector('.second-hand').style.transform = `translateX(-50%) rotate(${secondDegrees}deg)`;
}

// Обновляем часы каждую секунду
setInterval(updateClock, 1000);
// Запускаем часы сразу при загрузке страницы
updateClock();

// Анимация появления элементов при скролле
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.art-block, .content h1, .content p');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('visible');
        }
    });
}

// Плавный скролл к секциям
document.querySelectorAll('header a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Динамическая смена языка
const languageButtons = document.querySelectorAll('.dropdown-content a');
languageButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const language = this.textContent;
        document.querySelector('.dropdown-btn').textContent = language;
        // Здесь можно добавить логику смены языка
    });
});

// Анимация для героев вокруг часов
function animateHeroes() {
    const heroes = document.querySelectorAll('.hero');
    heroes.forEach((hero, index) => {
        const angle = (index * (360 / heroes.length)) + performance.now() * 0.02;
        const radius = 125;
        const radians = angle * (Math.PI / 180);
        
        const top = 50 + (radius * Math.sin(radians));
        const left = 50 + (radius * Math.cos(radians));
        
        hero.style.top = `${top}%`;
        hero.style.left = `${left}%`;
    });
    
    requestAnimationFrame(animateHeroes);
}

// Запускаем анимации
window.addEventListener('scroll', handleScrollAnimation);
handleScrollAnimation(); // Вызываем один раз при загрузке
animateHeroes();
