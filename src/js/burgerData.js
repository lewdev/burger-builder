const burgerData = {
  partNamesArr: null
  , ingredients: null
  , parts: {
    "bottomBun": {
      w: 50, h: 8, rounded: "bottom", color: Colors.PEACH, radius: 5
    }
    , "burger": {
      w: 48, h: 8, rounded: "both", color: Colors.BROWN, radius: 7
    }
    , "lettuce": {
      w: 48, h: 3, rounded: "both", color: Colors.LIGHTGREEN, radius: 2 
    }
    , "tomato": {
      w: 45, h: 3, color: Colors.RED, radius: 2
    }
    , "cheese": {
      w: 45, h: 2, rounded: "both", color: Colors.YELLOW, radius: 2
    }
    , "onion": {
      w: 45, h: 2, rounded: "both", color: Colors.REGENTGRAY, radius: 2
    }
    , "topBun": {
      w: 50, h: 10, rounded: "top", color: Colors.PEACH, radius: 10
    }
  }
  , partsArr: function() {
    if (!burgerData.partNamesArr) {
      burgerData.partNamesArr = [];
      for (let parName in burgerData.parts) {
        burgerData.partNamesArr.push(parName);
      }
    }
    return burgerData.partNamesArr;
  }
  , ingredientArr: function() {
    if (!burgerData.ingredients) {
      burgerData.ingredients = [];
      for (let partName in burgerData.parts) {
        if (partName.indexOf("Bun") === -1) {
          burgerData.ingredients.push(partName);
        }
      }
    }
    return burgerData.ingredients;
  }
  , compliments: [
    "Excellent", "Fantastic", "Good Job", "Awesome", "Sick Move"
  ]
};