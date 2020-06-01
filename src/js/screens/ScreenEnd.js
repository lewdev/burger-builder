const ScreenEnd =  (function () {
  let data = null;
  const SCALE = .3;
  const COL_COUNT = 3;
  function setData(dataArg) {
    data = dataArg;
  }
  function draw(unitSize, screenCenterX, screenCenterY, data) {
    let fontSize = unitSize * 8;
    const color = Colors.PABLOBROWN;
    let x = screenCenterX;
    let y = unitSize * 10;
    const currGame = data["currGame"];
    const moneyEarned = currGame["rounds"].sum("award");
    const timeStr = (Math.round(currGame["time"] / 1000 * 100) / 100) + "s";
    const status = currGame["status"] === 1 ? "Completed" : "Failed";
    Draw.text(status + " Level " + currGame["level"], { x, y, fontSize, align: "center", color: color });
    y = y + fontSize * .8;
    Draw.text(
      "Time: " + timeStr
      + ", Earned: $" + moneyEarned
      , { x: x, y: y, fontSize: fontSize * .5, align: "center", color: color }
    );
    Burger.drawStars(currGame["stars"], x, y + (fontSize * 1), fontSize);
    // Draw.text(
    //   "Bank: " + Num.formatCurrency(data["bank"] || 0)
    //   , { x: x
    //     , y: (screenCenterY * 2) - (unitSize * 25)
    //     , fontSize: fontSize * .7
    //     , align: "center"
    //     , color: color }
    // );
    drawBurgerResults(unitSize, screenCenterX, screenCenterY, data, y);
  }
  function drawBurgerResults(unitSize, screenCenterX, screenCenterY, data, y) {
    const currGame = data["currGame"];
    const fontSize = unitSize * 5;
    const COL_WIDTH = unitSize * 30;
    const COL_HEIGHT = unitSize * 20;
    const size = currGame["rounds"].length;
    y = y + (COL_WIDTH * .6);
    let x = screenCenterX - COL_WIDTH;
    let i, burgerArr, col = 0;
    let round;
    for (i = 0; i < size; i++) {
      round = currGame["rounds"][i];
      burgerArr = round["burgerArr"];
      if (round["success"]) {
        Burger.draw(burgerArr, x, y, SCALE, unitSize);
      }
      else {
        Draw.text("🞮", { x, y: y + (unitSize * 3), fontSize: unitSize * 10, color: Colors.RED });
      }
      //rectangle for amount earned.
      Draw.roundedRectUnit({
        x: x + (COL_WIDTH / 4)
        , y: y - (COL_HEIGHT / 3)
        , w: 8, h: 5
        , radius: 3
        , color: Colors.LIGHTGREEN
        , unitSize: unitSize
        , rounded: "both"
        , scale: 1
      });
      Draw.text("$" + round["award"], { x: x + (COL_WIDTH / 4), y: y - (COL_HEIGHT / 4), fontSize: fontSize * .8, color: Colors.GREEN });
      Burger.drawStars(round["stars"], x, y + (COL_HEIGHT / 2), fontSize);
      if (++col === COL_COUNT) {
        col = 0;
        x = screenCenterX - COL_WIDTH;
        y += COL_HEIGHT;
      }
      else {
        x += COL_WIDTH;
      }
    }
  }
  function drawAmountEarned(x, y) {
  }
  return {
    draw: draw,
    setData: setData,
  }
})();