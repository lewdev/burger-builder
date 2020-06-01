let canvas = null;
let ctx = null;
Array.prototype.sum = function(prop) {
  let total = 0, i, size = this.length;
  for (i = 0; i < size; i++) {
    total += this[i][prop];
  }
  return total;
};
var burgerBuilder = (function() {
  const APP_DATA_KEY = "burger-builder";
  const SCREEN_UNITS = 110;
  const BGCOLOR = Colors.BLACK;
  const MODE = { START: 1, LEVEL_SELECT: 2, GAME: 3, END: 4 };
  const GAME_STATUS = { COMPLETE: 1, FAILED: 4 };
  const LOOP_MS = 10;
  const LEVELS = 9;
  const DEFAULT_FONT = "Tahoma";//"Georgia";//"Arial";//Courier New//Comic Sans MS
  let now = (new Date()).getTime();
  let buttons = {};
  let currentMode = MODE.START;
  let currGameParams = {};
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
    , "bank": 0
    , "items": []//need a store
    , "achievements": []
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
  function initButtons() {
    initStartScreenBtns();
    initLevelSelectScreenBtns();
    initGameScreenBtns();
    initEndScreenBtns();
  }
  function initStartScreenBtns() {
    const mode = MODE.START;
    buttons["start"] = new Button("Start", {
      x: "center", y: 30
      , w: 22, h: 12
      , position: "bottom"
      , font: DEFAULT_FONT
      , fontSize: 8
      , color: Colors.DARKBLUE
      , mode: mode
      , onclick: gotoLevelSelect
    });
    buttons["About"] = new Button("About", {
      x: -30, y: 30
      , w: 20, h: 9
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 5
      , color: Colors.GRAY
      , mode: mode
      , onclick: () => window.open("https://github.com/lewdev/burger-builder")
    });
    buttons["toggleMuteSound"] = new Button("Sound " + (data["muteSound"] ? "Off" : "On"), {
      x: 30, y: 33
      , w: 20, h: 6
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 4
      , color: Colors.GRAY
      , mode: mode
      , onclick: toggleMuteSound
    });
    buttons["toggleMuteMusic"] = new Button("Music " + (data["muteMusic"] ? "Off" : "On"), {
      x: 30, y: 26
      , w: 20, h: 6
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 4
      , color: Colors.GRAY
      , mode: mode
      , onclick: toggleMuteMusic
    });
  }
  function initLevelSelectScreenBtns() {
    setBestLevels();
    const mode = MODE.LEVEL_SELECT;
    buttons["backLvlSel"] = new Button("Back", {
      x: -36, y: 10
      , w: 22, h: 12
      , position: "center"
      , font: DEFAULT_FONT
      , fontSize: 8
      , color: Colors.GRAY
      , mode: mode
      , onclick: gotoStart
    });
    const COLUMNS = 3;
    const BTN_WIDTH = 15;
    const BTN_MARGIN = 5;
    const xStart = -((COLUMNS - 2) * (BTN_WIDTH + BTN_MARGIN));
    let i, level
      , x = xStart
      , col = 0, row = 0;
    for (i = 0; i < LEVELS; i++) {
      level = (i + 1);
      buttons["level" + level] = new Button(level, {
        x: x + (col++ * (BTN_WIDTH + BTN_MARGIN))
        , y: 26 + (row * 26)
        , w: BTN_WIDTH, h: BTN_WIDTH
        , position: "top-center"
        , font: DEFAULT_FONT
        , fontSize: BTN_WIDTH * .5
        , color: isLevelUnlocked(level) ? Colors.BLUE : Colors.GRAY
        , mode: mode
        , value: level
        , onclick: function() { startGame(this.value); }
      });
      if (col >= 3) {
        col = 0;
        x = xStart;
        row++;
      }
    }
  }
  function initEndScreenBtns() {
    const mode = MODE.END;
    buttons["endBack"] = new Button("Back", {
      x: -36, y: 15
      , w: 22, h: 12
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 8
      , color: Colors.GRAY
      , mode: mode
      , onclick: gotoLevelSelect
    });
    buttons["playAgain"] = new Button("↻", {
      x: "center", y: 15
      , w: 20, h: 14
      , position: "bottom"
      , font: DEFAULT_FONT
      , fontSize: 8
      , color: Colors.DARKBLUE
      , mode: mode
      , onclick: startGame
    });
    const isNextLeveUnlocked = isLevelUnlocked(data["currGame"]["level"] + 1);
    buttons["nextLevel"] = new Button("Next 🡆", {
      x: 36, y: 15
      , w: 30, h: 12
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 8
      , color: isNextLeveUnlocked ? Colors.BLUE : Colors.GRAY
      , mode: mode
      , hidden: data["currGame"]["level"] === LEVELS
      , onclick: () => {
        const currLevel = data["currGame"]["level"];
        if (currLevel === LEVELS) {
          //should not be able to play higher than this!
          message("This is the last level!", Colors.RED);
          return;
        }
        startGame(currLevel + 1);
      }
    });
  }
  function initGameScreenBtns() {
    const mode = MODE.GAME;
    buttons["clear"] = new Button("Clear", {
      x: -36, y: 30
      , w: 22, h: 12
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 8
      , color: Colors.DARKBLUE
      , mode: mode
      , onclick: clearBurger
    });
    buttons["back"] = new Button("Back", {
      x: -36, y: 10
      , w: 22, h: 12
      , position: "center"
      , font: DEFAULT_FONT
      , fontSize: 8
      , color: Colors.GRAY
      , mode: mode
      , onclick: gotoLevelSelect
    });
    buttons["submit"] = new Button("▲", {
      x: 0, y: 30
      , w: 22, h: 12
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 8
      , color: Colors.BLUE
      , mode: mode
      , onclick: submitBurger
    });
    buttons["remove"] = new Button("Remove", {
      x: 36, y: 30
      , w: 30, h: 12
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 8
      , color: Colors.DARKBLUE
      , mode: mode
      , onclick: removeBurgerPart
    });
    const partNameBtnArr = burgerData.partsArr();
    const SPACED_BY = 15;
    let i, size = partNameBtnArr.length, x = -((size - 1) * SPACED_BY / 2);
    for (i = 0; i < size; i++) {
      createPartBtn(partNameBtnArr[i], x, 12);
      x += SPACED_BY;
    }
  }
  function createPartBtn(partName, x, y) {
    const part = Burger.getPart(partName);
    let rounded = "both";
    if (partName.indexOf("top") > -1) {
      rounded = "top";
    }
    else if (partName.indexOf("bottom") > -1) {
      rounded = "bottom";
    }
    var btnLetter = Burger.getPartLetter(partName);
    buttons[partName] = new Button(btnLetter, {
      x: x, y: y
      , w: 12, h: 12
      , position: "bottom-center"
      , font: DEFAULT_FONT
      , fontSize: 8
      , rounded: rounded
      , color: part.color
      , fontColor: Colors.BLACK
      , mode: MODE.GAME
      , onclick: function() { addToBurger(partName) }
    });
  }
  function drawButtons() {
    let btn, x, y, fontSize, fontColor;
    for (var btnName in buttons) {
      btn = buttons[btnName];
      console.log("btn.hidden=" + btn.hidden);
      if (!btn.hidden) {
        fontColor = btn.fontColor || Colors.DOWNYBLUE;
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
              , align: "center", color: fontColor });
          }
        }
      }
    }
  }
  function gotoStart() {
    // currentMode = MODE.END;//revert
    currentMode = MODE.START;
    playMusic("menuBgMusic");
  }
  function gotoLevelSelect() {
    currentMode = MODE.LEVEL_SELECT;
    playMusic("menuBgMusic");
  }
  function setBestLevels() {
    data["bestLevels"] = {};
    let i, size = data["history"].length, game, levelIndex;
    for (i = 0; i < size; i++) {
      game = data["history"][i];
      if (game["status"] === GAME_STATUS.COMPLETE) {
        levelIndex = "level" + game["level"];
        if (!data["bestLevels"][levelIndex]
         || data["bestLevels"][levelIndex]["totalStars"] < game["totalStars"]) {
          data["bestLevels"][levelIndex] = game;
        }
      }
    }
  }
  function isLevelUnlocked(level) {
    if (level === 1) {
      return true;
    }
    else if (level > LEVELS) {
      return false;
    }
    let i, size = data["history"].length, game;
    for (i = 0; i < size; i++) {
      game = data["history"][i];
      if (game["level"] === level - 1 && game["status"] && game["status"] === GAME_STATUS.COMPLETE) {
        return true;
      }
    }
    return false;
  }
  function genLevelParams(level) {
    let roundCount = Math.floor(level * 1.2);
    if (roundCount < 3) roundCount = 3;
    if (roundCount > 9) roundCount = 9;
    const maxRoundTimeMs = Math.floor((24 - (level * 1.5)) * 1000);
    const burgerAward = Math.ceil((level * 1.5) + 9);
    let burgerSizeMin = Math.ceil(level * .4);
    let burgerSizeMax = Math.ceil(level * .9);
    if (burgerSizeMin < 3) burgerSizeMin = 3;
    if (burgerSizeMax < 3) burgerSizeMax = 3;
    if (burgerSizeMax > 7) burgerSizeMax = 7;
    currGameParams = {
      roundCount: roundCount,
      maxRoundTimeMs: maxRoundTimeMs,
      maxGameTime: maxRoundTimeMs * roundCount,
      burgerSizeMin: burgerSizeMin,
      burgerSizeMax: burgerSizeMax,
      roundTime: {//if game time is less than value, then awarded.
        star1: maxRoundTimeMs,
        star2: maxRoundTimeMs / 2,
        star3: maxRoundTimeMs / 3,
      },
      burgerAward: {
        star1: burgerAward,
        star2: Math.ceil(burgerAward * 1.5),
        star3: Math.ceil(burgerAward * 2),
      },
    };
  }
  function startGame(level) {
    level = level || 1;
    //reject if level is not unlocked yet.
    if (!isLevelUnlocked(level)) {
      message(`Level ${level} is locked.`, Colors.RED);
      playSound("noMatch");
      return;
    }
    genLevelParams(level);
    data["currGame"] = {
      "roundCount": currGameParams.roundCount
      , "level": level
      , "maxRoundTimeMs": currGameParams.maxRoundTimeMs //*.5< for 2 stars
      , "startTime": (new Date()).getTime()
      , "time": 0
      , "failCount": 0
      , "status": GAME_STATUS.FAILED
      , "currRound": generateRound()
      , "rounds": []
    };
    message("START\nLevel " + level, Colors.GREEN);
    currentMode = MODE.GAME;
    playMusic("gameBgMusic");
  }
  function startRound() {
    const currGame = data["currGame"];
    const roundsSoFar = currGame["rounds"].length;
    //if 3 failed, then end game
    if (currGame["failCount"] >= 3) {
      currGame["status"] = GAME_STATUS.FAILED;
      endGame();
      return;
    }
    currGame["status"] = GAME_STATUS.COMPLETE;
    if (roundsSoFar < currGame["roundCount"]) {
      currGame["currRound"] = generateRound();
    }
    else {
      endGame();
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
  function endGame() {
    setBestLevels();
    initEndScreenBtns();
    initLevelSelectScreenBtns();
    currentMode = MODE.END;
    playMusic("menuBgMusic");
    applyGameResults(data["currGame"]);
    saveData();
  }
  function generateRound() {
    const burgerSize = Rand.range(currGameParams.burgerSizeMin, currGameParams.burgerSizeMax);
    return {
      "targetBurgerArr": Burger.generate(burgerSize)
      , "burgerArr": []
      , "startTime": now
      , "success": false
    }
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
    now = (new Date()).getTime();
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
        if (mx > lx && mx < rx && my > ty && my < by) {
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
      case MODE.START:        ScreenStart.draw(unitSize, screenCenterX, screenCenterY, data); break;
      case MODE.LEVEL_SELECT: ScreenLevelSelect.draw(unitSize, screenCenterX, screenCenterY, data); break;
      case MODE.GAME:
        inGameUpkeep();
        ScreenGame.draw(unitSize, screenCenterX, screenCenterY, data);
        break;
      case MODE.END: ScreenEnd.draw(unitSize, screenCenterX, screenCenterY, data); break;
    }
    drawButtons();
    drawMessage();
  }
  function inGameUpkeep() {
    const time = now - data["currGame"]["currRound"]["startTime"]
    data["currGame"]["currRound"]["time"] = time;
    //if time is less than zero, fail.
    if (time >= currGameParams.maxRoundTimeMs) {
      data["currGame"]["failCount"]++;
      applyRoundResults(data["currGame"]["currRound"]);
      data["currGame"]["rounds"].push(data["currGame"]["currRound"]);
      message("Time is up :(", Colors.RED);
      playSound("noMatch");
      startRound();
    }
  }
  function drawMessage() {
    if (alertMsg) {
      const duration = 1000;
      const fade = 1000;
      const diff = now - alertMsg.time;
      if (diff < duration + fade) {
        const fadeStart = diff - duration;
        let opacity = 0;
        if (fadeStart > 0) {
          opacity = 1 -((diff - duration) / 1000);
        }
        opacity = opacity < 0 ? 0 : opacity;
        const fontUnitSize = 10;
        const fontSize = unitSize * fontUnitSize;
        const arr = alertMsg.text.split("\n");
        const size = arr.length;
        let y = screenCenterY - (size * (size - 1));
        let i;
        for (i = 0; i < size; i++) {
          Draw.text(arr[i], { x: screenCenterX, y: y
            , fontSize: fontSize, align: "center", color: alertMsg.color, opacity: opacity });
          y += fontSize * 1.2;
        }
      }
      else {
        alertMsg = false;
      }
    }
  }
  function addToBurger(partName) {
    playSound("addPart");
    data["currGame"]["currRound"]["burgerArr"].push(partName);
  }
  function clearBurger() {
    playSound("clear");
    data["currGame"]["currRound"]["burgerArr"] = [];
  }
  function removeBurgerPart() {
    playSound("clear");
    data["currGame"]["currRound"]["burgerArr"].pop();
  }
  function submitBurger() {
    //check if it matches target burger
    const burger = data["currGame"]["currRound"]["burgerArr"];
    const target = data["currGame"]["currRound"]["targetBurgerArr"];
    if (burgersMatch(burger, target)) {
      applyRoundResults(data["currGame"]["currRound"]);
      data["currGame"]["rounds"].push(data["currGame"]["currRound"]);
      message(Rand.arr(burgerData.compliments) + "!\n"
        + Burger.getStarsStr(data["currGame"]["currRound"]["stars"]), Colors.GREEN);
      playSound("match");
      startRound();
    }
    else {
      message("NO MATCH", Colors.RED);
      playSound("noMatch");
      clearBurger();
    }
  }
  function burgersMatch(burgerArr, targetBurgerArr) {
    const burgerSize = burgerArr.length;
    const targetSize = targetBurgerArr.length;
    if (burgerSize !== targetSize) {
      return false;
    }
    let i;
    for (i = 0; i < burgerSize; i++) {
      if (burgerArr[i] !== targetBurgerArr[i]) {
        return false;
      }
    }
    return true;
  }
  function applyGameResults(game) {
    //set game time
    game["time"] = now - game["startTime"];
    //apply money earned
    const moneyEarned = game["rounds"].sum("award");
    if (!data["bank"]) { 
      data["bank"] = 0;
    }
    data["bank"] += moneyEarned;
    //set total number of stars
    const possibleStars = game["roundCount"] * 3;
    const totalStars = game["rounds"].sum("stars");
    game["totalStars"] = totalStars;
    //calculate game star rating
    game["stars"] = 0;
    if (game["status"] === GAME_STATUS.COMPLETE) {
      if (totalStars > possibleStars * .75) {
        game["stars"] = 3;
      }
      else if (totalStars > possibleStars * .5) {
        game["stars"] = 2;
      }
      else if (totalStars > possibleStars * .25) {
        game["stars"] = 1;
      }
    }
    data["history"].push(game);
  }
  function applyRoundResults(round) {
    const time = round["time"];
    if (time >= currGameParams.maxRoundTimeMs) {
      round["stars"] = 0;
      round["award"] = 0;
      return;
    }
    round["success"] = true;
    if (time > 0 && time < currGameParams.roundTime.star3) {
      round["stars"] = 3;
      round["award"] = currGameParams.burgerAward.star3;
    }
    else if (time < currGameParams.roundTime.star2) {
      round["stars"] = 2;
      round["award"] = currGameParams.burgerAward.star2;
    }
    else if (time > currGameParams.roundTime.star3) {
      round["stars"] = 1;
      round["award"] = currGameParams.burgerAward.star1;
    }
  }
  function message(text, color) {
    alertMsg = {
      text: text
      , color: color
      , time: (new Date()).getTime()
    };
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
  }
  function saveData() {
    window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
  }
  function clearData() {
    window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
  }
})();