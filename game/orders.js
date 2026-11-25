// Pizza Panic — order book: recipes, names, order spawning and patience.
// Every order is a recipe: one sauce plus two or three toppings.
var TOPPINGS = {
  pepperoni: { icon: "🥩", label: "Pepperoni" },
  mushroom:  { icon: "🍄", label: "Mushroom" },
  pepper:    { icon: "🫑", label: "Bell Pepper" },
  onion:     { icon: "🧅", label: "Onion" },
  olive:     { icon: "🫒", label: "Olive" },
  cheese:    { icon: "🧀", label: "Extra Cheese" }
};
var SAUCES = {
  tomato: { icon: "🍅", label: "Tomato" },
  bbq:    { icon: "🥫", label: "BBQ" }
};
var RECIPES = [
  { name: "Classic Pep",      sauce: "tomato", toppings: ["pepperoni", "cheese"] },
  { name: "Garden Party",     sauce: "tomato", toppings: ["mushroom", "pepper", "onion"] },
  { name: "Smoky Joe",        sauce: "bbq",    toppings: ["pepperoni", "onion"] },
  { name: "Mediterranean",    sauce: "tomato", toppings: ["olive", "pepper", "cheese"] },
  { name: "Fungi Feast",      sauce: "bbq",    toppings: ["mushroom", "cheese", "olive"] },
  { name: "Pepper Storm",     sauce: "tomato", toppings: ["pepper", "pepperoni", "onion"] },
  { name: "Cheesy Deluxe",    sauce: "tomato", toppings: ["cheese", "mushroom"] },
  { name: "BBQ Garden",       sauce: "bbq",    toppings: ["pepper", "mushroom", "onion"] }
];
var nextOrderId = 1;

function randomRecipe() {
  return RECIPES[Math.floor(Math.random() * RECIPES.length)];
}

function makeOrder(difficulty) {
  var r = randomRecipe();
  var patience = Math.max(28, 50 - difficulty * 2);
  return {
    id: nextOrderId++,
    name: r.name,
    sauce: r.sauce,
    toppings: r.toppings.slice(),
    patience: patience,
    maxPatience: patience
  };
}

function recipeIcons(order) {
  var icons = SAUCES[order.sauce].icon;
  for (var i = 0; i < order.toppings.length; i++) icons += TOPPINGS[order.toppings[i]].icon;
  return icons;
}

function recipeText(order) {
  var parts = [SAUCES[order.sauce].label + " sauce"];
  for (var i = 0; i < order.toppings.length; i++) parts.push(TOPPINGS[order.toppings[i]].label);
  return parts.join(" + ");
}

// True when a finished pizza matches this order exactly.
function pizzaMatchesOrder(pizza, order) {
  if (!pizza.dough || !pizza.sauce || !pizza.baked || !pizza.sliced) return false;
  if (pizza.sauce !== order.sauce) return false;
  if (pizza.toppings.length !== order.toppings.length) return false;
  var want = order.toppings.slice().sort().join(",");
  var got = pizza.toppings.slice().sort().join(",");
  return want === got;
}
