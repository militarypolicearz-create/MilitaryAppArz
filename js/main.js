function initUI() {
    if (typeof inactivityTimer !== 'undefined' && inactivityTimer) {
        clearTimeout(inactivityTimer);
    }

    document.querySelectorAll('#authModal input, #authModal button, #authModal select, #authModal textarea').forEach(el => {
        el.disabled = false;
        el.style.pointerEvents = 'auto';
        el.style.opacity = '1';
    });

    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.disabled = false;
        usernameInput.style.pointerEvents = 'auto';
        usernameInput.style.opacity = '1';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.disabled = false;
        logoutBtn.style.pointerEvents = 'auto';
        logoutBtn.style.opacity = '1';
    }

    if (typeof loadTestState === 'function') loadTestState();
    if (typeof migrateEmployeesStructure === 'function') migrateEmployeesStructure();

    const authDatalist = document.getElementById('authPlayersList');
    if (authDatalist) {
        const employeesData = loadEmployeesData();
        const names = Object.values(employeesData)
            .filter(emp => emp.username && emp.username !== 'Вакантно')
            .map(emp => emp.username);
        authDatalist.innerHTML = names.map(name => `<option value="${name}">`).join('');
    }

    if (typeof checkAuth === 'function' && checkAuth()) {
        const authModal = document.getElementById('authModal');
        const app = document.getElementById('app');
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

        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleDisplay = document.getElementById('userRoleDisplay');
        const currentUsernameDisplay = document.getElementById('currentUsernameDisplay');
        const currentUserRoleDisplay = document.getElementById('currentUserRoleDisplay');
        const avatar = document.getElementById('userAvatar');

        if (userNameDisplay) userNameDisplay.textContent = currentUser.username;
        if (userRoleDisplay) userRoleDisplay.textContent = currentUser.position;
        if (currentUsernameDisplay) currentUsernameDisplay.textContent = currentUser.username;
        if (currentUserRoleDisplay) currentUserRoleDisplay.textContent = `— ${currentUser.position}`;
        if (avatar) {
            const icons = { curator: '★', senior_officer: '◆', officer: '●', cadet: '○' };
            avatar.textContent = icons[currentUser.type] || '·';
        }

        if (typeof updateRankMessage === 'function') updateRankMessage();
        if (typeof openHome === 'function') openHome();
    } else {
        const authModal = document.getElementById('authModal');
        const app = document.getElementById('app');
        if (authModal) {
            authModal.style.display = 'flex';
            authModal.style.opacity = '1';
        }
        if (app) app.style.display = 'none';
    }

    const authActionBtn = document.getElementById('authActionBtn');
    if (authActionBtn) {
        authActionBtn.addEventListener('click', () => {
            const username = document.getElementById('authUsername').value.trim();
            const password = document.getElementById('authPassword').value;
            loginUser(username, password);
        });
    }

    const authPassword = document.getElementById('authPassword');
    if (authPassword) {
        authPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const btn = document.getElementById('authActionBtn');
                if (btn) btn.click();
            }
        });
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && typeof test !== 'undefined' && test && !test.blocked) {
            showError("Тест заблокирован! Не переключайте вкладки во время теста.");
            if (typeof blockTest === 'function') blockTest();
        }
    });

    window.addEventListener('blur', () => {
        if (typeof test !== 'undefined' && test && !test.blocked) {
            setTimeout(() => {
                if (document.hidden && test && !test.blocked) {
                    showError("Тест заблокирован! Не переключайтесь в другие окна.");
                    if (typeof blockTest === 'function') blockTest();
                }
            }, 500);
        }
    });

    if (typeof trackActivity === 'function') {
        document.addEventListener('mousemove', trackActivity);
        document.addEventListener('mousedown', trackActivity);
        document.addEventListener('keypress', trackActivity);
        document.addEventListener('keydown', trackActivity);
    }

    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.addEventListener('click', () => showDisclaimer());

    const finishBtn = document.getElementById('finishBtn');
    if (finishBtn) finishBtn.addEventListener('click', () => finishTestManually());

    const unlockBtn = document.getElementById('unlockBtn');
    if (unlockBtn) {
        unlockBtn.addEventListener('click', () => unblockTest());
        unlockBtn.style.display = 'none';
    }

    const adminUnlockBtn = document.getElementById('adminUnlockBtn');
    if (adminUnlockBtn) {
        adminUnlockBtn.addEventListener('click', () => adminUnblockTest());
        adminUnlockBtn.style.display = 'none';
    }

    const logoutBtn2 = document.getElementById('logoutBtn');
    if (logoutBtn2) logoutBtn2.addEventListener('click', logoutUser);

    setInterval(() => {
        if (typeof test !== 'undefined' && test && !test.blocked && typeof lastActivityTime !== 'undefined') {
            const timeSinceLastActivity = Date.now() - lastActivityTime;
            if (timeSinceLastActivity >= INACTIVITY_TIMEOUT - 5000) {
                if (typeof showInactivityWarning === 'function') showInactivityWarning();
            }
        }
    }, 1000);

    ['username', 'authUsername'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = false;
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
        }
    });
}

document.addEventListener('DOMContentLoaded', initUI);