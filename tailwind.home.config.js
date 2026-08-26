const baseConfig = require("./tailwind.config.js");

module.exports = {
  ...baseConfig,
  content: [
    "./index.html",
    "./components/HomepageMotion.jsx",
    "./scripts/cms-page-loader.js",
  ],
  plugins: [],
};
