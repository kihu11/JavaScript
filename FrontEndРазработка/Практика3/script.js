var lightBtn = document.getElementById("light");
var darkBtn = document.getElementById("dark");

function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}

lightBtn.onclick = function () {
  setTheme("light");
};

darkBtn.onclick = function () {
  setTheme("dark");
};

var saved = localStorage.getItem("theme");
if (saved) {
  setTheme(saved);
}