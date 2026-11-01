import type { OrderStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const statusStyles: Record<OrderStatus, string> = {
  new: "bg-rose text-white",
  confirmed: "bg-[#E8DFF5] text-[#4A2E7A]",
  shipped: "bg-[#DCEBF7] text-[#1E4A70]",
  delivered: "bg-[#DDEFE2] text-success",
  cancelled: "bg-[#EEE6E8] text-mauve",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="m-0 font-serif text-[44px] font-medium leading-none">{title}</h1>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function Notice({ tone = "success", children }: { tone?: "success" | "error"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`m-0 mb-5 rounded-xl px-4 py-3 text-sm ${
        tone === "error" ? "bg-[#FCEDEF] text-danger" : "bg-[#E7F3EA] text-success"
      }`}
    >
      {children}
    </p>
  );
}
