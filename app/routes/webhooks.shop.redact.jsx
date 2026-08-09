import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop } = await authenticate.webhook(request);

  const deleted = await db.waitlistSignup.deleteMany({
    where: { shopDomain: shop },
  });

  console.log(`Shop redact: deleted ${deleted.count} signup(s) for ${shop}`);

  return new Response();
};