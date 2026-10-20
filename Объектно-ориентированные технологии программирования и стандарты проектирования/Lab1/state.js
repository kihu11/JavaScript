const state = {
  runId: 0,
  orderCount: 0,
  lineCount: 0,
  takingNumbers: [],
  kitchenQueue: [],
  serviceQueue: [],
  cookingOrders: [],
  pickupNumber: null,
  servingCount: 0,
  diningCount: 0
};

function resetState() {
  state.orderCount = 0;
  state.lineCount = 0;
  state.takingNumbers = [];
  state.kitchenQueue = [];
  state.serviceQueue = [];
  state.cookingOrders = [];
  state.pickupNumber = null;
  state.servingCount = 0;
  state.diningCount = 0;
}