
var params = new URLSearchParams(window.location.search);
var fio = params.get("fio");
var birthdate = params.get("birthdate");

if (fio) {
    var parts = fio.trim().split(" ");
    var name = parts[1] ? parts[1] : parts[0];
    greeting.innerHTML = "Добро пожаловать, " + name + "!";
}

if (birthdate) {
    var today = new Date();
    var bDate = new Date(birthdate);

    var nextBirthday = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
    if (nextBirthday < today) {
        nextBirthday = new Date(today.getFullYear() + 1, bDate.getMonth(), bDate.getDate());
    }

    var oneDay = 24 * 60 * 60 * 1000;
    var days = Math.round((nextBirthday - today) / oneDay);

    document.getElementById("birthdayInfo").innerHTML = "До вашего дня рождения осталось дней: " + days;
}
