<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Автомастерская</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
  <h1>Автомастерская</h1>
  <button id="reset">Начать заново</button>
</header>
<main>
  <section id="stats" class="stats"></section>

  <section>
    <h2>Механики</h2>
    <form id="mechForm" class="row">
      <input name="name" placeholder="Имя">
      <input name="exp" type="number" placeholder="Опыт, лет">
      <button>Добавить</button>
    </form>
    <div class="scroll"><table id="mechTable"></table></div>
  </section>

  <section>
    <h2>Заказы</h2>
    <form id="orderForm" class="row">
      <input name="title" placeholder="Название работ">
      <input name="car" placeholder="Машина">
      <input name="price" type="number" placeholder="Цена, ₽">
      <button>Создать</button>
    </form>
    <label>Показать:
      <select id="filter">
        <option value="all">все</option>
        <option value="active">активные</option>
        <option value="done">завершённые</option>
        <option value="cancelled">отменённые</option>
      </select>
    </label>
    <div class="scroll"><table id="orderTable"></table></div>
  </section>

  <section>
    <h2>Гараж</h2>
    <form id="garageForm" class="row">
      <input name="name" placeholder="Название гаража">
      <input name="places" type="number" placeholder="Мест">
      <button>Добавить гараж</button>
    </form>
    <div id="garages"></div>
  </section>
  <p id="msg" role="status"></p>
</main>
<script src="app.js"></script>
</body>
</html>
