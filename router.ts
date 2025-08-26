// HTTP router separated for readability
import { listProducts, createProduct, batchUpdate, getProduct, updateProduct, deleteProduct } from "./products.ts";

export async function routerHandler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Serve swagger UI and spec
  if (pathname === "/swagger" || pathname === "/") {
    const html = await Deno.readTextFile(new URL("./swagger.html", import.meta.url));
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  if (pathname === "/openapi.json") {
    const spec = await Deno.readTextFile(new URL("./openapi.json", import.meta.url));
    return new Response(spec, { headers: { "content-type": "application/json; charset=utf-8" } });
  }

  // Products endpoints
  if (pathname === "/products" && req.method === "GET") {
    const items = await listProducts(url.searchParams);
    return new Response(JSON.stringify(items), { headers: { "content-type": "application/json" } });
  }

  if (pathname === "/products" && req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const created = await createProduct(body);
    return new Response(JSON.stringify(created), { status: 201, headers: { "content-type": "application/json" } });
  }

  // batch update
  if (pathname === "/products/batch" && (req.method === "PATCH" || req.method === "PUT")) {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map(Number) : null;
    const updated = await batchUpdate(ids, body.update || {});
    return new Response(JSON.stringify(updated), { headers: { "content-type": "application/json" } });
  }

  // /products/:id
  const productIdMatch = pathname.match(/^\/products\/(\d+)$/);
  if (productIdMatch) {
    const id = Number(productIdMatch[1]);
    if (req.method === "GET") {
      const p = await getProduct(id);
      if (!p) return new Response(null, { status: 404 });
      return new Response(JSON.stringify(p), { headers: { "content-type": "application/json" } });
    }
    if (req.method === "PUT" || req.method === "PATCH") {
      const body = await req.json().catch(() => ({}));
      const updated = await updateProduct(id, body);
      if (!updated) return new Response(null, { status: 404 });
      return new Response(JSON.stringify(updated), { headers: { "content-type": "application/json" } });
    }
    if (req.method === "DELETE") {
      const ok = await deleteProduct(id);
      return new Response(null, { status: ok ? 204 : 404 });
    }
  }

  return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "content-type": "application/json" } });
}
