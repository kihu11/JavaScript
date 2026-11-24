var form = document.getElementById("regForm");
if (form) {
  form.onsubmit = function (event) {
    event.preventDefault();
    if (checkForm()) {
      form.submit();
    }
  };
} 
var greeting = document.getElementById("greeting");
if (greeting) {
    showWelcome();
}

function checkForm() {
  var ok = true;

  var login = document.getElementById("login").value;
  if (login.length < 3) {
    document.getElementById("errLogin").innerHTML = "Логин должен быть не короче 3 символов";
    ok = false;
  } else {
    document.getElementById("errLogin").innerHTML = "";
  }

  var password = document.getElementById("password").value;
  if (password.length < 6) {
    document.getElementById("errPassword").innerHTML = "Пароль должен быть не короче 6 символов";
    ok = false;
  } else {
    document.getElementById("errPassword").innerHTML = "";
  }

  var password2 = document.getElementById("password2").value;
  if (password2 !== password) {
    document.getElementById("errPassword2").innerHTML = "Пароли не совпадают";
    ok = false;
  } else {
    document.getElementById("errPassword2").innerHTML = "";
  }

  var fio = document.getElementById("fio").value;
  if (fio.trim().split(" ").length < 2) {
    document.getElementById("errFio").innerHTML = "Введите фамилию и имя";
    ok = false;
  } else {
    document.getElementById("errFio").innerHTML = "";
  }

  var genderM = document.getElementById("genderM").checked;
  var genderF = document.getElementById("genderF").checked;
  if (!genderM && !genderF) {
    document.getElementById("errGender").innerHTML = "Выберите пол";
    ok = false;
  } else {
    document.getElementById("errGender").innerHTML = "";
  }

  var birthdate = document.getElementById("birthdate").value;
  if (birthdate === "") {
    document.getElementById("errBirthdate").innerHTML = "Укажите дату рождения";
    ok = false;
  } else {
    var today = new Date();
    var bDate = new Date(birthdate);
    if (bDate > today) {
      document.getElementById("errBirthdate").innerHTML = "Дата не может быть в будущем";
      ok = false;
    } else {
      document.getElementById("errBirthdate").innerHTML = "";
    }
  }

  var country = document.getElementById("country").value;
  if (country === "") {
    document.getElementById("errCountry").innerHTML = "Выберите страну";
    ok = false;
  } else {
    document.getElementById("errCountry").innerHTML = "";
  }

  var interests = document.getElementsByName("interests");
  var interestChecked = false;
  for (var i = 0; i < interests.length; i++) {
    if (interests[i].checked) {
      interestChecked = true;
    }
  }
  if (!interestChecked) {
    document.getElementById("errInterests").innerHTML = "Выберите хотя бы один интерес";
    ok = false;
  } else {
    document.getElementById("errInterests").innerHTML = "";
  }

  var about = document.getElementById("about").value;
  if (about.length > 99) {
    document.getElementById("errAbout").innerHTML = "Слишком длинный текст (максимум 99 символов)";
    ok = false;
  } else {
    document.getElementById("errAbout").innerHTML = "";
  }

  return ok;
}

function showWelcome(){
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
}
