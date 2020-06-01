const ScreenLevelSelect = (function() {
  const LEVELS = 9;
  return {
    draw: (unitSize, screenCenterX, screenCenterY, data) => {
      //draw stars of best outcomes
      const COLUMNS = 3;
      const ROWS = Math.floor(LEVELS / COLUMNS);
      const BTN_WIDTH = 15;
      const BTN_MARGIN = 5;
      const xStart =  screenCenterX - (((COLUMNS - 2) * (BTN_WIDTH + BTN_MARGIN)) * unitSize);
      const yStart =  ((26 + (BTN_WIDTH * .9)) * unitSize);
      const bestLevels = data["bestLevels"];
      const fontSize = 5 * unitSize;
      let i, level, gameObj, stars
        , x = xStart
        , y = yStart
        , col = 0, row = 0;
      for (i = 0; i < LEVELS; i++) {
        level = (i + 1);
        gameObj = bestLevels["level" + level];
        if (gameObj) {
          stars = gameObj["stars"] ? gameObj["stars"] : 0;
          Burger.drawStars(stars
            , xStart + ((col++ * (BTN_WIDTH + BTN_MARGIN)) * unitSize)
            , yStart + ((row * BTN_WIDTH * 1.7) * unitSize)
            , fontSize
          );
        }
        if (col >= 3) {
          col = 0;
          x = xStart;
          row++;
        }
      }
    }
  }
})();