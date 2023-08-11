// Upgrades
class Upgrade {
  // Type : decides on which attribute to apply the value
  type = null;
  id = null;
  // Value to apply
  value = null;
  // Price to pay
  price = null;
  // HTML element
  element = null;
  button_ui = null;
  title_ui = null;
  // Master store
  store = null;

  constructor(element, store){
    this.store = store;
    this.element = element;
    this.type = this.element.getAttribute('data-type');
    this.id = this.element.getAttribute('data-id');
    this.value = parseInt(this.element.getAttribute('data-value'));
    this.price = parseInt(this.element.getAttribute('data-price'));

    this.title_ui = document.querySelector(".upgrade[data-id='" + this.id + "'] .name");
    this.button_ui = document.querySelector(".upgrade[data-id='" + this.id + "'] button");

    this.title_ui.innerHTML = this.type + " +" + this.value + " (" + this.price + " points)";
    var obj = this;
    // Setup the buy event for the button
    this.button_ui.addEventListener("click", ()=>{
      if(obj.buy()) {
        obj.button_ui.removeEventListener('click', this);
        obj.remove();
      }
    });
  }
  // Try to buy the upgrade
  buy(){
    return this.store.buy_upgrade(this);
  }
  // Remove the upgrade from the html list
  remove(){
    this.element.remove();
  }
}

// Store to buy from
class Store {
  game = null
  // List of upgrades, generated from the html
  upgrades = [];

  // UI elements
  store_ui = document.getElementById('store');
  constructor(game){
    this.game = game;
    var obj = this;
    // Generate the upgades list from the HTML
    document.querySelectorAll("#store .upgrade").forEach((upgrade_element) =>{
      obj.upgrades.push(new Upgrade(upgrade_element, obj))
    });
  }

  // Try to buy an upgrade from the game
  buy_upgrade(upgrade){
    if(!this.game.buy_upgrade(upgrade)){
      return false;
    }
    // Remove it from the available upgrades
    this.upgrades.splice(this.upgrades.indexOf(upgrade), 1);
    return true;
  }
}


// The main game object
class Game {
  timer = null;
  store = null;

  // Stats
  total_points = 0;
  points_per_second = 0;

  // Attributes
  extra_points_per_second = 0;
  multiplier = 1;
  points_per_click = 1;

  // UI elements
  total_points_ui = document.getElementById('total_points');
  multiplier_ui = document.getElementById('multiplier');
  extra_points_per_second_ui = document.getElementById('extra_points_per_second');
  clicker_ui = document.getElementById('clicker');
  points_per_second_ui = document.getElementById('points_per_second');
  points_per_click_ui = document.getElementById('points_per_click');

  start(){
    // The main clicker
    this.clicker_ui.addEventListener('click', () => {
      obj.add_point(obj.points_per_click);
    });

    // The store to buy upgrades from
    this.store = new Store(this);
    var obj = this;
    // The main game timer
    this.timer = setInterval(function(){
      obj.update();
    }, 1000);
  }

  // Update the passive income and update ui
  update(){
    if(this.extra_points_per_second > 0){
      this.add_point(this.extra_points_per_second);
    }
    this.update_ui();
  }

  // Add points to the total
  add_point(quantity = 1){
    this.points_per_second = quantity * this.multiplier;
    this.total_points += this.points_per_second;
    this.update_ui();
  }

  // Update the game ui
  update_ui = function(){
    this.total_points_ui.innerHTML = this.total_points;
    this.multiplier_ui.innerHTML = this.multiplier;
    this.extra_points_per_second_ui.innerHTML = this.extra_points_per_second;
    this.points_per_second_ui.innerHTML = this.points_per_second;
    this.points_per_click_ui.innerHTML = this.points_per_click;
  }

  // Try to buy an upgrade
  buy_upgrade(upgrade){
    if(this.total_points < upgrade.price){
      return false;
    }
    this.total_points -= upgrade.price;

    switch (upgrade.type) {
      case 'points':
        this.total_points += upgrade.value;
        break;
      case 'extra_points':
        this.extra_points_per_second += upgrade.value;
        break;
      case 'multiplier':
        this.multiplier += upgrade.value;
        break;
      case 'click':
        this.points_per_click += upgrade.value;
        break;
    }
    this.update_ui();
    return true;
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const game = new Game();
  game.start();
});