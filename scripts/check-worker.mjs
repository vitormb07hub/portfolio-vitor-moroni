import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../dist/server/index.js", import.meta.url), "utf8");
const worker = (
  await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`)
).default;
const origin = "https://portfolio.example";
const response = await worker.fetch(new Request(origin + "/"));
assert.equal(response.status, 200);
assert.match(response.headers.get("Content-Security-Policy"), /frame-ancestors 'none'/);
assert.equal(response.headers.get("X-Frame-Options"), "DENY");
assert.match(response.headers.get("Strict-Transport-Security"), /max-age=31536000/);
assert.match(await response.text(), /Empresa de software para varejo/);
for (const path of ["/.git/config", "/security/headers.json", "/scripts/serve.mjs", "/__proto__"]) {
  assert.equal((await worker.fetch(new Request(origin + path))).status, 404);
}
assert.equal((await worker.fetch(new Request(origin + "/", { method: "POST" }))).status, 405);
assert.equal((await worker.fetch(new Request("http://portfolio.example/"))).status, 308);
assert.equal(await (await worker.fetch(new Request(origin + "/", { method: "HEAD" }))).text(), "");
for (const path of [
  "/scripts/privacy.js",
  "/assets/images/vitor-moroni.webp",
  "/assets/images/social-card.png",
  "/assets/documents/curriculo-vitor-moroni.pdf",
]) {
  assert.equal((await worker.fetch(new Request(origin + path))).status, 200);
}
const photo = await worker.fetch(new Request(origin + "/assets/images/vitor-moroni.webp"));
assert.equal(photo.headers.get("Content-Type"), "image/webp");
const cachedPhoto = await worker.fetch(new Request(origin + "/assets/images/vitor-moroni.webp", { headers: { "If-None-Match": photo.headers.get("ETag") } }));
assert.equal(cachedPhoto.status, 304);
assert.equal((await cachedPhoto.arrayBuffer()).byteLength, 0);
const preview = await worker.fetch(new Request(origin + "/assets/images/social-card.png"));
assert.equal(preview.headers.get("Content-Type"), "image/png");
assert.equal((await worker.fetch(new Request(origin + "/%E0%A4%A"))).status, 400);
console.log(
  "Entrega pública validada: cabeçalhos, arquivos, métodos, HTTPS e ausência do nome da empresa."
);
