// lowdb wrapper for Deno using esm.sh
import { Low, JSONFile } from "https://esm.sh/lowdb@3.0.0";

const file = new JSONFile("./data.json");
export const db = new Low(file);

// initialize DB on import
await db.read();
if (!db.data) {
  db.data = { products: [], nextId: 1 };
  await db.write();
}

export async function writeDb() {
  await db.write();
}
