const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const portRaw = process.env.PORT || 3000;
const port = isNaN(Number(portRaw)) ? portRaw : Number(portRaw);
const nextPort = typeof port === "number" ? port : undefined;

const app = next({ dev, port: nextPort });
let handle = null;
let isPrepared = false;
let bootError = null;

// Helper to write to public directory so we can read it in browser
function logErrorToPublic(msg, err) {
  try {
    const pubDir = path.join(__dirname, 'public');
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir);
    const errText = `${msg}\n${err ? err.stack || err : ''}\n`;
    fs.writeFileSync(path.join(pubDir, 'boot-error.txt'), errText);
    console.error(errText);
    bootError = errText;
  } catch (e) {}
}

process.on('uncaughtException', err => logErrorToPublic('uncaughtException', err));
process.on('unhandledRejection', err => logErrorToPublic('unhandledRejection', err));

if (typeof port === "string" && fs.existsSync(port)) {
  try { fs.unlinkSync(port); } catch (e) {}
}

const server = createServer(async (req, res) => {
  if (bootError) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`CRASH: ${bootError}`);
    return;
  }
  if (!isPrepared) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end("<h1>Starting Next.js... please refresh in 5 seconds.</h1>");
    return;
  }
  try {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Error occurred handling", req.url, err);
    res.statusCode = 500;
    res.end("internal server error");
  }
});

server.listen(port, () => {
  console.log(`> Bound to port/socket ${port}`);
  
  app.prepare().then(() => {
    handle = app.getRequestHandler();
    isPrepared = true;
    console.log("> Next.js app prepared");
  }).catch((err) => {
    logErrorToPublic('app.prepare() failed', err);
    // Don't exit process, let the server return the error text to the browser!
  });
});
