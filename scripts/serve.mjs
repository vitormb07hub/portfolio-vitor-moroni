import { createServer } from "node:http";
import { readFile, stat, realpath } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const root = process.argv.includes("--dist") ? resolve(projectRoot, "build") : resolve(projectRoot);
const port = Number(process.env.PORT || 4173);
const securityHeaders = JSON.parse(
  await readFile(resolve(projectRoot, "security", "headers.json"), "utf8")
);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

/** Expõe apenas arquivos do site; documentação e configuração ficam privadas. */
const server = createServer(async (request, response) => {
  for (const [key, value] of Object.entries(securityHeaders)) response.setHeader(key, value);
  response.setHeader("Cache-Control", "no-store");
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Método não permitido");
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
    const allowed =
      relativePath === "index.html" ||
      ["scripts/main.js", "scripts/privacy.js"].includes(relativePath) ||
      /^(assets|styles)\//.test(relativePath);
    const path = resolve(root, relativePath);
    if (
      !allowed ||
      !path.startsWith(`${root}${sep}`) ||
      relativePath.split("/").some((part) => part.startsWith("."))
    ) {
      response.writeHead(404);
      response.end("Arquivo não encontrado");
      return;
    }
    const canonicalPath = await realpath(path);
    if (!canonicalPath.startsWith(`${await realpath(root)}${sep}`))
      throw new Error("Outside public root");
    if (!(await stat(canonicalPath)).isFile()) throw new Error("Not a file");
    const content = await readFile(canonicalPath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(path)] || "application/octet-stream",
      "Content-Length": content.byteLength,
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404);
    response.end("Arquivo não encontrado");
  }
});

server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `A porta ${port} está ocupada. Defina PORT para usar outra.`
      : error.message
  );
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}`));
process.on("SIGINT", () => server.close());
process.on("SIGTERM", () => server.close());
