document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  var name = document.getElementById('name').value.trim();
  var service = document.getElementById('service').value;
  var date = document.getElementById('date').value;
  document.getElementById('msg').textContent =
    name + ', вы записаны: ' + service + ', ' + date;
  this.reset();
});
