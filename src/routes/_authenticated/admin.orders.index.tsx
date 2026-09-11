import { createFileRoute, Link } from "@tanstack/react-router";
import { OrderStatusChip } from "@/components/StatusChip";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/_authenticated/admin/orders/")({
  head: () => ({
    meta: [
      { title: "Orders | Kvaliteetaken admin" },
      { name: "description", content: "Production orders and their status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { orders } = useStore();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Size</th>
              <th className="px-5 py-3 font-medium">Active side</th>
              <th className="px-5 py-3 font-medium">Order date</th>
              <th className="px-5 py-3 text-right font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Documents</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">{o.number}</td>
                <td className="px-5 py-3 text-muted-foreground">{o.customerName}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {o.lines[0]?.width} × {o.lines[0]?.height} mm
                </td>
                <td className="px-5 py-3 font-semibold text-foreground">
                  {o.lines[0]?.activeSide === "L" ? "LEFT" : "RIGHT"}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{o.orderDate}</td>
                <td className="px-5 py-3 text-right">
                  <OrderStatusChip status={o.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      to="/admin/orders/$orderId/production"
                      params={{ orderId: o.id }}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Production
                    </Link>
                    <Link
                      to="/admin/orders/$orderId/glass"
                      params={{ orderId: o.id }}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Glass
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
