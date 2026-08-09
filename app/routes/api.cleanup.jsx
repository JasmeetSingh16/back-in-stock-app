import db from "../db.server";

export const action = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CLEANUP_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const deleted = await db.waitlistSignup.deleteMany({
    where: {
      createdAt: { lt: twelveMonthsAgo },
    },
  });

  console.log(`🧹 Cleanup: deleted ${deleted.count} stale signup(s)`);

  return new Response(JSON.stringify({ deleted: deleted.count }), {
    headers: { "Content-Type": "application/json" },
  });
};