const ScreenStart = (function() {
  function draw(unitSize, screenCenterX, screenCenterY, data) {
    let fontSize = unitSize * 10;
    const color = Colors.PABLOBROWN;
    const x = screenCenterX;
    let y = screenCenterY - unitSize * 20;

    //console.log(burgerArr);
    Burger.draw(burgerData.partsArr(), x, y, .7, unitSize);

    //Draw.text("🍔", { x: x, y: y, fontSize: unitSize * 20, align: "center", color: color });
    y += unitSize * 20;
    Draw.text("Burger Builder", { x: x, y: y, fontSize: fontSize, align: "center", color: color });

    // //y = screenHeight - unitSize * 6;
    // y = (screenCenterY * 2) - unitSize * 6;
    // fontSize = unitSize * 2;
    // Draw.text("Background music from PlayOnLoop.com", {
    //   x: x, y: y, fontSize: fontSize, position: "bottom-center", color: color });
    // y += unitSize * 3
    // Draw.text("Licensed under Creative Commons by Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/)", {
    //   x: x, y: y, fontSize: fontSize, position: "bottom-center", color: color });
    // Draw.roundedRect({
    //   x, y: (screenCenterY * 2) - (10 * unitSize)
    // });
    Draw.text(
      "Bank: " + Num.formatCurrency(data["bank"] || 0)
      , {
        x: x
        , y: (screenCenterY * 2) - (unitSize * 10)
        , fontSize: fontSize * .7
        , align: "center"
        , color: color }
    );
  }
  return {
    draw: draw
  }
})();