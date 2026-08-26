const baseConfig = require("./tailwind.config.js");

module.exports = {
  ...baseConfig,
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
};
