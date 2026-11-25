<?php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$in = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? 'state';

function fail(string $msg): void { throw new Exception($msg); }

try {
    switch ($action) {
    case 'state':
        break;

    case 'add_mechanic':
        $name = trim($in['name'] ?? '');
        $exp = $in['exp'] ?? '';
        if ($name === '') fail('Введите имя');
        if (!is_numeric($exp) || $exp < 0) fail('Опыт должен быть числом ≥ 0');
        $pdo->prepare('INSERT INTO mechanics (name, exp) VALUES (?, ?)')->execute([$name, (int)$exp]);
        break;

    case 'delete_mechanic':
        $m = $pdo->prepare('SELECT order_id FROM mechanics WHERE id = ?');
        $m->execute([$in['id'] ?? 0]);
        $row = $m->fetch();
        if (!$row) fail('Механик не найден');
        if ($row['order_id'] !== null) fail('Нельзя удалить: у механика есть активный заказ');
        $pdo->prepare('DELETE FROM mechanics WHERE id = ?')->execute([$in['id']]);
        break;

    case 'create_order':
        $title = trim($in['title'] ?? ''); $car = trim($in['car'] ?? ''); $price = $in['price'] ?? '';
        if ($title === '' || $car === '') fail('Заполните название и машину');
        if (!is_numeric($price) || $price <= 0) fail('Цена должна быть больше нуля');
        $places = (int)$pdo->query('SELECT COALESCE(SUM(places),0) s FROM garages')->fetch()['s'];
        $busy = (int)$pdo->query("SELECT COUNT(*) c FROM orders WHERE status='active'")->fetch()['c'];
        if ($places - $busy <= 0) fail('Нет свободных мест в гараже');
        $pdo->prepare('INSERT INTO orders (title, car, date, price) VALUES (?, ?, ?, ?)')
            ->execute([$title, $car, date('Y-m-d'), $price]);
        break;

    case 'assign':
        $o = $pdo->prepare("SELECT * FROM orders WHERE id = ? AND status = 'active'");
        $o->execute([$in['orderId'] ?? 0]);
        $order = $o->fetch();
        if (!$order) fail('Заказ не найден или не активен');
        if ($order['mechanic_id'] !== null) fail('Механик уже назначен');
        $m = $pdo->prepare('SELECT * FROM mechanics WHERE id = ?');
        $m->execute([$in['mechanicId'] ?? 0]);
        $mech = $m->fetch();
        if (!$mech || $mech['order_id'] !== null) fail('Механик занят');
        $pdo->prepare('UPDATE orders SET mechanic_id = ? WHERE id = ?')->execute([$mech['id'], $order['id']]);
        $pdo->prepare('UPDATE mechanics SET order_id = ? WHERE id = ?')->execute([$order['id'], $mech['id']]);
        break;

    case 'finish': // status: done | cancelled
        $status = $in['status'] ?? '';
        if (!in_array($status, ['done', 'cancelled'], true)) fail('Неверный статус');
        $pdo->prepare("UPDATE orders SET status = ? WHERE id = ? AND status = 'active'")->execute([$status, $in['id'] ?? 0]);
        $pdo->prepare('UPDATE mechanics SET order_id = NULL WHERE order_id = ?')->execute([$in['id'] ?? 0]);
        break;

    case 'add_garage':
        $name = trim($in['name'] ?? ''); $places = $in['places'] ?? '';
        if ($name === '') fail('Введите название');
        if (!is_numeric($places) || $places <= 0) fail('Мест должно быть больше нуля');
        $pdo->prepare('INSERT INTO garages (name, places) VALUES (?, ?)')->execute([$name, (int)$places]);
        break;

    case 'reset':
        $pdo->exec("DELETE FROM mechanics; DELETE FROM orders; DELETE FROM garages; DELETE FROM sqlite_sequence;");
        seed($pdo);
        break;

    default:
        fail('Неизвестное действие');
    }

    echo json_encode([
        'mechanics' => $pdo->query('SELECT * FROM mechanics ORDER BY id')->fetchAll(),
        'orders'    => $pdo->query('SELECT * FROM orders ORDER BY id')->fetchAll(),
        'garages'   => $pdo->query('SELECT * FROM garages ORDER BY id')->fetchAll(),
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
