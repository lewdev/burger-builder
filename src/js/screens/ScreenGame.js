const ScreenGame = (function() {
  const TIMES_X = "\u2716";
  function draw(unitSize, screenCenterX, screenCenterY, data) {
    drawTargetBurger(unitSize, screenCenterX, screenCenterY, data);
    drawCookingArea(unitSize, screenCenterX, screenCenterY, data);
    drawLevel(unitSize, screenCenterX, screenCenterY, data);
    drawHowManyBurgersLeft(unitSize, screenCenterX, screenCenterY, data);
    drawTimeLeft(unitSize, screenCenterX, screenCenterY, data);
  }
  function drawTargetBurger(unitSize, screenCenterX, screenCenterY, data) {
    const scale = .55;
    const burgerArr = data["currGame"]["currRound"]["targetBurgerArr"];
    Burger.draw(burgerArr, screenCenterX, unitSize * 40 * scale, scale, unitSize);
    Burger.drawContents(burgerArr, screenCenterX + unitSize * 40 * scale, unitSize * 36 * scale, scale, unitSize);
  }
  function drawCookingArea(unitSize, screenCenterX, screenCenterY, data) {
    const burgerArr = data["currGame"]["currRound"]["burgerArr"];
    Burger.draw(burgerArr, screenCenterX, screenCenterY, 1, unitSize);
    Burger.drawContents(burgerArr, screenCenterX + unitSize * 40, screenCenterY, 1, unitSize);
  }
  function drawLevel(unitSize, screenCenterX, screenCenterY, data) {
    const level = data["currGame"]["level"]; 
    const xOffset = 42 * unitSize;
    const fontSize = 6 * unitSize;
    const yOffset = 9 * unitSize;
    Draw.roundedRectUnit({
      x: screenCenterX + xOffset
      , y: yOffset - (2 * unitSize)
      , w: 22, h: 8
      , radius: 3
      , color: Colors.ORANGE
      , unitSize: unitSize
      , rounded: "both"
      , scale: 1
    });
  Draw.text("Level " + level
      , { x: screenCenterX + xOffset, y: yOffset, fontSize: fontSize, align: "center", color: Colors.WHITE });
  }
  function drawHowManyBurgersLeft(unitSize, screenCenterX, screenCenterY, data) {
    const roundCount = data["currGame"]["roundCount"]; 
    const currRound = data["currGame"]["rounds"].length + 1;
    const xOffset = 42 * unitSize;
    const fontSize = 8 * unitSize;
    const yOffset = 20 * unitSize;
    Draw.text(currRound + " of " + roundCount
      , { x: screenCenterX + xOffset, y: yOffset, fontSize: fontSize, align: "center", color: Colors.REGENTGRAY });
    let fails = "";
    switch (data["currGame"]["failCount"]) {
      case 1: fails = `${TIMES_X}`; break;
      case 2: fails = `${TIMES_X} ${TIMES_X}`; break;
      case 3: fails = `${TIMES_X} ${TIMES_X} ${TIMES_X}`; break;
    }
    if (fails) {
      Draw.text(fails, { x: screenCenterX + xOffset, y: yOffset + (fontSize * 1.2), fontSize: fontSize, align: "center", color: Colors.RED });
    }
  }
  function drawTimeLeft(unitSize, screenCenterX, screenCenterY, data) {
    const maxRoundTimeMs = data["currGame"]["maxRoundTimeMs"];
    const maxLen = 30;
    //const xOffset = -(38 * unitSize);
    const fontSize = 4 * unitSize;
    const xOffset = 0;
    const yOffset = 6 * unitSize;
    //const yOffset = 24 * unitSize;
    const timeLeft = maxRoundTimeMs - data["currGame"]["currRound"]["time"];
    Draw.roundedRectUnit({
      x: screenCenterX + xOffset + (1 * unitSize)
      , y: yOffset - (1 * unitSize)
      , w: maxLen + 2, h: 7
      , radius: 3
      , color: Colors.PURPLE
      , unitSize: unitSize
      , rounded: "both"
      , scale: 1
    });
    //inner bar
    Draw.roundedRectUnit({
      x: screenCenterX + xOffset + (1 * unitSize)
      , y: yOffset - (1 * unitSize)
      , w: (timeLeft / maxRoundTimeMs) * maxLen, h: 6
      , radius: 2
      , color: Colors.GRAY
      , unitSize: unitSize
      , rounded: "both"
      , scale: 1
    });
    Draw.text(Math.floor(timeLeft / 1000) + "s"
      , { x: screenCenterX + xOffset, y: yOffset + (.3 * unitSize), fontSize: fontSize, color: Colors.REGENTGRAY });
  }
  return {
    draw,
    drawTimeLeft,
  }
})();