import { authenticate } from "../shopify.server";
import db from "../db.server";
import { sendRestockEmail } from "../utils/email.server";

export const action = async ({ request }) => {
  console.log("🔔 Webhook route hit");

  const { shop, payload, admin } = await authenticate.webhook(request);

  console.log("✅ Authenticated. Shop:", shop);
  console.log("📦 Payload:", JSON.stringify(payload));

  const { inventory_item_id, available } = payload;

  if (available > 0) {
    const pendingSignups = await db.waitlistSignup.findMany({
      where: {
        shopDomain: shop,
        inventoryItemId: String(inventory_item_id),
        notifiedAt: null,
      },
    });

    console.log(`Found ${pendingSignups.length} pending signups`);

    if (pendingSignups.length > 0) {
      // Look up product name + handle from the inventory item
      let productName = "Your item";
      let productUrl = `https://${shop}`;

      try {
        const response = await admin.graphql(
          `#graphql
          query getProductFromInventoryItem($id: ID!) {
            inventoryItem(id: $id) {
              variant {
                product {
                  title
                  handle
                  onlineStoreUrl
                }
              }
            }
          }`,
          {
            variables: {
              id: `gid://shopify/InventoryItem/${inventory_item_id}`,
            },
          }
        );

        const data = await response.json();
        const product = data?.data?.inventoryItem?.variant?.product;

        if (product) {
          productName = product.title;
          productUrl = product.onlineStoreUrl || `https://${shop}/products/${product.handle}`;
        }

        console.log("🔎 Resolved product:", productName, productUrl);
      } catch (err) {
        console.error("⚠️ Failed to look up product, using fallback:", err);
      }

      for (const signup of pendingSignups) {
        try {
          await sendRestockEmail(signup.email, productName, productUrl);

          await db.waitlistSignup.update({
            where: { id: signup.id },
            data: { notifiedAt: new Date() },
          });

          console.log(`✅ Notified ${signup.email}`);
        } catch (err) {
          console.error(`❌ Failed to notify ${signup.email}:`, err);
        }
      }
    }
  } else {
    console.log("⚠️ Available is not > 0, skipping:", available);
  }

  return new Response();
};