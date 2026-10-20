async function customerArrivals(id, interval) {
  while (id === state.runId) {
    state.lineCount++;
    render();
    await delay(interval);
  }
}

async function customerWaits(id, order) {
  await order.ready;
  if (id !== state.runId) return;
  state.servingCount--;
  state.diningCount++;
  render();
}

async function orderTaker(id) {
  while (id === state.runId) {
    if (state.lineCount === 0) {
      await delay(10);
      continue;
    }
    state.lineCount--;
    
    const currentTakingNumber = state.orderCount + 1;
    state.orderCount++;
    
    state.takingNumbers.push(currentTakingNumber);
    render();
    
    await delay(3000);
    if (id !== state.runId) return;
    
    const order = createOrder(currentTakingNumber);
    state.kitchenQueue.push(order);
    state.serviceQueue.push(order);
    
    state.servingCount++;
    render();
    customerWaits(id, order);
    
    state.takingNumbers = state.takingNumbers.filter(num => num !== currentTakingNumber);
    render();
  }
}

async function cook(id, interval) {
  while (id === state.runId) {
    if (state.kitchenQueue.length === 0) {
      await delay(50);
      continue;
    }
    const order = state.kitchenQueue.shift();
    state.cookingOrders.push(order);
    render();
    
    await delay(interval);
    if (id !== state.runId) return;
    
    order.resolveCooked();
    
    const index = state.cookingOrders.indexOf(order);
    if (index > -1) {
      state.cookingOrders.splice(index, 1);
    }
    render();
  }
}

async function server(id) {
  while (id === state.runId) {
    if (state.serviceQueue.length === 0) {
      await delay(50);
      continue;
    }
    const order = state.serviceQueue.shift();
    await order.cooked;
    if (id !== state.runId) return;
    state.pickupNumber = order.number;
    render();
    order.resolveReady();
    await delay(1);
    if (id !== state.runId) return;
    state.pickupNumber = null;
    render();
  }
}
