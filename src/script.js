let canvas = null;
let ctx = null;
var burgerBuilder = (function() {
  const APP_DATA_KEY = "burger-builder";
  const SCREEN_UNITS = 110;
  const BGCOLOR = Colors.BLACK;
  const CONTENT_BOX_SIZE = 8;
  const MODE = { START: 1, GAME: 2, END: 3 };
  const LOOP_MS = 10;
  const DEFAULT_FONT = "Tahoma";//"Georgia";//"Arial";//Courier New//Comic Sans MS
  let buttons = {};
  let currentMode = MODE.START;
  let unitSize;
  let screenWidth;
  let screenHeight;
  let screenCenterX;
  let screenCenterY;
  let mouseClickX;
  let mouseClickY;
  let alertMsg = false;
  let data = {
    "currGame": {
      "roundCount": 5
      , "time": 0
      , "level": 1
      , "currRound": {
        "targetBurgerArr": []
        , "burgerArr": []
      }
      , "rounds": []
    }
    , "muteSound": false
    , "muteMusic": false
    , "history": []
  };
  window.onload = function() {
    loadData(function() {
      Sound.init(function() {
        init();
        setInterval(loop, LOOP_MS);
      });
    });
  };
  function init() {
    //setup canvas
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    //resize listener
    window.addEventListener('resize', function () { resizeCanvas(); });
    //mouse click listener
    window.addEventListener('click', function (e) { handleMouseDown(e) });
    // window.addEventListener('mousedown', function (e) { handleMouseDown(e) });
    // window.addEventListener('mouseup', function (e) { handleMouseEnd(e) });
    window.addEventListener('touchstart', function (e) { handleMouseDown(e) });
    // window.addEventListener('touchend', function (e) { handleMouseEnd(e) });

    //init things
    resizeCanvas();
    initButtons();
    gotoStart();
  }
  function playSound(soundName) {
    if (!data["muteSound"]) {
      Sound.play(soundName);
    }
  }
  function playMusic(musicName) {
    if (!data["muteMusic"]) {
      Sound.music(musicName);
    }
  }
  function toggleMuteSound() {
    data["muteSound"] = !data["muteSound"];
    buttons["toggleMuteSound"].text = "Sound " + (data["muteSound"] ? "Off" : "On");
    saveData();
  }
  function toggleMuteMusic() {
    data["muteMusic"] = !data["muteMusic"];
    if (data["muteMusic"]) {
      Sound.stopMusic();
    }
    else {
      Sound.playMusic();
    }
    buttons["toggleMuteMusic"].text = "Music " + (data["muteMusic"] ? "Off" : "On");
    saveData();
  }
  function initButtons() {
    buttons = {
      "start": new Button("Start", {
        x: "center", y: 30
        , w: 22, h: 12
        , position: "bottom"
        , font: DEFAULT_FONT
        , fontSize: 8
        , color: Colors.DARKBLUE
        , mode: MODE.START
        , onclick: startGame
      })
      , "toggleMuteSound": new Button("Sound " + (data["muteSound"] ? "Off" : "On"), {
        x: 30, y: 33
        , w: 20, h: 6
        , position: "bottom-center"
        , font: DEFAULT_FONT
        , fontSize: 4
        , color: Colors.GRAY
        , mode: MODE.START
        , onclick: toggleMuteSound
      })
      , "toggleMuteMusic": new Button("Music " + (data["muteMusic"] ? "Off" : "On"), {
        x: 30, y: 26
        , w: 20, h: 6
        , position: "bottom-center"
        , font: DEFAULT_FONT
        , fontSize: 4
        , color: Colors.GRAY
        , mode: MODE.START
        , onclick: toggleMuteMusic
      })
      , "playAgain": new Button("Play Again", {
        x: "center", y: 15
        , w: 40, h: 12
        , position: "bottom"
        , font: DEFAULT_FONT
        , fontSize: 8
        , color: Colors.DARKBLUE
        , mode: MODE.END
        , onclick: startGame
      })
      , "endBack": new Button("Back", {
        x: -36, y: 15
        , w: 22, h: 12
        , position: "bottom-center"
        , font: DEFAULT_FONT
        , fontSize: 8
        , color: Colors.GRAY
        , mode: MODE.END
        , onclick: gotoStart
      })
      , "clear": new Button("Clear", {
        x: -36, y: 30
        , w: 22, h: 12
        , position: "bottom-center"
        , font: DEFAULT_FONT
        , fontSize: 8
        , color: Colors.DARKBLUE
        , mode: MODE.GAME
        , onclick: function() { clearBurger(); playSound("clear"); }
      })
      , "back": new Button("Back", {
        x: -36, y: 10
        , w: 22, h: 12
        , position: "center"
        , font: DEFAULT_FONT
        , fontSize: 8
        , color: Colors.GRAY
        , mode: MODE.GAME
        , onclick: gotoStart
      })
      , "submit": new Button("Go", {
        x: 0, y: 30
        , w: 22, h: 12
        , position: "bottom-center"
        , font: DEFAULT_FONT
        , fontSize: 8
        , color: Colors.DARKBLUE
        , mode: MODE.GAME
        , onclick: submitBurger
      })
      //, "submit": new Button()
    };
    const partNameBtnArr = ["bottomBun", "burger", "cheese", "tomato", "onion", "lettuce", "topBun"];
    const SPACED_BY = 12;
    let x = -36, i, size = partNameBtnArr.length;
    for (i = 0; i < size; i++) {
      createPartBtn(partNameBtnArr[i], x, 12);
      x += SPACED_BY;
    }
  }
  function createPartBtn(partName, x, y) {
    const part = getPart(partName);
    let rounded = "both";
    if (partName.indexOf("top") > -1) {
      rounded = "top";
    }
    else if (partName.indexOf("bottom") > -1) {
      rounded = "bottom";
    }
    buttons[partName] = new Button("", {
      x: x, y: y
      , w: 10, h: 10
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 8
      , rounded: rounded
      , color: part.color
      , mode: MODE.GAME
      , onclick: function() { addToBurger(partName) }
    });
  }
  function getPart(partName) {
    const part = burgerData.parts[partName];
    if (!part) {
      console.log("Part '" + partName + "' was not found!");
    }
    return part;
  }
  function drawButtons() {
    let btn, x, y, fontSize;
    for (var btnName in buttons) {
      btn = buttons[btnName];
      if (btn.mode === currentMode) {
        x = btn.x === "center" ? screenCenterX : btn.x * unitSize;
        y = btn.y * unitSize;
        if (btn.position.indexOf("center") > -1) {
          x = screenCenterX + x;
        }
        if (btn.position.indexOf("bottom") > -1) {
          y = screenHeight - y;
        }
        fontSize = btn.fontSize * unitSize;
        Draw.roundedRectUnit({
          x: x, y: y
          , w: btn.w, h: btn.h
          , radius: 3
          , color: btn.color
          , unitSize: unitSize
          , rounded: btn.rounded
          , scale: 1
        });
        if (btn.text) {
          Draw.text(btn.text, { x: x, y: y + (fontSize * .3),
            w: btn.w, h: btn.h, fontSize: fontSize, fontStyle: btn.font
            , align: "center", color: Colors.DOWNYBLUE });
        }
      }
    }
  }
  function gotoStart() {
    buttons["start"].hidden = false;
    currentMode = MODE.START;
    playMusic("menuBgMusic");
  }
  function startGame() {
    data["currGame"] = {
      "roundCount": 3
      , "level": 1
      , "startTime": (new Date()).getTime()
      , "time": 0
      , "currRound": generateRound(Rand.range(2, 6))
      , "rounds": []
    };
    message("START", Colors.GREEN);
    currentMode = MODE.GAME;
    playMusic("gameBgMusic");
  }
  function startRound() {
    const currGame = data["currGame"];
    const roundsSoFar = currGame["rounds"].length;
    //console.log("roundsSoFar=" + roundsSoFar);
    if (roundsSoFar < currGame["roundCount"]) {
      currGame["currRound"] = generateRound(Rand.range(2, 6));
    }
    else {
      console.log("GAME IS DONE");
      endGame();
    }
  }
  function endGame() {
    currentMode = MODE.END;
    playMusic("menuBgMusic");
    const currGame = data["currGame"];
    currGame["time"] = (new Date()).getTime() - currGame["startTime"];
    data["history"].push(currGame);
    saveData();
  }
  function generateRound(burgerSize) {
    return {
      "targetBurgerArr": generateBurger(burgerSize)
      , "burgerArr": []
    }
  }
  function generateBurger(burgerSize) {
    const burgerArr = ["bottomBun"];
    let i;
    for (i = 0; i < burgerSize; i++) {
      burgerArr.push(Rand.arr(burgerData.ingredientArr()));
    }
    burgerArr.push("topBun");
    return burgerArr;
  }
  function handleMouseDown(e) {
    mouseClickX = e.pageX;
    mouseClickY = e.pageY;
  }
  // function handleMouseEnd() {
  //   mouseClickX = false;
  //   mouseClickY = false;
  // }
  function loop() {
    mouse();
    render();
  }
  function mouse() {
    if (!mouseClickX) {
      return;
    }
    const mx = mouseClickX;
    const my = mouseClickY;
    let btn, lx, ty, rx, by, x, y;
    for (var btnName in buttons) {
      btn = buttons[btnName];
      if (btn.mode === currentMode) {
        x = btn.x === "center" ? screenCenterX : btn.x * unitSize;
        y = btn.y * unitSize;
        if (btn.position.indexOf("center") > -1) {
          x = screenCenterX + x;
        }
        if (btn.position.indexOf("bottom") > -1) {
          y = screenHeight - y;
        }
        lx = x - (btn.w / 2 * unitSize);
        ty = y - (btn.h / 2 * unitSize);
        rx = x + (btn.w / 2 * unitSize);
        by = y + (btn.h / 2 * unitSize);
        //console.log("mx=" + mx + ", my=" + my + ", lx=" + lx + ", ty=" + ty + ", rx=" + rx + ", by=" + by);
        if (mx > lx && mx < rx && my > ty && my < by) {
          //console.log("clicked btnName=" + btnName);
          btn.onclick();
          break;
        }
      }
    }
    mouseClickX = false;
    mouseClickY = false;
  }
  function render() {
    Draw.clear(BGCOLOR);
    switch (currentMode) {
      case MODE.START: drawStartMode(); break;
      case MODE.GAME: drawGameMode(); break;
      case MODE.END: drawEndMode(); break;
    }
    drawMessage();
    drawButtons();
  }
  function drawMessage() {
    if (alertMsg) {
      const duration = 1000;
      const fade = 1000;
      const now = (new Date()).getTime();
      const diff = now - alertMsg.time;
      if (diff < duration + fade) {
        const fadeStart = diff - duration;
        let opacity = 0;
        if (fadeStart > 0) {
          opacity = 1 -((diff - duration) / 1000);
        }
        opacity = opacity < 0 ? 1 : opacity / 1;
        Draw.text(alertMsg.text, { x: screenCenterX, y: screenCenterY
          , fontSize: unitSize * 10, align: "center", color: alertMsg.color, opacity: opacity });
      }
      else {
        alertMsg = false;
      }
    }
  }
  function drawStartMode() {
    let fontSize = unitSize * 10;
    const color = Colors.PABLOBROWN;
    const x = screenCenterX;
    let y = screenCenterY - unitSize * 20;

    //console.log(burgerArr);
    drawBurger(burgerData.partsArr(), x, y, .7);

    //Draw.text("🍔", { x: x, y: y, fontSize: unitSize * 20, align: "center", color: color });
    y += unitSize * 20;
    Draw.text("Burger Builder", { x: x, y: y, fontSize: fontSize, align: "center", color: color });

    y = screenHeight - unitSize * 6;
    fontSize = unitSize * 2;
    Draw.text("Background music from PlayOnLoop.com", {
      x: x, y: y, fontSize: fontSize, position: "bottom-center", color: color });
    y += unitSize * 3
    Draw.text("Licensed under Creative Commons by Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/)", {
      x: x, y: y, fontSize: fontSize, position: "bottom-center", color: color });

    // Background music from PlayOnLoop.com
    // Licensed under Creative Commons by Attribution 4.0
    // 
  }
  function drawGameMode() {
    drawTargetBurger();
    drawCookingArea();
  }
  function drawTargetBurger() {
    const scale = .55;
    const burgerArr = data["currGame"]["currRound"]["targetBurgerArr"];
    drawBurger(burgerArr, screenCenterX, unitSize * 40 * scale, scale);
    drawBurgerContents(burgerArr, screenCenterX + unitSize * 40 * scale, unitSize * 36 * scale, scale);
  }
  function drawCookingArea() {
    const burgerArr = data["currGame"]["currRound"]["burgerArr"];
    drawBurger(burgerArr, screenCenterX, screenCenterY, 1);
    drawBurgerContents(burgerArr, screenCenterX + unitSize * 40, screenCenterY, 1);
  }
  function drawEndMode() {
    let fontSize = unitSize * 10;
    const color = Colors.PABLOBROWN;
    let x = screenCenterX;
    let y = unitSize * 15;
    const currGame = data["currGame"];
    const timeStr = (Math.round(currGame["time"] / 1000 * 100) / 100) + "s";
    Draw.text("Complete", { x: x, y: y, fontSize: fontSize, align: "center", color: color });
    y = y + fontSize * .8;
    Draw.text(
      "Time: " + timeStr
      + ", Level: " + currGame["level"]
      + ", Rounds: " + currGame["rounds"].length
      , { x: x, y: y, fontSize: fontSize * .5, align: "center", color: color });
    let i, burgerArr, col = 0;
    const scale = .3;
    const COL_COUNT = 3;
    const COL_WIDTH = unitSize * 30;
    const COL_HEIGHT = unitSize * 20;
    const size = currGame["rounds"].length;
    y = y + (COL_WIDTH / 2);
    x = screenCenterX - COL_WIDTH;
    for (i = 0; i < size; i++) {
      burgerArr = currGame["rounds"][i]["burgerArr"];
      //console.log(burgerArr);
      drawBurger(burgerArr, x, y, scale);
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
  function drawBurgerContents(burgerArr, x, y, scale) {
    let i, part, partName;
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
      }
    }
  }
  function drawBurger(burgerArr, x, y, scale) {
    y = y - getBurgerHeight(burgerArr, scale) / 2;
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
      drawPart(x, y, part, scale);
    }
  }
  function addToBurger(partName) {
    playSound("addPart");
    data["currGame"]["currRound"]["burgerArr"].push(partName);
  }
  function clearBurger() {
    data["currGame"]["currRound"]["burgerArr"] = [];
  }
  function submitBurger() {
    console.log("Submit");
    //check if it matches target burger
    const burger = data["currGame"]["currRound"]["burgerArr"];
    const target = data["currGame"]["currRound"]["targetBurgerArr"];
    const burgerSize = burger.length;
    const targetSize = target.length;
    let match = true;
    if (burgerSize !== targetSize) {
      match = false;
    }
    if (match) {
      let i;
      for (i = 0; i < burgerSize; i++) {
        if (burger[i] !== target[i]) {
          match = false;
          break;
        }
      }
    }
    //alert message
    if (match) {
      data["currGame"]["rounds"].push(data["currGame"]["currRound"]);
      message(Rand.arr(burgerData.compliments) + "!", Colors.GREEN);
      playSound("match");
      startRound();
    }
    else {
      message("NO MATCH", Colors.RED);
      playSound("noMatch");
      clearBurger();
    }
  }
  function message(text, color) {
    alertMsg = {
      text: text
      , color: color
      , time: (new Date()).getTime()
    };
  }
  function getBurgerHeight(burgerArr, scale) {
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
  function drawPart(x, y, part, scale) {
    Draw.roundedRectUnit({
      x: x, y: y, w: part.w, h: part.h
      , radius: part.radius, color: part.color
      , unitSize: unitSize
      , rounded: part.rounded
      , scale: scale
    });
  }
  function loadData(callback) {
    const localData = window.localStorage.getItem(APP_DATA_KEY);
    if (localData) {
      const parsedData = JSON.parse(localData);
      if (parsedData) {
        data = parsedData;
      }
      else {
        console.error("ERROR: loading local storage data.");
      }
      callback();
    }
    else {
      callback();
    }
  }
  function resizeCanvas() {
    //x axis
    screenWidth = window.innerWidth;
    canvas.width = screenWidth;
    screenCenterX = screenWidth / 2;
    //y axis
    screenHeight = window.innerHeight;
    canvas.height = screenHeight;
    screenCenterY = screenHeight / 2;
    if (screenWidth < screenHeight) {
      unitSize = screenWidth / SCREEN_UNITS;
    }
    else {
      unitSize = screenHeight / SCREEN_UNITS;
    }
    // if (unitSize > 6.25) {
    //   unitSize = 6.25;
    // }
  }
  function saveData() {
    window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
  }
  function clearData() {
    window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
  }
  return {
    ctx: ctx
  }
})();