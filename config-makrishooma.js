const GAME_CONFIG = {

  GAME_NAME: "جنگ جهانی ماکریشوما",

  VERSION: "1.0.0",

  MAX_PLAYERS: 3,

  TURN_ORDER: [
    "iri",
    "china",
    "kazakhstan"
  ],

  START_HEALTH: 100,

  START_MONEY: 100,

  WEAPONS: {

    missile: {
      name: "موشک",
      damage: 0.5,
      price: 5,
      start: 100
    },

    bomb: {
      name: "بمب",
      damage: 1.0,
      price: 10,
      start: 55
    },

    nuke: {
      name: "بمب اتم",
      damage: 7.0,
      price: 30,
      start: 5
    }

  },

  COUNTRIES: {

    iri: {
      id: "iri",
      name: "🇮🇷 ایران",
      health: 100,
      missiles: 100,
      bombs: 55,
      nukes: 5,
      money: 100
    },

    china: {
      id: "china",
      name: "🇨🇳 چین",
      health: 100,
      missiles: 100,
      bombs: 45,
      nukes: 5,
      money: 100
    },

    kazakhstan: {
      id: "kazakhstan",
      name: "🇰🇿 قزاقستان",
      health: 100,
      missiles: 100,
      bombs: 45,
      nukes: 4,
      money: 100
    }

  },

  RETURN_TO_GAME: {
    missiles: 10,
    bombs: 2,
    nukes: 1
  },

  SHOP: {
    missilePrice: 5,
    bombPrice: 10,
    nukePrice: 30
  },

  AUTO_SAVE: true,

  AUTO_SAVE_INTERVAL: 1000,

  ALLOW_VOICE: true,

  ALLOW_CAMERA: true

};

Object.freeze(GAME_CONFIG);