const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

// --- GLASS WINDOW LOGGER ---
// This writes any fatal startup crashes directly to a public file so we can read it from the browser.
function logCrash(errContext, err) {
  try {
    const pubDir = path.join(__dirname, "public");
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir);
    const errText = `[${new Date().toISOString()}] CRASH in ${errContext}:\n${err ? err.stack || err : "Unknown Error"}\n`;
    fs.writeFileSync(path.join(pubDir, "crash.txt"), errText);
    console.error(errText);
  } catch (e) {
    console.error("Failed to write crash log to public/crash.txt", e);
  }
}

process.on("uncaughtException", (err) => logCrash("uncaughtException", err));
process.on("unhandledRejection", (reason) => logCrash("unhandledRejection", reason));

try {
  // FORCE PRODUCTION MODE! If NODE_ENV is missing, Next.js tries to boot the dev compiler 
  // which instantly runs out of memory on shared hosting and causes a 503 crash.
  const dev = false;
  
  // Passenger provides the socket via process.env.PORT. We must handle it as a string if it's a pipe.
  const portRaw = process.env.PORT || 3000;
  const port = isNaN(Number(portRaw)) ? portRaw : Number(portRaw);
  
  // Next.js strictly expects an integer or undefined.
  const nextPort = typeof port === "number" ? port : undefined;

  const app = next({ dev, port: nextPort });
  let handle;

  // Cleanup old Passenger sockets if they exist to prevent EADDRINUSE
  if (typeof port === "string" && fs.existsSync(port)) {
    try { fs.unlinkSync(port); } catch (e) {}
  }

  // To prevent Passenger from timing out (503), we must call listen() IMMEDIATELY,
  // before app.prepare() has finished.
  const server = createServer(async (req, res) => {
    try {
      if (!handle) {
        // Return 503 so load balancers know we aren't ready, but provide a friendly message.
        res.statusCode = 503;
        res.setHeader("Retry-After", "5");
        res.setHeader("Content-Type", "text/html");
        res.end("<h1>Next.js is warming up... Please refresh in 5 seconds.</h1>");
        return;
      }
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      logCrash("handleRequest", err);
      res.statusCode = 500;
      res.end("Internal Server Error during request handling");
    }
  });

  server.listen(port, () => {
    console.log(`> Node server listening on ${port}. Preparing Next.js...`);
    
    app.prepare().then(() => {
      handle = app.getRequestHandler();
      console.log("> Next.js App prepared and ready to handle requests.");
    }).catch((err) => {
      logCrash("app.prepare()", err);
      // We purposefully DO NOT exit the process here so that the server can still
      // respond to the browser and the user can check /crash.txt
    });
  });

} catch (globalErr) {
  logCrash("Global Execution", globalErr);
  process.exit(1);
}
