function getAccessCode(employeeId) {
    if (!employeeId) return null;
    return FIXED_ACCESS_CODES[employeeId] || null;
}

function formatUsername(username) {
    const parts = username.split(/[_\s-]/);
    const formattedParts = parts.map(part => {
        if (part.length === 0) return part;
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });
    return formattedParts.join('_');
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

function getTestTypeName(type) {
    if (type === 'exam') return 'Экзамен';
    if (type === 'retraining') return 'Переаттестация';
    return 'Тест';
}

function getInitials(username) {
    const parts = username.split(/[_\s-]/);
    return parts.map(part => part.charAt(0).toUpperCase()).join('').slice(0, 2);
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

    if (type === "success") alertDiv.style.background = "#10b981";
    else if (type === "error") alertDiv.style.background = "#ef4444";
    else alertDiv.style.background = "#3b82f6";

    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => alertDiv.remove(), 3000);
}

function showError(message) {
    showMessage(message, "error");
}

function showAuthStatus(message, type) {
    const statusEl = document.getElementById('authStatus');
    if (!statusEl) return;
    statusEl.style.display = 'block';
    statusEl.textContent = message;
    statusEl.className = `auth-status ${type}`;
}

function getRandomGreeting(userType) {
    const greetings = GREETINGS[userType] || GREETINGS['cadet'];
    return greetings[Math.floor(Math.random() * greetings.length)];
}

function shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function generateReadableCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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

window.getAccessCode = getAccessCode;
window.formatUsername = formatUsername;
window.escapeHtml = escapeHtml;
window.arrayBufferToBase64 = arrayBufferToBase64;
window.getTestTypeName = getTestTypeName;
window.getInitials = getInitials;
window.showMessage = showMessage;
window.showError = showError;
window.showAuthStatus = showAuthStatus;
window.getRandomGreeting = getRandomGreeting;
window.shuffleArray = shuffleArray;
window.generateReadableCode = generateReadableCode;
window.parseAnswersFromReport = parseAnswersFromReport;