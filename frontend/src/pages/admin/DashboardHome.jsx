import AdminTable from "./AdminTable";

export default function DashboardHome({ stats, products }) {
  return (
    <>
      <div className="stats">
        {[
          ["Total Cattle",  stats.total_products,     "♙"],
          ["Available",     stats.available_products, "✓"],
          ["Categories",   stats.total_categories,   "◫"],
          ["New Enquiries", stats.new_enquiries,      "✉"],
        ].map((x) => (
          <article key={x[0]}>
            <i>{x[2]}</i>
            <div>
              <small>{x[0]}</small>
              <b>{x[1] ?? 0}</b>
            </div>
          </article>
        ))}
      </div>
      <AdminTable
        products={(products ?? []).slice(0, 5)}
        readOnly
      />
    </>
  );
}
