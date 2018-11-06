const template = (name, html, js) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${name}</title>
</head>
<body>
  <script>
    ${js}  
  </script>
  ${html}
</body>
</html>`;
const fs = require("mz/fs");
const path = require("path");
const puppeteer = require("puppeteer");
const tests = fs.readdirSync(path.join(__dirname, "tests"));
const webpack = require("thenify")(require("webpack"));
console.log(tests);
(async () => {
  const browser = await puppeteer.launch();
  tests.forEach(async test => {});
  const page = await browser.newPage();

  await browser.close();
})();
