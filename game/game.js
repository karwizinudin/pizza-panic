// Pizza Panic — main game: shift timer, pizza assembly, oven, serving, scoring.
var SHIFT_SECONDS = 150;
var BAKE_SECONDS = 6;
var BURN_SECONDS = 9;

var state = {
  screen: "start", // start | playing | over
  timeLeft: SHIFT_SECONDS,
  score: 0,
  combo: 0,
  bestCombo: 0,
  served: 0,
  mistakes: 0,
  lost: 0,
  orders: [],
  spawnIn: 0,
  pizza: null, // {dough, sauce, toppings[], bake:0..1, baked, burnt, sliced}
  oven: null   // {progress} while baking
};

function $(id) { return document.getElementById(id); }
function freshPizza() { return { dough: false, sauce: null, toppings: [], bake: 0, baked: false, burnt: false, sliced: false }; }

function startShift() {
  state.screen = "playing";
  state.timeLeft = SHIFT_SECONDS;
  state.score = 0; state.combo = 0; state.bestCombo = 0;
  state.served = 0; state.mistakes = 0; state.lost = 0;
  state.orders = [makeOrder(0), makeOrder(0)];
  state.spawnIn = 9;
  state.pizza = freshPizza();
  state.oven = null;
  $("startScreen").classList.add("hidden");
  $("endScreen").classList.add("hidden");
  SoundFX.ding();
  renderAll();
}

function endShift() {
  state.screen = "over";
  $("finalScore").textContent = state.score;
  $("finalStats").textContent = "Pizzas served: " + state.served + "  ·  Best combo: ×" + Math.max(1, state.bestCombo) +
    "  ·  Mistakes: " + state.mistakes + "  ·  Orders lost: " + state.lost;
  var rank = state.score >= 2500 ? "🏆 HEAD CHEF — the pizzeria is yours!" :
             state.score >= 1500 ? "⭐ SOUS CHEF — the rush fears you!" :
             state.score >= 800  ? "👨‍🍳 LINE COOK — solid shift!" :
             "🍕 TRAINEE — the oven still believes in you!";
  $("finalRank").textContent = rank;
  $("endScreen").classList.remove("hidden");
  SoundFX.ding();
}

function toast(msg) {
  var t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function () { t.classList.remove("show"); }, 900);
}

// ---- stations ----
function addDough() {
  if (state.screen !== "playing") return;
  if (state.pizza.dough || state.oven) return;
  state.pizza.dough = true;
  SoundFX.place();
  renderPizza();
}
function addSauce(kind) {
  if (state.screen !== "playing") return;
  var p = state.pizza;
  if (!p.dough || p.sauce || state.oven || p.baked) return;
  p.sauce = kind;
  SoundFX.pop();
  renderPizza();
}
function addTopping(kind) {
  if (state.screen !== "playing") return;
  var p = state.pizza;
  if (!p.dough || !p.sauce || state.oven || p.baked) return;
  if (p.toppings.indexOf(kind) >= 0) return; // one of each per pizza
  if (p.toppings.length >= 4) return;
  p.toppings.push(kind);
  SoundFX.pop();
  renderPizza();
}
function startBake() {
  if (state.screen !== "playing") return;
  var p = state.pizza;
  if (!p.dough || !p.sauce || p.toppings.length === 0 || state.oven) return;
  state.oven = { progress: 0, done: false };
  SoundFX.place();
  renderPizza();
}
function slicePizza() {
  if (state.screen !== "playing") return;
  var p = state.pizza;
  if (!p.baked || p.burnt || p.sliced) return;
  p.sliced = true;
  SoundFX.pop();
  renderPizza();
}
function trashPizza() {
  if (state.screen !== "playing") return;
  if (!state.pizza.dough || (state.oven && !state.oven.done)) return;
  state.pizza = freshPizza();
  state.oven = null;
  SoundFX.buzz();
  renderPizza();
}

function servePizza() {
  if (state.screen !== "playing") return;
  var p = state.pizza;
  if (!p.dough) { toast("Build a pizza first!"); return; }
  if (!p.baked || p.burnt || !p.sliced) { toast("Bake it and slice it first!"); SoundFX.buzz(); return; }
  for (var i = 0; i < state.orders.length; i++) {
    var o = state.orders[i];
    if (pizzaMatchesOrder(p, o)) {
      var base = 100 + 25 * o.toppings.length;
      var timeBonus = Math.round(60 * (o.patience / o.maxPatience));
      var mult = Math.min(5, 1 + state.combo);
      var pts = (base + timeBonus) * mult;
      state.score += pts;
      state.served++;
      state.combo++;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.orders.splice(i, 1);
      state.pizza = freshPizza();
      state.oven = null;
      SoundFX.chaChing();
      toast("+" + pts + "  " + (state.combo > 1 ? "COMBO ×" + Math.min(5, state.combo) + "!" : "SERVED!"));
      renderAll();
      return;
    }
  }
  state.score = Math.max(0, state.score - 50);
  state.mistakes++;
  state.combo = 0;
  state.pizza = freshPizza();
  state.oven = null;
  SoundFX.buzz();
  toast("WRONG PIZZA! −50");
  renderAll();
}

// ---- loop ----
function tick(dt) {
  if (state.screen !== "playing") return;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) { state.timeLeft = 0; renderHud(); endShift(); return; }
  if (state.timeLeft <= 10 && Math.ceil(state.timeLeft) !== Math.ceil(state.timeLeft + dt)) SoundFX.tick();
  // orders
  for (var i = state.orders.length - 1; i >= 0; i--) {
    var o = state.orders[i];
    o.patience -= dt;
    if (o.patience <= 0) {
      state.orders.splice(i, 1);
      state.lost++;
      state.combo = 0;
      toast("Order walked out! 😤");
      SoundFX.buzz();
    }
  }
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.orders.length < 3) {
    state.orders.push(makeOrder(state.served));
    // Rush hour: the more you serve, the faster new orders arrive.
    var gap = Math.max(6, 11 - state.served * 0.4) + Math.random() * 4;
    state.spawnIn = gap;
  }
  // oven
  if (state.oven) {
    state.oven.progress += dt;
    if (state.oven.progress >= BAKE_SECONDS && !state.pizza.baked) {
      state.pizza.baked = true;
      state.pizza.bake = 1;
      state.oven.done = true;
      SoundFX.ding();
      toast("Pizza's ready — slice it!");
    }
    if (state.oven.progress >= BAKE_SECONDS + BURN_SECONDS) {
      state.pizza.burnt = true;
      state.oven = null;
      toast("BURNT! Trash it 🔥");
      SoundFX.buzz();
    }
  }
  renderHud();
  renderOrders();
  renderOven();
}

// ---- rendering ----
function renderHud() {
  var m = Math.floor(state.timeLeft / 60), s = Math.floor(state.timeLeft % 60);
  var t = $("timer");
  t.textContent = m + ":" + (s < 10 ? "0" : "") + s;
  t.classList.toggle("low", state.timeLeft <= 15);
  $("timefill").style.width = (100 * state.timeLeft / SHIFT_SECONDS) + "%";
  $("timefill").style.background = state.timeLeft <= 15 ? "#ff5d5d" : "#7dff9a";
  $("score").textContent = state.score;
  $("combo").textContent = "×" + Math.max(1, Math.min(5, 1 + state.combo));
  $("served").textContent = state.served;
}

function renderOrders() {
  var row = $("orderRow");
  row.innerHTML = "";
  for (var i = 0; i < 3; i++) {
    var o = state.orders[i];
    if (!o) {
      var e = document.createElement("div");
      e.className = "ticket empty";
      e.textContent = "— waiting for customers —";
      row.appendChild(e);
      continue;
    }
    var pct = Math.max(0, 100 * o.patience / o.maxPatience);
    var cls = pct > 50 ? "" : pct > 25 ? "warn" : "crit";
    var d = document.createElement("div");
    d.className = "ticket";
    d.innerHTML = '<div class="tno">ORDER #' + o.id + '</div>' +
      '<div class="recipe">' + recipeIcons(o) + '</div>' +
      '<div class="rname">' + o.name + ' — ' + recipeText(o) + '</div>' +
      '<div class="patience"><div class="' + cls + '" style="width:' + pct + '%"></div></div>';
    row.appendChild(d);
  }
}

var TOPPING_POS = [
  { left: "18%", top: "22%" }, { left: "62%", top: "18%" }, { left: "40%", top: "42%" },
  { left: "66%", top: "58%" }, { left: "22%", top: "62%" }, { left: "44%", top: "70%" }
];
function renderPizza() {
  var p = state.pizza;
  var el = $("pizza");
  el.className = "";
  if (!p.dough) { el.classList.add("empty"); el.innerHTML = '<div class="hint">Click DOUGH to start a pizza</div>'; }
  else {
    var html = "";
    if (p.sauce) html += '<div class="sauce' + (p.sauce === "bbq" ? " bbq" : "") + '"></div><div class="cheese"></div>';
    for (var i = 0; i < p.toppings.length; i++) {
      var pos = TOPPING_POS[i % TOPPING_POS.length];
      html += '<div class="top" style="left:' + pos.left + ';top:' + pos.top + '">' + TOPPINGS[p.toppings[i]].icon + "</div>";
    }
    el.innerHTML = html;
    if (p.baked) el.classList.add("baked");
    if (p.burnt) el.classList.add("burnt");
    if (p.sliced) el.classList.add("sliced");
  }
  var st;
  if (state.oven && !state.oven.done) st = "Baking in the oven… " + Math.max(0, BAKE_SECONDS - state.oven.progress).toFixed(0) + "s left!";
  else if (p.burnt) st = "Burnt! Hit TRASH and start over.";
  else if (p.baked && p.sliced) st = "Sliced & ready — hit SERVE!";
  else if (p.baked) st = "Baked! Slice it, then serve.";
  else if (!p.dough) st = "No pizza — start with dough!";
  else if (!p.sauce) st = "Dough ready — add a sauce!";
  else if (p.toppings.length === 0) st = "Sauced — add toppings from the ticket!";
  else st = "Looking good — bake it when ready!";
  $("pizzaState").textContent = st;
  $("serveBtn").disabled = !(p.dough && p.baked && !p.burnt && p.sliced);
  $("trashBtn").disabled = !p.dough || !!state.oven;
  ["stDough", "stSauceTom", "stSauceBbq"].forEach(function (id) { $(id).classList.remove("used"); });
  if (p.dough) $("stDough").classList.add("used");
  if (p.sauce === "tomato") $("stSauceTom").classList.add("used");
  if (p.sauce === "bbq") $("stSauceBbq").classList.add("used");
  ["stPepperoni", "stMushroom", "stPepper", "stOnion", "stOlive", "stCheese"].forEach(function (id) { $(id).classList.remove("used"); });
  p.toppings.forEach(function (t) {
    var map = { pepperoni: "stPepperoni", mushroom: "stMushroom", pepper: "stPepper", onion: "stOnion", olive: "stOlive", cheese: "stCheese" };
    $(map[t]).classList.add("used");
  });
}

function renderOven() {
  if (!state.oven) { $("ovenFill").style.width = "0%"; return; }
  var pct = Math.min(100, 100 * state.oven.progress / BAKE_SECONDS);
  $("ovenFill").style.width = pct + "%";
  $("ovenFill").style.background = state.oven.progress > BAKE_SECONDS ? "#e03131" : "#ffa94d";
}

function renderAll() { renderHud(); renderOrders(); renderPizza(); renderOven(); }

// ---- wiring ----
$("startBtn").addEventListener("click", startShift);
$("againBtn").addEventListener("click", startShift);
$("serveBtn").addEventListener("click", servePizza);
$("trashBtn").addEventListener("click", trashPizza);
$("stDough").addEventListener("click", addDough);
$("stSauceTom").addEventListener("click", function () { addSauce("tomato"); });
$("stSauceBbq").addEventListener("click", function () { addSauce("bbq"); });
$("stPepperoni").addEventListener("click", function () { addTopping("pepperoni"); });
$("stMushroom").addEventListener("click", function () { addTopping("mushroom"); });
$("stPepper").addEventListener("click", function () { addTopping("pepper"); });
$("stOnion").addEventListener("click", function () { addTopping("onion"); });
$("stOlive").addEventListener("click", function () { addTopping("olive"); });
$("stCheese").addEventListener("click", function () { addTopping("cheese"); });
$("stOven").addEventListener("click", startBake);
$("stSlice").addEventListener("click", slicePizza);
$("muteBtn").addEventListener("click", function () {
  $("muteBtn").textContent = SoundFX.toggleMute() ? "🔇" : "🔊";
});
document.addEventListener("keydown", function (e) {
  if (state.screen !== "playing") { if (e.key === "Enter") startShift(); return; }
  var k = e.key.toLowerCase();
  if (k === "d") addDough();
  else if (k === "1") addSauce("tomato");
  else if (k === "2") addSauce("bbq");
  else if (k === "3") addTopping("pepperoni");
  else if (k === "4") addTopping("mushroom");
  else if (k === "5") addTopping("pepper");
  else if (k === "6") addTopping("onion");
  else if (k === "7") addTopping("olive");
  else if (k === "8") addTopping("cheese");
  else if (k === "b") startBake();
  else if (k === "s") slicePizza();
  else if (k === "enter") servePizza();
});

state.pizza = freshPizza();
renderAll();
setInterval(function () { tick(0.1); }, 100);

// Test hooks for the headless play-test (not part of gameplay).
window.PizzaPanic = {
  state: state,
  start: startShift,
  end: endShift,
  serve: servePizza,
  version: "pizza-panic-1.1-rush-hour"
};
