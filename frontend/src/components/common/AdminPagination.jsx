export default function AdminPagination({
  currentPage = 1,
  lastPage = 1,
  total = 0,
  perPage = 10,
  onPageChange,
}) {
  if (total <= 0) return null;

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(lastPage, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "16px 20px",
        borderTop: "1px solid #e2e8f0",
        background: "#fafafa",
        borderBottomLeftRadius: "8px",
        borderBottomRightRadius: "8px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
        Showing <b style={{ color: "#0f172a" }}>{start}</b> to{" "}
        <b style={{ color: "#0f172a" }}>{end}</b> of{" "}
        <b style={{ color: "#0f172a" }}>{total}</b> entries
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            background: currentPage <= 1 ? "#f1f5f9" : "#fff",
            color: currentPage <= 1 ? "#94a3b8" : "#1e293b",
            fontSize: "13px",
            fontWeight: 600,
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ‹ Prev
        </button>

        {/* Page Buttons */}
        {pages[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              style={{
                padding: "6px 11px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#1e293b",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              1
            </button>
            {pages[0] > 2 && (
              <span style={{ padding: "0 4px", color: "#94a3b8" }}>...</span>
            )}
          </>
        )}

        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              style={{
                padding: "6px 11px",
                borderRadius: "6px",
                border: isActive ? "1px solid #ff7600" : "1px solid #cbd5e1",
                background: isActive ? "#ff7600" : "#fff",
                color: isActive ? "#fff" : "#1e293b",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: isActive ? "0 1px 3px rgba(255,118,0,0.3)" : "none",
              }}
            >
              {p}
            </button>
          );
        })}

        {pages[pages.length - 1] < lastPage && (
          <>
            {pages[pages.length - 1] < lastPage - 1 && (
              <span style={{ padding: "0 4px", color: "#94a3b8" }}>...</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(lastPage)}
              style={{
                padding: "6px 11px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#1e293b",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {lastPage}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            background: currentPage >= lastPage ? "#f1f5f9" : "#fff",
            color: currentPage >= lastPage ? "#94a3b8" : "#1e293b",
            fontSize: "13px",
            fontWeight: 600,
            cursor: currentPage >= lastPage ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
