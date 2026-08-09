import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload } = await authenticate.webhook(request);
  const { customer } = payload;

  const deleted = await db.waitlistSignup.deleteMany({
    where: { shopDomain: shop, email: customer.email },
  });

  console.log(`Redacted ${deleted.count} signup(s) for ${customer.email}`);

  return new Response();
};