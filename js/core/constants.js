const TEST_COUNT = 15;
const INACTIVITY_TIMEOUT = 20000;
const AUTH_EXPIRY_DAYS = 7;

const ADMIN_PASSWORD = "TryX9kTo77PassLm2TheQ8Exam2025RZx3kP9But5IfY6You2LoseN4t5202BvC7BanW1ForTheWholeLife2520";

const AES_KEY = "my_secret_aes_key_2024";

const FIXED_ACCESS_CODES = {
    'curator':          'Kx7amP9qqL2rrT5vvN8wwE3yyU6bbY9',
    'senior_officer_2': 'Bv4cnQ8wwE3yyU6kkF7ddS4jjR2ccJ9',
    'senior_officer_1': 'Zc9djR2kkF7ddS4xxP1vvN8ggT6bbY3',
    'officer_2':        'Hm3gT6xxP1vvN8qqL2rT5mmP9kF4zz',
    'officer_9':        'Wq5bY9ccJ4zzM2ffD3pH6sK1nR7tt',
    'officer_6':        'Lr8fD3sK6pV1xQ4mW7eT2yU5qqWw',
    'officer_5':        'De6fG9hI2jK5lM8nO1pQ4rS7tU0vW3',
    'officer_7':        'Ef7gH0iJ3kL6mN9oP2qR5sT8uV1wX4',
    'officer_3':        'Bc4dE7fG0hI3jK6lM9nO2pQ5rS8tV1',
    'officer_1':        'Ab3cD6eF9gH2iJ5kL8mN1oP4qR7sT0',
    'officer_8':        'Fg8hI1jK4lM7nO0pQ3rS6tU9vW2xY5',
    'officer_4':        'Cd5eF8gH1iJ4kL7mN0oP3qR6sT9uV2',
    'officer_10':       'Gh9iJ2kL5mN8oP1qR4sT7uV0wX3yZ6',
    'cadet_1':          'Hi0jK3lM6nO9pQ2rS5tU8vW1xY4zA7', // скоро под замену
    'cadet_3':          'Jk2lM5nO8pQ1rS4tU7vW0xY3zA6bC9', // под замену
    'cadet_2':          'Ij1kL4mN7oP0qR3sT6uV9wX2yZ5aB8',
    'cadet_4':          'Kl3mN6oP9qR2sT5uV8wX1yZ4aB7cD0',
    'cadet_5':          'Lm4nO7pQ0rS3tU6vW9xY2zA5bC8dE1'
};

const FIXED_EMPLOYEE_STRUCTURE = [
    { id: 'curator',          position: 'Куратор ВП',              type: 'curator',        username: 'Dobriy_Abobbi' },
    { id: 'senior_officer_2', position: 'Заместитель Куратора ВП', type: 'senior_officer', username: 'Chaffy_Washington' },
    { id: 'senior_officer_1', position: 'Заместитель Куратора ВП', type: 'senior_officer', username: 'Ralph_Laurence' },
    
    { id: 'officer_9',        position: 'Офицер ВП',               type: 'officer',       username: 'Kiril_Kot' },
    { id: 'officer_6',        position: 'Офицер ВП',               type: 'officer',       username: 'Hungwoo_Abobbi' },
    { id: 'officer_2',        position: 'Офицер ВП',               type: 'officer',       username: 'Alexey_Night' },
    { id: 'officer_5',        position: 'Офицер ВП',               type: 'officer',       username: 'Вакантно' },
    { id: 'officer_7',        position: 'Офицер ВП',               type: 'officer',       username: 'Вакантно' },
    { id: 'officer_3',        position: 'Офицер ВП',               type: 'officer',       username: 'Вакантно' },
    { id: 'officer_1',        position: 'Офицер ВП',               type: 'officer',       username: 'Вакантно' },
    { id: 'officer_8',        position: 'Офицер ВП',               type: 'officer',       username: 'Вакантно' },
    { id: 'officer_4',        position: 'Офицер ВП',               type: 'officer',       username: 'Вакантно' },
    { id: 'officer_10',       position: 'Офицер ВП',               type: 'officer',       username: 'Вакантно' },

    { id: 'cadet_3',          position: 'Курсант ВП',              type: 'cadet',        username: 'Leon_Abobbi' },
    { id: 'cadet_5',          position: 'Курсант ВП',              type: 'cadet',        username: 'Haruki_Yoshida' },
    { id: 'cadet_1',          position: 'Курсант ВП',              type: 'cadet',        username: 'Вакантно' },
    { id: 'cadet_2',          position: 'Курсант ВП',              type: 'cadet',        username: 'Вакантно' },
    { id: 'cadet_4',          position: 'Курсант ВП',              type: 'cadet',        username: 'Вакантно' }
];

const GREETINGS = {
    cadet: [
        "Добро пожаловать, курсант. Ты только начинаешь свой путь в Военной Полиции. Впереди много испытаний, но мы верим в тебя.",
        "Приветствую, новобранец. Система видит твой потенциал. Докажи, что ты достоин носить это звание.",
        "Курсант, ты принят в систему. Экзамен ждёт — не подведи. Твоя карьера начинается здесь и сейчас.",
        "С приветствием, курсант. Твой путь только начинается. Каждый великий офицер когда-то был новичком.",
        "Добро пожаловать в ряды Военной Полиции, курсант. Твоя преданность и усердие помогут тебе пройти этот путь."
    ],
    officer: [
        "Приветствую, офицер. Ты уже не новичок, но путь к вершине ещё долог. Система готова к твоим запросам.",
        "Офицер, твоя квалификация подтверждена. Военная Полиция нуждается в таких, как ты. Продолжай в том же духе.",
        "С возвращением, офицер. Твой опыт — наше богатство. Выполняй свой долг с честью и достоинством.",
        "Приветствую тебя, офицер. Ты — опора Военной Полиции. Твои решения меняют судьбы людей.",
        "Офицер, рад видеть тебя в системе. Твой профессионализм — пример для младших. Действуй решительно."
    ],
    senior_officer: [
        "Командир, рад приветствовать вас. Ваш опыт — опора системы. Младшие равняются на вас, не подведите их.",
        "Заместитель, ваше присутствие — честь. Система готова выполнять любые ваши приказы.",
        "Приветствую вас, сэр. Ваш авторитет заслужен годами. Продолжайте укреплять нашу систему изнутри.",
        "Заместитель, вы — пример для подражания. Ваш путь — это путь настоящего воина, достойного уважения.",
        "Командир, система полностью подчинена вам. Ваша мудрость и решительность ведут нас к победе."
    ],
    curator: [
        "Ваше Превосходительство, система к вашим услугам. Ваш приказ — закон для всей Военной Полиции.",
        "Куратор, рад приветствовать вас. Ваш авторитет абсолютен. Система полностью в вашем подчинении.",
        "Ваше слово — закон, Куратор. Все модули активированы и ждут ваших указаний. Повелевайте.",
        "Ваше Превосходительство, ваша мудрость ведёт нас. Без вас система — ничто. Мы гордимся вами.",
        "Куратор, ваше величие — основа Военной Полиции. Приветствую вас. Система преклоняется перед вами."
    ]
};

const POSITIONS_BY_UNIT = {
    'ТСР': ['Охранник', 'Дежурный', 'Конвоир', 'Надзиратель', 'Ст.Надзиратель', 'Начальник Блока', 'Инспектор', 'Ст.Инспектор', 'Зам.Начальника ТСР', 'Начальник ТСР'],
    'ЛСа': ['Рядовой', 'Капрал', 'Сержант', 'Мастер-Сержант', 'Лейтенант', 'Капитан', 'Майор', 'Подполковник', 'Полковник', 'Генерал'],
    'СФа': ['Юнга', 'Матрос', 'Старшина', 'Мичман', 'Энсин', 'Боцман', 'Коммодор', 'Контр-Адмирал', 'Вице-Адмирал', 'Адмирал']
};

window.TEST_COUNT = TEST_COUNT;
window.INACTIVITY_TIMEOUT = INACTIVITY_TIMEOUT;
window.AUTH_EXPIRY_DAYS = AUTH_EXPIRY_DAYS;
window.ADMIN_PASSWORD = ADMIN_PASSWORD;
window.AES_KEY = AES_KEY;
window.FIXED_ACCESS_CODES = FIXED_ACCESS_CODES;
window.FIXED_EMPLOYEE_STRUCTURE = FIXED_EMPLOYEE_STRUCTURE;
window.GREETINGS = GREETINGS;
window.POSITIONS_BY_UNIT = POSITIONS_BY_UNIT;
