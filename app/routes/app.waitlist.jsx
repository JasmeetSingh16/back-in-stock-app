import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  const signups = await db.waitlistSignup.groupBy({
    by: ["productId"],
    where: { shopDomain: shop },
    _count: { id: true },
  });

  const pendingCounts = await db.waitlistSignup.groupBy({
    by: ["productId"],
    where: { shopDomain: shop, notifiedAt: null },
    _count: { id: true },
  });

  const pendingMap = Object.fromEntries(
    pendingCounts.map((p) => [p.productId, p._count.id])
  );

  // Resolve product titles via Admin GraphQL
  const rows = await Promise.all(
    signups.map(async (s) => {
      let title = `Product ${s.productId}`;

      try {
        const response = await admin.graphql(
          `#graphql
          query getProduct($id: ID!) {
            product(id: $id) {
              title
            }
          }`,
          { variables: { id: `gid://shopify/Product/${s.productId}` } }
        );
        const data = await response.json();
        if (data?.data?.product?.title) {
          title = data.data.product.title;
        }
      } catch (err) {
        console.error(`Failed to resolve product ${s.productId}:`, err);
      }

      return {
        productId: s.productId,
        title,
        total: s._count.id,
        pending: pendingMap[s.productId] || 0,
      };
    })
  );

  return { rows };
};

export default function WaitlistDashboard() {
  const { rows } = useLoaderData();

  return (
    <s-page heading="Restock Waitlist">
      {rows.length === 0 ? (
        <s-card>
          <s-paragraph>
            No signups yet. Once customers sign up for restock alerts, you'll see them here.
          </s-paragraph>
        </s-card>
      ) : (
        <s-card>
          <s-table>
            <s-table-header-row>
              <s-table-header>Product</s-table-header>
              <s-table-header>Total signups</s-table-header>
              <s-table-header>Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {rows.map((r) => (
                <s-table-row key={r.productId}>
                  <s-table-cell>{r.title}</s-table-cell>
                  <s-table-cell>{r.total}</s-table-cell>
                  <s-table-cell>
                    {r.pending > 0 ? `${r.pending} waiting` : "All notified"}
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        </s-card>
      )}
    </s-page>
  );
}