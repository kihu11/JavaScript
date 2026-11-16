
const $ = id => document.getElementById(id);
 
function show(msg, color) {
  $('status').textContent = msg;
  $('status').style.color = 'var(--' + color + ')';
}
 
$('btn').onclick = () => {
  const pattern = $('pattern').value, text = $('text').value, out = $('result');
  out.textContent = text;
 
  if (pattern === '' || text === '') return show('Предупреждение: введена пустая строка!', 'warn');
 
  let m;
  try { m = parse(pattern); }
  catch (e) { return show('Предупреждение: это не регулярное выражение (' + e.message + ')', 'err'); }
 
  for (let i = 0; i < text.length; i++) {
    const ends = [...m(text, i)].filter(e => e > i);
    if (!ends.length) continue;
    const end = Math.max(...ends), mark = document.createElement('mark');
    mark.textContent = text.slice(i, end);
    out.textContent = text.slice(0, i);
    out.append(mark, text.slice(end));
    return show('Регулярное выражение найдено и выделено.', 'ok');
  }
  show('Регулярное выражение в строке отсутствует.', 'warn');
};
 