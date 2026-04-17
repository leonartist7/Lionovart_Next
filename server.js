const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const portRaw = process.env.PORT || 3000;
const port = isNaN(Number(portRaw)) ? portRaw : Number(portRaw);
const nextPort = typeof port === "number" ? port : undefined;

const app = next({ dev, hostname, port: nextPort });
const handle = app.getRequestHandler();

// If passenger leaves a broken socket file, clean it up
if (typeof port === "string" && fs.existsSync(port)) {
  try { fs.unlinkSync(port); } catch (e) {}
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on port ${port}`);
    });
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
