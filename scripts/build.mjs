import { cp, mkdir, readFile, writeFile, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, resolve, extname, relative, sep } from "node:path";
import { createHash } from "node:crypto";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const staticOutput = resolve(root, "build");
const output = resolve(root, "dist");

// Apenas diretórios gerados dentro deste projeto podem ser recriados.
for (const directory of [staticOutput, output]) {
  if (
    ![join(root, "build"), join(root, "dist")].includes(directory) ||
    !directory.startsWith(root + sep)
  ) {
    throw new Error("Diretório de saída fora do projeto.");
  }
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
}
for (const entry of ["index.html", "styles", "assets"]) {
  await cp(join(root, entry), join(staticOutput, entry), { recursive: true });
}
await mkdir(join(staticOutput, "scripts"), { recursive: true });
for (const script of ["main.js", "privacy.js"]) {
  await cp(join(root, "scripts", script), join(staticOutput, "scripts", script));
}
const headers = JSON.parse(await readFile(join(root, "security", "headers.json"), "utf8"));
headers["Strict-Transport-Security"] = "max-age=31536000";
headers["Content-Security-Policy"] += "; upgrade-insecure-requests";
await writeFile(
  join(staticOutput, "_headers"),
  `/*\n${Object.entries(headers)
    .map(([key, value]) => `  ${key}: ${value}`)
    .join("\n")}\n`
);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};
const files = {};
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Links simbólicos não são publicados.");
    if (entry.isDirectory()) await collect(path);
    else if (entry.isFile() && entry.name !== "_headers") {
      const bytes = await readFile(path);
      files["/" + relative(staticOutput, path).split(sep).join("/")] = {
        type: types[extname(path)] || "application/octet-stream",
        length: bytes.length,
        base64: bytes.toString("base64"),
        etag: `"${createHash("sha256").update(bytes).digest("hex")}"`,
      };
    }
  }
}
await collect(staticOutput);
await mkdir(join(output, "server"), { recursive: true });
await mkdir(join(output, ".openai"), { recursive: true });
const handler = await readFile(join(root, "worker", "index.js"), "utf8");
await writeFile(
  join(output, "server", "index.js"),
  `${handler}\nexport default createPortfolioWorker(${JSON.stringify(files)}, ${JSON.stringify(headers)});\n`
);
await cp(join(root, ".openai", "hosting.json"), join(output, ".openai", "hosting.json"));
console.log("Versão estática em build/; entrega com cabeçalhos de segurança em dist/.");
