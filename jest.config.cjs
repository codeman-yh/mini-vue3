const path = require('path')
module.exports = {
    // ...
    moduleNameMapper: {
      "@mini-vue3\/(.*)$": "<rootDir>/packages/$1/src",
    }
  };