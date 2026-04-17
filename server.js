const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");

const dev = process.env.NODE_ENV !== "production";
const portRaw = process.env.PORT || 3000;
const port = isNaN(Number(portRaw)) ? portRaw : Number(portRaw);
const nextPort = typeof port === "number" ? port : undefined;

const app = next({ dev, port: nextPort });
let handle;

// Clean up Passenger leftover sockets
if (typeof port === "string" && fs.existsSync(port)) {
  try { fs.unlinkSync(port); } catch (e) {}
}

const server = createServer((req, res) => {
  if (!handle) {
    res.statusCode = 503;
    res.setHeader("Retry-After", "5");
    res.end("Next.js is compiling/booting... please refresh in 5 seconds.");
    return;
  }
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl).catch((err) => {
    console.error("Error occurred handling", req.url, err);
    res.statusCode = 500;
    res.end("internal server error");
  });
});

server.listen(port, () => {
  console.log(`> Listening on ${port}`);
  app.prepare().then(() => {
    handle = app.getRequestHandler();
    console.log("> Next.js App prepared");
  }).catch((err) => {
    console.error("Next.js app.prepare failed:", err);
    try { fs.writeFileSync("hostinger-crash.log", err.stack || err.toString()); } catch(e){}
    process.exit(1);
  });
});
