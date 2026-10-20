function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createOrder() {
  let resolveCooked;
  let resolveReady;
  const cooked = new Promise(resolve => { resolveCooked = resolve; });
  const ready = new Promise(resolve => { resolveReady = resolve; });
  state.orderCount++;
  return { number: state.orderCount, cooked, ready, resolveCooked, resolveReady };
}
