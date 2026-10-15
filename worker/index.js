/** Entrega somente os arquivos públicos conhecidos, com proteção em toda resposta. */
export function createPortfolioWorker(files, securityHeaders) {
  return {
    async fetch(request) {
      const headers = new Headers(securityHeaders);
      headers.set("Cache-Control", "no-cache");
      const url = new URL(request.url);
      if (url.protocol !== "https:") {
        url.protocol = "https:";
        headers.set("Location", url.toString());
        return new Response(null, { status: 308, headers });
      }
      if (!["GET", "HEAD"].includes(request.method)) {
        headers.set("Allow", "GET, HEAD");
        return new Response("Método não permitido", { status: 405, headers });
      }
      let path;
      try {
        path = decodeURIComponent(url.pathname);
      } catch {
        return new Response("Endereço inválido", { status: 400, headers });
      }
      if (path === "/") path = "/index.html";
      if (!Object.hasOwn(files, path)) {
        headers.set("Content-Type", "text/plain; charset=utf-8");
        return new Response(request.method === "HEAD" ? null : "Arquivo não encontrado", {
          status: 404,
          headers,
        });
      }
      const file = files[path];
      headers.set("Content-Type", file.type);
      headers.set("ETag", file.etag);
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
      const knownVersions = (request.headers.get("If-None-Match") || "").split(",").map((value) => value.trim());
      if (knownVersions.some((value) => value === file.etag || value === `W/${file.etag}` || value === "*")) {
        return new Response(null, { status: 304, headers });
      }
      headers.set("Content-Length", String(file.length));
      if (request.method === "HEAD") return new Response(null, { headers });
      const bytes = Uint8Array.from(atob(file.base64), (character) => character.charCodeAt(0));
      return new Response(bytes, { headers });
    },
  };
}
