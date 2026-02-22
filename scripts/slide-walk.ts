import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import readline from "node:readline";
import url from "node:url";

const port = Number(process.env.SLIDES_PORT || 8080);
const baseUrl = process.env.SLIDES_URL || `http://localhost:${port}`;
const startServer = process.env.SLIDES_START_SERVER === "1";
const htmlPath = path.resolve("index.html");

const html = fs.readFileSync(htmlPath, "utf8");
const totalSlides = (html.match(/<section\b/gi) || []).length;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let current = 0;

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".json": "application/json; charset=utf-8",
};

const server = startServer
  ? http.createServer((req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end();
        return;
      }

      const parsed = url.parse(req.url);
      const safePath = (parsed.pathname || "/").replace(/\\\\/g, "/");
      const filePath =
        safePath === "/" ? htmlPath : path.resolve(`.${safePath}`);

      if (!filePath.startsWith(process.cwd())) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": contentTypes[ext] || "application/octet-stream",
        });
        res.end(data);
      });
    })
  : null;

if (server) {
  server.listen(port, "127.0.0.1", () => {
    console.log(`Servidor local activo en ${baseUrl}`);
  });
}

const printSlide = () => {
  const slideUrl = `${baseUrl}/#/${current}`;
  console.log(`\\nSlide ${current + 1}/${totalSlides}: ${slideUrl}`);
  console.log(
    'Escribe \"n\" para siguiente, \"p\" para anterior, o \"q\" para salir.',
  );
};

const step = (command: string) => {
  const value = command.trim().toLowerCase();
  if (value === "q") {
    if (server) {
      server.close();
    }
    rl.close();
    return;
  }
  if (value === "p") {
    current = Math.max(0, current - 1);
    printSlide();
    return;
  }
  current = Math.min(totalSlides - 1, current + 1);
  printSlide();
};

console.log(`Total slides detectadas: ${totalSlides}`);
printSlide();

rl.on("line", step);
