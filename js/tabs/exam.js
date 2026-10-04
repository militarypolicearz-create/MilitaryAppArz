var test = null;
var blocked = false;
var inactivityTimer = null;
var lastActivityTime = Date.now();
var currentTestType = 'exam';

function updateRankMessage() {
    const greetingEl = document.getElementById('topbarGreeting');
    if (!greetingEl) return;

    if (!currentUser || !currentUser.type) {
        greetingEl.innerHTML = '';
        return;
    }

    const greetings = GREETINGS[currentUser.type] || GREETINGS['cadet'];
    const greetingText = greetings[Math.floor(Math.random() * greetings.length)];

    greetingEl.innerHTML = `
        <div class="topbar-greeting ${currentUser.type}">
            <span class="topbar-greeting__text">${greetingText}</span>
        </div>
    `;
}

function renderGreeting() {
    const greetingEl = document.getElementById('testGreeting');
    if (!greetingEl || !currentUser || !currentUser.type) return;

    const greetingText = getRandomGreeting(currentUser.type);

    const roleNames = {
        cadet: 'Курсант',
        officer: 'Офицер',
        senior_officer: 'Старший офицер',
        curator: 'Куратор'
    };

    const roleName = roleNames[currentUser.type] || 'Сотрудник';

    greetingEl.innerHTML = `
        <div class="greeting-box">
            <div class="greeting-content">
                <div class="greeting-message">${greetingText}</div>
                <div class="greeting-user">${roleName} ${currentUser.position} — ${currentUser.username}</div>
            </div>
        </div>
    `;
}

function getQuestionsByType(type) {
    if (type === 'exam') return examQuestions;
    if (type === 'retraining') return retrainingQuestions;
    return examQuestions;
}

function getTestForUserType(userType) {
    if (userType === 'cadet') return 'exam';
    if (userType === 'officer' || userType === 'senior_officer') return 'retraining';
    return null;
}

function resetInactivityTimer() {
    lastActivityTime = Date.now();
    if (inactivityTimer) clearTimeout(inactivityTimer);

    if (test && !test.blocked) {
        const answeredCount = Object.keys(test.answers || {}).length;
        if (answeredCount >= TEST_COUNT) return;

        const bufferTime = test.current === 0 ? 10000 : 0;

        inactivityTimer = setTimeout(() => {
            const timeSinceLastActivity = Date.now() - lastActivityTime;
            if (test && !test.blocked && timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
                const currentAnsweredCount = Object.keys(test.answers || {}).length;
                if (currentAnsweredCount >= TEST_COUNT) return;
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
        warning.innerHTML = `Внимание! Бездействие обнаружено!<br>Тест будет заблокирован через ${Math.ceil(timeLeft / 1000)} сек.`;
        document.body.appendChild(warning);

        setTimeout(() => {
            const w = document.getElementById('inactivityWarning');
            if (w) w.remove();
        }, 5000);
    }
}

function getActiveTestTab() {
    const tab = document.querySelector('.app-topbar__tabs .tab.active[data-tab="exam"]')
             || document.querySelector('.app-topbar__tabs .tab.active[data-tab="retraining"]');
    return tab ? tab.dataset.tab : 'exam';
}

function updateTestShellHeader() {
    const titleEl = document.getElementById('testShellTitle');
    const subEl = document.getElementById('testShellSubtitle');
    if (!titleEl || !subEl) return;

    if (currentTestType === 'retraining') {
        titleEl.textContent = 'Переаттестация Военной Полиции';
        subEl.textContent = `Тест из ${TEST_COUNT} вопросов для подтверждения квалификации.`;
    } else {
        titleEl.textContent = 'Экзамен Военной Полиции';
        subEl.textContent = `Тест из ${TEST_COUNT} вопросов по основной деятельности ВП.`;
    }
}

function updateInlineUser() {
    const nameEl = document.getElementById('currentUsernameDisplay');
    const roleEl = document.getElementById('currentUserRoleDisplay');
    const avatarEl = document.getElementById('userAvatarInline');
    if (!currentUser) return;

    if (nameEl) nameEl.textContent = currentUser.username;
    if (roleEl) roleEl.textContent = currentUser.position;

    if (avatarEl) {
        const icons = {
            curator: '★',
            senior_officer: '◆',
            officer: '●',
            cadet: '○'
        };
        avatarEl.textContent = icons[currentUser.type] || '·';
    }
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
    if (username.toLowerCase() !== currentUser.username.toLowerCase()) {
        showError(`Вы авторизованы как ${currentUser.username}. Введите свой ник!`);
        return;
    }

    currentTestType = getActiveTestTab();

    if (currentTestType === 'exam' && currentUser.type !== 'cadet' && currentUser.type !== 'curator') {
        showError("Экзамен доступен только курсантам!");
        return;
    }
    if (currentTestType === 'retraining' && currentUser.type !== 'officer' && currentUser.type !== 'senior_officer' && currentUser.type !== 'curator') {
        showError("Переаттестация доступна только офицерам и выше!");
        return;
    }

    const modal = document.getElementById("disclaimerModal");
    modal.style.display = "flex";
    document.getElementById("closeDisclaimerBtn").onclick = closeDisclaimer;
    document.getElementById("confirmStartBtn").onclick = confirmStartTest;
}

function closeDisclaimer() {
    document.getElementById("disclaimerModal").style.display = "none";
}

function confirmStartTest() {
    document.getElementById("disclaimerModal").style.display = "none";
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

    currentTestType = getActiveTestTab();

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
    const unlockCode = generateReadableCode();

    test = {
        username: currentUser.username,
        userType: currentUser.type,
        current: 0,
        answers: {},
        shuffledQuestions: shuffledQuestions,
        startTime: new Date(),
        blocked: true,
        testType: currentTestType,
        unlockCode: unlockCode,
        blockReason: 'Ожидание разблокировки'
    };

    saveTestState();

    try {
        createUnlockFile();
        showMessage("Код разблокировки выдан! Файл скачан. Отправьте код администратору.", "success");
    } catch (e) {
        console.error('Ошибка создания файла разблокировки:', e);
        showError("Ошибка создания файла разблокировки!");
    }

    const unlockBtn = document.getElementById("unlockBtn");
    const adminUnlockBtn = document.getElementById("adminUnlockBtn");
    const finishBtn = document.getElementById("finishBtn");
    if (unlockBtn) unlockBtn.style.display = "inline-block";
    if (adminUnlockBtn) adminUnlockBtn.style.display = "inline-block";
    if (finishBtn) finishBtn.style.display = "none";

    document.querySelectorAll("input, button, textarea, select").forEach(el => {
        if (el.id === "username" || el.id === "logoutBtn" ||
            el.id.includes("unlock") || el.id.includes("adminUnlock") ||
            el.closest(".app-topbar__tabs") || el.closest("#authModal") ||
            el.closest(".app-sidebar")) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            return;
        }
        el.disabled = true;
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
    });

    updateTestShellHeader();
    renderBlockedScreen();
    updateWarningBannerVisibility();
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
            if (!el.id.includes("admin") && el.id !== "username" && !el.closest(".app-topbar__tabs")) {
                el.disabled = false;
            }
        });

        saveTestState();
        showMessage("Тест успешно разблокирован администратором!", "success");
        resetInactivityTimer();
        renderCurrentTest();
        updateWarningBannerVisibility();
    } else {
        showError("Тест не заблокирован!");
    }
}

function renderCurrentTest() {
    if (test && test.testType) currentTestType = test.testType;

    updateTestShellHeader();
    updateInlineUser();
    updateRankMessage();

    if (currentTestType === 'exam') renderExam();
    else if (currentTestType === 'retraining') renderRetraining();
    else renderExam();

    updateWarningBannerVisibility();
}

function renderExam() {
    currentTestType = 'exam';
    if (test && test.testType) currentTestType = test.testType;

    const area = document.getElementById("testContent");
    if (!area) return;

    if (test && test.testType !== 'exam') {
        area.innerHTML = renderStartScreen({
            type: 'exam',
            title: 'Активный тест другого типа',
            subtitle: `Сейчас активен тест: <strong>${getTestTypeName(test.testType)}</strong>. Завершите его или переключитесь на нужную вкладку.`,
            showList: false
        });
        return;
    }

    if (!test) {
        if (!currentUser) {
            area.innerHTML = renderStartScreen({
                type: 'exam',
                title: 'Экзамен Военной Полиции',
                subtitle: 'Для доступа к тесту необходимо авторизоваться. Экзамен доступен только курсантам.',
                showList: false
            });
            return;
        }

        if (currentUser.type !== 'cadet' && currentUser.type !== 'curator') {
            area.innerHTML = renderStartScreen({
                type: 'exam',
                title: 'Доступ запрещён',
                subtitle: `Экзамен доступен только <strong>курсантам</strong>. Ваш статус: <strong>${currentUser.position}</strong>.`,
                showList: false
            });
            return;
        }

        area.innerHTML = renderStartScreen({
            type: 'exam',
            title: 'Экзамен Военной Полиции',
            subtitle: `<strong>${currentUser.username}</strong> — ${currentUser.position}. Тест состоит из <strong>${TEST_COUNT} вопросов</strong> по основной деятельности ВП.`,
            showList: true
        });
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
    if (test && test.testType) currentTestType = test.testType;

    const area = document.getElementById("testContent");
    if (!area) return;

    if (test && test.testType !== 'retraining') {
        area.innerHTML = renderStartScreen({
            type: 'retraining',
            title: 'Активный тест другого типа',
            subtitle: `Сейчас активен тест: <strong>${getTestTypeName(test.testType)}</strong>. Завершите его или переключитесь на нужную вкладку.`,
            showList: false
        });
        return;
    }

    if (!test) {
        if (!currentUser) {
            area.innerHTML = renderStartScreen({
                type: 'retraining',
                title: 'Переаттестация Военной Полиции',
                subtitle: 'Для доступа к тесту необходимо авторизоваться. Переаттестация доступна офицерам и выше.',
                showList: false
            });
            return;
        }

        if (currentUser.type !== 'officer' && currentUser.type !== 'senior_officer' && currentUser.type !== 'curator') {
            area.innerHTML = renderStartScreen({
                type: 'retraining',
                title: 'Доступ запрещён',
                subtitle: `Переаттестация доступна только <strong>офицерам и выше</strong>. Ваш статус: <strong>${currentUser.position}</strong>.`,
                showList: false
            });
            return;
        }

        area.innerHTML = renderStartScreen({
            type: 'retraining',
            title: 'Переаттестация Военной Полиции',
            subtitle: `<strong>${currentUser.username}</strong> — ${currentUser.position}. Тест состоит из <strong>${TEST_COUNT} вопросов</strong> для подтверждения квалификации.`,
            showList: true
        });
        return;
    }

    if (test.blocked) {
        renderBlockedScreen();
        return;
    }

    renderTestQuestions();
}

function renderStartScreen({ type, title, subtitle, showList }) {
    const note = showList ? `
        <div class="test-start-screen__note">
            Система отслеживает активность. Бездействие более ${INACTIVITY_TIMEOUT / 1000} секунд приведёт к блокировке теста.
        </div>
    ` : '';

    return `
        <div class="test-header">
            <h2 class="test-title">${title}</h2>
            <p class="test-subtitle">${subtitle}</p>
        </div>
        ${note}
    `;
}

function renderMultipleChoiceQuestion(q) {
    const savedAnswers = test.answers[test.current];
    let selectedOptions = [];

    if (Array.isArray(savedAnswers)) selectedOptions = savedAnswers;
    else if (typeof savedAnswers === 'string') selectedOptions = [savedAnswers];

    const maxSelections = q.maxSelections || 2;

    return `
        <div class="question-box">
            <div class="question-header">
                <span class="question-counter">Вопрос ${test.current + 1} из ${TEST_COUNT}</span>
                <span class="selection-limit">Выберите до ${maxSelections} вариантов</span>
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
                <span>Выбрано: <strong id="selectedCount">${selectedOptions.length}</strong> / ${maxSelections}</span>
            </div>

            <div class="question-actions">
                <button class="btn btn-primary" id="nextBtn">
                    ${test.current < TEST_COUNT - 1 ? "Следующий вопрос" : "Завершить тест"}
                </button>
            </div>

            <div class="activity-warning">
                Система отслеживает активность!
            </div>
        </div>
    `;
}

function renderTextQuestion(q) {
    return `
        <div class="question-box">
            <div class="question-header">
                <span class="question-counter">Вопрос ${test.current + 1} из ${TEST_COUNT}</span>
            </div>

            <div class="question-text-large">${escapeHtml(q.text)}</div>

            <input type="text" id="answerInput" placeholder="Введите ваш ответ здесь..."
                   value="${test.answers[test.current] || ''}" autocomplete="off">

            <div class="question-actions">
                <button class="btn btn-primary" id="nextBtn">
                    ${test.current < TEST_COUNT - 1 ? "Следующий вопрос" : "Завершить тест"}
                </button>
            </div>

            <div class="activity-warning">
                Система отслеживает активность!
            </div>
        </div>
    `;
}

function renderTestQuestions() {
    const q = test.shuffledQuestions[test.current];
    const area = document.getElementById("testContent");
    if (!area || !q) return;

    if (q.type === 'multiple' && q.options && q.options.length > 0) {
        area.innerHTML = renderMultipleChoiceQuestion(q);

        const optionCards = document.querySelectorAll('.option-card');
        const selectedCountSpan = document.getElementById('selectedCount');
        const maxSelections = q.maxSelections || 2;

        const updateSelection = () => {
            const selectedOptions = Array.from(document.querySelectorAll('.option-card.selected'))
                .map(card => card.dataset.optionValue);
            test.answers[test.current] = selectedOptions;
            saveTestState();
            if (selectedCountSpan) selectedCountSpan.textContent = selectedOptions.length;
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
        area.innerHTML = renderTextQuestion(q);
        const answerInput = document.getElementById("answerInput");
        if (answerInput) {
            answerInput.addEventListener("input", (e) => {
                trackActivity();
                test.answers[test.current] = e.target.value.trim();
                saveTestState();
            });
            answerInput.addEventListener("keypress", (e) => {
                trackActivity();
                if (e.key === "Enter") nextQuestion();
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
    const area = document.getElementById("testContent");
    const testTypeName = getTestTypeName(test.testType);

    if (inactivityTimer) { clearTimeout(inactivityTimer); inactivityTimer = null; }

    let answersHtml = '';

    test.shuffledQuestions.forEach((q, index) => {
        const userAnswer = test.answers[index];
        let answerDisplay = '';

        if (q.type === 'multiple' && q.options) {
            const selectedOptions = Array.isArray(userAnswer) ? userAnswer : [];
            answerDisplay = `
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
                    ${q.options.map(option => {
                        const isSelected = selectedOptions.includes(option);
                        return `
                            <span class="review-option ${isSelected ? 'review-option-selected' : 'review-option-unselected'}">
                                ${isSelected ? '✓' : '○'} ${escapeHtml(option)}
                            </span>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            const answerText = userAnswer || "—";
            answerDisplay = `
                <div class="review-answer-text">${escapeHtml(answerText)}</div>
            `;
        }

        answersHtml += `
            <div class="review-item">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.82em; font-weight: 600; color: var(--vp-accent-hover); margin-bottom: 2px;">
                            Вопрос ${index + 1}
                        </div>
                        <div style="font-size: 0.92em; color: var(--text-bright);">${escapeHtml(q.text)}</div>
                        ${answerDisplay}
                    </div>
                    <button class="btn small ghost review-edit-btn" data-question-index="${index}">
                        Изменить
                    </button>
                </div>
            </div>
        `;
    });

    const answeredCount = Object.keys(test.answers).length;

    area.innerHTML = `
        <div class="review-container">
            <div class="review-header">
                <h2>Проверка ответов</h2>
                <p>Проверьте все ответы перед завершением ${testTypeName.toLowerCase()}</p>
                <div class="review-stats">
                    <span class="review-stat"><span>Всего:</span> <strong>${TEST_COUNT}</strong></span>
                    <span class="review-stat"><span>Отвечено:</span> <strong style="color: var(--success);">${answeredCount}</strong></span>
                    <span class="review-stat"><span>Без ответа:</span> <strong style="color: var(--error);">${TEST_COUNT - answeredCount}</strong></span>
                </div>
            </div>

            <div class="review-answers-list">
                ${answersHtml}
            </div>

            <div class="review-actions">
                <button class="btn ghost" id="backToTestBtn">Назад</button>
                <button class="btn" id="confirmFinishBtn">Завершить тест</button>
            </div>
        </div>
    `;

    document.getElementById("backToTestBtn").addEventListener("click", () => {
        renderCurrentTest();
    });

    document.querySelectorAll(".review-edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            test.current = parseInt(btn.dataset.questionIndex);
            saveTestState();
            renderCurrentTest();
        });
    });

    document.getElementById("confirmFinishBtn").addEventListener("click", () => finishTest());
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
    if (!test) { showError("Нет активного теста."); return; }

    const endTime = new Date();
    const timeSpent = Math.round((endTime - test.startTime) / 1000 / 60);
    const testTypeName = getTestTypeName(test.testType);
    const answeredQuestions = Object.keys(test.answers).length;

    let reportText = `${testTypeName.toUpperCase()} ВОЕННОЙ ПОЛИЦИИ - РЕЗУЛЬТАТЫ
=================================

Общая информация:
----------------
Имя: ${test.username}
Тип теста: ${testTypeName}
Дата: ${new Date().toLocaleString('ru-RU')}
Время выполнения: ${timeSpent} минут
Всего вопросов: ${TEST_COUNT}
Отвечено: ${answeredQuestions}/${TEST_COUNT}

Ответы:
----------------
`;

    test.shuffledQuestions.forEach((q, i) => {
        let answerText = test.answers[i];
        if (Array.isArray(answerText)) answerText = answerText.join(', ');
        else if (!answerText) answerText = "Нет ответа";

        reportText += `\n${i + 1}. ${q.text}\n`;
        reportText += `Ответ: ${answerText}\n`;
        reportText += `---------------------------------\n`;
    });

    reportText += `

=================================
Arizona RP | Военная Полиция`;

    try {
        const encrypted = CryptoJS.AES.encrypt(reportText, AES_KEY).toString();
        const blob = new Blob([btoa(encrypted)], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        });
        saveAs(blob, `${test.username}_${testTypeName}_${timeSpent}мин_результаты.docx`);
        showMessage("Файл с результатами скачан!", "success");
    } catch (e) {
        console.error('Ошибка сохранения результатов:', e);
        showError("Ошибка сохранения результатов");
    }

    saveTestResultForStatistics(test, timeSpent);

    if (inactivityTimer) { clearTimeout(inactivityTimer); inactivityTimer = null; }

    const testUsername = test.username;
    const finishedType = test.testType;
    clearTestState();

    const unlockBtn = document.getElementById("unlockBtn");
    const adminUnlockBtn = document.getElementById("adminUnlockBtn");
    const finishBtn = document.getElementById("finishBtn");
    const startBtn = document.getElementById("startBtn");

    if (unlockBtn) unlockBtn.style.display = "none";
    if (adminUnlockBtn) adminUnlockBtn.style.display = "none";
    if (finishBtn) finishBtn.style.display = "none";
    if (startBtn) startBtn.disabled = false;

    hideWarningBanner();

    const area = document.getElementById("testContent");
    if (area) {
        area.innerHTML = renderStartScreen({
            type: finishedType === 'retraining' ? 'retraining' : 'exam',
            title: `${testTypeName} завершён`,
            subtitle: `<strong>${escapeHtml(testUsername)}</strong>, ваш ${testTypeName.toLowerCase()} успешно завершён. Файл с результатами был автоматически скачан — отправьте его администратору для оценки. Ответов: ${answeredQuestions} из ${TEST_COUNT}.`,
            showList: false
        });
    }
}

function saveTestResultForStatistics(testData, timeSpent) {
    const testResult = {
        id: Date.now().toString(),
        username: testData.username,
        testType: testData.testType,
        score: 0,
        timeSpent: timeSpent,
        totalQuestions: TEST_COUNT,
        correctAnswers: 0,
        date: new Date().toISOString(),
        graded: false,
        passed: false
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
            blockReason: test.blockReason,
            playerId: test.playerId
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
                blockReason: savedTest.blockReason || 'Бездействие',
                playerId: savedTest.playerId
            };
            blocked = savedTest.blocked;
            currentTestType = savedTest.testType || 'exam';

            if (blocked) {
                document.querySelectorAll("input, button").forEach(el => {
                    if (!el.id.includes("unlock") && el.id !== "username" && !el.closest(".app-topbar__tabs")) {
                        el.disabled = true;
                    }
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

function blockTest() {
    if (blocked || !test) return;

    blocked = true;
    test.blocked = true;

    document.querySelectorAll("input, button").forEach(el => {
        if (!el.id.includes("unlock") && !el.id.includes("adminUnlock") &&
            el.id !== "username" && !el.closest(".app-topbar__tabs")) {
            el.disabled = true;
        }
    });

    if (inactivityTimer) { clearTimeout(inactivityTimer); inactivityTimer = null; }

    test.unlockCode = generateReadableCode();
    createUnlockFile();
    saveTestState();
    renderBlockedScreen();
    hideWarningBanner();
}

function createUnlockFile() {
    if (!test) return;

    const testTypeName = getTestTypeName(test.testType);
    const unlockContent = `КОД РАЗБЛОКИРОВКИ ТЕСТА

Тип теста: ${testTypeName}
Имя пользователя: ${test.username}
Код разблокировки: ${test.unlockCode}

Причина блокировки: Ожидание разблокировки
Тест заблокирован: ${new Date().toLocaleString('ru-RU')}

Для разблокировки теста обратитесь к администратору.

Arizona RP | Военная Полиция`;

    try {
        const encryptedUnlock = CryptoJS.AES.encrypt(unlockContent, AES_KEY).toString();
        const unlockBlob = new Blob([btoa(encryptedUnlock)], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        });
        saveAs(unlockBlob, `${test.username}_${testTypeName}_код_разблокировки.docx`);
        console.log('Файл разблокировки создан:', `${test.username}_${testTypeName}_код_разблокировки.docx`);

        if (typeof addFileToEmployeeFolder === 'function') {
            addFileToEmployeeFolder(
                test.username,
                test.testType,
                `${test.username}_${testTypeName}_разблокировка_${new Date().toLocaleDateString('ru-RU')}.docx`,
                unlockContent
            );
        }
    } catch (e) {
        console.error('Ошибка создания файла разблокировки:', e);
        showError('Ошибка создания файла разблокировки!');
    }
}

function renderBlockedScreen() {
    const testTypeName = getTestTypeName(test.testType);
    const area = document.getElementById("testContent");
    if (!area) return;

    const isNeutral = test.blockReason === 'Ожидание старта';

    area.innerHTML = `
        <div class="blocked-note ${isNeutral ? 'test-blocked-neutral' : ''}">
            <h2>${testTypeName} ${isNeutral ? 'ожидает начала' : 'заблокирован'}</h2>
            <p>${isNeutral ? 'Нажмите кнопку «Начать тест» для активации.' : 'Система зафиксировала отсутствие активности более 20 секунд.'}</p>
            ${!isNeutral ? `
                <p>Файл с кодом разблокировки был скачан и сохранён в вашу папку.</p>
                <p>Отправьте файл <strong>${test.username}_${testTypeName}_код_разблокировки.docx</strong> администратору.</p>
                <div style="margin: 14px 0;">
                    <button class="btn ghost" id="resendCodeBtn">Получить код повторно</button>
                </div>
            ` : ''}

            <div style="margin-top: 14px;">
                <input type="text" id="unlockCodeInput" placeholder="${isNeutral ? 'Введите код для разблокировки' : 'Введите код от администратора'}">
                <button class="btn" id="submitUnlockBtn">Разблокировать тест</button>
            </div>

            <div style="margin-top: 10px;">
                <button class="btn warning" id="adminUnlockBtn">Админ-разблокировка</button>
            </div>
        </div>
    `;

    const resendBtn = document.getElementById("resendCodeBtn");
    if (resendBtn) {
        resendBtn.addEventListener("click", () => {
            test.unlockCode = generateReadableCode();
            saveTestState();
            createUnlockFile();
            showMessage("Файл с кодом разблокировки отправлен на скачивание!", "success");
        });
    }

    document.getElementById("submitUnlockBtn").addEventListener("click", () => {
        const enteredCode = document.getElementById("unlockCodeInput").value.trim().toUpperCase();
        if (enteredCode === test.unlockCode) {
            blocked = false;
            test.blocked = false;
            document.querySelectorAll("input, button").forEach(el => el.disabled = false);
            saveTestState();
            showMessage("Тест успешно разблокирован!", "success");
            resetInactivityTimer();
            renderCurrentTest();
            updateWarningBannerVisibility();
        } else {
            showError("Неверный код разблокировки!");
        }
    });

    document.getElementById("adminUnlockBtn").addEventListener("click", adminUnblockTest);
}

function unblockTest() {
    const code = document.getElementById("username").value.trim().toUpperCase();
    if (!test) { showError("Нет активного теста для разблокировки!"); return; }

    if (code === test.unlockCode) {
        blocked = false;
        test.blocked = false;
        document.querySelectorAll("input, button").forEach(el => el.disabled = false);
        saveTestState();
        showMessage("Тест успешно разблокирован!", "success");
        resetInactivityTimer();
        renderCurrentTest();
        updateWarningBannerVisibility();
    } else {
        showError("Неверный код разблокировки!");
    }
}

window.updateRankMessage = updateRankMessage;
window.renderGreeting = renderGreeting;
window.getQuestionsByType = getQuestionsByType;
window.getTestForUserType = getTestForUserType;
window.resetInactivityTimer = resetInactivityTimer;
window.trackActivity = trackActivity;
window.showInactivityWarning = showInactivityWarning;
window.getActiveTestTab = getActiveTestTab;
window.updateTestShellHeader = updateTestShellHeader;
window.updateInlineUser = updateInlineUser;
window.showDisclaimer = showDisclaimer;
window.closeDisclaimer = closeDisclaimer;
window.confirmStartTest = confirmStartTest;
window.actuallyStartTest = actuallyStartTest;
window.adminUnblockTest = adminUnblockTest;
window.renderCurrentTest = renderCurrentTest;
window.renderExam = renderExam;
window.renderRetraining = renderRetraining;
window.renderStartScreen = renderStartScreen;
window.renderMultipleChoiceQuestion = renderMultipleChoiceQuestion;
window.renderTextQuestion = renderTextQuestion;
window.renderTestQuestions = renderTestQuestions;
window.renderReviewPage = renderReviewPage;
window.nextQuestion = nextQuestion;
window.finishTestManually = finishTestManually;
window.finishTest = finishTest;
window.saveTestResultForStatistics = saveTestResultForStatistics;
window.saveTestState = saveTestState;
window.loadTestState = loadTestState;
window.clearTestState = clearTestState;
window.blockTest = blockTest;
window.createUnlockFile = createUnlockFile;
window.renderBlockedScreen = renderBlockedScreen;
window.unblockTest = unblockTest;