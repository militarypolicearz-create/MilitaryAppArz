function loginUser(username, password) {
    if (!username || username.trim() === '') {
        showAuthStatus('Введите ник', 'error');
        return false;
    }
    if (!password || password.length === 0) {
        showAuthStatus('Введите код доступа', 'error');
        return false;
    }

    const formattedUsername = formatUsername(username);
    const employeesData = loadEmployeesData();
    const employee = Object.values(employeesData).find(emp =>
        emp.username.toLowerCase() === formattedUsername.toLowerCase() &&
        emp.username !== 'Вакантно'
    );

    if (!employee) {
        showAuthStatus(`Сотрудник "${formattedUsername}" не найден`, 'error');
        return false;
    }

    const correctCode = getAccessCode(employee.id);
    if (!correctCode) {
        showAuthStatus('Для вашей должности не задан код доступа', 'error');
        return false;
    }
    if (password.trim() !== correctCode) {
        showAuthStatus('Неверный код доступа', 'error');
        return false;
    }

    return performAuth(formattedUsername);
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
            emp.username.toLowerCase() === currentUser.username.toLowerCase() &&
            emp.username !== 'Вакантно'
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
        emp.username.toLowerCase() === username.toLowerCase() &&
        emp.username !== 'Вакантно'
    );
    if (!employee) {
        showAuthStatus('Сотрудник не найден.', 'error');
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
    showAuthStatus(`Добро пожаловать, ${employee.username}! (${employee.position})`, 'success');

    setTimeout(() => {
        const authModal = document.getElementById('authModal');
        const app = document.getElementById('app');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleDisplay = document.getElementById('userRoleDisplay');
        const usernameInput = document.getElementById('username');
        const avatar = document.getElementById('userAvatar');
        const currentUsernameDisplay = document.getElementById('currentUsernameDisplay');
        const currentUserRoleDisplay = document.getElementById('currentUserRoleDisplay');
        const avatarInline = document.getElementById('userAvatarInline');

        if (authModal) {
            authModal.style.opacity = '0';
            authModal.style.transition = 'opacity 0.5s ease';
            setTimeout(() => authModal.style.display = 'none', 500);
        }
        if (app) {
            app.style.display = 'block';
            app.style.opacity = '0';
            app.style.transition = 'opacity 0.5s ease';
            setTimeout(() => app.style.opacity = '1', 100);
        }
        if (userNameDisplay) userNameDisplay.textContent = employee.username;
        if (userRoleDisplay) userRoleDisplay.textContent = employee.position;
        if (currentUsernameDisplay) currentUsernameDisplay.textContent = employee.username;
        if (currentUserRoleDisplay) currentUserRoleDisplay.textContent = employee.position;

        const icons = {
            curator: '★',
            senior_officer: '◆',
            officer: '●',
            cadet: '○'
        };
        const icon = icons[employee.type] || '·';
        if (avatar) avatar.textContent = icon;
        if (avatarInline) avatarInline.textContent = icon;

        if (usernameInput) {
            usernameInput.disabled = false;
            usernameInput.style.pointerEvents = 'auto';
            usernameInput.style.opacity = '1';
        }

        if (typeof updateRankMessage === 'function') updateRankMessage();
        if (typeof openHome === 'function') openHome();
    }, 600);
    return true;
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authDate');
    localStorage.removeItem('adminAuthenticated');
    isAdminAuthenticated = false;

    if (typeof test !== 'undefined' && test && typeof clearTestState === 'function') {
        clearTestState();
    }
    currentUser = null;
    if (typeof test !== 'undefined') test = null;
    if (typeof blocked !== 'undefined') blocked = false;
    if (typeof isAdminAuthenticated !== 'undefined') isAdminAuthenticated = false;

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        if (modal.id !== 'authModal' && modal.id !== 'disclaimerModal' && modal.id !== 'employeeSelectionModal') {
            modal.remove();
        }
    });

    const app = document.getElementById('app');
    const authModal = document.getElementById('authModal');
    const statusEl = document.getElementById('authStatus');
    const usernameInput = document.getElementById('authUsername');
    const passwordInput = document.getElementById('authPassword');

    if (app) {
        app.style.opacity = '0';
        setTimeout(() => app.style.display = 'none', 500);
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

    if (typeof hideWarningBanner === 'function') hideWarningBanner();
    if (typeof updateRankMessage === 'function') updateRankMessage();
    showMessage('Вы вышли из системы', 'info');
}

function authenticateAdmin() {
    if (isAdminAuthenticated === true) {
        return true;
    }

    const pwd = prompt("Введите пароль для Админки:");
    if (pwd === ADMIN_PASSWORD) {
        isAdminAuthenticated = true;
        localStorage.setItem('adminAuthenticated', 'true');
        showMessage("Доступ в админ-панель разрешён", "success");
        return true;
    }
    alert("Неверный пароль!");
    return false;
}

function logoutAdmin() {
    isAdminAuthenticated = false;
    localStorage.removeItem('adminAuthenticated');
    showMessage("Выход из админ-панели выполнен", "info");
    if (typeof openExamTab === 'function') openExamTab();
    if (typeof setTopbarActive === 'function') setTopbarActive('exam');
    if (typeof clearSidebarActive === 'function') clearSidebarActive();
}

window.loginUser = loginUser;
window.checkAuth = checkAuth;
window.performAuth = performAuth;
window.logoutUser = logoutUser;
window.authenticateAdmin = authenticateAdmin;
window.logoutAdmin = logoutAdmin;
