const Rand = {
  rand: function(max) {
    return Math.floor(Math.random() * max);
  }
  /* Will not ever return "max" */
  , range: function(min, max) {
    return Math.floor(Math.random() * Math.abs(max - min)) + min;
  }
  , arr: function(arr) {
    return arr[Rand.rand(arr.length)];
  }
};