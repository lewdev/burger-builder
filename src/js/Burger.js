const Burger = (function() {
  const CONTENT_BOX_SIZE = 8;
  const STAR_FILLED =  "\u2605";//"\uD83D\uDFCA";
  const STAR_OUTLINE = "\u2606";//"\u2729";
  function draw(burgerArr, x, y, scale, unitSize) {
    y = y - getBurgerHeight(burgerArr, scale, unitSize) / 2;
    let i, part, partName, prevPart;
    const size = burgerArr.length;
    for (i = size - 1; i >= 0; i--) {
      prevPart = part;
      partName = burgerArr[i];
      part = getPart(partName);
      if (i < size - 1) { 
        if (prevPart) {
          y += ((part.h * scale / 2) + (prevPart.h * scale / 2)) * unitSize;
        }
        else {
          y += (part.h * scale / 2) * unitSize;
        }
      }
      drawPart(x, y, part, scale, unitSize);
    }
  }
  function getBurgerHeight(burgerArr, scale, unitSize) {
    if (!scale) scale = 1;
    let i, part, partName, height = 0;
    const size = burgerArr.length;
    for (i = 0; i < size; i++) {
      partName = burgerArr[i];
      part = getPart(partName);
      height += part.h * scale * unitSize
    }
    return height;
  }
  function drawContents(burgerArr, x, y, scale, unitSize) {
    let i, part, partName, fontSize;
    const size = burgerArr.length;
    y = y - (unitSize * CONTENT_BOX_SIZE * size * scale / 2)
    for (i = size - 1; i >= 0; i--) {
      partName = burgerArr[i];
      if (partName.indexOf("Bun") === -1) {
        part = getPart(partName);
        if (!part) break;
        if (i > 0) {
          y += scale * CONTENT_BOX_SIZE * unitSize;
        }
        Draw.roundedRectUnit({
          x: x, y: y, w: CONTENT_BOX_SIZE, h: CONTENT_BOX_SIZE
          , radius: 1, color: part.color
          , unitSize: unitSize
          , rounded: "both"
          , scale: scale
        });
        fontSize = CONTENT_BOX_SIZE * scale * unitSize;
        Draw.text(getPartLetter(partName), { x: x, y: y + fontSize * .4,
          w: fontSize, h: fontSize, fontSize: fontSize
          , align: "center", color: Colors.BLACK });
      }
    }
  }
  function getPartLetter(partName) {
    if (!partName.includes("Bun")) {
      return partName.charAt(0).toUpperCase();
    }
    return "";
  }
  function getPart(partName) {
    const part = burgerData.parts[partName];
    if (!part) {
      console.log("Part '" + partName + "' was not found!");
    }
    return part;
  }
  function drawPart(x, y, part, scale, unitSize) {
    Draw.roundedRectUnit({
      x: x, y: y, w: part.w, h: part.h
      , radius: part.radius, color: part.color
      , unitSize: unitSize
      , rounded: part.rounded
      , scale: scale
    });
  }
  function generate(burgerSize) {
    const burgerArr = ["bottomBun"];
    let i;
    for (i = 0; i < burgerSize; i++) {
      burgerArr.push(Rand.arr(burgerData.ingredientArr()));
    }
    burgerArr.push("topBun");
    return burgerArr;
  }
  function drawStars(starCount, x, y, fontSize) {
    Draw.text(getStarsStr(starCount), {
      x: x, y: y, fontSize: fontSize, align: "center", color: Colors.YELLOW
    });
  }
  function getStarsStr(starCount) {
    switch (starCount) {
      case 1: return `${STAR_FILLED} ${STAR_OUTLINE} ${STAR_OUTLINE}`;
      case 2: return `${STAR_FILLED} ${STAR_FILLED} ${STAR_OUTLINE}`;
      case 3: return `${STAR_FILLED} ${STAR_FILLED} ${STAR_FILLED}`;
    }
    return `${STAR_OUTLINE} ${STAR_OUTLINE} ${STAR_OUTLINE}`;
  }
  return {
    draw: draw,
    drawContents: drawContents,
    getPart: getPart,
    getPartLetter: getPartLetter,
    generate: generate,
    drawStars: drawStars,
    getStarsStr: getStarsStr,
  }
})();