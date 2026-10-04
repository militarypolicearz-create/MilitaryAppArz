let currentUser = null;
let playersDatabase = JSON.parse(localStorage.getItem('playersDatabase') || '[]');
let isAdminAuthenticated = false;

function saveEmployeesData(employeesData) {
    localStorage.setItem('fixedEmployees', JSON.stringify(employeesData));
}

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
            if (!oldEmp || !newEmpSlot) return;

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
            oldEmp.files = { academy: [], exam: [], retraining: [] };

            newEmpSlot.folders = {
                academy: `${move.username}_Академия`,
                exam: `${move.username}_Экзамен`,
                retraining: `${move.username}_Переаттестация`
            };
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

                    emp.files = { academy: [], exam: [], retraining: [] };
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
                files: { academy: [], exam: [], retraining: [] }
            };
        });
    }

    saveEmployeesData(employeesData);
    return employeesData;
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

    if (!employee) return false;

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

    if (!employee.files[folderType]) employee.files[folderType] = [];
    employee.files[folderType].push(file);
    saveEmployeesData(employeesData);

    return true;
}

function migrateEmployeesStructure() {
    const saved = localStorage.getItem('fixedEmployees');
    if (!saved) return;
    const employeesData = JSON.parse(saved);
    let needSave = false;

    FIXED_EMPLOYEE_STRUCTURE.forEach(fixedEmp => {
        if (!employeesData[fixedEmp.id]) {
            employeesData[fixedEmp.id] = {
                ...fixedEmp,
                username: fixedEmp.username,
                folders: {
                    academy: `${fixedEmp.username !== 'Вакантно' ? fixedEmp.username : fixedEmp.position}_Академия`,
                    exam: `${fixedEmp.username !== 'Вакантно' ? fixedEmp.username : fixedEmp.position}_Экзамен`,
                    retraining: `${fixedEmp.username !== 'Вакантно' ? fixedEmp.username : fixedEmp.position}_Переаттестация`
                },
                files: { academy: [], exam: [], retraining: [] }
            };
            needSave = true;
        }
    });

    if (needSave) saveEmployeesData(employeesData);
}

window.loadEmployeesData = loadEmployeesData;
window.saveEmployeesData = saveEmployeesData;
window.getEmployeeByUsername = getEmployeeByUsername;
window.addFileToEmployeeFolder = addFileToEmployeeFolder;
window.migrateEmployeesStructure = migrateEmployeesStructure;