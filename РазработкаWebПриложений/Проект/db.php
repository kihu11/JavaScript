<?php
// Подключение к SQLite, создание таблиц и начальные данные
$pdo = new PDO('sqlite:' . __DIR__ . '/shop.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

$pdo->exec("
CREATE TABLE IF NOT EXISTS mechanics (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, exp INTEGER NOT NULL, order_id INTEGER);
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, car TEXT NOT NULL, date TEXT NOT NULL, price REAL NOT NULL, status TEXT NOT NULL DEFAULT 'active', mechanic_id INTEGER);
CREATE TABLE IF NOT EXISTS garages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, places INTEGER NOT NULL);
");

function seed(PDO $pdo): void {
    $m = $pdo->prepare('INSERT INTO mechanics (name, exp, order_id) VALUES (?, ?, ?)');
    foreach ([['Иван Петров', 8, 1], ['Сергей Козлов', 5, 2], ['Алексей Громов', 3, null],
              ['Дмитрий Орлов', 12, null], ['Павел Седов', 1, null], ['Олег Новиков', 6, null]] as $r) $m->execute($r);
    $o = $pdo->prepare('INSERT INTO orders (title, car, date, price, status, mechanic_id) VALUES (?, ?, ?, ?, ?, ?)');
    $today = date('Y-m-d');
    $o->execute(['Замена масла', 'Toyota Camry', $today, 3500, 'active', 1]);
    $o->execute(['Ремонт подвески', 'Lada Vesta', $today, 12000, 'active', 2]);
    $g = $pdo->prepare('INSERT INTO garages (name, places) VALUES (?, ?)');
    $g->execute(['Гараж А', 4]);
    $g->execute(['Гараж Б', 3]);
}

if ($pdo->query('SELECT COUNT(*) c FROM mechanics')->fetch()['c'] == 0
    && $pdo->query('SELECT COUNT(*) c FROM garages')->fetch()['c'] == 0) seed($pdo);
