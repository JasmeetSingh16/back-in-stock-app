import { data } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  const { admin } = await authenticate.public.appProxy(request);

  const body = await request.json();
  const { productId, variantId, email, shop } = body;

  if (!email || !productId || !shop || !admin) {
    return data({ error: "Missing required fields" }, { status: 400 });
  }

  // Resolve inventoryItemId via Admin API
  const variantResponse = await admin.graphql(
    `#graphql
    query getVariant($id: ID!) {
      productVariant(id: $id) {
        inventoryItem {
          id
        }
      }
    }`,
    { variables: { id: `gid://shopify/ProductVariant/${variantId}` } }
  );
  const variantData = await variantResponse.json();
  const inventoryItemGid = variantData?.data?.productVariant?.inventoryItem?.id;
  const inventoryItemId = inventoryItemGid ? inventoryItemGid.split("/").pop() : null;

  await db.waitlistSignup.upsert({
    where: {
      shopDomain_productId_email: {
        shopDomain: shop,
        productId,
        email,
      },
    },
    update: {
      // Re-signing up (e.g. after already being notified once) puts them back on the list
      notifiedAt: null,
      variantId,
      inventoryItemId,
    },
    create: {
      shopDomain: shop,
      productId,
      variantId,
      inventoryItemId,
      email,
    },
  });

  return data({ success: true });
};