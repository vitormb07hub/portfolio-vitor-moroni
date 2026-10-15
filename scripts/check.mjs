import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const html = await readFile(resolve(root, "index.html"), "utf8");
const errors = [];
if (!/<html\s+lang="pt-BR"/.test(html)) errors.push("Idioma principal não declarado.");
if ([...html.matchAll(/<h1\b/g)].length !== 1)
  errors.push("A página deve ter um título principal.");
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  if (!/\balt="[^"]*"/.test(match[0])) errors.push("Imagem sem descrição alternativa.");
}
for (const match of html.matchAll(/<a\b[^>]*>/g)) {
  if (/target="_blank"/.test(match[0]) && !/rel="[^\"]*noopener[^\"]*noreferrer/.test(match[0])) {
    errors.push("Link externo sem proteção para nova aba.");
  }
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) errors.push("Há IDs duplicados no HTML.");

for (const match of html.matchAll(/\b(?:src|href|data-image)="([^"]+)"/g)) {
  const reference = match[1];
  if (/^(https?:|mailto:)/.test(reference)) continue;
  if (reference.startsWith("#")) {
    if (!ids.includes(reference.slice(1))) errors.push(`Seção ausente: ${reference}`);
    continue;
  }
  try {
    await access(resolve(root, reference));
  } catch {
    errors.push(`Arquivo ausente: ${reference}`);
  }
}

for (const script of ["main.js", "privacy.js", "serve.mjs", "build.mjs", "check.mjs"]) {
  try {
    execFileSync(process.execPath, ["--check", resolve(root, "scripts", script)], {
      stdio: "pipe",
    });
  } catch {
    errors.push(`Sintaxe inválida: scripts/${script}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Verificação concluída: arquivos, âncoras, IDs e sintaxe JavaScript.");
}
