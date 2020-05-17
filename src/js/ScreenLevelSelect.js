const ScreenLevelSelect = (function() {
  const LEVELS = 9;
  const buttons = {};
  function initButtons() {
    let i, btn, level;
    for (i = 0; i < LEVELS; i++) {
      level = (i + 1);
      buttons["level" + level] = new Button("" + level, {
        x: -10, y: 30
        , w: 12, h: 12
        , position: "center"
        , font: "Arial"
        , fontSize: 8
        , color: Colors.DARKBLUE
        , mode: MODE.START
        , onclick: startGame
      })
    }
  }
})();