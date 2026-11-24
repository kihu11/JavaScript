function getFormData() {
    return {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        age: document.getElementById('age').value.trim(),
        newAge: document.getElementById('newAge').value.trim()
    };
}

function isPositiveInteger(str) {
    if (!/^\d+$/.test(str)) return false;
    const n = Number(str);
    return Number.isInteger(n) && n > 0 && n < 100;
}

function isNotEmpty(str) {
    return typeof str == 'string' && str.length > 0;
}


const sum = (a,b) => {return a + b};

const su = (a,b)



function isValidName(str) {
    return /^[A-Za-zА-Яа-яЁё\s-]+$/.test(str);
}

function validateForm() {
    const data = getFormData();

    if (!isNotEmpty(data.firstName)) {
        return { valid: false, message: 'Введите имя.' };
    }
    if (!isNotEmpty(data.lastName)) {
        return { valid: false, message: 'Введите фамилию.' };
    }
    if (!isValidName(data.lastName)) {
        return { valid: false, message: 'Фамилия должна содержать только буквы.' };
    }
    if (!isPositiveInteger(data.age)) {
        return { valid: false, message: 'Возраст должен быть целым положительным числом (< 100).' };
    }
    if (!isPositiveInteger(data.newAge)) {
        return { valid: false, message: 'Новый возраст должен быть целым положительным числом (< 100).' };
    }
    
    return { valid: true, message: '' };
}

