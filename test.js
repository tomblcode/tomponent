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
    let asserts = 1;
    let assert = (() => {
      let doneasserts = 0;
      ${function assert(bool) {
        doneasserts++;
        if (bool && asserts === doneasserts) {
          console.log("TEST PASSED");
        } else if (!bool) {
          console.log("TEST FAILED");
        }
      }}
      return assert;
    })();
    ${function deepEqual(x, y) {
      // taken from https://stackoverflow.com/questions/201183/how-to-determine-equality-for-two-javascript-objects#32922084
      const ok = Object.keys,
        tx = typeof x,
        ty = typeof y;
      return x && y && tx === "object" && tx === ty
        ? ok(x).length === ok(y).length &&
            ok(x).every(key => deepEqual(x[key], y[key]))
        : x === y;
    }}
    onerror = () => {
      assert(false);
    }
  </script>
  <script>
      ${js}
  </script>
  ${html}
</body>
</html>`;
const fs = require("mz/fs");
const path = require("path");
const { nextAvailable: getPort } = require("node-port-check");
const puppeteer = require("puppeteer");
const tests = fs.readdirSync(path.join(__dirname, "tests"));
const webpack = require("thenify")(require("webpack"));
const app = new (require("koa"))();
const ranTests = {};
app.use(async ctx => {
  if (ctx.path.split("/")[1] === "test") {
    const test = decodeURIComponent(ctx.path.slice(6).split("/")[0]);
    await webpack({
      mode: "production",
      entry: path.join(__dirname, "tests", test, "index.jsx"),
      output: {
        path: path.join(__dirname, "tests", test),
        filename: "bundle.js"
      },
      devtool: "inline-source-map",
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            include: path.join(__dirname, "tests", test),
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: ["@babel/plugin-transform-react-jsx"]
            }
          }
        ]
      },
      target: "web",
      resolve: {
        alias: {
          tomponent: path.join(__dirname, "lib/index.js")
        }
      }
    });

    ctx.body = template(
      test,
      (await fs.exists(path.join(__dirname, "tests", test, "index.html")))
        ? await fs.readFile(path.join(__dirname, "tests", test, "index.html"))
        : "",
      await fs.readFile(path.join(__dirname, "tests", test, "bundle.js"))
    );
  } else if (ctx.path === "/") {
    ctx.body = template(
      "tests",
      `<style>
        body {
          margin: 0;
        }
        p {
          font-family: monospace;
          margin: 0;
          box-sizing: border-box;
          padding: 4px;
          width: 100%;
        }
      </style>
      <p id="passed"></p>
      <p id="failed"></p>
      <p id="finished"></p>
      <p id="total"></p>
      <p id="percentage"></p>
      <br>
      <p>Tests:</p>`,
      `(${ranTests => {
        onload = () => {
          document.getElementById("passed").innerText = `Passed: ${
            Object.keys(ranTests)
              .map(key => ranTests[key])
              .filter(value => value === true).length
          }, ${
            Object.keys(ranTests)
              .map(key => ranTests[key])
              .filter(value => value !== null).length > 0
              ? (Object.keys(ranTests)
                  .map(key => ranTests[key])
                  .filter(value => value === true).length /
                  Object.keys(ranTests)
                    .map(key => ranTests[key])
                    .filter(value => value !== null).length) *
                  100 +
                "%"
              : ""
          }`;
          document.getElementById("failed").innerText = `Failed: ${
            Object.keys(ranTests)
              .map(key => ranTests[key])
              .filter(value => value === false).length
          }`;
          document.getElementById("finished").innerText = `Finished: ${
            Object.keys(ranTests)
              .map(key => ranTests[key])
              .filter(value => value !== null).length
          }`;
          document.getElementById("total").innerText = `Total: ${
            Object.keys(ranTests).length
          }`;
          Object.keys(ranTests).forEach(test => {
            const el = document.createElement("p");
            el.appendChild(document.createTextNode(test));
            let color;
            if (ranTests[test] === true) {
              color = {
                bg: "#acff99",
                border: "#1c9900"
              };
            } else if (ranTests[test] === false) {
              color = {
                bg: "#f99",
                border: "#900"
              };
            } else {
              color = {
                bg: "#ccc",
                border: "#4d4d4d"
              };
            }
            el.style.color = color.border;
            el.style.background = color.bg;
            el.style.borderTop = el.style.borderBottom = `1px ${
              color.border
            } solid`;
            document.body.appendChild(el);
          });
        };
      }})(JSON.parse("${JSON.stringify(ranTests).replace(/"/g, '\\"')}"))`
    );
  }
});

async function setTest(browser, name, passed) {
  ranTests[name] = passed;
  await (await browser.pages())[0].reload();
  if (
    process.env.CI === "true" &&
    Object.keys(ranTests)
      .map(key => ranTests[key])
      .filter(value => value !== null).length === Object.keys(ranTests).length
  ) {
    try {
      const text = (await (await browser.pages())[0].evaluate(() => {
        return document.body.innerText;
      }))
        .split("\n")
        .filter(item => !!item)
        .slice(0, 4)
        .join("\n");
      console.log(text);
      process.exit(text.split("\n")[1] === "Failed: 0" ? 0 : 1);
    } catch (e) {
      setTest(browser, name, passed);
    }
  }
}
(async () => {
  const port = await getPort(8080, "0.0.0.0");
  app.listen(port);
  const browser = await puppeteer.launch({
    headless: false,
    args:
      process.env.CI !== "true" ? ["--window-size=800,730"] : ["--no-sandbox"]
  });
  await (await browser.pages())[0].goto(`localhost:${port}`);
  (await browser.pages())[0].on("close", process.exit);
  await Promise.all(
    tests
      .map(test => async () => {
        await setTest(browser, test, null);
        const page = await browser.newPage();
        (await browser.pages())[0].bringToFront();
        page.on("console", async message => {
          if (
            message.type() === "log" &&
            message.text().slice(0, 5) === "TEST "
          ) {
            let passed;
            if (message.text() === "TEST PASSED") {
              passed = true;
            } else {
              passed = false;
            }
            if (true && passed) await page.close();
            await fs.unlink(path.join(__dirname, "tests", test, "bundle.js"));
            await setTest(browser, test, passed);
          }
        });
        await page.goto(`localhost:${port}/test/${encodeURIComponent(test)}`);
      })
      .map(p => p())
  );
})();
