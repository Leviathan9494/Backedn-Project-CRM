import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { startServer } from "../mod.ts";

Deno.test("integration: CRUD via HTTP", async () => {
  const { controller } = startServer(8123);
  const base = `http://localhost:${8123}`;

  // create
  const res1 = await fetch(base + '/products', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'X', price: 9.9 }) });
  assertEquals(res1.status, 201);
  const created = await res1.json();
  const id = created.id;

  // get
  const res2 = await fetch(base + '/products/' + id);
  assertEquals(res2.status, 200);
  const fetched = await res2.json();
  assertEquals(fetched.name, 'X');

  // update
  const res3 = await fetch(base + '/products/' + id, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ price: 11 }) });
  assertEquals(res3.status, 200);
  const updated = await res3.json();
  assertEquals(updated.price, 11);

  // list
  const res4 = await fetch(base + '/products');
  const list = await res4.json();
  if (!Array.isArray(list)) throw new Error('expected array');

  // delete
  const res5 = await fetch(base + '/products/' + id, { method: 'DELETE' });
  assertEquals(res5.status, 204);

  controller.abort();
});
