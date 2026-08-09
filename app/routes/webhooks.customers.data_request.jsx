import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload } = await authenticate.webhook(request);
  const { customer } = payload;

  const signups = await db.waitlistSignup.findMany({
    where: { shopDomain: shop, email: customer.email },
  });

  console.log(`Data request for ${customer.email}: ${signups.length} records found`);
  // Shopify just requires you to log/process this — no response body needed.
  // For a real store, you'd typically email the data to the merchant/customer per Shopify's docs.

  return new Response();
};