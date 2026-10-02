/* Netlify Blobs stores (site-wide, private: never served publicly).
   - "books":  the PDF/EPUB files, key = file name (uploaded by
               scripts/upload-books.mjs from ~/Desktop/nava-libri/releases).
   - "orders": one JSON record per paid Checkout Session, key = session id.
               No personal data: the buyer's email stays in Stripe. */
import { getStore } from '@netlify/blobs';

export const booksStore = () => getStore({ name: 'books', consistency: 'strong' });
export const ordersStore = () => getStore({ name: 'orders', consistency: 'strong' });

export async function getOrder(id) {
  return ordersStore().get(id, { type: 'json' });
}

export async function saveOrder(order) {
  await ordersStore().setJSON(order.id, order);
}
