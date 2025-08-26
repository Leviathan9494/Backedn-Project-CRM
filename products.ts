// Routes and business logic for products
import { db, writeDb } from "./db.ts";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  [key: string]: unknown;
}

export type DBRef = {
  data?: { products: Product[]; nextId?: number };
  read?: () => Promise<void>;
  write?: () => Promise<void>;
};

// Business logic functions accept an optional db-like object for easier testing/mocking
export async function listProducts(query?: URLSearchParams, dbRef: DBRef = db as unknown as DBRef) {
  await dbRef.read?.();
  const all = (dbRef.data?.products as Product[]) || [];
  if (!query) return all;
  const q = query.get("q")?.toLowerCase();
  if (q) return all.filter((p: Product) => (String(p.name) + " " + String(p.description || "")).toLowerCase().includes(q));
  return all;
}

export async function getProduct(id: number, dbRef: DBRef = db as unknown as DBRef) {
  await dbRef.read?.();
  return ((dbRef.data?.products as Product[]) || []).find((p: Product) => p.id === id) || null;
}

export async function createProduct(payload: Partial<Product>, dbRef: DBRef = db as unknown as DBRef) {
  await dbRef.read?.();
  const data = dbRef.data ||= { products: [], nextId: 1 } as { products: Product[]; nextId: number };
  const id = data.nextId || 1;
  // ensure caller cannot override the auto-generated id
    const { id: _ignore, ...safePayload } = payload || {};
    const sp = safePayload as Partial<Product>;
    const productCore: Product = {
      id,
      name: String(sp.name ?? ""),
      description: sp.description ?? "",
      price: Number(sp.price ?? 0),
    } as Product;
    const product: Product = orderProduct({ ...productCore, ...sp });
  data.products.push(product);
  data.nextId = id + 1;
  await dbRef.write?.();
  return product;
}

export async function updateProduct(id: number, payload: Partial<Product>, dbRef: DBRef = db as unknown as DBRef) {
  await dbRef.read?.();
  const data = dbRef.data ||= { products: [], nextId: 1 } as { products: Product[]; nextId: number };
  const idx = data.products.findIndex((p: Product) => p.id === id);
  if (idx === -1) return null;
  // ignore any provided id in payload to keep id immutable
    const { id: _ignore, ...safePayload } = payload || {};
    const merged = { ...data.products[idx], ...safePayload } as Product;
    const updated = orderProduct({ ...merged, id });
  data.products[idx] = updated;
  await dbRef.write?.();
  return updated;
}

export async function deleteProduct(id: number, dbRef: DBRef = db as unknown as DBRef) {
  await dbRef.read?.();
  const data = dbRef.data ||= { products: [], nextId: 1 } as { products: Product[]; nextId: number };
  const idx = data.products.findIndex((p: Product) => p.id === id);
  if (idx === -1) return false;
  data.products.splice(idx, 1);
  await dbRef.write?.();
  return true;
}

// Bonus: batch update - accept array of ids or a filter and an update object
export async function batchUpdate(ids: number[] | null, updateFields: Record<string, unknown>, dbRef: DBRef = db as unknown as DBRef) {
  await dbRef.read?.();
  const data = dbRef.data ||= { products: [], nextId: 1 } as { products: Product[]; nextId: number };
  const targets = ids ? data.products.filter((p: Product) => ids.includes(p.id)) : data.products;
  for (const p of targets) {
    Object.entries(updateFields).forEach(([k, v]) => {
      // never allow id to be changed via batch update
      if (k === "id") return;
      // relative update handling for numeric fields expressed as string: "+=10" or "-=%"
      const current = (p as unknown as Record<string, unknown>)[k];
      if (typeof v === "string" && /^([+\-]=)/.test(v) && typeof current === "number") {
        const op = v.slice(0, 2);
        const val = Number(v.slice(2));
        if (!isNaN(val)) {
          if (op === "+=") (p as unknown as Record<string, unknown>)[k] = (current as number) + val;
          if (op === "-=") (p as unknown as Record<string, unknown>)[k] = (current as number) - val;
        }
      } else {
        (p as unknown as Record<string, unknown>)[k] = v;
      }
    });
  }
  await dbRef.write?.();
    // ensure returned objects have id ordered first
    return targets.map((t) => orderProduct(t));
}

  // Helper: return a new object with `id` as the first key for consistent client display
  function orderProduct(p: Product): Product {
    // place id first, then other keys in insertion order
    const { id, ...rest } = p as Record<string, unknown>;
    return Object.assign({ id }, rest) as Product;
  }

// HTTP router handler
// routerHandler moved to ./router.ts for clarity
