// === НАСТРОЙКИ ===
const TEST_COUNT = 15;
const ADMIN_PASSWORD = "TryX9kTo77PassLm2TheQ8Exam2025RZx3kP9But5IfY6You2LoseN4t5202BvC7BanW1ForTheWholeLife2520";
const AES_KEY = "my_secret_aes_key_2024";
const INACTIVITY_TIMEOUT = 20000;
const AUTH_EXPIRY_DAYS = 7;

let isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
let currentTestType = 'exam';
let playersDatabase = JSON.parse(localStorage.getItem('playersDatabase') || '[]');
let currentUser = null;

// === БАЗА ПОЛЬЗОВАТЕЛЕЙ (ХРАНИТСЯ В LOCALSTORAGE) ===
let usersDatabase = JSON.parse(localStorage.getItem('usersDatabase') || '{}');

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(36);
}

function registerUser(username, password) {
    if (!username || username.trim() === '') {
        showAuthStatus('❌ Введите ник!', 'error');
        return false;
    }
    
    if (!password || password.length < 6) {
        showAuthStatus('❌ Пароль должен быть минимум 6 символов!', 'error');
        return false;
    }
    
    const employeesData = loadEmployeesData();
    const employee = Object.values(employeesData).find(emp => 
        emp.username.toLowerCase() === username.toLowerCase() && emp.username !== 'Вакантно'
    );
    
    if (!employee) {
        showAuthStatus('❌ Сотрудник с таким ником не найден в системе!', 'error');
        return false;
    }
    
    if (usersDatabase[username.toLowerCase()]) {
        showAuthStatus('❌ Этот ник уже зарегистрирован! Используйте вход.', 'error');
        return false;
    }
    
    usersDatabase[username.toLowerCase()] = {
        username: username,
        password: hashPassword(password),
        registeredAt: Date.now(),
        lastLogin: Date.now()
    };
    
    localStorage.setItem('usersDatabase', JSON.stringify(usersDatabase));
    showAuthStatus(`✅ Пользователь ${username} зарегистрирован! Теперь войдите.`, 'success');
    return true;
}

function loginUser(username, password) {
    if (!username || username.trim() === '') {
        showAuthStatus('❌ Введите ник!', 'error');
        return false;
    }
    
    if (!password || password.length < 6) {
        showAuthStatus('❌ Введите пароль!', 'error');
        return false;
    }
    
    const userData = usersDatabase[username.toLowerCase()];
    if (!userData) {
        showAuthStatus('❌ Пользователь не найден. Зарегистрируйтесь!', 'error');
        return false;
    }
    
    if (userData.password !== hashPassword(password)) {
        showAuthStatus('❌ Неверный пароль!', 'error');
        return false;
    }
    
    const daysPassed = (Date.now() - userData.lastLogin) / (1000 * 60 * 60 * 24);
    if (daysPassed >= 7) {
        showAuthStatus('❌ Сессия истекла (7 дней). Перерегистрируйтесь!', 'error');
        delete usersDatabase[username.toLowerCase()];
        localStorage.setItem('usersDatabase', JSON.stringify(usersDatabase));
        return false;
    }
    
    userData.lastLogin = Date.now();
    localStorage.setItem('usersDatabase', JSON.stringify(usersDatabase));
    
    return performAuth(username);
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    const authDate = localStorage.getItem('authDate');
    
    if (!savedUser || !authDate) return false;
    
    const daysPassed = (Date.now() - parseInt(authDate)) / (1000 * 60 * 60 * 24);
    
    if (daysPassed >= AUTH_EXPIRY_DAYS) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authDate');
        return false;
    }
    
    try {
        currentUser = JSON.parse(savedUser);
        const employeesData = loadEmployeesData();
        const employee = Object.values(employeesData).find(emp => 
            emp.username.toLowerCase() === currentUser.username.toLowerCase() && emp.username !== 'Вакантно'
        );
        
        if (!employee) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authDate');
            return false;
        }
        
        currentUser.type = employee.type;
        currentUser.position = employee.position;
        return true;
    } catch (e) {
        return false;
    }
}

function performAuth(username) {
    const employeesData = loadEmployeesData();
    const employee = Object.values(employeesData).find(emp => 
        emp.username.toLowerCase() === username.toLowerCase() && emp.username !== 'Вакантно'
    );
    
    if (!employee) {
        showAuthStatus('❌ Сотрудник не найден.', 'error');
        return false;
    }
    
    currentUser = {
        username: employee.username,
        type: employee.type,
        position: employee.position,
        id: employee.id
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('authDate', String(Date.now()));
    
    showAuthStatus(`✅ Добро пожаловать, ${employee.username}! (${employee.position})`, 'success');
    
    setTimeout(() => {
        const authModal = document.getElementById('authModal');
        const app = document.getElementById('app');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleDisplay = document.getElementById('userRoleDisplay');
        const usernameInput = document.getElementById('username');
        const avatar = document.getElementById('userAvatar');
        const currentUsernameDisplay = document.getElementById('currentUsernameDisplay');
        const currentUserRoleDisplay = document.getElementById('currentUserRoleDisplay');
        
        if (authModal) {
            authModal.style.opacity = '0';
            authModal.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                authModal.style.display = 'none';
            }, 500);
        }
        if (app) {
            app.style.display = 'block';
            app.style.opacity = '0';
            app.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                app.style.opacity = '1';
            }, 100);
        }
        
        if (userNameDisplay) userNameDisplay.textContent = employee.username;
        if (userRoleDisplay) userRoleDisplay.textContent = employee.position;
        if (currentUsernameDisplay) currentUsernameDisplay.textContent = employee.username;
        if (currentUserRoleDisplay) currentUserRoleDisplay.textContent = `— ${employee.position}`;
        
        if (avatar) {
            const icons = {
                'curator': '👑',
                'senior_officer': '⭐',
                'officer': '⚖️',
                'cadet': '🎓'
            };
            avatar.textContent = icons[employee.type] || '👤';
        }
        if (usernameInput) {
            usernameInput.disabled = false;
            usernameInput.style.pointerEvents = 'auto';
            usernameInput.style.opacity = '1';
        }
        
        updateRankMessage();
        renderGreeting();
        renderCurrentTest();
    }, 600);
    
    return true;
}

function showAuthStatus(message, type) {
    const statusEl = document.getElementById('authStatus');
    if (!statusEl) return;
    statusEl.style.display = 'block';
    statusEl.textContent = message;
    statusEl.className = `auth-status ${type}`;
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authDate');
    
    if (test) {
        clearTestState();
    }
    
    currentUser = null;
    test = null;
    blocked = false;
    
    const app = document.getElementById('app');
    const authModal = document.getElementById('authModal');
    const statusEl = document.getElementById('authStatus');
    const usernameInput = document.getElementById('authUsername');
    const passwordInput = document.getElementById('authPassword');
    
    if (app) {
        app.style.opacity = '0';
        setTimeout(() => {
            app.style.display = 'none';
        }, 500);
    }
    if (authModal) {
        authModal.style.display = 'flex';
        authModal.style.opacity = '1';
    }
    if (statusEl) statusEl.style.display = 'none';
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
    
    document.querySelectorAll("input, button, textarea, select").forEach(el => {
        el.disabled = false;
    });
    
    showMessage('Вы вышли из системы', 'info');
}

const GREETINGS = {
    'cadet': [
        "Добро пожаловать, курсант. Ты только начинаешь свой путь в Военной Полиции. Впереди много испытаний.",
        "Приветствую, новобранец. Система видит твой потенциал. Докажи, что ты достоин носить это звание.",
        "Курсант, ты принят в систему. Экзамен ждёт — не подведи. Твоя карьера начинается здесь и сейчас.",
        "С приветствием, курсант. Твой путь только начинается. Каждый великий офицер когда-то был новичком.",
        "Добро пожаловать в ряды Военной Полиции, курсант. Твоя преданность и усердие помогут тебе пройти этот путь."
    ],
    'officer': [
        "Приветствую, офицер. Ты уже не новичок, но путь к вершине ещё долог. Система готова к твоим запросам.",
        "Офицер, твоя квалификация подтверждена. Военная Полиция нуждается в таких, как ты. Продолжай в том же духе.",
        "С возвращением, офицер. Твой опыт — наше богатство. Выполняй свой долг с честью и достоинством.",
        "Приветствую тебя, офицер. Ты — опора Военной Полиции. Твои решения меняют судьбы людей.",
        "Офицер, рад видеть тебя в системе. Твой профессионализм — пример для младших. Действуй решительно."
    ],
    'senior_officer': [
        "Командир, рад приветствовать вас. Ваш опыт — опора системы. Младшие равняются на вас, не подведите их.",
        "Господин старший офицер, ваше присутствие — честь. Система готова выполнять любые ваши приказы.",
        "Приветствую вас, сэр. Ваш авторитет заслужен годами. Продолжайте укреплять нашу систему изнутри.",
        "Старший офицер, вы — пример для подражания. Ваш путь — это путь настоящего воина, достойного уважения.",
        "Командир, система полностью подчинена вам. Ваша мудрость и решительность ведут нас к победе."
    ],
    'curator': [
        "Ваше Превосходительство, система к вашим услугам. Ваш приказ — закон для всей Военной Полиции.",
        "Куратор, рад приветствовать вас. Ваш авторитет абсолютен. Система полностью в вашем подчинении.",
        "Ваше слово — закон, Куратор. Все модули активированы и ждут ваших указаний. Повелевайте.",
        "Ваше Превосходительство, ваша мудрость ведёт нас. Без вас система — ничто. Мы гордимся вами.",
        "Куратор, ваше величие — основа Военной Полиции. Приветствую вас. Система преклоняется перед вами."
    ]
};

function getRandomGreeting(userType) {
    const greetings = GREETINGS[userType] || GREETINGS['cadet'];
    return greetings[Math.floor(Math.random() * greetings.length)];
}

function renderGreeting() {
    const greetingEl = document.getElementById('testGreeting');
    if (!greetingEl || !currentUser || !currentUser.type) return;
    
    const greetingText = getRandomGreeting(currentUser.type);
    
    let icon = '';
    let roleName = '';
    
    switch(currentUser.type) {
        case 'cadet':
            icon = '🎓';
            roleName = 'Курсант';
            break;
        case 'officer':
            icon = '⚖️';
            roleName = 'Офицер';
            break;
        case 'senior_officer':
            icon = '⭐';
            roleName = 'Старший офицер';
            break;
        case 'curator':
            icon = '👑';
            roleName = 'Куратор';
            break;
        default:
            icon = '👤';
            roleName = 'Сотрудник';
    }
    
    greetingEl.innerHTML = `
        <div class="greeting-box">
            <div class="greeting-icon">${icon}</div>
            <div class="greeting-content">
                <div class="greeting-role">${roleName} ${currentUser.position}</div>
                <div class="greeting-message">${greetingText}</div>
                <div class="greeting-user">${currentUser.username}</div>
            </div>
        </div>
    `;
}

const FIXED_EMPLOYEE_STRUCTURE = [
    { id: 'curator', position: 'Куратор ВП', type: 'curator', username: 'Jan_Abobbi' },
    { id: 'senior_officer_2', position: 'Старший офицер ВП', type: 'senior_officer', username: 'Chaffy_Washington' },
    { id: 'senior_officer_1', position: 'Старший офицер ВП', type: 'senior_officer', username: 'Gustavo_Mendez' },
    { id: 'officer_2', position: 'Офицер ВП', type: 'officer', username: 'Eul_Requiem' },
    { id: 'officer_5', position: 'Офицер ВП', type: 'officer', username: 'Ralph_Laurence' },
    { id: 'officer_7', position: 'Офицер ВП', type: 'officer', username: 'Danya_Armani' },
    { id: 'officer_3', position: 'Офицер ВП', type: 'officer', username: 'Akashi_Miyazuki' },
    { id: 'officer_1', position: 'Офицер ВП', type: 'officer', username: 'Gera_Guerra' },
    { id: 'officer_4', position: 'Офицер ВП', type: 'officer', username: 'Вакантно' },
    { id: 'officer_6', position: 'Офицер ВП', type: 'officer', username: 'Вакантно' },
    { id: 'cadet_2', position: 'Курсант ВП', type: 'cadet', username: 'Blake_Obi' },
    { id: 'cadet_1', position: 'Курсант ВП', type: 'cadet', username: 'Kristoph_Hidenberg' },
    { id: 'cadet_3', position: 'Курсант ВП', type: 'cadet', username: 'Вакантно' }
];

// === ВОПРОСЫ ДЛЯ ЭКЗАМЕНА ===
const examQuestions = [
    { text: "Что обязаны знать и соблюдать сотрудники Военной полиции?", type: "multiple",
        options: [
            "Устав МО, Устав ВП",
            "Устав МЮ",
            "Федеральное постановление, уголовный кодекс, административный кодекс",
            "Всё выше перечисленное"
        ],
        correctAnswers: ["Устав МО, Устав ВП", "Федеральное постановление, уголовный кодекс, административный кодекс"],
        maxSelections: 2
    },
    { text: "Как должны разговаривать сотрудники военной полиции?", type: "text" },
    { text: "При каких условиях сотрудник ВП может покинуть свою ВЧ без формы в рабочее время?(Не с разрешения и не в обед)", type: "text" },
    { text: "Что должны иметь при себе сотрудники военной полиции при проверке ВЧ на ЧС?", type: "text" },
    { text: "Что должен делать сотрудник ВП при проверке ВЧ на ЧС, помимо самой проверки?", type: "text" },
    { text: "Что запрещается сотрудникам ВП при выполнении спец.задачи?", type: "text" },
    { text: "При каком приказе сотрудник ВП обязан снять маску?",
        type: "multiple",
        options: [
            "Приказ Министра Обороны",
            "Приказ Куратора Дельты",
            "Приказ Сотрудника Пра-во",
            "Приказ Руководста армии"
        ],
        correctAnswers: ["Приказ Министра Обороны", "Приказ Руководства армии"],
        maxSelections: 2
    },
    { text: "Какими цветами должен быть покрашен автомобиль сотрудника ВП?", type: "text" },
    { text: "Какая приписка в рации департамента?", type: "text" },
    { text: "Сколько минимум минут нужно проверять ВЧ на ЧС?", type: "multiple",
        options: [
            "4 минуты",
            "5 минут",
            "3 минуты",
            "Минимального лимита нет"
        ],
        correctAnswers: ["3 минуты"],
        maxSelections: 1
    },
    { text: "Кому подчиняются сотрудники ВП?", type: "text" },
    { text: "Последовательность действий офицера ВП при виде нарушителя?", type: "text" },
    { text: "Какие места помимо Военных Частей нужно проверять?", type: "text" },
    { text: "Назовите недельную норму проверок состава МО от ВП.", type: "multiple",
        options: [
            "7 раз в неделю",
            "3 раза в неделю",
            "5 раз в неделю",
            "4 раза в неделю"
        ],
        correctAnswers: ["3 раза в неделю"],
        maxSelections: 1
    },
    { text: "Какие последствия ждут организацию получившая неудовлетворительную оценку при проверке состава?", type: "text" },
];

// === ВОПРОСЫ ДЛЯ ПЕРЕАТТЕСТАЦИИ ===
const retrainingQuestions = [
    { text: "Что обязаны знать и соблюдать сотрудники Военной полиции?", type: "multiple",
        options: [
            "Устав МО, Устав ВП",
            "Устав МЮ",
            "Федеральное постановление, уголовный кодекс, административный кодекс",
            "Всё выше перечисленное"
        ],
        correctAnswers: ["Устав МО, Устав ВП", "Федеральное постановление, уголовный кодекс, административный кодекс"],
        maxSelections: 2
    },
    { text: "Как должны разговаривать сотрудники военной полиции?", type: "text" },
    { text: "При каких условиях сотрудник ВП может покинуть свою ВЧ без формы в рабочее время?(Не с разрешения и не в обед)", type: "text" },
    { text: "Что должны иметь при себе сотрудники военной полиции при проверке ВЧ на ЧС?", type: "text" },
    { text: "Что должен делать сотрудник ВП при проверке ВЧ на ЧС, помимо самой проверки?", type: "text" },
    { text: "Что запрещается сотрудникам ВП при выполнении спец.задачи?", type: "text" },
    { text: "При каком приказе сотрудник ВП обязан снять маску?",
        type: "multiple",
        options: [
            "Приказ Министра Обороны",
            "Приказ Куратора Дельты",
            "Приказ Сотрудника Пра-во",
            "Приказ Руководста армии"
        ],
        correctAnswers: ["Приказ Министра Обороны", "Приказ Руководства армии"],
        maxSelections: 2
    },
    { text: "Какими цветами должен быть покрашен автомобиль сотрудника ВП?", type: "text" },
    { text: "Какая приписка в рации департамента?", type: "text" },
    { text: "Сколько минимум минут нужно проверять ВЧ на ЧС?", type: "multiple",
        options: [
            "4 минуты",
            "5 минут",
            "3 минуты",
            "Минимального лимита нет"
        ],
        correctAnswers: ["3 минуты"],
        maxSelections: 1
    },
    { text: "Кому подчиняются сотрудники ВП?", type: "text" },
    { text: "Последовательность действий офицера ВП при виде нарушителя?", type: "text" },
    { text: "Какие места помимо Военных Частей нужно проверять?", type: "text" },
    { text: "Назовите недельную норму проверок состава МО от ВП.", type: "multiple",
        options: [
            "7 раз в неделю",
            "3 раза в неделю",
            "5 раз в неделю",
            "4 раза в неделю"
        ],
        correctAnswers: ["3 раза в неделю"],
        maxSelections: 1
    },
    { text: "Какие последствия ждут организацию получившая неудовлетворительную оценку при проверке состава?", type: "text" },
    { text: "В какое время запрещается делать проверку состава МО от ВП?", type: "text" },
    { text: "Назовите все критерии требующиеся для внесения личного транспортного средства в реестр.", type: "text" },
    { text: "Какие грузовые транспортные средства можно регистрировать в реестре?", type: "text" },
    { text: "Представим ситуацию, вы хотите заехать в СФа, стоите на КПП и видите как воруют маты в грузовом отсеке. Ваши действия?", type: "text" },
    { text: "Представим ситуацию, на Министра Обороны напали трое бандитов. Ваши действия?", type: "text" },
    { text: "У кого сотрудники ВП могут попросить помощи, ради поимки прогульщиков?", type: "text" },
    { text: "В каких случаях разрешается заехать на ВЧ без запроса?", type: "text" },
    { text: "Что грозит сотруднику ВП при распространения ответов из экзамена или её попытке?", type: "text" },
    { text: "Что грозит сотруднику ВП при трёхразовом провале экзамена?", type: "text" },
    { text: "В каких случаях разрешено заниматся надзорной деятельностью без формы?", type: "text" },
    { text: "Сколько времени даётся на прохождение переатестации?", type: "text" },
    { text: "В каких случаях Куратор ВП может потребовать пройти внеплановую переатестацию?", type: "text" },
];

let test = null;
let blocked = false;
let inactivityTimer = null;
let lastActivityTime = Date.now();
let currentGradingFile = null;
let currentGradingAnswers = null;
let currentFileIndex = null;

// === ФУНКЦИИ ДЛЯ РАБОТЫ С ФАЙЛАМИ И СОТРУДНИКАМИ ===

function extractUsernameFromFilename(filename) {
    const nameWithoutExt = filename.replace(/\.docx$/, '');
    
    const patterns = [
        /^([^_]+_[^_]+)_(?:Academy|Академия|Exam|Экзамен|Retraining|Переаттестация)/i,
        /^([^_]+_[^_]+)_(?:Academy|Академия|Exam|Экзамен|Retraining|Переаттестация).*?оценка/i,
        /^([^_]+_[^_]+)_код_разблокировки/i,
        /^([^_]+_[^_]+)_(?:Academy|Академия|Exam|Экзамен|Retraining|Переаттестация).*?разблокировка/i,
        /^([a-zA-Z]+_[a-zA-Z]+)_/,
        /^([a-zA-Z]+)_(?:Academy|Академия|Exam|Экзамен|Retraining|Переаттестация)/i,
    ];
    
    for (const pattern of patterns) {
        const match = nameWithoutExt.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    const parts = nameWithoutExt.split('_');
    
    if (parts.length >= 2) {
        const secondPart = parts[1].toLowerCase();
        const isTestType = ['academy', 'академия', 'exam', 'экзамен', 'retraining', 'переаттестация'].includes(secondPart);
        
        if (!isTestType && /^[a-zA-Z]+$/.test(parts[0]) && /^[a-zA-Z]+$/.test(parts[1])) {
            return `${parts[0]}_${parts[1]}`;
        }
    }
    
    if (parts.length >= 1 && /^[a-zA-Z]+$/.test(parts[0])) {
        return parts[0];
    }
    
    return null;
}

function extractTestTypeFromFilename(filename) {
    const lowerName = filename.toLowerCase();
    
    if (lowerName.includes('экзамен') || lowerName.includes('exam')) return 'exam';
    if (lowerName.includes('переаттестация') || lowerName.includes('retraining')) return 'retraining';
    
    const parts = filename.split('_');
    if (parts.length >= 2) {
        const possibleType = parts[1].toLowerCase();
        if (possibleType.includes('exam') || possibleType.includes('экзамен')) return 'exam';
        if (possibleType.includes('retraining') || possibleType.includes('переатт')) return 'retraining';
    }
    
    return 'exam';
}

function extractTimeFromFilename(filename) {
    const match = filename.match(/(\d+)мин/);
    return match ? parseInt(match[1]) : 15;
}

function findPossibleEmployees(username) {
    const employeesData = loadEmployeesData();
    
    if (!username || username.trim() === '') {
        return Object.values(employeesData)
            .filter(emp => emp.username && emp.username !== 'Вакантно')
            .map(emp => ({
                ...emp,
                matchScore: 50
            }));
    }
    
    const cleanUsername = username.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
    
    const results = Object.values(employeesData)
        .filter(emp => emp.username && emp.username !== 'Вакантно')
        .map(emp => {
            const cleanEmpName = emp.username.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
            let score = 0;
            
            if (cleanEmpName === cleanUsername) score = 100;
            if (cleanEmpName.includes(cleanUsername)) score = Math.max(score, 90);
            if (cleanUsername.includes(cleanEmpName)) score = Math.max(score, 85);
            
            const empParts = cleanEmpName.split(/[_\s-]/);
            const userParts = cleanUsername.split(/[_\s-]/);
            
            let partScore = 0;
            empParts.forEach(empPart => {
                userParts.forEach(userPart => {
                    if (empPart === userPart) partScore += 50;
                    else if (empPart.includes(userPart)) partScore += 30;
                    else if (userPart.includes(empPart)) partScore += 25;
                });
            });
            
            if (partScore > 0) {
                score = Math.max(score, partScore / Math.max(empParts.length, userParts.length));
            }
            
            if (cleanUsername.length < 3) {
                score *= 0.7;
            }
            
            return {
                ...emp,
                matchScore: Math.min(100, Math.round(score))
            };
        })
        .filter(emp => emp.matchScore > 30)
        .sort((a, b) => b.matchScore - a.matchScore);
    
    return results;
}
function showAvailableTabs() {
    const userRole = currentUser?.type || '';
    const tabs = {
        exam: document.querySelector('.tab[data-tab="exam"]'),
        retraining: document.querySelector('.tab[data-tab="retraining"]'),
        admin: document.querySelector('.tab[data-tab="admin"]'),
        decree: document.querySelector('.tab[data-tab="decree"]')
    };

    // === КУРСАНТ — только Экзамен ===
    if (userRole === 'cadet') {
        tabs.exam.style.display = 'inline-block';
        tabs.retraining.style.display = 'none';
        tabs.admin.style.display = 'none';
        tabs.decree.style.display = 'none';
    }
    // === ОФИЦЕР — только Переаттестация ===
    else if (userRole === 'officer') {
        tabs.exam.style.display = 'none';
        tabs.retraining.style.display = 'inline-block';
        tabs.admin.style.display = 'inline-block';
        tabs.decree.style.display = 'inline-block';
    }
    // === СТАРШИЙ ОФИЦЕР — только Переаттестация ===
    else if (userRole === 'senior_officer') {
        tabs.exam.style.display = 'none';
        tabs.retraining.style.display = 'inline-block';
        tabs.admin.style.display = 'inline-block';
        tabs.decree.style.display = 'inline-block';
    }
    // === КУРАТОР — всё ===
    else if (userRole === 'curator') {
        tabs.exam.style.display = 'inline-block';
        tabs.retraining.style.display = 'inline-block';
        tabs.admin.style.display = 'inline-block';
        tabs.decree.style.display = 'inline-block';
    }
    // === НЕИЗВЕСТНЫЙ РОЛЬ ===
    else {
        tabs.exam.style.display = 'none';
        tabs.retraining.style.display = 'none';
        tabs.admin.style.display = 'none';
        tabs.decree.style.display = 'none';
    }

    // Если текущая вкладка скрыта - переключаем на доступную
    if (currentUser) {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            const tabName = activeTab.dataset.tab;
            if (tabName === 'exam' && tabs.exam.style.display === 'none') {
                // Переключаем на retraining если оно доступно
                if (tabs.retraining.style.display !== 'none') {
                    document.querySelector('.tab[data-tab="retraining"]')?.classList.add('active');
                    document.querySelector('.tab[data-tab="exam"]')?.classList.remove('active');
                    currentTestType = 'retraining';
                    renderCurrentTest();
                }
            } else if (tabName === 'retraining' && tabs.retraining.style.display === 'none') {
                // Переключаем на exam если оно доступно
                if (tabs.exam.style.display !== 'none') {
                    document.querySelector('.tab[data-tab="exam"]')?.classList.add('active');
                    document.querySelector('.tab[data-tab="retraining"]')?.classList.remove('active');
                    currentTestType = 'exam';
                    renderCurrentTest();
                }
            } else if (tabName === 'admin' && tabs.admin.style.display === 'none') {
                // Переключаем на exam или retraining
                if (tabs.exam.style.display !== 'none') {
                    document.querySelector('.tab[data-tab="exam"]')?.classList.add('active');
                    document.querySelector('.tab[data-tab="admin"]')?.classList.remove('active');
                    currentTestType = 'exam';
                    renderCurrentTest();
                } else if (tabs.retraining.style.display !== 'none') {
                    document.querySelector('.tab[data-tab="retraining"]')?.classList.add('active');
                    document.querySelector('.tab[data-tab="admin"]')?.classList.remove('active');
                    currentTestType = 'retraining';
                    renderCurrentTest();
                }
            } else if (tabName === 'decree' && tabs.decree.style.display === 'none') {
                if (tabs.exam.style.display !== 'none') {
                    document.querySelector('.tab[data-tab="exam"]')?.classList.add('active');
                    document.querySelector('.tab[data-tab="decree"]')?.classList.remove('active');
                    currentTestType = 'exam';
                    renderCurrentTest();
                } else if (tabs.retraining.style.display !== 'none') {
                    document.querySelector('.tab[data-tab="retraining"]')?.classList.add('active');
                    document.querySelector('.tab[data-tab="decree"]')?.classList.remove('active');
                    currentTestType = 'retraining';
                    renderCurrentTest();
                }
            }
        }
    }
}
function showEmployeeSelectionModal(filename, username, testType, gradedFile, gradedAnswers, fileIndex) {
    const possibleEmployees = findPossibleEmployees(username);
    
    if (possibleEmployees.length === 0) {
        showError(`Не найдено сотрудников для имени "${username}". Проверьте правильность имени в файле.`);
        return;
    }
    
    if (possibleEmployees.length === 1) {
        const employee = possibleEmployees[0];
        saveGradedResultsToEmployee(employee, gradedFile, gradedAnswers, fileIndex);
        return;
    }
    
    const modal = document.getElementById('employeeSelectionModal');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const employeeList = document.getElementById('employeeSelectionList');
    const confirmBtn = document.getElementById('confirmEmployeeSelection');
    
    currentGradingFile = gradedFile;
    currentGradingAnswers = gradedAnswers;
    currentFileIndex = fileIndex;
    
    fileNameDisplay.textContent = filename;
    employeeList.innerHTML = '';
    
    possibleEmployees.forEach((employee, index) => {
        const employeeOption = document.createElement('div');
        employeeOption.className = 'employee-option';
        employeeOption.innerHTML = `
            <input type="radio" name="employeeSelect" id="employee_${index}" value="${employee.id}">
            <div class="employee-info">
                <div class="employee-name">${escapeHtml(employee.username)}</div>
                <div class="employee-position">${employee.position}</div>
                <div class="employee-stats">
                    <span>📁 Академия: ${employee.files.academy.length}</span>
                    <span>🎓 Экзамен: ${employee.files.exam.length}</span>
                    <span>🔄 Переатт.: ${employee.files.retraining.length}</span>
                </div>
                <div class="employee-match-score">Совпадение: ${employee.matchScore}%</div>
            </div>
        `;
        
        employeeOption.querySelector('input').addEventListener('change', (e) => {
            document.querySelectorAll('.employee-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            employeeOption.classList.add('selected');
            confirmBtn.disabled = false;
        });
        
        employeeList.appendChild(employeeOption);
    });
    
    document.getElementById('cancelEmployeeSelection').onclick = () => {
        modal.style.display = 'none';
        showMessage('Сохранение отменено', 'info');
    };
    
    confirmBtn.onclick = () => {
        const selectedInput = document.querySelector('input[name="employeeSelect"]:checked');
        if (selectedInput) {
            const employeeId = selectedInput.value;
            const employeesData = loadEmployeesData();
            const selectedEmployee = employeesData[employeeId];
            
            if (selectedEmployee) {
                saveGradedResultsToEmployee(selectedEmployee, currentGradingFile, currentGradingAnswers, currentFileIndex);
                modal.style.display = 'none';
            }
        }
    };
    
    confirmBtn.disabled = true;
    document.querySelectorAll('.employee-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    modal.style.display = 'flex';
}

function saveGradedResultsToEmployee(employee, gradedFile, gradedAnswers, fileIndex) {
    const username = employee.username;
    const testType = gradedFile.testType || extractTestTypeFromFilename(gradedFile.name);
    const timeSpent = gradedFile.timeSpent || extractTimeFromFilename(gradedFile.name) || 15;
    
    let reportText, fileName;
    
    if (gradedFile.isUnlockFile) {
        reportText = `КОД РАЗБЛОКИРОВКИ ТЕСТА - СОХРАНЁН В ПАПКУ
=================================

Тип теста: ${getTestTypeName(testType)}
Имя пользователя: ${username}
Дата сохранения: ${new Date().toLocaleString('ru-RU')}

Файл разблокировки сохранен в папку сотрудника ${username}
Администратор: Система
=================================
Arizona RP | Военная Полиция
Файл сохранен автоматически`;

        fileName = `${username}_${getTestTypeName(testType)}_разблокировка_сохранено_${new Date().toLocaleDateString('ru-RU')}.docx`;
        
    } else {
        const score = gradedFile.score;
        const correctAnswers = gradedFile.correctAnswers;
        const totalAnswers = gradedFile.totalAnswers;
        const passed = gradedFile.passed;
        const testTypeName = getTestTypeName(testType);
        
        reportText = `${testTypeName.toUpperCase()} ВОЕННОЙ ПОЛИЦИИ - РЕЗУЛЬТАТЫ С ОЦЕНКОЙ
=================================

Общая информация:
----------------
Имя: ${username}
Тип теста: ${testTypeName}
Дата оценки: ${new Date().toLocaleString('ru-RU')}
Время выполнения: ${timeSpent} минут
Всего вопросов: ${totalAnswers}
Правильных ответов: ${correctAnswers}
Оценка: ${score}%
Статус: ${passed ? '✅ ПРОЙДЕН' : '❌ НЕ ПРОЙДЕН'}

Ответы с оценкой:
----------------
`;

        gradedAnswers.forEach((answer, index) => {
            reportText += `\n${index + 1}. ${escapeHtml(answer.question)}\n`;
            if (Array.isArray(answer.answer)) {
                reportText += `Ответ: ${escapeHtml(answer.answer.join(', '))}\n`;
            } else {
                reportText += `Ответ: ${escapeHtml(answer.answer)}\n`;
            }
            reportText += `Оценка: ${answer.correct ? '✅ Правильно' : '❌ Неправильно'}\n`;
            reportText += `---------------------------------\n`;
        });

        reportText += `

=================================
Arizona RP | Военная Полиция
Тест оценен администратором`;

        fileName = `${username}_${testTypeName}_${timeSpent}мин_оценка_${score}%.docx`;
    }
    
    const success = addFileToEmployeeFolder(
        username,
        testType,
        fileName,
        reportText
    );
    
    if (success) {
        const message = gradedFile.isUnlockFile 
            ? `✅ Файл разблокировки сохранен в папку сотрудника ${username}!` 
            : `✅ Оценка сохранена! Файл "${fileName}" сохранен в папку сотрудника ${username}`;
            
        showMessage(message, "success");
        
        const savedFiles = JSON.parse(localStorage.getItem("adminFiles") || "[]");
        if (savedFiles[fileIndex]) {
            savedFiles[fileIndex].username = username;
            savedFiles[fileIndex].testType = testType;
            savedFiles[fileIndex].graded = true;
            
            if (gradedFile.isUnlockFile) {
                savedFiles[fileIndex].isUnlockFile = true;
                savedFiles[fileIndex].passed = true;
                savedFiles[fileIndex].score = 100;
            } else {
                savedFiles[fileIndex].score = gradedFile.score;
                savedFiles[fileIndex].correctAnswers = gradedFile.correctAnswers;
                savedFiles[fileIndex].totalAnswers = gradedFile.totalAnswers;
                savedFiles[fileIndex].passed = gradedFile.passed;
            }
            
            localStorage.setItem("adminFiles", JSON.stringify(savedFiles));
        }
        
        if (!gradedFile.isUnlockFile && gradedFile.score !== undefined) {
            const statistics = JSON.parse(localStorage.getItem('testStatistics') || '[]');
            statistics.push({
                id: Date.now().toString(),
                username: username,
                testType: testType,
                score: gradedFile.score,
                timeSpent: timeSpent,
                correctAnswers: gradedFile.correctAnswers,
                totalAnswers: gradedFile.totalAnswers,
                passed: gradedFile.passed,
                date: new Date().toISOString(),
                graded: true
            });
            
            localStorage.setItem("testStatistics", JSON.stringify(statistics));
        }
        
        const gradingPanel = document.getElementById("gradingPanel");
        if (gradingPanel) {
            gradingPanel.style.display = "none";
        }
        
        renderFiles();
        renderAdmin();
    } else {
        showError(`❌ Не удалось сохранить файл в папку сотрудника ${username}.`);
    }
}

// === ОСНОВНЫЕ ФУНКЦИИ СИСТЕМЫ ===

function loadEmployeesData() {
    const saved = localStorage.getItem('fixedEmployees');
    let employeesData;
    
    if (saved) {
        employeesData = JSON.parse(saved);
        
        const usernameToNewPosition = {};
        FIXED_EMPLOYEE_STRUCTURE.forEach(fixedEmp => {
            if (fixedEmp.username !== 'Вакантно') {
                usernameToNewPosition[fixedEmp.username] = {
                    id: fixedEmp.id,
                    position: fixedEmp.position,
                    type: fixedEmp.type
                };
            }
        });
        
        const movedEmployees = [];
        
        Object.values(employeesData).forEach(oldEmp => {
            const oldUsername = oldEmp.username;
            if (oldUsername !== 'Вакантно' && usernameToNewPosition[oldUsername]) {
                const newPosition = usernameToNewPosition[oldUsername];
                
                if (oldEmp.id !== newPosition.id) {
                    movedEmployees.push({
                        oldId: oldEmp.id,
                        newId: newPosition.id,
                        username: oldUsername,
                        files: { ...oldEmp.files }
                    });
                }
            }
        });
        
        movedEmployees.forEach(move => {
            const oldEmp = employeesData[move.oldId];
            const newEmpSlot = employeesData[move.newId];
            
            if (oldEmp && newEmpSlot) {
                if (newEmpSlot.username !== 'Вакантно' && newEmpSlot.username !== move.username) {
                    const vacantSlot = Object.values(employeesData).find(emp => 
                        emp.type === newEmpSlot.type && emp.username === 'Вакантно'
                    );
                    
                    if (vacantSlot) {
                        vacantSlot.username = newEmpSlot.username;
                        vacantSlot.files = { ...newEmpSlot.files };
                        
                        newEmpSlot.username = 'Вакантно';
                        newEmpSlot.files = { academy: [], exam: [], retraining: [] };
                    }
                }
                
                newEmpSlot.files = { ...move.files };
                newEmpSlot.username = move.username;
                
                oldEmp.username = 'Вакантно';
                oldEmp.files = {
                    academy: [],
                    exam: [],
                    retraining: []
                };
                
                newEmpSlot.folders = {
                    academy: `${move.username}_Академия`,
                    exam: `${move.username}_Экзамен`,
                    retraining: `${move.username}_Переаттестация`
                };
            }
        });
        
        FIXED_EMPLOYEE_STRUCTURE.forEach(fixedEmp => {
            if (employeesData[fixedEmp.id] && employeesData[fixedEmp.id].username !== fixedEmp.username) {
                if (fixedEmp.username !== 'Вакантно') {
                    const existingFiles = employeesData[fixedEmp.id].files;
                    
                    employeesData[fixedEmp.id].username = fixedEmp.username;
                    employeesData[fixedEmp.id].folders = {
                        academy: `${fixedEmp.username}_Академия`,
                        exam: `${fixedEmp.username}_Экзамен`,
                        retraining: `${fixedEmp.username}_Переаттестация`
                    };
                    employeesData[fixedEmp.id].files = existingFiles;
                }
            }
        });
        
        Object.values(employeesData).forEach(emp => {
            if (emp.id.includes('cadet') && emp.username === 'Вакантно') {
                const totalFiles = (emp.files.academy?.length || 0) + 
                                  (emp.files.exam?.length || 0) + 
                                  (emp.files.retraining?.length || 0);
                
                if (totalFiles > 0) {
                    const allFiles = [
                        ...(emp.files.academy || []),
                        ...(emp.files.exam || []),
                        ...(emp.files.retraining || [])
                    ];
                    
                    allFiles.forEach(file => {
                        const fileContent = file.content || '';
                        const nameMatch = fileContent.match(/Имя[:\s]+([^\n]+)/i) || 
                                         fileContent.match(/Имя пользователя[:\s]+([^\n]+)/i);
                        
                        if (nameMatch) {
                            const foundName = nameMatch[1].trim();
                            
                            const realOwner = Object.values(employeesData).find(e => 
                                e.username !== 'Вакантно' && 
                                e.username.toLowerCase() === foundName.toLowerCase()
                            );
                            
                            if (realOwner) {
                                const fileType = file.name.toLowerCase().includes('академи') ? 'academy' :
                                               file.name.toLowerCase().includes('экзамен') ? 'exam' :
                                               file.name.toLowerCase().includes('переатт') ? 'retraining' : 'academy';
                                
                                if (!realOwner.files[fileType]) {
                                    realOwner.files[fileType] = [];
                                }
                                
                                realOwner.files[fileType].push(file);
                            }
                        }
                    });
                    
                    emp.files = {
                        academy: [],
                        exam: [],
                        retraining: []
                    };
                }
            }
        });
        
    } else {
        employeesData = {};
        FIXED_EMPLOYEE_STRUCTURE.forEach(emp => {
            employeesData[emp.id] = {
                ...emp,
                username: emp.username,
                folders: {
                    academy: `${emp.username !== 'Вакантно' ? emp.username : emp.position}_Академия`,
                    exam: `${emp.username !== 'Вакантно' ? emp.username : emp.position}_Экзамен`,
                    retraining: `${emp.username !== 'Вакантно' ? emp.username : emp.position}_Переаттестация`
                },
                files: {
                    academy: [],
                    exam: [],
                    retraining: []
                }
            };
        });
    }
    
    saveEmployeesData(employeesData);
    return employeesData;
}

function saveEmployeesData(employeesData) {
    localStorage.setItem('fixedEmployees', JSON.stringify(employeesData));
}

function getEmployeeByUsername(username, employeesData) {
    return Object.values(employeesData).find(emp => 
        emp.username.toLowerCase() === username.toLowerCase() && emp.username !== 'Вакантно'
    );
}

function addFileToEmployeeFolder(username, folderType, fileName, content) {
    const employeesData = loadEmployeesData();
    let employee = getEmployeeByUsername(username, employeesData);
    
    if (!employee) {
        employee = Object.values(employeesData).find(emp => 
            emp.username !== 'Вакантно' && 
            username.toLowerCase().includes(emp.username.toLowerCase())
        );
        
        if (!employee) {
            employee = Object.values(employeesData).find(emp => 
                emp.username !== 'Вакантно' && 
                emp.username.toLowerCase().includes(username.toLowerCase())
            );
        }
        
        if (!employee) {
            employee = Object.values(employeesData).find(emp => 
                emp.username !== 'Вакантно' && 
                emp.username.toLowerCase().startsWith(username.toLowerCase().split('_')[0])
            );
        }
    }
    
    if (!employee) {
        return false;
    }

    const file = {
        id: Date.now().toString(),
        name: fileName,
        content: content,
        date: new Date().toLocaleString('ru-RU'),
        type: 'document',
        graded: fileName.includes('оценка') || fileName.includes('разблокировка'),
        score: content.match(/Оценка: (\d+)%/)?.[1] || 0,
        isUnlockFile: fileName.includes('разблокировка'),
        isGraded: fileName.includes('оценка'),
        isNew: true
    };

    if (!employee.files[folderType]) {
        employee.files[folderType] = [];
    }

    employee.files[folderType].push(file);
    saveEmployeesData(employeesData);
    
    return true;
}

function getTestTypeName(type) {
    switch(type) {
        case 'exam': return 'Экзамен';
        case 'retraining': return 'Переаттестация';
        default: return 'Тест';
    }
}

function parseAnswersFromReport(reportText) {
    const lines = reportText.split('\n');
    const answers = [];
    let currentQuestion = null;
    let currentAnswer = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.match(/^\d+\./)) {
            if (currentQuestion && currentAnswer !== null) {
                answers.push({
                    question: currentQuestion,
                    answer: currentAnswer,
                    correct: false
                });
            }
            currentQuestion = line.replace(/^\d+\.\s*/, '');
            currentAnswer = null;
        } else if (line.startsWith('Ответ:') && currentQuestion) {
            currentAnswer = line.replace('Ответ:', '').trim();
        }
    }

    if (currentQuestion && currentAnswer !== null) {
        answers.push({
            question: currentQuestion,
            answer: currentAnswer,
            correct: false
        });
    }

    return answers;
}

function escapeHtml(str) {
    if (typeof str !== "string") return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function showMessage(message, type = "info") {
    const alertDiv = document.createElement("div");
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10001;
        max-width: 300px;
    `;
    
    if (type === "success") {
        alertDiv.style.background = "#10b981";
    } else if (type === "error") {
        alertDiv.style.background = "#ef4444";
    } else {
        alertDiv.style.background = "#3b82f6";
    }
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function showError(message) {
    showMessage(message, "error");
}

// === ФУНКЦИИ ТЕСТИРОВАНИЯ ===

function resetInactivityTimer() {
    lastActivityTime = Date.now();
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    if (test && !test.blocked) {
        const bufferTime = test.current === 0 ? 10000 : 0;
        
        inactivityTimer = setTimeout(() => {
            const timeSinceLastActivity = Date.now() - lastActivityTime;
            if (test && !test.blocked && timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
                showError("Тест заблокирован за бездействие!");
                blockTest();
            }
        }, INACTIVITY_TIMEOUT + bufferTime);
    }
}

function trackActivity() {
    resetInactivityTimer();
}

function showInactivityWarning() {
    const timeLeft = INACTIVITY_TIMEOUT - (Date.now() - lastActivityTime);
    if (timeLeft <= 5000 && !document.getElementById('inactivityWarning')) {
        const warning = document.createElement('div');
        warning.className = 'inactivity-warning';
        warning.id = 'inactivityWarning';
        warning.innerHTML = `⚠️ Внимание! Бездействие обнаружено!<br>Тест будет заблокирован через ${Math.ceil(timeLeft/1000)} сек.`;
        document.body.appendChild(warning);
        
        setTimeout(() => {
            const w = document.getElementById('inactivityWarning');
            if (w) w.remove();
        }, 5000);
    }
}

function shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function getQuestionsByType(type) {
    switch(type) {
        case 'exam': return examQuestions;
        case 'retraining': return retrainingQuestions;
        default: return examQuestions;
    }
}

function getTestForUserType(userType) {
    if (userType === 'cadet') {
        return 'exam';
    } else if (userType === 'officer' || userType === 'senior_officer') {
        return 'retraining';
    } else if (userType === 'curator') {
        return null; // Куратор выбирает сам через вкладки
    }
    return null;
}

function showDisclaimer() {
    const username = document.getElementById("username").value.trim();
    if (!username) {
        showError("Введите имя перед началом теста!");
        return;
    }
    
    if (!currentUser) {
        showError("Авторизуйтесь!");
        return;
    }
    
    // Проверяем, что введённый ник совпадает с авторизованным
    if (username.toLowerCase() !== currentUser.username.toLowerCase()) {
        showError(`Вы авторизованы как ${currentUser.username}. Введите свой ник!`);
        return;
    }
    
    // Проверяем, какой тест должен проходить пользователь
    const testType = getTestForUserType(currentUser.type);
    if (!testType) {
        showError("Ваш статус не позволяет проходить тестирование.");
        return;
    }
    
    // Для куратора - проверяем, что он выбрал тип теста на вкладке
    if (currentUser.type === 'curator') {
        const selectedType = localStorage.getItem('curatorSelectedTest');
        if (!selectedType) {
            showError("Сначала выберите тип теста на вкладке!");
            return;
        }
        currentTestType = selectedType;
    } else {
        currentTestType = testType;
    }
    
    const modal = document.getElementById("disclaimerModal");
    modal.style.display = "flex";
    document.getElementById("closeDisclaimerBtn").onclick = closeDisclaimer;
    document.getElementById("confirmStartBtn").onclick = confirmStartTest;
}

function closeDisclaimer() {
    const modal = document.getElementById("disclaimerModal");
    modal.style.display = "none";
}

function confirmStartTest() {
    const modal = document.getElementById("disclaimerModal");
    modal.style.display = "none";
    actuallyStartTest();
}

function actuallyStartTest() {
    const username = document.getElementById("username").value.trim();
    if (!username) {
        showError("Введите имя!");
        return;
    }
    
    if (!currentUser) {
        showError("Авторизуйтесь!");
        return;
    }
    
    if (username.toLowerCase() !== currentUser.username.toLowerCase()) {
        showError(`Вы авторизованы как ${currentUser.username}. Введите свой ник!`);
        return;
    }
    
    // Для куратора - проверяем выбранный тип через активную вкладку
    if (currentUser.type === 'curator') {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            currentTestType = activeTab.dataset.tab;
        } else {
            currentTestType = 'exam';
        }
    } else {
        const testType = getTestForUserType(currentUser.type);
        if (!testType) {
            showError("Ваш статус не позволяет проходить тестирование.");
            return;
        }
        currentTestType = testType;
    }
    
    // Проверяем доступ к тесту
    if (currentTestType === 'exam' && currentUser.type !== 'cadet' && currentUser.type !== 'curator') {
        showError("Экзамен доступен только курсантам!");
        return;
    }
    
    if (currentTestType === 'retraining' && currentUser.type !== 'officer' && currentUser.type !== 'senior_officer' && currentUser.type !== 'curator') {
        showError("Переаттестация доступна только офицерам и выше!");
        return;
    }
    
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    
    const questions = getQuestionsByType(currentTestType);
    const shuffledQuestions = shuffleArray([...questions]).slice(0, TEST_COUNT);
    
    // Генерируем код разблокировки
    const unlockCode = generateReadableCode();
    
    test = {
        username: currentUser.username,
        userType: currentUser.type,
        current: 0,
        answers: {},
        shuffledQuestions,
        startTime: new Date(),
        blocked: true, // Сразу блокируем тест
        testType: currentTestType,
        unlockCode: unlockCode,
        blockReason: 'Ожидание разблокировки'
    };
    
    // Создаём файл с кодом разблокировки
    createUnlockFile();
    
    saveTestState();
    document.getElementById("unlockBtn").style.display = "inline-block";
    document.getElementById("adminUnlockBtn").style.display = "inline-block";
    document.getElementById("finishBtn").style.display = "none"; // Скрываем до разблокировки
    
    showMessage(`📄 Код разблокировки выдан! Файл скачан. Отправьте код администратору.`, "success");
    
    // Блокируем элементы теста
    document.querySelectorAll("input, button, textarea, select").forEach(el => {
        if (el.id === "username") {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        if (el.id === "logoutBtn") {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        if (el.id.includes("unlock") || el.id.includes("adminUnlock")) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        if (el.closest(".tabs")) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        if (el.closest('#authModal')) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        el.disabled = true;
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
    });
    
    renderBlockedScreen();
}

function adminUnblockTest() {
    if (!test) {
        showError("Нет активного теста для разблокировки!");
        return;
    }
    
    if (!authenticateAdmin()) {
        showError("Только для администратора!");
        return;
    }
    
    if (test.blocked) {
        blocked = false;
        test.blocked = false;
        delete test.unlockCode;
        
        document.querySelectorAll("input, button").forEach(el => {
            if (!el.id.includes("admin") && el.id !== "username" && !el.closest(".tabs")) {
                el.disabled = false;
            }
        });
        
        saveTestState();
        showMessage("Тест успешно разблокирован администратором!", "success");
        resetInactivityTimer();
        renderCurrentTest();
    } else {
        showError("Тест не заблокирован!", "info");
    }
}

function unblockTest() {
    const code = document.getElementById("username").value.trim().toUpperCase();
    if (!test) {
        showError("Нет активного теста для разблокировки!");
        return;
    }
    
    if (code === test.unlockCode) {
        blocked = false;
        test.blocked = false;
        document.querySelectorAll("input, button").forEach(el => el.disabled = false);
        saveTestState();
        showMessage("Тест успешно разблокирован!", "success");
        resetInactivityTimer();
        renderCurrentTest();
    } else {
        showError("Неверный код разблокировки!");
    }
}

function blockTest() {
    if (blocked || !test) return;
    
    blocked = true;
    test.blocked = true;

    // БЛОКИРУЕМ ТОЛЬКО ЭЛЕМЕНТЫ ТЕСТА
    document.querySelectorAll("input, button, textarea, select").forEach(el => {
        // === НИКОГДА НЕ БЛОКИРУЕМ АВТОРИЗАЦИЮ ===
        if (el.closest('#authModal')) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        // === НИКОГДА НЕ БЛОКИРУЕМ ЭЛЕМЕНТЫ АВТОРИЗАЦИИ ПО ID ===
        if (el.id === 'authUsername' || el.id === 'authPassword' || el.id === 'authActionBtn' || el.id === 'authStatus') {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        // === НИКОГДА НЕ БЛОКИРУЕМ ПОЛЕ ВВОДА НИКА ===
        if (el.id === "username") {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        if (el.id === "logoutBtn") {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        if (el.id.includes("unlock") || el.id.includes("adminUnlock")) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        if (el.closest(".tabs")) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        if (el.closest('.auth-tabs')) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        
        el.disabled = true;
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
    });

    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }

    if (!test.unlockCode) {
        test.unlockCode = generateReadableCode();
        createUnlockFile();
    }

    saveTestState();
    renderBlockedScreen();
}

function unblockTestSuccess() {
    blocked = false;
    test.blocked = false;
    test.blockReason = null;
    
    document.querySelectorAll("input, button, textarea, select").forEach(el => {
        el.disabled = false;
        el.style.pointerEvents = 'auto';
        el.style.opacity = '1';
    });
    
    document.getElementById("finishBtn").style.display = "inline-block";
    document.getElementById("unlockBtn").style.display = "none";
    document.getElementById("adminUnlockBtn").style.display = "none";
    
    saveTestState();
    showMessage("Тест разблокирован!", "success");
    resetInactivityTimer();
    renderCurrentTest();
}

function adminUnblockTest() {
    if (!test) {
        showError("Нет активного теста для разблокировки!");
        return;
    }
    
    if (!authenticateAdmin()) {
        showError("Только для администратора!");
        return;
    }
    
    if (test.blocked) {
        blocked = false;
        test.blocked = false;
        test.blockReason = null;
        delete test.unlockCode;
        
        document.querySelectorAll("input, button, textarea, select").forEach(el => {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
        });
        
        document.getElementById("finishBtn").style.display = "inline-block";
        document.getElementById("unlockBtn").style.display = "none";
        document.getElementById("adminUnlockBtn").style.display = "none";
        
        saveTestState();
        showMessage("Тест успешно разблокирован администратором!", "success");
        resetInactivityTimer();
        renderCurrentTest();
    } else {
        showError("Тест не заблокирован!", "info");
    }
}

function createUnlockFile() {
    if (!test) return;
    
    const testTypeName = getTestTypeName(test.testType);
    const unlockContent = `ЕДИНОРАЗОВЫЙ КОД РАЗБЛОКИРОВКИ ТЕСТА
=================================

Тип теста: ${testTypeName}
Имя пользователя: ${test.username}
Должность: ${currentUser ? currentUser.position : 'Неизвестно'}
Код разблокировки: ${test.unlockCode}

Дата выдачи: ${new Date().toLocaleString('ru-RU')}

Инструкция:
1. Этот код является ЕДИНОРАЗОВЫМ.
2. Скопируйте код и отправьте его администратору.
3. Администратор введёт код в системе для разблокировки.
4. После разблокировки код становится недействительным.

=================================
Arizona RP | Военная Полиция`;

    try {
        const encrypted = CryptoJS.AES.encrypt(unlockContent, AES_KEY).toString();
        const blob = new Blob([btoa(encrypted)], { 
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
        });
        saveAs(blob, `${test.username}_${testTypeName}_код_разблокировки.docx`);
        
        // Сохраняем в папку сотрудника
        saveUnlockFileToEmployeeFolder(test.username, test.testType, unlockContent);
        
        showMessage(`📄 Код разблокировки выдан! Файл скачан.`, "success");
    } catch (e) {
        showError('Ошибка создания файла разблокировки');
    }
}

function saveUnlockFileToEmployeeFolder(username, testType, unlockContent) {
    const testTypeName = getTestTypeName(testType);
    const fileName = `${username}_${testTypeName}_разблокировка_${new Date().toLocaleDateString('ru-RU')}.docx`;
    
    addFileToEmployeeFolder(
        username,
        testType,
        fileName,
        unlockContent
    );
}

function renderBlockedScreen() {
    const testTypeName = getTestTypeName(test.testType);
    const area = document.getElementById("mainArea");
    const isWaitingUnlock = test.blockReason === 'Ожидание разблокировки';
    
    area.innerHTML = `
        <div class="blocked-note ${isWaitingUnlock ? 'test-blocked-neutral' : ''}" 
             style="${isWaitingUnlock ? 'background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.1); color: var(--text-muted);' : ''}">
            <h2 style="${isWaitingUnlock ? 'color: var(--text-muted);' : ''}">
                ${isWaitingUnlock ? '🔒' : '🚫'} ${testTypeName} ${isWaitingUnlock ? 'заблокирован. Требуется разблокировка!' : 'заблокирован за бездействие!'}
            </h2>
            ${isWaitingUnlock ? `
                <p>Для начала теста необходим <strong>единоразовый код разблокировки</strong>.</p>
                <p>Файл с кодом был скачан. Отправьте его администратору.</p>
            ` : `
                <p>Система зафиксировала отсутствие активности более 20 секунд.</p>
                <p>Файл с кодом разблокировки был скачан и сохранен в вашу папку.</p>
            `}
            <p>Отправьте файл <strong>${test.username}_${testTypeName}_код_разблокировки.docx</strong> администратору.</p>
            
            <div style="margin: 20px 0;">
                <button class="btn ghost" id="resendCodeBtn">📧 Получить код повторно</button>
            </div>
            
            <div style="margin-top: 20px;">
                <input type="text" id="unlockCodeInput" placeholder="Введите код от администратора" style="margin: 10px 0; width: 100%; max-width: 400px;">
                <button class="btn" id="submitUnlockBtn">🔓 Разблокировать тест</button>
            </div>
            
            <div style="margin-top: 15px;">
                <button class="btn warning" id="adminUnlockBtn" style="background: var(--warning); color: black;">
                    🔓 Админ-разблокировка
                </button>
            </div>
        </div>
    `;

    document.getElementById("resendCodeBtn").addEventListener("click", () => {
        createUnlockFile();
        showMessage("Файл с кодом разблокировки отправлен на скачивание!", "success");
    });

    document.getElementById("submitUnlockBtn").addEventListener("click", () => {
        const enteredCode = document.getElementById("unlockCodeInput").value.trim().toUpperCase();
        if (enteredCode === test.unlockCode) {
            unblockTestSuccess();
        } else {
            showError("Неверный код разблокировки!");
        }
    });
    
    document.getElementById("adminUnlockBtn").addEventListener("click", adminUnblockTest);
}

function renderCurrentTest() {
    // Принудительно устанавливаем тип теста для курсантов и офицеров
    if (currentUser) {
        if (currentUser.type === 'cadet') {
            currentTestType = 'exam';
        } else if (currentUser.type === 'officer' || currentUser.type === 'senior_officer') {
            currentTestType = 'retraining';
        }
    }
    
    if (test && test.testType) {
        currentTestType = test.testType;
    }
    
    // Показываем/скрываем кнопки в зависимости от состояния теста
    if (test && test.blocked) {
        document.getElementById("unlockBtn").style.display = "inline-block";
        document.getElementById("adminUnlockBtn").style.display = "inline-block";
        document.getElementById("finishBtn").style.display = "none";
    } else if (test && !test.blocked) {
        document.getElementById("unlockBtn").style.display = "none";
        document.getElementById("adminUnlockBtn").style.display = "none";
        document.getElementById("finishBtn").style.display = "inline-block";
    } else {
        document.getElementById("unlockBtn").style.display = "none";
        document.getElementById("adminUnlockBtn").style.display = "none";
        document.getElementById("finishBtn").style.display = "none";
    }
    
    // Показываем приветствие
    if (currentUser && currentUser.type) {
        renderGreeting();
    }
    
    if (currentTestType === 'exam') {
        renderExam();
    } else if (currentTestType === 'retraining') {
        renderRetraining();
    } else {
        renderExam();
    }
}

function clearTestIfDifferent(testType) {
    if (test && test.testType !== testType) {
        if (confirm(`У вас активен тест "${getTestTypeName(test.testType)}". Переключиться на "${getTestTypeName(testType)}"? Текущий тест будет потерян.`)) {
            clearTestState();
            return true;
        }
        return false;
    }
    return true;
}
// === ФУНКЦИИ ДЛЯ ОТОБРАЖЕНИЯ ТЕСТОВ ===

function renderExam() {
    currentTestType = 'exam';
    if (test && test.testType) {
        currentTestType = test.testType;
    }
    
    const area = document.getElementById("mainArea");
    
    // Если тест создан для другого типа - показываем сообщение
    if (test && test.testType !== 'exam') {
        area.innerHTML = `
            <div class="question-box">
                <div id="testGreeting"></div>
                <h2>🎓 Экзамен Военной Полиции</h2>
                <p><strong>⛔ Активный тест другого типа!</strong></p>
                <p>Сейчас активен тест: <strong>${getTestTypeName(test.testType)}</strong></p>
                <p>Завершите текущий тест или переключитесь на соответствующую вкладку.</p>
                <div style="margin-top: 15px;">
                    <button class="btn ghost" id="clearTestBtn">🗑️ Очистить тест</button>
                </div>
            </div>
        `;
        document.getElementById("clearTestBtn")?.addEventListener("click", () => {
            if (confirm("Очистить текущий тест? Все ответы будут потеряны.")) {
                clearTestState();
                renderCurrentTest();
            }
        });
        return;
    }
    
    if (!test) {
        if (!currentUser) {
            area.innerHTML = `
                <div class="question-box">
                    <div id="testGreeting"></div>
                    <h2>🎓 Экзамен Военной Полиции</h2>
                    <p><strong>🔒 Для доступа к тесту необходимо авторизоваться.</strong></p>
                    <p>Экзамен доступен только курсантам.</p>
                </div>
            `;
            return;
        }
        
        if (currentUser.type !== 'cadet' && currentUser.type !== 'curator') {
            area.innerHTML = `
                <div class="question-box">
                    <div id="testGreeting"></div>
                    <h2>🎓 Экзамен Военной Полиции</h2>
                    <p><strong>⛔ Доступ запрещён!</strong></p>
                    <p>Экзамен доступен только <strong>курсантам</strong>.</p>
                    <p>Ваш статус: <strong>${currentUser.position}</strong></p>
                </div>
            `;
            return;
        }
        
        area.innerHTML = `
            <div class="question-box">
                <div id="testGreeting"></div>
                <h2>🎓 Экзамен Военной Полиции</h2>
                <p><strong>${currentUser.username}</strong> (${currentUser.position})</p>
                <p>Тест состоит из <strong>15 вопросов</strong> по основной деятельности ВП.</p>
                <p><strong>Для начала теста потребуется единоразовый код разблокировки.</strong></p>
                <p>После нажатия "Начать тест" файл с кодом будет скачан.</p>
                <div style="margin-top: 15px; color: var(--warning); font-size: 0.9em;">
                    ⚠️ Система отслеживает активность! Бездействие >20 секунд — блокировка.
                </div>
            </div>
        `;
        return;
    }

    if (test.blocked) {
        renderBlockedScreen();
        return;
    }

    renderTestQuestions();
}

function renderRetraining() {
    currentTestType = 'retraining';
    if (test && test.testType) {
        currentTestType = test.testType;
    }
    
    const area = document.getElementById("mainArea");
    
    if (!test) {
        if (!currentUser) {
            area.innerHTML = `
                <div class="question-box">
                    <div id="testGreeting"></div>
                    <h2>🔄 Переаттестация Военной Полиции</h2>
                    <p><strong>🔒 Для доступа к тесту необходимо авторизоваться.</strong></p>
                    <p>Переаттестация доступна офицерам и выше.</p>
                </div>
            `;
            return;
        }
        
        if (currentUser.type !== 'officer' && currentUser.type !== 'senior_officer' && currentUser.type !== 'curator') {
            area.innerHTML = `
                <div class="question-box">
                    <div id="testGreeting"></div>
                    <h2>🔄 Переаттестация Военной Полиции</h2>
                    <p><strong>⛔ Доступ запрещён!</strong></p>
                    <p>Переаттестация доступна только <strong>офицерам и выше</strong>.</p>
                    <p>Ваш статус: <strong>${currentUser.position}</strong></p>
                </div>
            `;
            return;
        }
        
        area.innerHTML = `
            <div class="question-box">
                <div id="testGreeting"></div>
                <h2>🔄 Переаттестация Военной Полиции</h2>
                <p><strong>${currentUser.username}</strong> (${currentUser.position})</p>
                <p>Тест состоит из <strong>15 вопросов</strong> для обновления знаний и навыков.</p>
                <p><strong>Для начала теста потребуется единоразовый код разблокировки.</strong></p>
                <p>После нажатия "Начать тест" файл с кодом будет скачан.</p>
                <div style="margin-top: 15px; color: var(--warning); font-size: 0.9em;">
                    ⚠️ Система отслеживает активность! Бездействие >20 секунд — блокировка.
                </div>
            </div>
        `;
        return;
    }

    if (test.blocked) {
        renderBlockedScreen();
        return;
    }

    renderTestQuestions();
}

function renderMultipleChoiceQuestion(q, currentIndex) {
    const savedAnswers = test.answers[currentIndex];
    let selectedOptions = [];
    
    if (savedAnswers && Array.isArray(savedAnswers)) {
        selectedOptions = savedAnswers;
    } else if (savedAnswers && typeof savedAnswers === 'string') {
        selectedOptions = [savedAnswers];
    } else {
        selectedOptions = [];
    }
    
    const maxSelections = q.maxSelections || 2;
    
    return `
        <div class="question-box">
            <div class="question-header">
                <span class="question-counter">Вопрос ${test.current + 1} из ${TEST_COUNT}</span>
                <span class="selection-limit">✅ Выберите до ${maxSelections} вариантов</span>
            </div>
            
            <div class="question-text-large">${escapeHtml(q.text)}</div>
            
            <div class="options-grid">
                ${q.options.map((option) => {
                    const isSelected = selectedOptions.includes(option);
                    return `
                        <div class="option-card ${isSelected ? 'selected' : ''}" data-option-value="${escapeHtml(option)}">
                            <div class="option-check">
                                <span class="checkmark">${isSelected ? '✓' : ''}</span>
                            </div>
                            <div class="option-text">${escapeHtml(option)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="selected-info">
                <span>📋 Выбрано: <strong id="selectedCount">${selectedOptions.length}</strong> / ${maxSelections}</span>
            </div>
            
            <div class="question-actions">
                <button class="btn btn-primary" id="nextBtn">
                    ${test.current < TEST_COUNT - 1 ? "Следующий вопрос →" : "✓ Завершить тест"}
                </button>
            </div>
            
            <div class="activity-warning">
                ⚠️ Система отслеживает активность!
            </div>
        </div>
    `;
}

function renderTextQuestion(q, currentIndex) {
    return `
        <div class="question-box">
            <h3>Вопрос ${test.current + 1} из ${TEST_COUNT}</h3>
            <p><strong>${q.text}</strong></p>
            <input type="text" id="answerInput" placeholder="Введите ваш ответ здесь..." 
                   value="${test.answers[test.current] || ''}" autocomplete="off">
            <div style="margin-top: 20px;">
                <button class="btn" id="nextBtn">
                    ${test.current < TEST_COUNT - 1 ? "Следующий вопрос" : "Завершить тест"}
                </button>
            </div>
            <div class="small" style="margin-top: 15px; color: var(--warning);">
                ⚠️ Система отслеживает активность!
            </div>
        </div>
    `;
}

function renderTestQuestions() {
    const q = test.shuffledQuestions[test.current];
    const area = document.getElementById("mainArea");
    
    if (q.type === 'multiple' && q.options && q.options.length > 0) {
        area.innerHTML = renderMultipleChoiceQuestion(q, test.current);
        
        const optionCards = document.querySelectorAll('.option-card');
        const selectedCountSpan = document.getElementById('selectedCount');
        const maxSelections = q.maxSelections || 2;
        
        const updateSelection = () => {
            const selectedOptions = Array.from(document.querySelectorAll('.option-card.selected'))
                .map(card => card.dataset.optionValue);
            
            test.answers[test.current] = selectedOptions;
            saveTestState();
            
            if (selectedCountSpan) {
                selectedCountSpan.textContent = selectedOptions.length;
            }
        };
        
        optionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const isSelected = card.classList.contains('selected');
                const currentSelected = document.querySelectorAll('.option-card.selected').length;
                
                if (!isSelected && currentSelected >= maxSelections) {
                    showError(`Можно выбрать не более ${maxSelections} вариантов!`);
                    return;
                }
                
                if (isSelected) {
                    card.classList.remove('selected');
                    card.querySelector('.checkmark').textContent = '';
                } else {
                    card.classList.add('selected');
                    card.querySelector('.checkmark').textContent = '✓';
                }
                
                updateSelection();
                trackActivity();
            });
        });
        
        const nextBtn = document.getElementById("nextBtn");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                const selectedOptions = test.answers[test.current];
                if (!selectedOptions || selectedOptions.length === 0) {
                    showError("Пожалуйста, выберите хотя бы один вариант ответа!");
                    return;
                }
                nextQuestion();
            });
        }
        
    } else {
        area.innerHTML = renderTextQuestion(q, test.current);
        
        const answerInput = document.getElementById("answerInput");
        if (answerInput) {
            answerInput.addEventListener("input", (e) => {
                trackActivity();
                test.answers[test.current] = e.target.value.trim();
                saveTestState();
            });
            
            answerInput.addEventListener("keypress", (e) => {
                trackActivity();
                if (e.key === "Enter") {
                    nextQuestion();
                }
            });
            
            answerInput.addEventListener("mousedown", trackActivity);
            answerInput.focus();
        }
        
        const nextBtn = document.getElementById("nextBtn");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                trackActivity();
                nextQuestion();
            });
        }
    }
}

function renderReviewPage() {
    const area = document.getElementById("mainArea");
    const testTypeName = getTestTypeName(test.testType);
    
    let answersHtml = '';
    
    test.shuffledQuestions.forEach((q, index) => {
        const userAnswer = test.answers[index];
        let answerDisplay = '';
        
        if (q.type === 'multiple' && q.options) {
            const selectedOptions = Array.isArray(userAnswer) ? userAnswer : [];
            answerDisplay = `
                <div class="review-multiple-answers">
                    ${q.options.map(option => {
                        const isSelected = selectedOptions.includes(option);
                        return `
                            <span class="review-option ${isSelected ? 'review-option-selected' : 'review-option-unselected'}">
                                ${isSelected ? '✓' : '○'} ${escapeHtml(option)}
                            </span>
                        `;
                    }).join('')}
                </div>
                <div class="review-edit">
                    <button class="btn small review-edit-btn" data-question-index="${index}">✏️ Редактировать</button>
                </div>
            `;
        } else {
            const answerText = userAnswer || "Нет ответа";
            answerDisplay = `
                <div class="review-answer-text">${escapeHtml(answerText)}</div>
                <div class="review-edit">
                    <button class="btn small review-edit-btn" data-question-index="${index}">✏️ Редактировать</button>
                </div>
            `;
        }
        
        answersHtml += `
            <div class="review-item" data-question-index="${index}">
                <div class="review-question-header">
                    <span class="review-question-number">Вопрос ${index + 1}</span>
                    <span class="review-question-text">${escapeHtml(q.text)}</span>
                </div>
                <div class="review-answer">
                    ${answerDisplay}
                </div>
            </div>
        `;
    });
    
    area.innerHTML = `
        <div class="review-container">
            <div class="review-header">
                <h2>📋 Предварительный просмотр ответов</h2>
                <p>Проверьте все свои ответы перед завершением ${testTypeName.toLowerCase()}</p>
                <div class="review-stats">
                    <div class="review-stat">
                        <span>📝 Всего вопросов:</span>
                        <strong>${TEST_COUNT}</strong>
                    </div>
                    <div class="review-stat">
                        <span>✅ Отвечено:</span>
                        <strong>${Object.keys(test.answers).length}</strong>
                    </div>
                    <div class="review-stat">
                        <span>❌ Без ответа:</span>
                        <strong>${TEST_COUNT - Object.keys(test.answers).length}</strong>
                    </div>
                </div>
            </div>
            
            <div class="review-answers-list">
                ${answersHtml}
            </div>
            
            <div class="review-actions">
                <button class="btn ghost" id="backToTestBtn">← Вернуться к тесту</button>
                <button class="btn" id="confirmFinishBtn">
                    ✅ Завершить тест
                </button>
            </div>
        </div>
    `;
    
    document.getElementById("backToTestBtn").addEventListener("click", () => {
        renderCurrentTest();
    });
    
    document.querySelectorAll(".review-edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const questionIndex = parseInt(btn.dataset.questionIndex);
            test.current = questionIndex;
            saveTestState();
            renderCurrentTest();
        });
    });
    
    const confirmFinishBtn = document.getElementById("confirmFinishBtn");
    if (confirmFinishBtn) {
        confirmFinishBtn.addEventListener("click", () => {
            finishTest();
        });
    }
}

function nextQuestion() {
    if (test.current < TEST_COUNT - 1) {
        test.current++;
        saveTestState();
        renderCurrentTest();
    } else {
        renderReviewPage();
    }
}

function finishTestManually() {
    if (confirm("Вы уверены, что хотите завершить тест? Все ответы будут сохранены, но файл не будет скачан.")) {
        renderReviewPage();
    }
}

function finishTest() {
    if (!test) {
        showError("Нет активного теста.");
        return;
    }

    const endTime = new Date();
    const timeSpent = Math.round((endTime - test.startTime) / 1000 / 60);
    const testTypeName = getTestTypeName(test.testType);
    
    let correctCount = 0;
    const answeredQuestions = Object.keys(test.answers).length;

    test.shuffledQuestions.forEach((q, i) => {
        const userAnswer = test.answers[i];
        if (!userAnswer) return;
        
        if (q.type === 'multiple') {
            if (q.correctAnswers && Array.isArray(q.correctAnswers) && userAnswer && Array.isArray(userAnswer)) {
                const sortedUser = [...userAnswer].sort();
                const sortedCorrect = [...q.correctAnswers].sort();
                if (sortedUser.length === sortedCorrect.length && 
                    sortedUser.every((val, index) => val === sortedCorrect[index])) {
                    correctCount++;
                }
            }
        } else {
            if (userAnswer && userAnswer.trim() !== '') correctCount++;
        }
    });

    const score = test.shuffledQuestions.length > 0 ? Math.round((correctCount / TEST_COUNT) * 100) : 0;
    const passed = score >= 70;

    // Сохраняем результат
    saveTestResultForStatistics(test, timeSpent, score, correctCount, passed);

    // Генерируем файл с результатами
    let reportText = `${testTypeName.toUpperCase()} ВОЕННОЙ ПОЛИЦИИ - РЕЗУЛЬТАТЫ
=================================

Общая информация:
----------------
Имя: ${test.username}
Тип теста: ${testTypeName}
Дата: ${new Date().toLocaleString('ru-RU')}
Время выполнения: ${timeSpent} минут
Всего вопросов: ${TEST_COUNT}
Правильных ответов: ${correctCount}
Оценка: ${score}%
Статус: ${passed ? '✅ ПРОЙДЕН' : '❌ НЕ ПРОЙДЕН'}

Ответы:
----------------
`;

    test.shuffledQuestions.forEach((q, i) => {
        let answerText = test.answers[i];
        if (Array.isArray(answerText)) {
            answerText = answerText.join(', ');
        } else if (!answerText) {
            answerText = "Нет ответа";
        }
        
        reportText += `\n${i + 1}. ${q.text}\n`;
        reportText += `Ответ: ${answerText}\n`;
        reportText += `---------------------------------\n`;
    });

    reportText += `

=================================
Arizona RP | Военная Полиция
Тест завершен.`;

    // Сохраняем файл с результатами
    try {
        const encrypted = CryptoJS.AES.encrypt(reportText, AES_KEY).toString();
        const blob = new Blob([btoa(encrypted)], { 
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
        });
        saveAs(blob, `${test.username}_${testTypeName}_${timeSpent}мин_результаты.docx`);
        showMessage("Файл с результатами скачан!", "success");
    } catch (e) {
        showError("Ошибка сохранения результатов");
    }

    // Сохраняем в статистику
    saveTestResultForStatistics(test, timeSpent, score, correctCount, passed);

    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }

    // Очищаем состояние теста
    const testUsername = test.username;
    const testType = test.testType;
    clearTestState();
    
    document.getElementById("unlockBtn").style.display = "none";
    document.getElementById("adminUnlockBtn").style.display = "none";
    document.getElementById("finishBtn").style.display = "none";
    document.getElementById("startBtn").disabled = false;

    document.getElementById("mainArea").innerHTML = `
        <div class="question-box">
            <h2>✅ ${testTypeName} завершён!</h2>
            <p><strong>${escapeHtml(testUsername)}</strong>, ваш ${testTypeName.toLowerCase()} успешно завершён.</p>
            <p><strong>Результат: ${score}% (${correctCount}/${TEST_COUNT})</strong></p>
            <p>${passed ? '🎉 Поздравляем! Тест пройден успешно!' : '😔 К сожалению, тест не пройден.'}</p>
            <p><strong>Вы ответили на ${answeredQuestions} из ${TEST_COUNT} вопросов.</strong></p>
            <p>Файл с результатами был автоматически скачан.</p>
            <div style="margin-top: 20px;">
                <button class="btn" id="restartBtn">🔄 Пройти тест снова</button>
            </div>
        </div>
    `;

    document.getElementById("restartBtn").addEventListener("click", () => {
        document.getElementById("username").value = "";
        document.querySelectorAll("input, button").forEach(el => el.disabled = false);
        showMessage("Готово к новому тесту!", "success");
        renderCurrentTest();
    });
}

function saveTestResultForStatistics(testData, timeSpent, score, correctCount, passed) {
    const testResult = {
        id: Date.now().toString(),
        username: testData.username,
        testType: testData.testType,
        score: score,
        timeSpent: timeSpent,
        totalQuestions: TEST_COUNT,
        correctAnswers: correctCount,
        date: new Date().toISOString(),
        graded: false,
        passed: passed
    };
    
    const pendingResults = JSON.parse(localStorage.getItem('pendingTestResults') || '[]');
    pendingResults.push(testResult);
    localStorage.setItem('pendingTestResults', JSON.stringify(pendingResults));
}

function saveTestState() {
    if (test) {
        localStorage.setItem('currentTest', JSON.stringify({
            username: test.username,
            userType: test.userType,
            current: test.current,
            answers: test.answers,
            shuffledQuestions: test.shuffledQuestions,
            startTime: test.startTime,
            blocked: test.blocked,
            unlockCode: test.unlockCode,
            testType: test.testType,
            blockReason: test.blockReason
        }));
    }
}

function loadTestState() {
    const saved = localStorage.getItem('currentTest');
    if (saved) {
        try {
            const savedTest = JSON.parse(saved);
            test = {
                username: savedTest.username,
                userType: savedTest.userType,
                current: savedTest.current,
                answers: savedTest.answers,
                shuffledQuestions: savedTest.shuffledQuestions,
                startTime: new Date(savedTest.startTime),
                blocked: savedTest.blocked,
                unlockCode: savedTest.unlockCode,
                testType: savedTest.testType || 'exam',
                blockReason: savedTest.blockReason || 'Бездействие'
            };
            blocked = savedTest.blocked;
            currentTestType = savedTest.testType || 'exam';
            
            if (blocked) {
                document.querySelectorAll("input, button, textarea, select").forEach(el => {
                    if (el.closest('#authModal')) {
                        el.disabled = false;
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                        return;
                    }
                    if (el.id === 'authUsername' || el.id === 'authPassword' || el.id === 'authActionBtn' || el.id === 'authStatus') {
                        el.disabled = false;
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                        return;
                    }
                    if (el.id === "username") {
                        el.disabled = false;
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                        return;
                    }
                    if (el.id === "logoutBtn") {
                        el.disabled = false;
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                        return;
                    }
                    if (el.id.includes("unlock") || el.id.includes("adminUnlock")) {
                        el.disabled = false;
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                        return;
                    }
                    if (el.closest(".tabs")) {
                        el.disabled = false;
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                        return;
                    }
                    if (el.closest('.auth-tabs')) {
                        el.disabled = false;
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                        return;
                    }
                    
                    el.disabled = true;
                    el.style.pointerEvents = 'none';
                    el.style.opacity = '0.5';
                });
            }
        } catch (e) {
            localStorage.removeItem('currentTest');
            test = null;
            blocked = false;
        }
    }
}

function clearTestState() {
    localStorage.removeItem('currentTest');
    test = null;
    blocked = false;
}

function generateReadableCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// === ФУНКЦИИ ДЛЯ СТАТИСТИКИ ===

function calculateStats() {
    const statistics = JSON.parse(localStorage.getItem('testStatistics') || '[]');
    const validResults = statistics.filter(result => 
        result.graded === true && 
        result.score !== undefined && 
        result.username && 
        result.testType
    );
    
    if (validResults.length === 0) {
        return getEmptyStats();
    }
    
    const uniqueResults = [];
    const seen = new Set();
    
    validResults.forEach(result => {
        const key = `${result.username}_${result.testType}_${new Date(result.date).getTime()}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(result);
        }
    });
    
    const scores = uniqueResults.map(f => f.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round(totalScore / uniqueResults.length);
    
    const times = uniqueResults.map(result => result.timeSpent || 15);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const averageTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    
    const formatTime = (minutes) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}` : `${mins} мин`;
    };
    
    const passedTests = uniqueResults.filter(f => f.passed).length;
    const passRate = Math.round((passedTests / uniqueResults.length) * 100);
    
    const examResults = uniqueResults.filter(f => f.testType === 'exam');
    const retrainingResults = uniqueResults.filter(f => f.testType === 'retraining');
    
    const examCount = examResults.length;
    const retrainingCount = retrainingResults.length;
    
    const examRanking = createSimpleRanking(examResults, 'Экзамен');
    const retrainingRanking = createSimpleRanking(retrainingResults, 'Переаттестация');
    
    const gradeDistribution = {
        excellent: uniqueResults.filter(f => f.score >= 90).length,
        good: uniqueResults.filter(f => f.score >= 70 && f.score < 90).length,
        satisfactory: uniqueResults.filter(f => f.score >= 50 && f.score < 70).length,
        fail: uniqueResults.filter(f => f.score < 50).length
    };
    
    const recentResults = uniqueResults
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(f => ({
            name: f.username,
            score: f.score,
            passed: f.passed,
            date: new Date(f.date).toLocaleString('ru-RU'),
            type: getTestTypeName(f.testType),
            time: formatTime(f.timeSpent || 15),
            id: f.id
        }));
    
    const lastMonthResults = uniqueResults.filter(result => {
        const resultDate = new Date(result.date);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return resultDate > monthAgo;
    });
    
    const lastMonthPassRate = lastMonthResults.length > 0 
        ? Math.round((lastMonthResults.filter(f => f.passed).length / lastMonthResults.length) * 100)
        : passRate;
    
    const passRateTrend = passRate > lastMonthPassRate ? 'up' : 'down';
    
    return {
        totalTests: uniqueResults.length,
        averageScore,
        passRate,
        passRateTrend,
        examCount,
        retrainingCount,
        minScore,
        maxScore,
        minTime: formatTime(minTime),
        maxTime: formatTime(maxTime),
        averageTime: formatTime(averageTime),
        gradeDistribution,
        recentResults,
        examRanking,
        retrainingRanking,
        examPassRate: examResults.length > 0 ? Math.round((examResults.filter(f => f.passed).length / examResults.length) * 100) : 0,
        retrainingPassRate: retrainingResults.length > 0 ? Math.round((retrainingResults.filter(f => f.passed).length / retrainingResults.length) * 100) : 0,
        lastUpdated: new Date().toLocaleString('ru-RU'),
        allResults: uniqueResults.map(r => ({
            ...r,
            timeFormatted: formatTime(r.timeSpent || 15),
            testTypeName: getTestTypeName(r.testType)
        }))
    };
}

function createSimpleRanking(results, type) {
    if (results.length === 0) return [];
    
    return results
        .map(result => ({
            username: result.username,
            score: result.score,
            passed: result.passed,
            date: new Date(result.date).toLocaleString('ru-RU'),
            time: `${result.timeSpent || 15} мин`,
            correctAnswers: result.correctAnswers || 0,
            totalAnswers: result.totalAnswers || 15,
            initials: getInitials(result.username),
            id: result.id
        }))
        .sort((a, b) => b.score - a.score)
        .map((result, index) => ({
            ...result,
            rank: index + 1,
            position: `${index + 1}/${results.length}`,
            isTop3: index < 3
        }));
}

function getInitials(username) {
    const parts = username.split(/[_\s-]/);
    return parts.map(part => part.charAt(0).toUpperCase()).join('').slice(0, 2);
}

function getEmptyStats() {
    return {
        totalTests: 0,
        averageScore: 0,
        passRate: 0,
        passRateTrend: 'up',
        examCount: 0,
        retrainingCount: 0,
        minScore: 0,
        maxScore: 0,
        minTime: "0:00",
        maxTime: "0:00",
        averageTime: "0:00",
        gradeDistribution: { excellent: 0, good: 0, satisfactory: 0, fail: 0 },
        recentResults: [],
        examRanking: [],
        retrainingRanking: [],
        examPassRate: 0,
        retrainingPassRate: 0,
        lastUpdated: new Date().toLocaleString('ru-RU'),
        allResults: []
    };
}

function renderGradeDistribution(distribution) {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (total === 0) return '<p class="no-data">📊 Нет данных для отображения</p>';
    
    const percentages = {
        excellent: Math.round((distribution.excellent / total) * 100),
        good: Math.round((distribution.good / total) * 100),
        satisfactory: Math.round((distribution.satisfactory / total) * 100),
        fail: Math.round((distribution.fail / total) * 100)
    };
    
    return `
        <div class="pie-chart" style="
            --excellent: ${percentages.excellent};
            --good: ${percentages.good};
            --satisfactory: ${percentages.satisfactory};
        ">
            <div class="chart-center">
                ${total}
            </div>
        </div>
        
        <div class="chart-legend">
            <div class="legend-item">
                <div class="legend-color" style="background: var(--success);"></div>
                <span>Отлично (${distribution.excellent})</span>
                <strong>${percentages.excellent}%</strong>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #3b82f6;"></div>
                <span>Хорошо (${distribution.good})</span>
                <strong>${percentages.good}%</strong>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: var(--warning);"></div>
                <span>Удовл. (${distribution.satisfactory})</span>
                <strong>${percentages.satisfactory}%</strong>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: var(--error);"></div>
                <span>Неудовл. (${distribution.fail})</span>
                <strong>${percentages.fail}%</strong>
            </div>
        </div>
    `;
}

function renderRecentResults(results) {
    if (results.length === 0) return '<p class="no-data">⏳ Пока нет завершенных тестов</p>';
    
    return results.map((result, index) => `
        <div class="timeline-item" style="animation-delay: ${index * 0.1}s">
            <div class="timeline-date">${result.date}</div>
            <div class="timeline-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <strong>${result.name}</strong> - ${result.type}
                        <div class="trend-indicator ${result.score >= 70 ? 'up' : 'down'}">
                            <span class="trend-arrow">${result.score >= 70 ? '↗' : '↘'}</span>
                            <span>${result.score}%</span>
                            <span>(${result.time})</span>
                        </div>
                    </div>
                    ${result.id ? `
                        <button class="btn small ghost delete-recent-test" 
                                style="padding: 2px 8px; font-size: 0.8em;"
                                onclick="event.stopPropagation(); deleteSpecificTest('${result.id}', '${result.name}', '${result.type.toLowerCase()}')"
                                title="Удалить этот тест">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderRanking(ranking, type) {
    if (ranking.length === 0) {
        return `<div class="no-data-message">
                    <div class="skeleton skeleton-card"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>`;
    }
    
    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3, 10);
    
    return `
        <div class="ranking-animated">
            ${top3.map((result, index) => `
                <div class="ranking-item top-3" style="animation-delay: ${index * 0.2}s">
                    <div class="ranking-avatar">
                        ${result.initials}
                    </div>
                    <div class="ranking-info">
                        <div class="ranking-name">${result.username}</div>
                        <div class="ranking-details">
                            <span class="ranking-score">${result.score}%</span>
                            <span>${result.time}</span>
                            <span>${result.correctAnswers}/${result.totalAnswers}</span>
                        </div>
                    </div>
                    <div class="ranking-medal">
                        ${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                </div>
            `).join('')}
            
            ${rest.map((result, index) => `
                <div class="ranking-item" style="animation-delay: ${0.6 + index * 0.1}s">
                    <div class="ranking-avatar">
                        ${result.initials}
                    </div>
                    <div class="ranking-info">
                        <div class="ranking-name">${result.username}</div>
                        <div class="ranking-details">
                            <span class="ranking-score">${result.score}%</span>
                            <span>${result.time}</span>
                        </div>
                    </div>
                    <div class="ranking-position">#${result.rank}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderStatsProgress(stats) {
    return `
        <div class="progress-bars">
            <div class="progress-item">
                <div class="progress-label">
                    <span>📊 Общая проходимость</span>
                    <span>${stats.passRate}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${stats.passRate}%; background: ${stats.passRate >= 70 ? 'var(--success)' : stats.passRate >= 50 ? 'var(--warning)' : 'var(--error)'}">
                        <span class="progress-percent">${stats.passRate}%</span>
                    </div>
                </div>
            </div>
            
            <div class="progress-item">
                <div class="progress-label">
                    <span>🎓 Экзамены</span>
                    <span>${stats.examPassRate}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${stats.examPassRate}%; background: var(--accent)}">
                        <span class="progress-percent">${stats.examPassRate}%</span>
                    </div>
                </div>
            </div>
            
            <div class="progress-item">
                <div class="progress-label">
                    <span>🔄 Переаттестация</span>
                    <span>${stats.retrainingPassRate}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${stats.retrainingPassRate}%; background: #8b5cf6">
                        <span class="progress-percent">${stats.retrainingPassRate}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderPendingTests() {
    const pendingResults = JSON.parse(localStorage.getItem('pendingTestResults') || '[]');
    
    if (pendingResults.length === 0) {
        return '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Нет тестов, ожидающих оценку</p>';
    }
    
    return `
        <div class="pending-list">
            ${pendingResults.map((test, index) => `
                <div class="pending-item" style="animation-delay: ${index * 0.1}s">
                    <div class="pending-info">
                        <strong>${escapeHtml(test.username)}</strong>
                        <span class="pending-type">${getTestTypeName(test.testType)}</span>
                        <span class="pending-time">⏱️ ${test.timeSpent} мин</span>
                    </div>
                    <div class="pending-date">
                        ${new Date(test.date).toLocaleString('ru-RU')}
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 10px; font-size: 0.9em; color: var(--text-muted);">
            📝 Эти тесты завершены, но еще не оценены администратором
        </div>
    `;
}

function renderPlayersList(searchTerm = '') {
    let filteredPlayers = playersDatabase;
    
    if (searchTerm) {
        filteredPlayers = playersDatabase.filter(player => 
            player.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (filteredPlayers.length === 0) {
        return '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Игроки не найдены</p>';
    }
    
    return `
        <div class="players-grid">
            ${filteredPlayers.map((player, index) => `
                <div class="player-card" style="animation-delay: ${index * 0.1}s">
                    <div class="player-header">
                        <strong>${escapeHtml(player.username)}</strong>
                        <span class="player-id">ID: ${player.id.slice(-6)}</span>
                    </div>
                    <div class="player-folders">
                        <div class="folder-item">
                            <span class="folder-icon">🎓</span>
                            <span>${player.folders.exam}</span>
                        </div>
                        <div class="folder-item">
                            <span class="folder-icon">🔄</span>
                            <span>${player.folders.retraining}</span>
                        </div>
                        <div class="folder-item">
                            <span class="folder-icon">📚</span>
                            <span>${player.folders.academy}</span>
                        </div>
                    </div>
                    <div class="player-stats">
                        <div class="stat">
                            <span>Экзамены:</span>
                            <strong>${player.tests?.exam?.length || 0}</strong>
                        </div>
                        <div class="stat">
                            <span>Переатт.:</span>
                            <strong>${player.tests.retraining.length}</strong>
                        </div>
                        <div class="stat">
                            <span>Академия:</span>
                            <strong>${player.tests.academy.length}</strong>
                        </div>
                    </div>
                    <div class="player-actions">
                        <button class="btn small" onclick="viewPlayerDetails('${player.id}')">👁️ Просмотр</button>
                        <button class="btn small ghost" onclick="deletePlayer('${player.id}')">🗑️ Удалить</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 10px; font-size: 0.9em; color: var(--text-muted);">
            Всего игроков: ${filteredPlayers.length}
        </div>
    `;
}

function searchPlayers() {
    const searchTerm = document.getElementById('searchPlayer').value;
    const playersList = document.querySelector('.players-list');
    if (playersList) {
        playersList.innerHTML = renderPlayersList(searchTerm);
    }
}

function viewPlayerDetails(playerId) {
    const player = playersDatabase.find(p => p.id === playerId);
    if (!player) return;
    
    alert(`Детали игрока:\n\nИмя: ${player.username}\nID: ${player.id}\nЗарегистрирован: ${new Date(player.registrationDate).toLocaleString('ru-RU')}\n\nПапки:\n- ${player.folders.exam}\n- ${player.folders.retraining}\n- ${player.folders.academy}\n\nТесты:\n- Экзамены: ${player.tests.exam.length}\n- Переаттестации: ${player.tests.retraining.length}\n- Академия: ${player.tests.academy.length}`);
}

function deletePlayer(playerId) {
    const player = playersDatabase.find(p => p.id === playerId);
    if (!player) return;
    
    if (confirm(`Удалить игрока "${player.username}" и все его данные?`)) {
        playersDatabase = playersDatabase.filter(p => p.id !== playerId);
        localStorage.setItem('playersDatabase', JSON.stringify(playersDatabase));
        showMessage(`Игрок "${player.username}" удален`, "success");
        
        const playersList = document.querySelector('.players-list');
        if (playersList) {
            playersList.innerHTML = renderPlayersList();
        }
    }
}

function exportStatistics() {
    const stats = calculateStats();
    
    let csvContent = "Статистика тестирования\n\n";
    csvContent += "Общая статистика:\n";
    csvContent += `Всего тестов,${stats.totalTests}\n`;
    csvContent += `Средний балл,${stats.averageScore}%\n`;
    csvContent += `Минимальный балл,${stats.minScore}%\n`;
    csvContent += `Максимальный балл,${stats.maxScore}%\n`;
    csvContent += `Проходимость,${stats.passRate}%\n`;
    csvContent += `Среднее время,${stats.averageTime}\n`;
    csvContent += `Минимальное время,${stats.minTime}\n`;
    csvContent += `Максимальное время,${stats.maxTime}\n`;
    csvContent += `Экзамены,${stats.examCount}\n`;
    csvContent += `Переаттестации,${stats.retrainingCount}\n\n`;
    
    csvContent += "Распределение оценок:\n";
    csvContent += `Отлично (90-100%),${stats.gradeDistribution.excellent}\n`;
    csvContent += `Хорошо (70-89%),${stats.gradeDistribution.good}\n`;
    csvContent += `Удовлетворительно (50-69%),${stats.gradeDistribution.satisfactory}\n`;
    csvContent += `Неудовлетворительно (0-49%),${stats.gradeDistribution.fail}\n\n`;
    
    csvContent += "Рейтинг экзаменов (от худшего к лучшему):\n";
    csvContent += "Место,Имя,Оценка,Время,Правильные ответы,Всего вопросов,Статус\n";
    stats.examRanking.forEach(result => {
        csvContent += `${result.rank},${result.username},${result.score}%,${result.time},${result.correctAnswers},${result.totalAnswers},${result.passed ? 'ПРОЙДЕН' : 'НЕ ПРОЙДЕН'}\n`;
    });
    
    csvContent += "\nРейтинг переаттестации (от худшего к лучшему):\n";
    csvContent += "Место,Имя,Оценка,Время,Правильные ответы,Всего вопросов,Статус\n";
    stats.retrainingRanking.forEach(result => {
        csvContent += `${result.rank},${result.username},${result.score}%,${result.time},${result.correctAnswers},${result.totalAnswers},${result.passed ? 'ПРОЙДЕН' : 'НЕ ПРОЙДЕН'}\n`;
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `статистика_тестирования_${new Date().toISOString().slice(0,10)}.csv`);
    showMessage("Статистика экспортирована в CSV", "success");
}

function clearAllData() {
    if (confirm("ВНИМАНИЕ! Это удалит ВСЕ данные:\n- Всех игроков\n- Все тесты\n- Всю статистику\n- Все файлы\n\nВы уверены?")) {
        const adminAuthenticated = localStorage.getItem('adminAuthenticated');
        const fixedEmployees = localStorage.getItem('fixedEmployees');
        
        localStorage.clear();
        
        if (fixedEmployees) {
            localStorage.setItem('fixedEmployees', fixedEmployees);
        }
        if (adminAuthenticated) {
            localStorage.setItem('adminAuthenticated', adminAuthenticated);
        }
        
        playersDatabase = [];
        isAdminAuthenticated = adminAuthenticated === 'true';
        
        showMessage("Все данные удалены (кроме фиксированных сотрудников)", "success");
        renderAdmin();
    }
}

// === ФУНКЦИИ РАБОТЫ С СОТРУДНИКАМИ В АДМИНКЕ ===

function renderFixedEmployees(employeesData) {
    return `
        <div class="employees-composition">
            ${FIXED_EMPLOYEE_STRUCTURE.map(empTemplate => {
                const employee = employeesData[empTemplate.id];
                const isVacant = employee.username === 'Вакантно';
                const isFixedEmployee = FIXED_EMPLOYEE_STRUCTURE.find(fixed => 
                    fixed.id === empTemplate.id && fixed.username !== 'Вакантно'
                );
                
                let typeClass = '';
                if (employee.type === 'curator' || employee.type === 'senior_officer') {
                    typeClass = 'employee-high-rank';
                } else {
                    typeClass = 'employee-standard';
                }
                
                const academyFiles = employee.files.academy || [];
                const examFiles = employee.files.exam || [];
                const retrainingFiles = employee.files.retraining || [];
                
                return `
                    <div class="employee-slot ${typeClass}" data-employee-id="${employee.id}">
                        <div class="employee-header">
                            <div class="employee-position">${employee.position}</div>
                            <div class="employee-status ${isVacant ? 'status-vacant' : 'status-occupied'}">
                                ${isVacant ? '🔄 Вакантно' : '✅ ' + employee.username}
                            </div>
                        </div>
                        
                        <div class="employee-content">
                            ${isFixedEmployee && !isVacant ? `
                            ` : `
                                <input type="text" 
                                       class="employee-username" 
                                       value="" 
                                       placeholder="Введите ник сотрудника"
                                       data-employee-id="${employee.id}">
                                
                                <div class="employee-actions">
                                    <button class="btn small save-employee-btn" data-employee-id="${employee.id}">
                                        💾 Сохранить
                                    </button>
                                    <button class="btn small ghost clear-employee-btn" data-employee-id="${employee.id}" ${isVacant ? 'style="display: none;"' : ''}>
                                        🗑️ Очистить
                                    </button>
                                </div>
                            `}
                            
                            ${!isVacant ? `
                                <div class="employee-folders">
                                    <div class="folder-card ${getFolderState(academyFiles)}" 
                                         data-employee-id="${employee.id}" 
                                         data-folder-type="academy">
                                        ${getFolderBadges(academyFiles)}
                                        <div class="folder-icon">${getFolderIcon('academy')}</div>
                                        <div class="folder-label">${getFolderLabel('academy')}</div>
                                        <div class="folder-stats">
                                            <div class="file-count">${academyFiles.length} файлов</div>
                                            ${getFolderStatus(academyFiles, getFolderStats(academyFiles))}
                                        </div>
                                    </div>
                                    
                                    <div class="folder-card ${getFolderState(examFiles)}" 
                                         data-employee-id="${employee.id}" 
                                         data-folder-type="exam">
                                        ${getFolderBadges(examFiles)}
                                        <div class="folder-icon">${getFolderIcon('exam')}</div>
                                        <div class="folder-label">${getFolderLabel('exam')}</div>
                                        <div class="folder-stats">
                                            <div class="file-count">${examFiles.length} файлов</div>
                                            ${getFolderStatus(examFiles, getFolderStats(examFiles))}
                                        </div>
                                    </div>
                                    
                                    <div class="folder-card ${getFolderState(retrainingFiles)}" 
                                         data-employee-id="${employee.id}" 
                                         data-folder-type="retraining">
                                        ${getFolderBadges(retrainingFiles)}
                                        <div class="folder-icon">${getFolderIcon('retraining')}</div>
                                        <div class="folder-label">${getFolderLabel('retraining')}</div>
                                        <div class="folder-stats">
                                            <div class="file-count">${retrainingFiles.length} файлов</div>
                                            ${getFolderStatus(retrainingFiles, getFolderStats(retrainingFiles))}
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <div class="employee-empty">
                                    <span class="empty-text">Должность свободна</span>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function getFolderState(files) {
    if (files.length === 0) return 'empty';
    
    const hasUnlockFiles = files.some(f => f.isUnlockFile);
    const hasGradedFiles = files.some(f => f.graded && !f.isUnlockFile);
    const hasNewFiles = files.some(f => f.isNew);
    const hasPendingFiles = files.some(f => !f.graded && !f.isUnlockFile);
    
    if (hasUnlockFiles) return 'has-unlock';
    if (hasNewFiles) return 'has-new';
    if (hasPendingFiles) return 'has-pending';
    if (hasGradedFiles) return 'has-graded';
    
    return 'has-files';
}

function getFolderStats(files) {
    const totalFiles = files.length;
    const unlockFiles = files.filter(f => f.isUnlockFile).length;
    const gradedFiles = files.filter(f => f.graded && !f.isUnlockFile).length;
    const pendingFiles = files.filter(f => !f.graded && !f.isUnlockFile).length;
    const newFiles = files.filter(f => f.isNew).length;
    
    const averageScore = gradedFiles > 0 
        ? Math.round(files.filter(f => f.graded && !f.isUnlockFile)
                         .reduce((sum, f) => sum + parseInt(f.score), 0) / gradedFiles)
        : 0;
    
    return { 
        totalFiles, 
        unlockFiles, 
        gradedFiles, 
        pendingFiles,
        newFiles,
        averageScore 
    };
}

function getFolderIcon(folderType) {
    const icons = {
        academy: '📚',
        exam: '🎓',
        retraining: '🔄'
    };
    return icons[folderType] || '📁';
}

function getFolderLabel(folderType) {
    const labels = {
        academy: 'Академия',
        exam: 'Экзамен',
        retraining: 'Переатт.'
    };
    return labels[folderType] || folderType;
}

function getFolderBadges(files) {
    let badges = '';
    const stats = getFolderStats(files);
    
    if (stats.unlockFiles > 0) {
        badges += '<div class="folder-badge badge-unlock">🔓</div>';
    }
    if (stats.newFiles > 0) {
        badges += '<div class="folder-badge badge-new">NEW</div>';
    }
    
    return badges;
}

function getFolderStatus(files, stats) {
    if (stats.unlockFiles > 0) {
        return `<div class="folder-details">${stats.unlockFiles} блокировка</div>`;
    }
    if (stats.pendingFiles > 0) {
        return `<div class="folder-details">Ожидает оценки</div>`;
    }
    if (stats.gradedFiles > 0) {
        const scoreClass = getScoreClass(stats.averageScore);
        return `<div class="folder-score ${scoreClass}">${stats.averageScore}%</div>`;
    }
    return `<div class="folder-details"></div>`;
}

function getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
}

function initEmployeesManagement() {
    document.querySelectorAll('.save-employee-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const employeeId = e.target.dataset.employeeId;
            const input = document.querySelector(`.employee-username[data-employee-id="${employeeId}"]`);
            
            if (input) {
                const username = input.value.trim();
                
                if (!username) {
                    showError('Введите ник сотрудника!');
                    return;
                }
                
                saveEmployee(employeeId, username);
            }
        });
    });
    
    document.querySelectorAll('.clear-employee-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const employeeId = e.target.dataset.employeeId;
            clearEmployee(employeeId);
        });
    });
    
    document.querySelectorAll('.employee-username').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const employeeId = e.target.dataset.employeeId;
                const username = e.target.value.trim();
                
                if (username) {
                    saveEmployee(employeeId, username);
                }
            }
        });
    });
    
    document.querySelectorAll('.folder-card').forEach(folder => {
        folder.addEventListener('click', (e) => {
            const employeeId = e.currentTarget.dataset.employeeId;
            const folderType = e.currentTarget.dataset.folderType;
            openFolderModal(employeeId, folderType);
        });
    });
}

function saveEmployee(employeeId, username) {
    const employeesData = loadEmployeesData();
    const employee = employeesData[employeeId];
    
    const fixedEmployee = FIXED_EMPLOYEE_STRUCTURE.find(emp => 
        emp.id === employeeId && emp.username !== 'Вакантно'
    );
    
    if (fixedEmployee && fixedEmployee.username !== 'Вакантно') {
        showError(`Сотрудник "${fixedEmployee.username}" является фиксированным и не может быть изменен!`);
        return;
    }
    
    const existingEmployee = getEmployeeByUsername(username, employeesData);
    if (existingEmployee && existingEmployee.id !== employeeId) {
        showError(`Сотрудник "${username}" уже назначен на должность "${existingEmployee.position}"!`);
        return;
    }
    
    employee.username = username;
    
    employee.folders = {
        academy: `${username}_Академия`,
        exam: `${username}_Экзамен`,
        retraining: `${username}_Переаттестация`
    };
    
    saveEmployeesData(employeesData);
    showMessage(`Сотрудник "${username}" назначен на должность "${employee.position}"`, 'success');
    
    renderAdmin();
}

function clearEmployee(employeeId) {
    const employeesData = loadEmployeesData();
    const employee = employeesData[employeeId];
    const oldUsername = employee.username;
    
    const fixedEmployee = FIXED_EMPLOYEE_STRUCTURE.find(emp => 
        emp.id === employeeId && emp.username !== 'Вакантно'
    );
    
    if (fixedEmployee && fixedEmployee.username !== 'Вакантно') {
        showError(`Сотрудник "${fixedEmployee.username}" является фиксированным и не может быть удален!`);
        return;
    }
    
    if (oldUsername === 'Вакантно') {
        showError('Эта должность уже свободна!');
        return;
    }
    
    if (!confirm(`Освободить должность "${employee.position}" от сотрудника "${oldUsername}"?`)) {
        return;
    }
    
    employee.username = 'Вакантно';
    
    employee.folders = {
        academy: `${employee.position}_Академия`,
        exam: `${employee.position}_Экзамен`,
        retraining: `${employee.position}_Переаттестация`
    };
    
    saveEmployeesData(employeesData);
    showMessage(`Должность "${employee.position}" освобождена`, 'success');
    
    renderAdmin();
}

function openFolderModal(employeeId, folderType) {
    const employeesData = loadEmployeesData();
    const employee = employeesData[employeeId];
    
    if (!employee) return;
    
    const folderNames = {
        academy: 'Академия',
        exam: 'Экзамен', 
        retraining: 'Переаттестация'
    };
    
    const files = employee.files[folderType] || [];
    const testFiles = files.filter(f => !f.isUnlockFile);
    const unlockFiles = files.filter(f => f.isUnlockFile);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>📁 ${employee.username} - ${folderNames[folderType]}</h2>
            <div class="small" style="margin-bottom: 15px; color: var(--text-muted);">
                📝 Файлы появляются здесь после оценки администратором или блокировки теста
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <h4 style="margin-top: 0; color: var(--accent);">📤 Загрузить файл в папку</h4>
                <input type="file" id="folderFileInput" accept=".docx,.txt,.pdf" style="display: none;">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button class="btn small" id="chooseFolderFileBtn">📁 Выбрать файл</button>
                    <span id="selectedFileName" style="color: var(--text-muted); font-size: 0.9em;">Файл не выбран</span>
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn small" id="uploadToFolderBtn" disabled>⬆️ Загрузить в папку</button>
                </div>
            </div>
            
            <div class="files-list">
                ${unlockFiles.length > 0 ? `
                    <div class="file-section">
                        <div class="file-section-title">
                            <span>🔓</span>
                            <span>Файлы разблокировки (${unlockFiles.length})</span>
                        </div>
                        ${unlockFiles.map(file => `
                            <div class="file-item">
                                <div class="file-info">
                                    <div class="file-name">
                                        <span>🔓</span>
                                        ${escapeHtml(file.name)}
                                    </div>
                                    <div class="file-date">${file.date}</div>
                                    <div class="file-score" style="color: var(--warning);">Файл разблокировки</div>
                                </div>
                                <div class="file-actions">
                                    <button class="btn small download-file-btn" 
                                            data-file-content="${btoa(unescape(encodeURIComponent(file.content)))}"
                                            data-file-name="${file.name}">
                                        📥 Скачать
                                    </button>
                                    <button class="btn small ghost delete-file-btn" 
                                            data-file-id="${file.id}">
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${testFiles.length > 0 ? `
                    <div class="file-section">
                        <div class="file-section-title">
                            <span>📝</span>
                            <span>Результаты тестов (${testFiles.length})</span>
                        </div>
                        ${testFiles.map(file => `
                            <div class="file-item">
                                <div class="file-info">
                                    <div class="file-name">
                                        ${file.graded ? '✅' : '⏳'} ${escapeHtml(file.name)}
                                    </div>
                                    <div class="file-date">${file.date}</div>
                                    ${file.graded ? `
                                        <div class="file-score ${file.score >= 70 ? 'score-good' : 'score-bad'}">
                                            Оценка: ${file.score}%
                                        </div>
                                    ` : `
                                        <div class="file-score" style="color: var(--warning);">
                                            Ожидает оценки
                                        </div>
                                    `}
                                </div>
                                <div class="file-actions">
                                    <button class="btn small download-file-btn" 
                                            data-file-content="${btoa(unescape(encodeURIComponent(file.content)))}"
                                            data-file-name="${file.name}">
                                        📥 Скачать
                                    </button>
                                    <button class="btn small ghost delete-file-btn" 
                                            data-file-id="${file.id}">
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${files.length === 0 ? `
                    <div class="no-files-message">
                        <p>📁 В папке пока нет файлов</p>
                        <p class="small">Вы можете загрузить файлы с помощью формы выше</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-buttons">
                <button class="btn ghost" id="closeFolderModal">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeFolderModal').addEventListener('click', () => {
        modal.remove();
    });
    
    const folderFileInput = document.getElementById('folderFileInput');
    const chooseFolderFileBtn = document.getElementById('chooseFolderFileBtn');
    const uploadToFolderBtn = document.getElementById('uploadToFolderBtn');
    const selectedFileName = document.getElementById('selectedFileName');
    
    chooseFolderFileBtn.addEventListener('click', () => folderFileInput.click());
    
    folderFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            selectedFileName.textContent = file.name;
            uploadToFolderBtn.disabled = false;
        } else {
            selectedFileName.textContent = 'Файл не выбран';
            uploadToFolderBtn.disabled = true;
        }
    });
    
    uploadToFolderBtn.addEventListener('click', () => {
        const file = folderFileInput.files[0];
        if (!file) return;
        
        uploadFileToEmployeeFolder(file, employeeId, folderType, modal);
    });
    
    document.querySelectorAll('.download-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fileContent = e.target.dataset.fileContent;
            const fileName = e.target.dataset.fileName;
            
            try {
                const content = decodeURIComponent(escape(atob(fileContent)));
                const blob = new Blob([content], { 
                    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                });
                saveAs(blob, fileName);
                showMessage('Файл скачан', 'success');
            } catch (error) {
                showError('Ошибка при скачивании файла');
            }
        });
    });
    
    document.querySelectorAll('.delete-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fileId = e.target.dataset.fileId;
            if (confirm('Удалить этот файл?')) {
                deleteEmployeeFile(employeeId, folderType, fileId);
                modal.remove();
                renderAdmin();
            }
        });
    });
}

function uploadFileToEmployeeFolder(file, employeeId, folderType, modal) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const content = e.target.result;
        const fileName = file.name;
        
        const employeesData = loadEmployeesData();
        const employee = employeesData[employeeId];
        
        if (!employee) {
            showError('Сотрудник не найден!');
            return;
        }
        
        const newFile = {
            id: Date.now().toString(),
            name: fileName,
            content: typeof content === 'string' ? content : new TextDecoder().decode(content),
            date: new Date().toLocaleString('ru-RU'),
            type: 'uploaded',
            graded: false,
            score: 0,
            isUnlockFile: false,
            isGraded: false,
            isNew: true
        };
        
        if (!employee.files[folderType]) {
            employee.files[folderType] = [];
        }
        
        employee.files[folderType].push(newFile);
        saveEmployeesData(employeesData);
        
        showMessage(`Файл "${fileName}" успешно загружен в папку!`, 'success');
        
        modal.remove();
        renderAdmin();
    };
    
    reader.onerror = () => {
        showError('Ошибка при чтении файла');
    };
    
    reader.readAsText(file);
}

function deleteEmployeeFile(employeeId, folderType, fileId) {
    const employeesData = loadEmployeesData();
    const employee = employeesData[employeeId];
    
    if (!employee || !employee.files[folderType]) return;
    
    employee.files[folderType] = employee.files[folderType].filter(file => file.id !== fileId);
    saveEmployeesData(employeesData);
    
    showMessage('Файл удален', 'success');
}

// === ФУНКЦИИ ДЛЯ АРХИВА ВСЕХ ФАЙЛОВ ===

function getAllFilesFromEmployees() {
    const employeesData = loadEmployeesData();
    const allFiles = [];
    
    Object.values(employeesData).forEach(emp => {
        if (emp.username !== 'Вакантно' && emp.files) {
            ['academy', 'exam', 'retraining'].forEach(folderType => {
                if (emp.files[folderType] && Array.isArray(emp.files[folderType])) {
                    emp.files[folderType].forEach(file => {
                        allFiles.push({
                            ...file,
                            employeeId: emp.id,
                            employeeUsername: emp.username,
                            employeePosition: emp.position,
                            folderType: folderType,
                            folderName: getTestTypeName(folderType),
                            sortDate: file.id ? parseInt(file.id) : Date.now()
                        });
                    });
                }
            });
        }
    });
    
    return allFiles;
}

function openAllFilesModal() {
    const allFiles = getAllFilesFromEmployees();
    
    allFiles.sort((a, b) => {
        if (b.sortDate !== a.sortDate) {
            return b.sortDate - a.sortDate;
        }
        
        const nameA = a.employeeUsername.toLowerCase();
        const nameB = b.employeeUsername.toLowerCase();
        if (nameA !== nameB) {
            return nameA.localeCompare(nameB);
        }
        
        const typeOrder = {
            'exam': 1,
            'academy': 2,
            'retraining': 3
        };
        const orderA = a.isUnlockFile ? 0 : (typeOrder[a.folderType] || 4);
        const orderB = b.isUnlockFile ? 0 : (typeOrder[b.folderType] || 4);
        
        return orderA - orderB;
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = '10002';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 1200px; max-height: 90vh; width: 90vw;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: var(--accent);">📁 Все файлы системы</h2>
                <button class="btn small ghost" id="closeAllFilesModal">✖ Закрыть</button>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 10px 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div>
                        <strong>📊 Всего файлов:</strong> ${allFiles.length}
                    </div>
                    <div>
                        <strong>👥 Сотрудников:</strong> ${new Set(allFiles.map(f => f.employeeUsername)).size}
                    </div>
                    <div>
                        <strong>🎯 Оцененных:</strong> ${allFiles.filter(f => f.graded && !f.isUnlockFile).length}
                    </div>
                    <div>
                        <strong>🔓 Разблокировок:</strong> ${allFiles.filter(f => f.isUnlockFile).length}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="text" 
                           id="allFilesSearch" 
                           placeholder="Поиск по имени файла или сотрудника..." 
                           style="flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white;">
                    <button class="btn small" id="clearAllFilesSearch">🗑️ Очистить</button>
                </div>
                
                <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" class="file-type-filter" value="exam" checked> 🎓 Экзамен
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" class="file-type-filter" value="academy" checked> 📚 Академия
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" class="file-type-filter" value="retraining" checked> 🔄 Переаттестация
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" class="file-type-filter" value="unlock" checked> 🔓 Разблокировки
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" class="file-type-filter" value="graded"> ✅ Оцененные
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" class="file-type-filter" value="pending"> ⏳ Ожидающие оценки
                    </label>
                </div>
            </div>
            
            <div id="allFilesListContainer" style="overflow-y: auto; max-height: 55vh; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; background: rgba(0,0,0,0.2);">
                <div id="allFilesList"></div>
                <div id="allFilesPagination" style="margin-top: 15px; text-align: center;"></div>
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.9em;">
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <div>💡 <strong>Сортировка:</strong> Дата ↓ → Имя ↑ → Тип теста</div>
                    <div>⚠️ <strong>Удаление:</strong> Файлы удаляются навсегда!</div>
                    <div>📥 <strong>Скачивание:</strong> Сохраняет оригинальный формат</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    renderAllFilesList(allFiles);
    
    document.getElementById('closeAllFilesModal').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('clearAllFilesSearch').addEventListener('click', () => {
        document.getElementById('allFilesSearch').value = '';
        renderAllFilesList(allFiles);
    });
    
    document.getElementById('allFilesSearch').addEventListener('input', (e) => {
        renderAllFilesList(allFiles, e.target.value);
    });
    
    document.querySelectorAll('.file-type-filter').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            renderAllFilesList(allFiles);
        });
    });
}

function renderAllFilesList(allFiles, searchTerm = '') {
    const container = document.getElementById('allFilesList');
    const paginationContainer = document.getElementById('allFilesPagination');
    
    if (!container) return;
    
    let filteredFiles = [...allFiles];
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredFiles = filteredFiles.filter(file => 
            file.name.toLowerCase().includes(term) ||
            file.employeeUsername.toLowerCase().includes(term) ||
            file.employeePosition.toLowerCase().includes(term) ||
            (file.content && file.content.toLowerCase().includes(term))
        );
    }
    
    const activeFilters = Array.from(document.querySelectorAll('.file-type-filter:checked'))
        .map(cb => cb.value);
    
    if (activeFilters.length > 0) {
        filteredFiles = filteredFiles.filter(file => {
            let fileType = '';
            
            if (file.isUnlockFile) {
                fileType = 'unlock';
            } else if (file.graded) {
                fileType = 'graded';
            } else if (!file.graded && !file.isUnlockFile) {
                fileType = 'pending';
            }
            
            const matchesType = activeFilters.includes(file.folderType) || 
                               activeFilters.includes(fileType);
            
            return matchesType;
        });
    }
    
    const itemsPerPage = 50;
    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    let currentPage = 1;
    
    function renderPage(page) {
        currentPage = page;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageFiles = filteredFiles.slice(start, end);
        
        if (pageFiles.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
                    <h3>Файлы не найдены</h3>
                    <p>Попробуйте изменить поисковый запрос или фильтры</p>
                </div>
            `;
            paginationContainer.innerHTML = '';
            return;
        }
        
        container.innerHTML = pageFiles.map((file, index) => {
            const number = start + index + 1;
            const isGraded = file.graded && !file.isUnlockFile;
            const isPending = !file.graded && !file.isUnlockFile;
            const isUnlock = file.isUnlockFile;
            
            let icon = '📄';
            let typeColor = 'var(--text-muted)';
            let statusText = '';
            
            if (isUnlock) {
                icon = '🔓';
                typeColor = 'var(--warning)';
                statusText = 'Разблокировка';
            } else if (isGraded) {
                icon = '✅';
                typeColor = file.score >= 70 ? 'var(--success)' : 'var(--error)';
                statusText = `Оценка: ${file.score}%`;
            } else if (isPending) {
                icon = '⏳';
                typeColor = 'var(--warning)';
                statusText = 'Ожидает оценки';
            }
            
            const date = file.date || 'Неизвестно';
            
            return `
                <div class="all-file-item" style="margin-bottom: 10px; padding: 12px; border-radius: 6px; background: rgba(255,255,255,0.03); border-left: 4px solid ${typeColor};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                <span style="font-size: 1.2em;">${icon}</span>
                                <strong style="color: ${typeColor};">${escapeHtml(file.name)}</strong>
                                <span style="font-size: 0.8em; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 10px;">#${number}</span>
                            </div>
                            
                            <div style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 0.9em; color: var(--text-muted);">
                                <div>
                                    <strong>👤:</strong> ${escapeHtml(file.employeeUsername)}
                                    <span style="color: var(--text-muted);">(${escapeHtml(file.employeePosition)})</span>
                                </div>
                                <div>
                                    <strong>📅:</strong> ${date}
                                </div>
                                <div>
                                    <strong>📝:</strong> ${escapeHtml(file.folderName)}
                                </div>
                                ${statusText ? `
                                <div>
                                    <strong>🎯:</strong> <span style="color: ${typeColor};">${statusText}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 5px; flex-shrink: 0;">
                            <button class="btn small view-all-file-btn" 
                                    data-file-id="${file.id}"
                                    data-employee-id="${file.employeeId}"
                                    data-folder-type="${file.folderType}"
                                    title="Просмотр файла">
                                👁️
                            </button>
                            <button class="btn small download-all-file-btn" 
                                    data-file-content="${btoa(unescape(encodeURIComponent(file.content || '')))}"
                                    data-file-name="${file.name}"
                                    title="Скачать файл">
                                📥
                            </button>
                            <button class="btn small ghost delete-all-file-btn" 
                                    data-file-id="${file.id}"
                                    data-employee-id="${file.employeeId}"
                                    data-folder-type="${file.folderType}"
                                    data-file-name="${file.name}"
                                    title="Удалить файл">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        if (totalPages > 1) {
            let paginationHTML = '<div style="display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">';
            
            if (currentPage > 1) {
                paginationHTML += `<button class="btn small pagination-btn" data-page="${currentPage - 1}">← Назад</button>`;
            }
            
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    paginationHTML += `<button class="btn small active" style="background: var(--accent);">${i}</button>`;
                } else {
                    paginationHTML += `<button class="btn small pagination-btn" data-page="${i}">${i}</button>`;
                }
            }
            
            if (currentPage < totalPages) {
                paginationHTML += `<button class="btn small pagination-btn" data-page="${currentPage + 1}">Вперед →</button>`;
            }
            
            paginationHTML += '</div>';
            
            paginationContainer.innerHTML = `
                <div style="text-align: center; margin-top: 15px;">
                    <div style="margin-bottom: 10px; color: var(--text-muted);">
                        Страница ${currentPage} из ${totalPages} • Показано ${pageFiles.length} из ${filteredFiles.length} файлов
                    </div>
                    ${paginationHTML}
                </div>
            `;
            
            document.querySelectorAll('.pagination-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const page = parseInt(btn.dataset.page);
                    renderPage(page);
                });
            });
        } else {
            paginationContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); margin-top: 10px;">
                    Показано ${filteredFiles.length} файлов
                </div>
            `;
        }
        
        addAllFilesEventListeners();
    }
    
    renderPage(1);
}

function addAllFilesEventListeners() {
    document.querySelectorAll('.view-all-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fileId = e.target.dataset.fileId;
            const employeeId = e.target.dataset.employeeId;
            const folderType = e.target.dataset.folderType;
            
            const employeesData = loadEmployeesData();
            const employee = employeesData[employeeId];
            
            if (employee && employee.files[folderType]) {
                const file = employee.files[folderType].find(f => f.id === fileId);
                if (file) {
                    openFileViewer(file);
                } else {
                    showError('Файл не найден!');
                }
            }
        });
    });
    
    document.querySelectorAll('.download-all-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fileContent = e.target.dataset.fileContent;
            const fileName = e.target.dataset.fileName;
            
            try {
                const content = decodeURIComponent(escape(atob(fileContent)));
                const blob = new Blob([content], { 
                    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                });
                saveAs(blob, fileName);
                showMessage('Файл скачан', 'success');
            } catch (error) {
                console.error('Ошибка при скачивании:', error);
                showError('Ошибка при скачивании файла');
            }
        });
    });
    
    document.querySelectorAll('.delete-all-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fileId = e.target.dataset.fileId;
            const employeeId = e.target.dataset.employeeId;
            const folderType = e.target.dataset.folderType;
            const fileName = e.target.dataset.fileName;
            
            if (confirm(`Вы уверены, что хотите удалить файл?\n\n"${fileName}"\n\nЭто действие невозможно отменить!`)) {
                const success = deleteAllFilesFile(employeeId, folderType, fileId);
                
                if (success) {
                    showMessage('Файл удален', 'success');
                    const allFiles = getAllFilesFromEmployees();
                    const searchTerm = document.getElementById('allFilesSearch')?.value || '';
                    renderAllFilesList(allFiles, searchTerm);
                } else {
                    showError('Ошибка при удалении файла');
                }
            }
        });
    });
}

function deleteAllFilesFile(employeeId, folderType, fileId) {
    try {
        const employeesData = loadEmployeesData();
        const employee = employeesData[employeeId];
        
        if (!employee || !employee.files[folderType]) {
            return false;
        }
        
        const initialLength = employee.files[folderType].length;
        employee.files[folderType] = employee.files[folderType].filter(file => file.id !== fileId);
        
        if (employee.files[folderType].length === initialLength) {
            return false;
        }
        
        saveEmployeesData(employeesData);
        return true;
    } catch (error) {
        console.error('Ошибка при удалении файла:', error);
        return false;
    }
}

function deleteSpecificTest(testId, username, testType) {
    if (!confirm(`Удалить тест сотрудника "${username}" (${getTestTypeName(testType)})?\n\nЭто действие нельзя отменить!`)) {
        return false;
    }
    
    const statistics = JSON.parse(localStorage.getItem('testStatistics') || '[]');
    const initialLength = statistics.length;
    
    const updatedStatistics = statistics.filter(test => {
        if (testId) {
            return test.id !== testId;
        }
        return !(test.username === username && test.testType === testType);
    });
    
    if (updatedStatistics.length === initialLength) {
        showError('Тест не найден!');
        return false;
    }
    
    localStorage.setItem('testStatistics', JSON.stringify(updatedStatistics));
    
    const pendingResults = JSON.parse(localStorage.getItem('pendingTestResults') || '[]');
    const updatedPending = pendingResults.filter(test => {
        if (testId) {
            return test.id !== testId;
        }
        return !(test.username === username && test.testType === testType);
    });
    
    if (updatedPending.length !== pendingResults.length) {
        localStorage.setItem('pendingTestResults', JSON.stringify(updatedPending));
    }
    
    showMessage(`Тест сотрудника "${username}" удален из статистики`, 'success');
    
    renderAdmin();
    return true;
}

function deleteAllTestsByType(testType) {
    if (!confirm(`Удалить ВСЕ тесты типа "${getTestTypeName(testType)}"?\n\nЭто действие нельзя отменить!`)) {
        return false;
    }
    
    const statistics = JSON.parse(localStorage.getItem('testStatistics') || '[]');
    const initialLength = statistics.length;
    
    const updatedStatistics = statistics.filter(test => test.testType !== testType);
    
    if (updatedStatistics.length === initialLength) {
        showError(`Не найдено тестов типа "${getTestTypeName(testType)}"`);
        return false;
    }
    
    localStorage.setItem('testStatistics', JSON.stringify(updatedStatistics));
    
    const pendingResults = JSON.parse(localStorage.getItem('pendingTestResults') || '[]');
    const updatedPending = pendingResults.filter(test => test.testType !== testType);
    
    if (updatedPending.length !== pendingResults.length) {
        localStorage.setItem('pendingTestResults', JSON.stringify(updatedPending));
    }
    
    showMessage(`Все тесты типа "${getTestTypeName(testType)}" удалены`, 'success');
    
    renderAdmin();
    return true;
}

function deleteAllTestsByEmployee(username) {
    if (!confirm(`Удалить ВСЕ тесты сотрудника "${username}"?\n\nЭто действие нельзя отменить!`)) {
        return false;
    }
    
    const statistics = JSON.parse(localStorage.getItem('testStatistics') || '[]');
    const initialLength = statistics.length;
    
    const updatedStatistics = statistics.filter(test => test.username !== username);
    
    if (updatedStatistics.length === initialLength) {
        showError(`Не найдено тестов сотрудника "${username}"`);
        return false;
    }
    
    localStorage.setItem('testStatistics', JSON.stringify(updatedStatistics));
    
    const pendingResults = JSON.parse(localStorage.getItem('pendingTestResults') || '[]');
    const updatedPending = pendingResults.filter(test => test.username !== username);
    
    if (updatedPending.length !== pendingResults.length) {
        localStorage.setItem('pendingTestResults', JSON.stringify(updatedPending));
    }
    
    showMessage(`Все тесты сотрудника "${username}" удалены`, 'success');
    
    renderAdmin();
    return true;
}

function deleteAllTests() {
    if (!confirm('ВНИМАНИЕ! Удалить ВСЕ тесты из статистики?\n\nЭто действие нельзя отменить!')) {
        return;
    }
    
    localStorage.setItem('testStatistics', JSON.stringify([]));
    localStorage.setItem('pendingTestResults', JSON.stringify([]));
    
    showMessage('Все тесты удалены', 'success');
    
    const modal = document.querySelector('.modal-overlay[style*="z-index: 10003"]');
    if (modal) modal.remove();
    
    renderAdmin();
}

function openTestManagementModal() {
    const statistics = JSON.parse(localStorage.getItem('testStatistics') || '[]');
    const gradedTests = statistics.filter(test => test.graded === true);
    
    if (gradedTests.length === 0) {
        showMessage('Нет оцененных тестов для управления', 'info');
        return;
    }
    
    const testsByEmployee = {};
    gradedTests.forEach(test => {
        if (!testsByEmployee[test.username]) {
            testsByEmployee[test.username] = [];
        }
        testsByEmployee[test.username].push(test);
    });
    
    const sortedEmployees = Object.keys(testsByEmployee).sort();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = '10003';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 1000px; max-height: 90vh; width: 90vw;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: var(--accent);">🗑️ Управление тестами</h2>
                <button class="btn small ghost" id="closeTestManagementModal">✖ Закрыть</button>
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <h4 style="margin-top: 0;">⚡ Быстрые действия</h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn small danger" onclick="deleteAllTests()">
                        🗑️ Удалить все тесты
                    </button>
                    <button class="btn small warning" onclick="deleteAllTestsByType('exam')">
                        🎓 Удалить все экзамены
                    </button>
                    <button class="btn small warning" onclick="deleteAllTestsByType('retraining')">
                        🔄 Удалить все переатт.
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <input type="text" 
                       id="testSearchInput" 
                       placeholder="Поиск по сотруднику..." 
                       style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white;"
                       onkeyup="filterTestList()">
            </div>
            
            <div id="testListContainer" style="overflow-y: auto; max-height: 60vh; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; background: rgba(0,0,0,0.2);">
                ${sortedEmployees.map(username => {
                    const tests = testsByEmployee[username];
                    const examTests = tests.filter(t => t.testType === 'exam');
                    const retrainingTests = tests.filter(t => t.testType === 'retraining');
                    
                    return `
                        <div class="test-employee-section" data-username="${username}">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                                <div>
                                    <strong style="font-size: 1.1em;">👤 ${escapeHtml(username)}</strong>
                                    <span style="margin-left: 10px; font-size: 0.9em; color: var(--text-muted);">
                                        Всего: ${tests.length} тестов
                                    </span>
                                </div>
                                <button class="btn small danger" onclick="deleteAllTestsByEmployee('${username}')">
                                    🗑️ Удалить все
                                </button>
                            </div>
                            
                            ${examTests.length > 0 ? `
                                <div class="test-type-section">
                                    <div class="test-type-header">
                                        <span>🎓 Экзамены</span>
                                        <span>${examTests.length} тестов</span>
                                    </div>
                                    ${renderTestListItems(examTests)}
                                </div>
                            ` : ''}
                            
                            ${retrainingTests.length > 0 ? `
                                <div class="test-type-section">
                                    <div class="test-type-header">
                                        <span>🔄 Переаттестация</span>
                                        <span>${retrainingTests.length} тестов</span>
                                    </div>
                                    ${renderTestListItems(retrainingTests)}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
                
                ${gradedTests.length === 0 ? `
                    <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
                        <h3>Нет оцененных тестов</h3>
                        <p>Все тесты ожидают оценки администратора</p>
                    </div>
                ` : ''}
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.9em;">
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <div>⚠️ <strong>Внимание:</strong> Удаление тестов нельзя отменить!</div>
                    <div>📊 <strong>Статистика:</strong> ${gradedTests.length} оцененных тестов</div>
                    <div>👥 <strong>Сотрудники:</strong> ${sortedEmployees.length} чел.</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeTestManagementModal').addEventListener('click', () => {
        modal.remove();
    });
    
    if (!document.querySelector('#testManagementStyles')) {
        const styles = document.createElement('style');
        styles.id = 'testManagementStyles';
        styles.textContent = `
            .test-employee-section {
                margin-bottom: 20px;
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 8px;
                padding: 15px;
                background: rgba(0,0,0,0.1);
            }
            
            .test-type-section {
                margin: 15px 0;
                padding: 10px;
                background: rgba(255,255,255,0.02);
                border-radius: 6px;
            }
            
            .test-type-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                font-weight: bold;
                color: var(--accent);
            }
            
            .test-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                margin: 5px 0;
                background: rgba(255,255,255,0.03);
                border-radius: 4px;
                border-left: 3px solid var(--success);
            }
            
            .test-item.failed {
                border-left-color: var(--error);
            }
            
            .test-item .test-info {
                flex: 1;
            }
            
            .test-item .test-score {
                font-weight: bold;
                margin: 0 10px;
                min-width: 50px;
                text-align: center;
            }
            
            .test-item .test-score.passed {
                color: var(--success);
            }
            
            .test-item .test-score.failed {
                color: var(--error);
            }
            
            .btn.danger {
                background: var(--error);
                color: white;
            }
            
            .btn.warning {
                background: var(--warning);
                color: black;
            }
            
            .btn.small {
                padding: 5px 10px;
                font-size: 0.85em;
            }
        `;
        document.head.appendChild(styles);
    }
}

function renderTestListItems(tests) {
    tests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return tests.map(test => {
        const date = new Date(test.date).toLocaleString('ru-RU');
        const passedClass = test.passed ? 'passed' : 'failed';
        const itemClass = test.passed ? '' : 'failed';
        
        return `
            <div class="test-item ${itemClass}">
                <div class="test-info">
                    <div>${date}</div>
                    <div style="font-size: 0.9em; color: var(--text-muted);">
                        ${test.timeSpent || 15} мин • ${test.correctAnswers || 0}/${test.totalAnswers || 15}
                    </div>
                </div>
                <div class="test-score ${passedClass}">
                    ${test.score}%
                </div>
                <button class="btn small danger" 
                        onclick="deleteSpecificTest('${test.id}', '${test.username}', '${test.testType}')"
                        title="Удалить этот тест">
                    🗑️
                </button>
            </div>
        `;
    }).join('');
}

function filterTestList() {
    const searchInput = document.getElementById('testSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const sections = document.querySelectorAll('.test-employee-section');
    
    sections.forEach(section => {
        const username = section.dataset.username.toLowerCase();
        
        if (username.includes(searchTerm) || searchTerm === '') {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// === ФУНКЦИИ ДЛЯ АДМИН-ПАНЕЛИ ===

function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    let savedFiles = JSON.parse(localStorage.getItem("adminFiles") || "[]");
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const base64 = arrayBufferToBase64(evt.target.result);
            
            const extractedUsername = extractUsernameFromFilename(file.name);
            const testType = extractTestTypeFromFilename(file.name);
            
            const existingFileIndex = savedFiles.findIndex(f => f.name === file.name);
            if (existingFileIndex !== -1) {
                savedFiles[existingFileIndex] = {
                    ...savedFiles[existingFileIndex],
                    content: base64,
                    size: file.size,
                    uploaded: new Date().toLocaleString('ru-RU')
                };
                showMessage(`Файл "${file.name}" обновлен!`, "success");
            } else {
                savedFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploaded: new Date().toLocaleString('ru-RU'),
                    passed: false,
                    content: base64,
                    graded: false,
                    score: 0,
                    correctAnswers: 0,
                    totalAnswers: 0,
                    gradingData: null,
                    username: extractedUsername,
                    testType: testType,
                    isUnlockFile: file.name.toLowerCase().includes('разблокировк')
                });
                showMessage(`Файл "${file.name}" загружен! ${extractedUsername ? `Определен сотрудник: ${extractedUsername}` : 'Сотрудник не определен'}`, "success");
            }
            
            localStorage.setItem("adminFiles", JSON.stringify(savedFiles));
            renderFiles();
        };
        reader.readAsArrayBuffer(file);
    });
    
    e.target.value = "";
}

function initAdminPanel() {
    const fileInput = document.getElementById("fileInput");
    const chooseFileBtn = document.getElementById("chooseFileBtn");
    
    if (chooseFileBtn) {
        chooseFileBtn.addEventListener("click", () => fileInput.click());
    }
    if (fileInput) {
        fileInput.addEventListener("change", handleFileUpload);
    }
    
    renderFiles();
}

function renderFiles() {
    const fileList = document.getElementById("fileList");
    if (!fileList) return;
    
    const savedFiles = JSON.parse(localStorage.getItem("adminFiles") || "[]");
    
    if (savedFiles.length === 0) {
        fileList.innerHTML = '<li style="text-align: center; color: var(--text-muted);">Нет загруженных файлов</li>';
        return;
    }

    fileList.innerHTML = savedFiles.map((f, i) => `
        <li>
            <div class="file-info">
                <strong>${escapeHtml(f.name)}</strong>
                <span class="small">${(f.size / 1024).toFixed(1)} KB</span>
            </div>
            <div class="small">Загружен: ${f.uploaded}</div>
            ${f.name.toLowerCase().includes('разблокировк') ? `
                <div class="small" style="color: var(--warning); font-weight: bold;">
                    🔓 Файл разблокировки
                </div>
            ` : f.graded ? `
                <div class="small" style="color: ${f.score >= 70 ? 'var(--success)' : 'var(--error)'}; font-weight: bold;">
                    Оценка: ${f.score}% (${f.correctAnswers}/${f.totalAnswers})
                </div>
            ` : ''}
            
            <div class="file-actions">
                <label style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" class="pass-checkbox" data-index="${i}" ${f.passed ? "checked" : ""}>
                    <span class="small">Пройден</span>
                </label>
                
                <button class="btn small open-btn" data-index="${i}">👁️ Просмотр</button>
                
                ${f.name.toLowerCase().includes('разблокировк') ? `
                    <button class="btn small unlock-save-btn" data-index="${i}">📁 Сохранить в папку</button>
                ` : `
                    <button class="btn small grade-btn" data-index="${i}">📝 ${f.graded ? 'Изменить оценку' : 'Оценить'}</button>
                `}
                
                <button class="btn small ghost del-btn" data-index="${i}">❌ Удалить</button>
            </div>
        </li>
    `).join("");

    document.querySelectorAll(".pass-checkbox").forEach(cb => {
        cb.addEventListener("change", (e) => {
            const index = parseInt(e.target.dataset.index);
            savedFiles[index].passed = e.target.checked;
            localStorage.setItem("adminFiles", JSON.stringify(savedFiles));
        });
    });

    document.querySelectorAll(".open-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index);
            openFileViewer(savedFiles[index]);
        });
    });

    document.querySelectorAll(".grade-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index);
            openGradingPanel(savedFiles[index], index);
        });
    });

    document.querySelectorAll(".unlock-save-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index);
            saveUnlockFileToEmployee(savedFiles[index], index);
        });
    });

    document.querySelectorAll(".del-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteFile(index);
        });
    });
}

function saveUnlockFileToEmployee(file, fileIndex) {
    try {
        const storedBase64 = file.content;
        const fileText = atob(storedBase64);
        let decryptedContent = null;
        
        try {
            const encrypted = atob(fileText);
            decryptedContent = CryptoJS.AES.decrypt(encrypted, AES_KEY).toString(CryptoJS.enc.Utf8);
        } catch (err) {
            decryptedContent = fileText;
        }

        const unlockMatch = decryptedContent?.match(/Имя пользователя:\s*([^\n]+)/i);
        const username = unlockMatch ? unlockMatch[1].trim() : extractUsernameFromFilename(file.name);
        
        const typeMatch = decryptedContent?.match(/Тип теста:\s*([^\n]+)/i);
        const testType = typeMatch ? typeMatch[1].toLowerCase().includes('экзамен') ? 'exam' : 
                               typeMatch[1].toLowerCase().includes('переаттестац') ? 'retraining' : 'exam' 
                         : extractTestTypeFromFilename(file.name);
        
        if (!username || username === '' || username === 'Вакантно') {
            showError("Не удалось определить имя сотрудника из файла!");
            return;
        }

        showEmployeeSelectionModal(
            file.name,
            username,
            testType,
            {
                ...file,
                isUnlockFile: true,
                testType: testType,
                passed: true,
                score: 100,
                correctAnswers: 1,
                totalAnswers: 1,
                timeSpent: extractTimeFromFilename(file.name) || 15
            },
            [{ question: "Файл разблокировки", answer: "Код разблокировки теста", correct: true }],
            fileIndex
        );
        
    } catch (error) {
        console.error("Ошибка при обработке файла разблокировки:", error);
        showError("Ошибка при обработке файла разблокировки");
    }
}
function updateRankMessage() {
    const messageEl = document.getElementById('rankMessage');
    const textEl = document.getElementById('rankMessageText');
    const iconEl = document.getElementById('rankMessageIcon');
    
    if (!currentUser || !currentUser.type) {
        if (messageEl) {
            messageEl.className = 'rank-message';
            textEl.textContent = 'Добро пожаловать в систему';
            iconEl.textContent = '🖥️';
        }
        return;
    }
    
    // Берем случайное приветствие из GREETINGS
    const greetings = GREETINGS[currentUser.type] || GREETINGS['cadet'];
    const greetingText = greetings[Math.floor(Math.random() * greetings.length)];
    
    const icons = {
        'cadet': '🎓',
        'officer': '⚖️',
        'senior_officer': '⭐',
        'curator': '👑'
    };
    
    if (messageEl) {
        messageEl.className = `rank-message ${currentUser.type}`;
    }
    if (textEl) {
        textEl.textContent = greetingText;
    }
    if (iconEl) {
        iconEl.textContent = icons[currentUser.type] || '🖥️';
    }
}

function openGradingPanel(file, fileIndex) {
    const gradingPanel = document.getElementById("gradingPanel");
    const gradingStats = document.getElementById("gradingStats");
    const answersList = document.getElementById("answersList");
    
    if (!gradingPanel || !gradingStats || !answersList) return;
    
    try {
        const storedBase64 = file.content;
        const fileText = atob(storedBase64);
        let decryptedPlain = null;
        
        try {
            const encrypted = atob(fileText);
            decryptedPlain = CryptoJS.AES.decrypt(encrypted, AES_KEY).toString(CryptoJS.enc.Utf8);
        } catch (err) {
            decryptedPlain = null;
        }

        if (decryptedPlain) {
            let answers = file.gradingData || parseAnswersFromReport(decryptedPlain);
            const totalCount = answers.length;
            let correctCount = answers.filter(a => a.correct).length;
            
            const updateStats = () => {
                correctCount = answers.filter(a => a.correct).length;
                const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
                
                gradingStats.innerHTML = `
                    <div class="live-stats">
                        <div class="live-counter">
                            <div class="counter-item">
                                <div class="counter-value">${correctCount}</div>
                                <div class="counter-label">Правильно</div>
                            </div>
                            <div class="counter-item">
                                <div class="counter-value">${totalCount - correctCount}</div>
                                <div class="counter-label">Неправильно</div>
                            </div>
                            <div class="counter-item">
                                <div class="counter-value">${totalCount}</div>
                                <div class="counter-label">Всего</div>
                            </div>
                        </div>
                        <div class="progress-circle" style="--progress: ${score}%">
                            <div class="progress-percent">${score}%</div>
                        </div>
                    </div>
                    ${file.graded ? '<div style="text-align: center; color: var(--success); margin-top: 10px;">✓ Оценка сохранена</div>' : ''}
                `;
                
                return score;
            };
            
            updateStats();
            
            const extractedUsername = extractUsernameFromFilename(file.name);
            const testType = extractTestTypeFromFilename(file.name);
            
            answersList.innerHTML = `
                <div class="grading-container">
                    <div class="quick-grading-actions">
                        <button class="bulk-action-btn bulk-correct" id="markAllCorrect">
                            <span>✅</span>
                            <span>Отметить все как правильные</span>
                        </button>
                        <button class="bulk-action-btn bulk-incorrect" id="markAllIncorrect">
                            <span>❌</span>
                            <span>Отметить все как неправильные</span>
                        </button>
                        <button class="bulk-action-btn bulk-reset" id="resetAll">
                            <span>🔄</span>
                            <span>Сбросить все</span>
                        </button>
                    </div>
                    
                    <div class="grading-hint">
                        💡 <strong>Подсказка:</strong> Кликните по любому ответу, чтобы изменить его статус. 
                        Используйте <span class="hotkey">Space</span> для быстрого переключения.
                    </div>
                    
                    ${answers.map((answer, index) => {
                        const statusClass = answer.correct ? 'correct' : 'incorrect';
                        const statusText = answer.correct ? 'Правильный' : 'Неправильный';
                        const statusColor = answer.correct ? 'status-correct' : 'status-incorrect';
                        
                        return `
                            <div class="answer-full-card ${statusClass}" 
                                 data-index="${index}"
                                 tabindex="0"
                                 role="button"
                                 aria-label="Ответ ${index + 1}: ${statusText}. Нажмите, чтобы изменить статус">
                                 
                                <div class="answer-header">
                                    <div class="question-number">Вопрос ${index + 1}</div>
                                    <div class="status-indicator ${statusColor}">
                                        <span>${answer.correct ? '✅' : '❌'}</span>
                                        <span>${statusText}</span>
                                    </div>
                                </div>
                                
                                <div class="question-text">${escapeHtml(answer.question)}</div>
                                
                                <div class="answer-text">${escapeHtml(answer.answer || 'Нет ответа')}</div>
                                
                                <div class="answer-actions">
                                    <label class="toggle-label" onclick="event.stopPropagation()">
                                        <input type="checkbox" 
                                               class="toggle-checkbox" 
                                               data-index="${index}" 
                                               ${answer.correct ? 'checked' : ''}>
                                        <span>✅ Правильный ответ</span>
                                    </label>
                                    
                                    <div class="quick-actions">
                                        <button class="quick-btn quick-correct" data-index="${index}" data-action="correct">
                                            ✅ Правильно
                                        </button>
                                        <button class="quick-btn quick-incorrect" data-index="${index}" data-action="incorrect">
                                            ❌ Неправильно
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="click-feedback"></div>
                            </div>
                        `;
                    }).join('')}
                    
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <h4>👤 Определение сотрудника</h4>
                        <p>Автоматически определено: <strong>${extractedUsername || "Не определено"}</strong></p>
                        <p>Тип теста: <strong>${getTestTypeName(testType)}</strong></p>
                        <div style="margin-top: 10px;">
                            <label style="display: block; margin-bottom: 5px;">Введите имя сотрудника вручную:</label>
                            <input type="text" id="manualUsernameInput" 
                                   style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white;"
                                   placeholder="Введите ник сотрудника"
                                   value="${extractedUsername || ''}">
                        </div>
                    </div>
                </div>
            `;

            const createClickEffect = (element, x, y) => {
                const feedback = element.querySelector('.click-feedback');
                feedback.style.left = `${x}px`;
                feedback.style.top = `${y}px`;
                feedback.classList.remove('click-animation');
                void feedback.offsetWidth;
                feedback.classList.add('click-animation');
                
                setTimeout(() => {
                    feedback.classList.remove('click-animation');
                }, 500);
            };

            document.querySelectorAll('.answer-full-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.toggle-label') || e.target.closest('.quick-btn')) {
                        return;
                    }
                    
                    const index = parseInt(card.dataset.index);
                    answers[index].correct = !answers[index].correct;
                    
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    createClickEffect(card, x, y);
                    
                    updateAnswerCard(index, answers[index].correct);
                    updateStats();
                    
                    if (answers[index].correct) {
                        playSuccessSound();
                    }
                });
                
                card.addEventListener('keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Spacebar') {
                        e.preventDefault();
                        const index = parseInt(card.dataset.index);
                        answers[index].correct = !answers[index].correct;
                        
                        const rect = card.getBoundingClientRect();
                        createClickEffect(card, rect.width / 2, rect.height / 2);
                        
                        updateAnswerCard(index, answers[index].correct);
                        updateStats();
                    }
                });
            });

            document.querySelectorAll('.toggle-checkbox').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.target.dataset.index);
                    answers[index].correct = e.target.checked;
                    updateAnswerCard(index, answers[index].correct);
                    updateStats();
                });
            });

            document.querySelectorAll('.quick-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.target.dataset.index);
                    const action = e.target.dataset.action;
                    answers[index].correct = (action === 'correct');
                    
                    const card = document.querySelector(`.answer-full-card[data-index="${index}"]`);
                    const rect = card.getBoundingClientRect();
                    createClickEffect(card, rect.width / 2, rect.height / 2);
                    
                    updateAnswerCard(index, answers[index].correct);
                    updateStats();
                });
            });

            document.getElementById('markAllCorrect')?.addEventListener('click', () => {
                answers.forEach((answer, index) => {
                    answer.correct = true;
                    updateAnswerCard(index, true);
                });
                updateStats();
                showMessage('Все ответы отмечены как правильные', 'success');
            });

            document.getElementById('markAllIncorrect')?.addEventListener('click', () => {
                answers.forEach((answer, index) => {
                    answer.correct = false;
                    updateAnswerCard(index, false);
                });
                updateStats();
                showMessage('Все ответы отмечены как неправильные', 'warning');
            });

            document.getElementById('resetAll')?.addEventListener('click', () => {
                answers.forEach((answer, index) => {
                    answer.correct = false;
                    updateAnswerCard(index, false);
                });
                updateStats();
                showMessage('Все ответы сброшены', 'info');
            });

            function updateAnswerCard(index, isCorrect) {
                const card = document.querySelector(`.answer-full-card[data-index="${index}"]`);
                const checkbox = document.querySelector(`.toggle-checkbox[data-index="${index}"]`);
                const statusIndicator = card.querySelector('.status-indicator');
                
                if (isCorrect) {
                    card.classList.remove('incorrect');
                    card.classList.add('correct');
                    statusIndicator.classList.remove('status-incorrect');
                    statusIndicator.classList.add('status-correct');
                    statusIndicator.innerHTML = '<span>✅</span><span>Правильный</span>';
                } else {
                    card.classList.remove('correct');
                    card.classList.add('incorrect');
                    statusIndicator.classList.remove('status-correct');
                    statusIndicator.classList.add('status-incorrect');
                    statusIndicator.innerHTML = '<span>❌</span><span>Неправильный</span>';
                }
                
                if (checkbox) {
                    checkbox.checked = isCorrect;
                }
            }

            function playSuccessSound() {
                console.log('✅ Правильный ответ отмечен');
            }

            const saveGradingBtn = document.getElementById("saveGradingBtn");
            const closeGradingBtn = document.getElementById("closeGradingBtn");
            
            if (saveGradingBtn) {
                saveGradingBtn.onclick = () => {
                    file.gradingData = answers;
                    file.correctAnswers = answers.filter(a => a.correct).length;
                    file.totalAnswers = answers.length;
                    file.score = Math.round((file.correctAnswers / file.totalAnswers) * 100);
                    file.passed = file.score >= 70;
                    file.testType = testType;
                    
                    const manualUsername = document.getElementById('manualUsernameInput')?.value.trim();
                    const username = manualUsername || extractedUsername;
                    
                    if (!username) {
                        showError("Введите имя сотрудника!");
                        return;
                    }
                    
                    showEmployeeSelectionModal(file.name, username, testType, file, answers, fileIndex);
                };
            }
            
            if (closeGradingBtn) {
                closeGradingBtn.onclick = () => {
                    gradingPanel.style.display = 'none';
                };
            }

            gradingPanel.style.display = 'block';
            
            setTimeout(() => {
                const firstCard = document.querySelector('.answer-full-card');
                if (firstCard) {
                    firstCard.focus();
                }
            }, 100);
        }
    } catch (error) {
        console.error('Ошибка при загрузке ответов:', error);
        showError("Ошибка при загрузке ответов для оценки");
    }
}

function openFileViewer(file) {
    const fileViewer = document.getElementById("fileViewer");
    if (!fileViewer) return;
    
    fileViewer.style.display = "block";

    try {
        const storedBase64 = file.content;
        const fileText = atob(storedBase64);
        let decryptedPlain = null;
        
        try {
            const encrypted = atob(fileText);
            decryptedPlain = CryptoJS.AES.decrypt(encrypted, AES_KEY).toString(CryptoJS.enc.Utf8);
        } catch (err) {
            decryptedPlain = null;
        }

        let contentHTML = '';
        if (decryptedPlain && decryptedPlain.length > 0) {
            let reportWithGrading = decryptedPlain;
            if (file.graded) {
                reportWithGrading += `\n\n=== ОЦЕНКА АДМИНИСТРАТОРА ===\n`;
                reportWithGrading += `Оценка: ${file.score}%\n`;
                reportWithGrading += `Правильных ответов: ${file.correctAnswers}/${file.totalAnswers}\n`;
                reportWithGrading += `Статус: ${file.passed ? '✅ ПРОЙДЕН' : '❌ НЕ ПРОЙДЕН'}\n`;
            }
            
            contentHTML = `<pre>${escapeHtml(reportWithGrading)}</pre>`;
        } else {
            contentHTML = `<pre style="color: var(--error);">Не удалось расшифровать файл.</pre>`;
        }

        fileViewer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>${escapeHtml(file.name)}</strong>
                <button class="btn small" id="closeViewerBtn">✖ Закрыть</button>
            </div>
            ${contentHTML}
        `;
        
        document.getElementById("closeViewerBtn").addEventListener("click", () => {
            fileViewer.style.display = "none";
        });
        
    } catch (error) {
        fileViewer.innerHTML = `<div style="color: var(--error);">Ошибка при чтении файла</div>`;
    }
}

function deleteFile(index) {
    const savedFiles = JSON.parse(localStorage.getItem("adminFiles") || "[]");
    const fileName = savedFiles[index].name;
    
    if (confirm(`Удалить файл "${fileName}"?`)) {
        savedFiles.splice(index, 1);
        localStorage.setItem("adminFiles", JSON.stringify(savedFiles));
        renderFiles();
        
        const fileViewer = document.getElementById("fileViewer");
        const gradingPanel = document.getElementById("gradingPanel");
        
        if (fileViewer) fileViewer.style.display = "none";
        if (gradingPanel) gradingPanel.style.display = "none";
        
        showMessage(`Файл "${fileName}" удален`, "success");
    }
}

function authenticateAdmin() {
    if (isAdminAuthenticated) {
        return true;
    }
    
    const pwd = prompt("Введите пароль для Админки:");
    if (pwd === ADMIN_PASSWORD) {
        isAdminAuthenticated = true;
        localStorage.setItem('adminAuthenticated', 'true');
        return true;
    } else {
        alert("Неверный пароль!");
        return false;
    }
}

function logoutAdmin() {
    isAdminAuthenticated = false;
    localStorage.setItem('adminAuthenticated', 'false');
    showMessage("Выход из админ-панели выполнен", "info");
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelector(".tab[data-tab='exam']").classList.add("active");
    currentTestType = 'exam';
    renderCurrentTest();
}

function renderAdmin() {
    const area = document.getElementById("adminArea");
    const employeesData = loadEmployeesData();
    const stats = calculateStats();
    
    const totalPositions = FIXED_EMPLOYEE_STRUCTURE.length;
    const occupiedPositions = Object.values(employeesData).filter(emp => emp.username !== 'Вакантно').length;
    const vacantPositions = totalPositions - occupiedPositions;
    
    area.innerHTML = `
        <div class="admin-container">
            <div class="admin-layout">
                <div class="admin-employees-sidebar">
                    <h3>👥 Состав Военной Полиции</h3>
                    
                    <div class="employees-stats">
                        <div class="employee-stat">
                            <div class="stat-value">${totalPositions}</div>
                            <div class="stat-label">Всего мест</div>
                        </div>
                        <div class="employee-stat">
                            <div class="stat-value">${occupiedPositions}</div>
                            <div class="stat-label">Занято</div>
                        </div>
                        <div class="employee-stat">
                            <div class="stat-value">${vacantPositions}</div>
                            <div class="stat-label">Свободно</div>
                        </div>
                    </div>
                    
                    ${renderFixedEmployees(employeesData)}
                    
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <h3 style="margin-top: 0; color: var(--accent);">📁 Все файлы системы</h3>
                        <p class="small" style="margin-bottom: 15px;">Просмотр и управление всеми файлами тестов и разблокировок</p>
                        <button class="btn" id="showAllFilesBtn" style="width: 100%;">📂 Открыть архив файлов</button>
                    </div>
                    
                    <div style="margin-top: 15px; font-size: 0.9em; color: var(--text-muted);">
                        💡 Фиксированные сотрудники не могут быть изменены. Редактирование доступно только для вакантных мест.
                    </div>
                </div>

                <div class="admin-main-panel">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: var(--accent); margin: 0;">📊 Админ-панель</h2>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn small" onclick="exportStatistics()">📈 Экспорт статистики</button>
                            <button class="btn small" onclick="openTestManagementModal()">🗑️ Управление тестами</button>
                            <button class="btn small ghost" onclick="logoutAdmin()">🚪 Выйти</button>
                        </div>
                    </div>
                    
                    <div class="stats-container">
                        <h3>📈 Статистика тестирования</h3>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">📊</div>
                                <div class="stat-number">${stats.totalTests}</div>
                                <div class="stat-label">Всего тестов</div>
                                <div class="stat-trend">Обновлено сегодня</div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">🎯</div>
                                <div class="stat-number">${stats.averageScore}%</div>
                                <div class="stat-label">Средний балл</div>
                                <div class="stat-trend ${stats.passRateTrend === 'up' ? 'trend-up' : 'trend-down'}">
                                    ${stats.passRateTrend === 'up' ? '↗ Рост' : '↘ Снижение'}
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">✅</div>
                                <div class="stat-number">${stats.passRate}%</div>
                                <div class="stat-label">Проходимость</div>
                                <div class="small">${stats.totalTests > 0 ? stats.passRate + '% успешно' : 'Нет данных'}</div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">⏱️</div>
                                <div class="stat-number">${stats.averageTime.split(':')[0]}</div>
                                <div class="stat-label">Среднее время</div>
                                <div class="small">${stats.averageTime}</div>
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <div class="chart-card">
                                <h4>📊 Распределение оценок</h4>
                                ${renderGradeDistribution(stats.gradeDistribution)}
                            </div>
                            
                            <div class="chart-card">
                                <h4>📈 Прогресс по типам тестов</h4>
                                ${renderStatsProgress(stats)}
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <div class="chart-card">
                                <h4>🏆 Топ-10 результатов</h4>
                                <div class="ranking-tabs">
                                    <button class="btn small active" onclick="switchRankingTab('exam')">🎓 Экзамены</button>
                                    <button class="btn small" onclick="switchRankingTab('retraining')">🔄 Переатт.</button>
                                </div>
                                <div id="rankingContent">
                                    ${renderRanking(stats.examRanking, 'exam')}
                                </div>
                            </div>
                            
                            <div class="chart-card">
                                <h4>🕒 Последние тесты</h4>
                                <div class="timeline">
                                    ${renderRecentResults(stats.recentResults)}
                                </div>
                                <div class="small" style="text-align: center; margin-top: 15px;">
                                    Обновлено: ${stats.lastUpdated}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h3>⏳ Тесты, ожидающие оценку</h3>
                        <div class="pending-tests">
                            ${renderPendingTests()}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h3>👥 Управление игроками</h3>
                        <div class="players-management">
                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                <input type="text" id="searchPlayer" placeholder="Поиск игрока..." style="flex: 1;">
                                <button class="btn" id="searchPlayerBtn">🔍 Поиск</button>
                            </div>
                            <div class="players-list">
                                ${renderPlayersList()}
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h3>📁 Загрузка и проверка результатов</h3>
                        <p>Загрузите файлы результатов тестов для проверки.</p>
                        <p><strong>Важно:</strong> Файлы автоматически сохраняются в папки сотрудников только после оценки!</p>
                        <p>Система определит имя сотрудника из названия файла (формат: <code>Имя_Фамилия_ТипТеста_время_результаты.docx</code>)</p>
                        
                        <input type="file" id="fileInput" multiple accept=".docx,.txt" style="display: none;">
                        <button class="btn" id="chooseFileBtn">📁 Выбрать файлы</button>
                        
                        <div style="margin-top: 20px;">
                            <h4>Загруженные файлы:</h4>
                            <ul id="fileList"></ul>
                        </div>
                        
                        <div id="gradingPanel" style="display: none; margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                            <h4>📝 Оценка ответов</h4>
                            <div id="gradingStats" class="grading-stats"></div>
                            <div id="answersList"></div>
                            <div style="margin-top: 15px;">
                                <button class="btn" id="saveGradingBtn">💾 Сохранить оценку</button>
                                <button class="btn ghost" id="closeGradingBtn">❌ Закрыть</button>
                            </div>
                        </div>
                        
                        <div id="fileViewer" class="report" style="display: none; margin-top: 20px;"></div>
                    </div>
                    
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                        <button class="btn ghost" id="clearAllBtn" onclick="clearAllData()">🗑️ Удалить все записи</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="fileViewer" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 800px; max-height: 80vh;"></div>
        </div>
    `;

    document.getElementById("logoutAdminBtn")?.addEventListener("click", logoutAdmin);
    
    initAdminPanel();
    initEmployeesManagement();
    
    const searchPlayerBtn = document.getElementById('searchPlayerBtn');
    if (searchPlayerBtn) {
        searchPlayerBtn.addEventListener('click', searchPlayers);
    }
    
    const searchPlayerInput = document.getElementById('searchPlayer');
    if (searchPlayerInput) {
        searchPlayerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchPlayers();
            }
        });
    }
    
    document.getElementById('showAllFilesBtn')?.addEventListener('click', openAllFilesModal);
    
    const rankingTabs = document.querySelectorAll('.ranking-tabs .btn');
    rankingTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            rankingTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const type = this.textContent.includes('Экзамен') ? 'exam' : 'retraining';
            switchRankingTab(type);
        });
    });
}
function updatePlayersDatalist() {
    const datalist = document.getElementById('playersList');
    if (datalist) {
        // Заполняем список игроков из базы
        const players = JSON.parse(localStorage.getItem('playersDatabase') || '[]');
        datalist.innerHTML = players.map(player => 
            `<option value="${player.username}">`
        ).join('');
    }
    
    // Также обновляем список в модалке авторизации
    const authDatalist = document.getElementById('authPlayersList');
    if (authDatalist) {
        const employeesData = loadEmployeesData();
        const names = Object.values(employeesData)
            .filter(emp => emp.username && emp.username !== 'Вакантно')
            .map(emp => emp.username);
        authDatalist.innerHTML = names.map(name => `<option value="${name}">`).join('');
    }
}
function switchRankingTab(type) {
    const stats = calculateStats();
    let ranking;
    
    switch(type) {
        case 'exam':
            ranking = stats.examRanking;
            break;
        case 'retraining':
            ranking = stats.retrainingRanking;
            break;
        default:
            ranking = stats.examRanking;
    }
    
    const rankingContent = document.getElementById('rankingContent');
    if (rankingContent) {
        rankingContent.innerHTML = renderRanking(ranking, type);
        
        setTimeout(() => {
            const items = rankingContent.querySelectorAll('.ranking-item');
            items.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
            });
        }, 100);
    }
}

// === ИНИЦИАЛИЗАЦИЯ ===

function initUI() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    
    // === РАЗБЛОКИРУЕМ АВТОРИЗАЦИЮ ПЕРЕД ВСЕМ ===
    document.querySelectorAll('#authModal input, #authModal button, #authModal select, #authModal textarea').forEach(el => {
        el.disabled = false;
        el.style.pointerEvents = 'auto';
        el.style.opacity = '1';
    });
    
    // === РАЗБЛОКИРУЕМ ПОЛЕ ВВОДА НИКА ===
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.disabled = false;
        usernameInput.style.pointerEvents = 'auto';
        usernameInput.style.opacity = '1';
    }
    
    // === РАЗБЛОКИРУЕМ КНОПКУ ВЫХОДА ===
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.disabled = false;
        logoutBtn.style.pointerEvents = 'auto';
        logoutBtn.style.opacity = '1';
    }
    
    loadTestState();
    
    // === ОБНОВЛЯЕМ СПИСКИ ===
    const datalist = document.getElementById('playersList');
    if (datalist) {
        const players = JSON.parse(localStorage.getItem('playersDatabase') || '[]');
        datalist.innerHTML = players.map(player => 
            `<option value="${player.username}">`
        ).join('');
    }
    
    const authDatalist = document.getElementById('authPlayersList');
    if (authDatalist) {
        const employeesData = loadEmployeesData();
        const names = Object.values(employeesData)
            .filter(emp => emp.username && emp.username !== 'Вакантно')
            .map(emp => emp.username);
        authDatalist.innerHTML = names.map(name => `<option value="${name}">`).join('');
    }
    
    // === ПРОВЕРКА АВТОРИЗАЦИИ ===
    if (checkAuth()) {
        const authModal = document.getElementById('authModal');
        const app = document.getElementById('app');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleDisplay = document.getElementById('userRoleDisplay');
        const usernameInput2 = document.getElementById('username');
        const avatar = document.getElementById('userAvatar');
        const currentUsernameDisplay = document.getElementById('currentUsernameDisplay');
        const currentUserRoleDisplay = document.getElementById('currentUserRoleDisplay');
        
        if (authModal) {
            authModal.style.opacity = '0';
            authModal.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                authModal.style.display = 'none';
            }, 500);
        }
        if (app) {
            app.style.display = 'block';
            app.style.opacity = '0';
            app.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                app.style.opacity = '1';
            }, 100);
        }
        
        if (userNameDisplay) userNameDisplay.textContent = currentUser.username;
        if (userRoleDisplay) userRoleDisplay.textContent = currentUser.position;
        if (currentUsernameDisplay) currentUsernameDisplay.textContent = currentUser.username;
        if (currentUserRoleDisplay) currentUserRoleDisplay.textContent = `— ${currentUser.position}`;
        
        if (avatar) {
            const icons = {
                'curator': '👑',
                'senior_officer': '⭐',
                'officer': '⚖️',
                'cadet': '🎓'
            };
            avatar.textContent = icons[currentUser.type] || '👤';
        }
        
        if (usernameInput2) {
            usernameInput2.disabled = false;
            usernameInput2.style.pointerEvents = 'auto';
            usernameInput2.style.opacity = '1';
        }
        
        updateRankMessage();
        renderGreeting();
        renderCurrentTest();
    } else {
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('authModal').style.opacity = '1';
        document.getElementById('app').style.display = 'none';
    }
    
    // === ВКЛАДКИ АВТОРИЗАЦИИ (ВХОД / РЕГИСТРАЦИЯ) ===
    let authMode = 'login';
    
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            authMode = this.dataset.tab;
            
            const btn = document.getElementById('authActionBtn');
            if (authMode === 'login') {
                btn.textContent = '🔑 Войти в систему';
            } else {
                btn.textContent = '📝 Зарегистрироваться';
            }
            
            document.getElementById('authStatus').style.display = 'none';
        });
    });
    
    document.getElementById('authActionBtn').addEventListener('click', function() {
        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;
        
        if (authMode === 'login') {
            loginUser(username, password);
        } else {
            registerUser(username, password);
        }
    });
    
    document.getElementById('authPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('authActionBtn').click();
        }
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && test && !test.blocked) {
            console.log('🚫 Пользователь покинул вкладку!');
            showError("Тест заблокирован! Не переключайте вкладки во время теста.");
            blockTest();
        }
    });
    
    window.addEventListener('blur', () => {
        if (test && !test.blocked) {
            setTimeout(() => {
                if (document.hidden && test && !test.blocked) {
                    console.log('🚫 Окно потеряло фокус!');
                    showError("Тест заблокирован! Не переключайтесь в другие окна.");
                    blockTest();
                }
            }, 500);
        }
    });
    
    document.addEventListener('mousemove', trackActivity);
    document.addEventListener('mousedown', trackActivity);
    document.addEventListener('keypress', trackActivity);
    document.addEventListener('keydown', trackActivity);
    
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => {
            trackActivity();
            const tabName = tab.dataset.tab;
            
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const contentArea = document.getElementById("contentArea");
            if (tabName === "admin") {
                contentArea.classList.add("admin-active");
                document.getElementById("mainArea").style.display = "none";
                document.getElementById("adminArea").style.display = "block";
                document.getElementById("decreeArea").style.display = "none";
                if (!authenticateAdmin()) {
                    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
                    document.querySelector(".tab[data-tab='exam']").classList.add("active");
                    document.getElementById("mainArea").style.display = "block";
                    document.getElementById("adminArea").style.display = "none";
                    document.getElementById("decreeArea").style.display = "none";
                    contentArea.classList.remove("admin-active");
                    currentTestType = 'exam';
                    renderCurrentTest();
                    return;
                }
                renderAdmin();
            } else if (tabName === "decree") {
                contentArea.classList.remove("admin-active");
                document.getElementById("mainArea").style.display = "none";
                document.getElementById("adminArea").style.display = "none";
                document.getElementById("decreeArea").style.display = "block";
                if (typeof renderDecree === 'function') {
                    renderDecree();
                }
            } else {
                contentArea.classList.remove("admin-active");
                document.getElementById("mainArea").style.display = "block";
                document.getElementById("adminArea").style.display = "none";
                document.getElementById("decreeArea").style.display = "none";
                currentTestType = tabName;
                renderCurrentTest();
            }
        });
    });

    document.getElementById("startBtn").addEventListener("click", showDisclaimer);
    document.getElementById("finishBtn").addEventListener("click", finishTestManually);
    document.getElementById("unlockBtn").addEventListener("click", unblockTest);
    
    const adminUnlockBtn = document.getElementById("adminUnlockBtn");
    if (adminUnlockBtn) {
        adminUnlockBtn.addEventListener("click", adminUnblockTest);
    }

    document.getElementById("unlockBtn").style.display = "none";
    if (adminUnlockBtn) adminUnlockBtn.style.display = "none";

    // === КНОПКА ВЫХОДА ===
    const logoutBtn2 = document.getElementById('logoutBtn');
    if (logoutBtn2) {
        logoutBtn2.addEventListener('click', logoutUser);
    }

    setInterval(() => {
        if (test && !test.blocked) {
            const timeSinceLastActivity = Date.now() - lastActivityTime;
            if (timeSinceLastActivity >= INACTIVITY_TIMEOUT - 5000) {
                showInactivityWarning();
            }
        }
    }, 1000);

    // === РАЗБЛОКИРУЕМ ПОЛЯ ВВОДА ===
    ['username', 'authUsername'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
        }
    });

    renderCurrentTest();
}

document.addEventListener('DOMContentLoaded', initUI);
