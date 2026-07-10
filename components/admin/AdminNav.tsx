import Link from "next/link";

const links = [
  ["Overview", "/admin"],
  ["RFQs", "/admin/rfqs"],
  ["Suppliers", "/admin/suppliers"],
  ["Quotes", "/admin/quotes"],
] as const;

export function AdminNav() {
  return (
    <nav className="mb-7 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3" aria-label="Operations navigation">
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
