import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { createProduct, listProducts, batchUpdate, DBRef, Product } from "../products.ts";

// Mock DB with minimal API: data, read, write
function makeMockDb(): DBRef {
  const state = { products: [] as Product[], nextId: 1 };
  return {
    data: state as unknown as DBRef["data"],
    async read() { /* noop */ },
    async write() { /* noop */ }
  } as DBRef;
}

Deno.test("create and list products (unit)", async () => {
  const mock = makeMockDb();
  const p = await createProduct({ name: 'Apple', price: 1.2 }, mock);
  assertEquals(p.name, 'Apple');
  const all = await listProducts(undefined, mock);
  assertEquals(all.length, 1);
});

Deno.test("batch update relative numeric (unit)", async () => {
  const mock = makeMockDb();
  await createProduct({ name: 'A', price: 10 }, mock);
  await createProduct({ name: 'B', price: 20 }, mock);
  const res = await batchUpdate(null, { price: "+=5" }, mock);
  assertEquals((res as Product[]).length, 2);
  assertEquals((mock.data as { products: Product[] }).products[0].price, 15);
  assertEquals((mock.data as { products: Product[] }).products[1].price, 25);
});
