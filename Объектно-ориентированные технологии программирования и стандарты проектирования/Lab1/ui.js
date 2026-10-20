function icons(symbol, count) {
  return symbol.repeat(Math.min(count, 1000));
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function render() {
  setText('lineCount', state.lineCount);
  setText('lineVisual', icons('[x]', state.lineCount));

  const takingNumbers = state.takingNumbers || [];
  const takingNumbersStr = takingNumbers.join(', ');
  setText('takingOrder', takingNumbersStr || '-');
  
  const takersVisual = takingNumbers.map(() => '[x] -> [#]').join(' ');
  setText('takerVisual', takersVisual);

  const cookingOrders = state.cookingOrders || [];
  const cookingNumbers = cookingOrders.map(o => o.number).join(', ');
  setText('cooking', cookingNumbers || '-');
  
  const kitchenQueue = state.kitchenQueue || [];
  const numbers = kitchenQueue.map(o => o.number).join(', ');
  setText('waiting', 'Ожидают (' + kitchenQueue.length + '): ' + (numbers || '-'));
  
  const cooksVisual = cookingOrders.map(() => '[Cook]').join(' ');
  setText('kitchenVisual', (cooksVisual ? cooksVisual + ' ' : '') + icons('[#]', kitchenQueue.length));

  setText('pickup', state.pickupNumber === null ? '-' : state.pickupNumber);
  setText('servingCount', state.servingCount);
  setText('servingVisual', (state.pickupNumber === null ? '' : '[Order] ') + icons('[x]', state.servingCount));

  setText('diningCount', state.diningCount);
  setText('diningVisual', icons('[*]', state.diningCount));
}