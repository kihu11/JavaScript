function stop() {
  state.runId++;
}

function start() {
  const arrival = checkInterval(document.getElementById('arrival').value, 'интервал прихода клиентов');
  const cookTime = checkInterval(document.getElementById('cook').value, 'интервал приготовления заказа');
  setText('arrivalError', arrival.error || '');
  setText('cookError', cookTime.error || '');
  if (arrival.error || cookTime.error) return;

  stop();
  resetState();
  render();
  const id = state.runId;
  
  customerArrivals(id, arrival.value * 1000);
  
  const numberOfTakers = 3;
  for (let i = 0; i < numberOfTakers; i++) {
    orderTaker(id);
  }
  
  const numberOfCooks = 2;
  for (let i = 0; i < numberOfCooks; i++) {
    cook(id, cookTime.value * 1000);
  }
  
  server(id);
}

document.getElementById('start').addEventListener('click', start);
document.getElementById('stop').addEventListener('click', stop);
render();