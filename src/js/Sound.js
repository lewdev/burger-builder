var Sound = {
  PATH: "./audio/"
  , MUSIC_VOLUME: .1
  , lastSoundName: null
  , lastMusicName: null
  //map of sound names to audio.
  , audio: null
  //map of sound names to their file names.
  , map: {
    "addPart":       "addPart - Jump 1.wav"
    , "clear":       "clear - Select 1.wav"
    , "endGame":     "endGame - Victory SoundFX2.ogg"
    , "match":       "match - Fruit collect 1.wav"
    , "noMatch":     "noMatch - Text 1.wav"
    , "gameBgMusic": "game - POL-star-way-short.wav"
    , "menuBgMusic": "menu - POL-follow-me-short.wav"
  }
  , init: function(callback) {
    if (!Sound.audio) {
      Sound.audio = {};    
      for (var name in Sound.map) {
        Sound.audio[name] = new Audio(Sound.PATH + Sound.map[name]);
      }
    }
    callback();
  }
  , play: function(soundName) {
    Sound.stop(Sound.lastSoundName);
    const audio = Sound.getAudio(soundName);
    if (audio) {
      audio.play();
    }
    Sound.lastSoundName = soundName;
  }
  , music: function(soundName) {
    Sound.stop(Sound.lastMusicName);
    const audio = Sound.getAudio(soundName);
    if (audio) {
      audio.play();
      audio.loop = true;
      audio.volume = Sound.MUSIC_VOLUME;
    }
    Sound.lastMusicName = soundName;
  }
  , getAudio(soundName) {
    const audio = Sound.audio[soundName];
    if (!audio) {
      console.log("Sound '" + soundName + "' not found");
      return null;
    }
    return audio;
  }
  , stop: function(soundName) {
    if (!soundName) {
      return;
    }
    const audio = Sound.audio[soundName];
    if (!audio) {
      console.log("Sound '" + soundName + "' not found");
      return;
    }
    audio.pause();
    //audio.currentTime = 0;
  }
  , stopMusic: function() {
    Sound.stop(Sound.lastMusicName);
  }
  , playMusic: function() {
    console.log("Sound.lastMusicName=" + Sound.lastMusicName);
    Sound.music(Sound.lastMusicName);
  }
};