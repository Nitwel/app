const path = require('path');

module.exports = async ({ config, mode }) => {
  config.module.rules.push({
    test: /\.md$/,
    use: [
      {
        loader: "html-loader"
      },
      {
        loader: "markdown-loader"
      }
    ],
  });
  
  return config;
};
