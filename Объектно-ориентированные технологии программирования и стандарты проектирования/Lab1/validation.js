function checkInterval(value, name) {
  const text = value.trim().replace(',', '.');
  if (text === '') return { error: 'Введите ' + name + '.' };
  const number = Number(text);
  if (isNaN(number)) return { error: 'Значение "' + value + '" не является числом.' };
  if (number <= 0) return { error: 'Значение должно быть больше нуля.' };
  //if (number < 0.001) return { error: 'Минимальный интервал - 0.01 сек.' };
  return { value: number };
}
