let input = prompt("Введите элементы массива через запяту.")
if (input == null) {
    console.log("Операция отменена");
} else {
    let array = input.split(",");

    array = array.map(item => item.trim());

    let result = array.join(" ");

    console.log("Исходный массив:", array);
    console.log("Результат:", result);
    alert("Результат:" + result);
}
