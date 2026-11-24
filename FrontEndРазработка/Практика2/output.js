const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');

function clearOutput() {
    resultDiv.innerHTML = '';
    errorDiv.textContent = '';
}

function showError(message) {
    errorDiv.textContent = message;
}

function showPerson(person, title) {
    resultDiv.innerHTML += `
        <p>
            <strong>${title}</strong><br>
            Полное имя: <b>${person.getFullName()}</b><br>
            Возраст: <b>${person.age}</b>
        </p>
    `;
}

function handleShowFullName() {
    clearOutput();

    const check = validateForm();
    if (!check.valid) {
        showError(check.message);
        return;
    }

    const data = getFormData();
    const person = new Person(data.firstName, data.lastName, Number(data.age));

    showPerson(person, 'Создан объект Person:');
}

function handleChangeAge() {
    clearOutput();

    const check = validateForm();
    if (!check.valid) {
        showError(check.message);
        return;
    }

    const data = getFormData();
    const person = new Person(data.firstName, data.lastName, Number(data.age));

    showPerson(person, 'До изменения возраста:');

    if (person.changeAge(Number(data.newAge))) {
        showPerson(person, 'После изменения возраста:');
    } else {
        showError('Не удалось изменить возраст.');
    }
}
document.getElementById('btnShow').addEventListener('click', handleShowFullName);
document.getElementById('btnChange').addEventListener('click', handleChangeAge);