import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`🔔 Compliance webhook: ${topic} for ${shop}`);

  switch (topic) {
    case "customers/data_request": {
      const { customer } = payload;
      const signups = await db.waitlistSignup.findMany({
        where: { shopDomain: shop, email: customer.email },
      });
      console.log(`Data request for ${customer.email}: ${signups.length} records found`);
      break;
    }

    case "customers/redact": {
      const { customer } = payload;
      const deleted = await db.waitlistSignup.deleteMany({
        where: { shopDomain: shop, email: customer.email },
      });
      console.log(`Redacted ${deleted.count} signup(s) for ${customer.email}`);
      break;
    }

    case "shop/redact": {
      const deleted = await db.waitlistSignup.deleteMany({
        where: { shopDomain: shop },
      });
      console.log(`Shop redact: deleted ${deleted.count} signup(s) for ${shop}`);
      break;
    }
  }

  return new Response();
};