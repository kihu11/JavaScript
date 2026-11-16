function parse(s) {
  let p = 0;
  const fail = msg => { throw new Error(msg); };
 
  function expr() {
    const alts = [term()];
    while (s[p] === '|') { p++; alts.push(term()); }
    return (t, i) => {
      const r = new Set();
      for (const a of alts) for (const e of a(t, i)) r.add(e);
      return r;
    };
  }
 
  function term() {
    const fs = [];
    while (p < s.length && s[p] !== '|' && s[p] !== ')') fs.push(factor());
    if (fs.length === 0) fail('пустая альтернатива или группа в позиции ' + p);
    return (t, i) => {
      let cur = new Set([i]);
      for (const f of fs) {
        const next = new Set();
        for (const c of cur) for (const e of f(t, c)) next.add(e);
        cur = next;
      }
      return cur;
    };
  }
 
  function star(a, t, starts) {
    const res = new Set(starts), queue = [...starts];
    while (queue.length) for (const e of a(t, queue.shift())) if (!res.has(e)) { res.add(e); queue.push(e); }
    return res;
  }
 
  function factor() {//Читает один элемент и смотрит, есть ли после него ?, *
    const a = atom(), op = s[p];
    if (op === '?') { p++; return (t, i) => new Set([i, ...a(t, i)]); }
    if (op === '*') { p++; return (t, i) => star(a, t, new Set([i])); }
    if (op === '+') { p++; return (t, i) => star(a, t, a(t, i)); }
    return a;
  }
 
  function atom() {
    let c = s[p];
    if (c === '*' || c === '+' || c === '?') fail("'" + c + "' без операнда в позиции " + p);
    p++;
    if (c === '(') {
      const e = expr();
      if (s[p] !== ')') fail('не закрыта скобка');
      p++;
      return e;
    }
    if (c === '.') return (t, i) => new Set(i < t.length ? [i + 1] : []);
    if (c === '\\') {
      if (p >= s.length) fail('символ \\ в конце выражения');
      c = s[p++];
    }
    return (t, i) => new Set(t[i] === c ? [i + 1] : []);
  }
 
  const m = expr();
  if (p < s.length) fail('лишняя закрывающая скобка в позиции ' + p);
  return m;
}
 