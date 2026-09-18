import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../../api/client";
import AdminTable from "./AdminTable";
import AdminPagination from "../../components/common/AdminPagination";
import { getImageUrl } from "../../utils/imageUrl";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80";

const emptyForm = {
  id: null,
  name: "",
  slug: "",
  category_id: "",
  seller_id: "",
  price: "",
  weight: "",
  gender: "Non Selection",
  breed: "",
  delivery_time: "",
  stock_quantity: "1",
  color: "Non Selection",
  milk_capacity_min: "",
  milk_capacity_max: "",
  age: "",
  lactation: "",
  availability: "available",
  short_description: "",
  description: "",
  featured_image: null,
  previewImage: "",
};

const Products = forwardRef(function Products({ categories = [] }, ref) {
  const [items, setItems] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [filterSeller, setFilterSeller] = useState("all");
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });

  // Searchable & Auto-retrievable Seller Selector State
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerSearchText, setSellerSearchText] = useState("");
  const [sellerSearchResults, setSellerSearchResults] = useState([]);
  const [isSellerDropdownOpen, setIsSellerDropdownOpen] = useState(false);
  const [searchingSellers, setSearchingSellers] = useState(false);

  const fileInputRef = useRef(null);
  const sellerDropdownRef = useRef(null);

  // Load initial batch of sellers
  useEffect(() => {
    api
      .get("/admin/sellers", { params: { limit: 100 } })
      .then((res) => {
        const list =
          res.data?.data?.data ||
          (Array.isArray(res.data?.data) ? res.data.data : []);
        setSellers(list);
        setSellerSearchResults(list);
      })
      .catch((err) => console.error("Error loading sellers:", err));
  }, []);

  // Close seller dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sellerDropdownRef.current &&
        !sellerDropdownRef.current.contains(e.target)
      ) {
        setIsSellerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live searchable sellers query (debounced)
  useEffect(() => {
    if (!isSellerDropdownOpen) return;
    const query = sellerSearchText.trim();
    if (!query) {
      setSellerSearchResults(sellers);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingSellers(true);
      try {
        const res = await api.get("/admin/sellers", {
          params: { search: query, limit: 30 },
        });
        const list =
          res.data?.data?.data ||
          (Array.isArray(res.data?.data) ? res.data.data : []);
        setSellerSearchResults(list);
      } catch (err) {
        // Fallback to local filter
        const lower = query.toLowerCase();
        const filtered = sellers.filter(
          (s) =>
            s.name?.toLowerCase().includes(lower) ||
            s.business_name?.toLowerCase().includes(lower) ||
            s.username?.toLowerCase().includes(lower) ||
            s.phone?.includes(lower) ||
            s.city?.toLowerCase().includes(lower),
        );
        setSellerSearchResults(filtered);
      } finally {
        setSearchingSellers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [sellerSearchText, isSellerDropdownOpen, sellers]);

  const fetchProducts = useCallback(
    async (
      page = 1,
      search = searchQuery,
      cat = filterCat,
      avail = filterAvailability,
      seller = filterSeller,
    ) => {
      try {
        setLoading(true);
        const params = { page, limit: 10 };
        if (search && search.trim()) params.search = search.trim();
        if (cat && cat !== "all") params.category_id = cat;
        if (avail && avail !== "all") params.availability = avail;
        if (seller && seller !== "all") params.seller_id = seller;

        const res = await api.get("/admin/products", { params });
        const resData = res.data?.data || {};

        setItems(resData.data || (Array.isArray(resData) ? resData : []));
        setPagination({
          page: resData.current_page || page,
          limit: resData.per_page || 10,
          total: resData.total || 0,
          lastPage: resData.last_page || 1,
        });
      } catch (err) {
        console.error("Products load error:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, filterCat, filterAvailability, filterSeller],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(
        1,
        searchQuery,
        filterCat,
        filterAvailability,
        filterSeller,
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    filterCat,
    filterAvailability,
    filterSeller,
    fetchProducts,
  ]);

  // Expose openAdd() for external triggers
  useImperativeHandle(ref, () => ({
    openAdd: () => openAddModal(),
  }));

  const openAddModal = () => {
    setSelectedSeller(null);
    setSellerSearchText("");
    setIsSellerDropdownOpen(false);
    setForm({
      ...emptyForm,
      category_id: categories.length > 0 ? (categories[0].id || categories[0]._id) : "",
      seller_id: "",
    });
  };

  // Open Edit Modal with AUTO-RETRIEVAL of assigned seller
  const openEditModal = async (p) => {
    const rawSeller = p.seller_id;
    let sObj = null;

    if (rawSeller && typeof rawSeller === "object") {
      sObj = rawSeller;
    } else if (rawSeller && typeof rawSeller === "string") {
      // Find in existing loaded sellers
      const found = sellers.find((s) => (s.id || s._id) === rawSeller);
      if (found) {
        sObj = found;
      } else {
        // Auto-retrieve from backend seller API so admin always sees the seller
        try {
          const res = await api.get(`/admin/sellers/${rawSeller}`);
          if (res.data?.data) {
            sObj = res.data.data;
          }
        } catch (e) {
          console.error("Failed to auto-retrieve seller details for product:", e);
        }
      }
    }

    setSelectedSeller(sObj);
    setSellerSearchText("");
    setIsSellerDropdownOpen(false);

    setForm({
      id: p.id || p._id,
      name: p.name || "",
      slug: p.slug || "",
      category_id:
        p.category_id?._id ||
        p.category_id ||
        (categories[0]?.id || categories[0]?._id || ""),
      seller_id: sObj ? (sObj.id || sObj._id) : (typeof rawSeller === "string" ? rawSeller : ""),
      price: p.price ?? "",
      weight: p.weight || "",
      gender: p.gender || "Non Selection",
      breed: p.breed || "",
      delivery_time: p.delivery_time || "",
      stock_quantity: p.stock_quantity ?? p.quantity ?? "1",
      color: p.color || "Non Selection",
      milk_capacity_min: p.milk_capacity_min ?? "",
      milk_capacity_max: p.milk_capacity_max ?? "",
      age: p.age ?? "",
      lactation: p.lactation || "",
      availability: p.availability || "available",
      short_description: p.short_description || "",
      description: p.description || "",
      featured_image: null,
      previewImage: p.featured_image ? getImageUrl(p.featured_image) : "",
    });
  };

  const handleTitleChange = (val) => {
    setForm((prev) => {
      const updates = { ...prev, name: val };
      if (!prev.id) {
        updates.slug = val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updates;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        featured_image: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleSelectSeller = (seller) => {
    if (seller === "none") {
      setSelectedSeller(null);
      setForm((prev) => ({ ...prev, seller_id: "" }));
    } else {
      setSelectedSeller(seller);
      setForm((prev) => ({ ...prev, seller_id: seller.id || seller._id }));
    }
    setIsSellerDropdownOpen(false);
    setSellerSearchText("");
  };

  const handleClearSeller = () => {
    setSelectedSeller(null);
    setForm((prev) => ({ ...prev, seller_id: "" }));
    setSellerSearchText("");
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Product title is required.");
      return;
    }
    if (!form.category_id) {
      alert("Please select a category.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("slug", form.slug?.trim() || form.name.trim());
      fd.append("category_id", form.category_id);
      fd.append(
        "seller_id",
        selectedSeller
          ? selectedSeller.id || selectedSeller._id
          : form.seller_id || "",
      );
      fd.append("price", form.price || "");
      fd.append("weight", form.weight || "");
      fd.append("gender", form.gender || "Non Selection");
      fd.append("breed", form.breed || "");
      fd.append("delivery_time", form.delivery_time || "");
      fd.append("stock_quantity", form.stock_quantity || "1");
      fd.append("color", form.color || "Non Selection");
      fd.append("milk_capacity_min", form.milk_capacity_min || "");
      fd.append("milk_capacity_max", form.milk_capacity_max || "");
      fd.append("age", form.age || "");
      fd.append("lactation", form.lactation || "");
      fd.append("availability", form.availability || "available");
      fd.append("short_description", form.short_description || "");
      fd.append("description", form.description || "");

      if (form.featured_image instanceof File) {
        fd.append("featured_image", form.featured_image);
      }

      if (form.id) {
        fd.append("_method", "PUT");
        await api.post(`/admin/products/${form.id}`, fd);
      } else {
        await api.post("/admin/products", fd);
      }
      setForm(null);
      fetchProducts(
        pagination.page,
        searchQuery,
        filterCat,
        filterAvailability,
        filterSeller,
      );
    } catch (err) {
      alert(
        "Error saving listing: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this cattle listing?")
    ) {
      try {
        await api.delete(`/admin/products/${id}`);
        fetchProducts(
          pagination.page,
          searchQuery,
          filterCat,
          filterAvailability,
          filterSeller,
        );
      } catch (err) {
        alert(
          "Error deleting listing: " +
            (err.response?.data?.message || err.message),
        );
      }
    }
  };

  const handlePageChange = (newPage) => {
    fetchProducts(
      newPage,
      searchQuery,
      filterCat,
      filterAvailability,
      filterSeller,
    );
  };

  return (
    <>
      <div className="admin-card">
        {/* Card Header: Title & Actions */}
        <div
          className="admin-card-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              All Cattle Listings ({pagination.total})
            </h2>
            <small style={{ color: "#64748b", fontSize: "12px" }}>
              Manage cattle inventory, breeds, assigned sellers, milk capacity, and status
            </small>
          </div>

          <button
            type="button"
            className="admin-action-btn-primary"
            onClick={openAddModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              fontWeight: 700,
            }}
          >
            <span>＋</span>
            <span>Add New Cow</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 24px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            flexWrap: "nowrap",
            overflowX: "auto",
          }}
        >
          {/* Search Input */}
          <div style={{ flex: "1 1 240px", minWidth: "200px" }}>
            <input
              type="text"
              placeholder="🔍 Search cow name, breed, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "13px",
                outline: "none",
                background: "#ffffff",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
              background: "#ffffff",
              cursor: "pointer",
              minWidth: "140px",
              flexShrink: 0,
            }}
          >
            <option value="">All Categories</option>
            {(categories || []).map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Seller Filter */}
          <select
            value={filterSeller}
            onChange={(e) => setFilterSeller(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
              background: "#ffffff",
              cursor: "pointer",
              minWidth: "150px",
              flexShrink: 0,
            }}
          >
            <option value="all">All Sellers</option>
            {sellers.map((s) => (
              <option key={s.id || s._id} value={s.id || s._id}>
                {s.business_name || s.name}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
              background: "#ffffff",
              cursor: "pointer",
              minWidth: "130px",
              flexShrink: 0,
            }}
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
          </select>

          {/* Reset Filters button */}
          {(searchQuery ||
            filterCat ||
            filterAvailability !== "all" ||
            filterSeller !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterCat("");
                setFilterAvailability("all");
                setFilterSeller("all");
              }}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                background: "#ffffff",
                color: "#dc2626",
                cursor: "pointer",
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="Reset filters"
            >
              ✕ Clear
            </button>
          )}
        </div>

        <AdminTable products={items} edit={openEditModal} remove={remove} />

        <AdminPagination
          currentPage={pagination.page}
          lastPage={pagination.lastPage}
          total={pagination.total}
          perPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      </div>

      {/* ─── ADD / EDIT COW MODAL ────────────────────────────────────── */}
      {form && (
        <div
          className="admin-modal-overlay"
          onClick={() => !saving && setForm(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            className="admin-modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#f4f6f9",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "1040px",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "#1e293b",
                color: "#ffffff",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #334155",
                flexShrink: 0,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "#ffffff",
                  }}
                >
                  {form.id ? "Edit Cattle Listing" : "Add New Cow Listing"}
                </h3>
                <small style={{ color: "#94a3b8", fontSize: "12px" }}>
                  Fill out cattle specifications and assign to a registered seller
                </small>
              </div>

              <button
                type="button"
                onClick={() => setForm(null)}
                disabled={saving}
                style={{
                  background: "transparent",
                  color: "#94a3b8",
                  border: "none",
                  fontSize: "20px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "4px 8px",
                  lineHeight: 1,
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <form onSubmit={saveProduct}>
                {/* ─── CARD 1: PRODUCT DETAILS (Matching Reference) ──── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 18px",
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#0f172a",
                    }}
                  >
                    Product Details
                  </div>

                  <div style={{ padding: "18px 20px" }}>
                    {/* Row 1: Title | Slug */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Product Title *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter here category name"
                          value={form.name}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Type Product Slug Here
                        </label>
                        <div style={{ display: "flex" }}>
                          <span
                            style={{
                              background: "#e2e8f0",
                              color: "#475569",
                              padding: "8px 12px",
                              fontSize: "13px",
                              fontWeight: 600,
                              border: "1px solid #cbd5e1",
                              borderRight: "none",
                              borderRadius: "4px 0 0 4px",
                            }}
                          >
                            Slug/
                          </span>
                          <input
                            type="text"
                            placeholder="Slug"
                            value={form.slug}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                slug: e.target.value,
                              }))
                            }
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "0 4px 4px 0",
                              fontSize: "13.5px",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Price | Weight */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Product Price
                        </label>
                        <input
                          type="number"
                          placeholder="Enter here product price"
                          value={form.price}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              price: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Weight
                        </label>
                        <input
                          type="text"
                          placeholder="Kilogram / kg"
                          value={form.weight}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              weight: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>

                    {/* Row 3: Gender */}
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#334155",
                          marginBottom: "6px",
                        }}
                      >
                        Gender
                      </label>
                      <select
                        value={form.gender}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          background: "#fff",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="Non Selection">Non Selection</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Heifer">Heifer</option>
                        <option value="Milking Cow">Milking Cow</option>
                        <option value="Pregnant Cow">Pregnant Cow</option>
                        <option value="Bull">Bull</option>
                        <option value="Calf">Calf</option>
                      </select>
                    </div>

                    {/* Row 4: Breed | Delivery Time */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Breed
                        </label>
                        <input
                          type="text"
                          placeholder="Enter here product breed"
                          value={form.breed}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              breed: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Delivery Time
                        </label>
                        <input
                          type="text"
                          placeholder="Type here delivery time"
                          value={form.delivery_time}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              delivery_time: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>

                    {/* Row 5: Stock Quantity | Color */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          placeholder="Enter here stock Quantity"
                          value={form.stock_quantity}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              stock_quantity: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Color
                        </label>
                        <select
                          value={form.color}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            background: "#fff",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="Non Selection">Non Selection</option>
                          <option value="Black">Black</option>
                          <option value="White">White</option>
                          <option value="Brown">Brown</option>
                          <option value="Black & White">Black & White</option>
                          <option value="Red Sindhi">Red Sindhi</option>
                          <option value="Spotted">Spotted</option>
                          <option value="Grey">Grey</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 6: Milk Capacity Min | Max */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Milk Capacity Min (L/day)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 15"
                          value={form.milk_capacity_min}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              milk_capacity_min: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Milk Capacity Max (L/day)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 25"
                          value={form.milk_capacity_max}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              milk_capacity_max: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>

                    {/* Row 7: Age | Lactation */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Age
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 3.5 Years / 3"
                          value={form.age}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              age: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Lactation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 1st Lactation / 2nd"
                          value={form.lactation}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              lactation: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>

                    {/* Row 8: Product Image */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#334155",
                          marginBottom: "6px",
                        }}
                      >
                        Product Image
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          background: "#fff",
                          cursor: "pointer",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            background: "#e2e8f0",
                            padding: "8px 14px",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            borderRight: "1px solid #cbd5e1",
                          }}
                        >
                          Choose file
                        </div>
                        <div
                          style={{
                            padding: "8px 14px",
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          {form.featured_image
                            ? form.featured_image.name
                            : "No file chosen"}
                        </div>
                      </div>

                      {form.previewImage && (
                        <div style={{ marginTop: "10px" }}>
                          <img
                            src={form.previewImage}
                            alt="Product Preview"
                            style={{
                              width: "90px",
                              height: "90px",
                              borderRadius: "6px",
                              objectFit: "cover",
                              border: "1px solid #cbd5e1",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── CARD 2: ASSIGN CATEGORY & SEARCHABLE SELLER ───── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 18px",
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#0f172a",
                    }}
                  >
                    Assign Category & Seller
                  </div>

                  <div style={{ padding: "18px 20px" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                        marginBottom: "16px",
                      }}
                    >
                      {/* Category */}
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Assign Main Category *
                        </label>
                        <select
                          value={form.category_id}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              category_id: e.target.value,
                            }))
                          }
                          required
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "13.5px",
                            background: "#fff",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => {
                            const cId = c.id || c._id;
                            return (
                              <option key={cId} value={cId}>
                                {c.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Searchable & Auto-Retrievable Seller Selector */}
                      <div ref={sellerDropdownRef} style={{ position: "relative" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#0369a1",
                            marginBottom: "6px",
                          }}
                        >
                          Assign Seller / Dairy Farm Partner *
                        </label>

                        {/* If a seller is already selected (auto-retrieved or chosen) */}
                        {selectedSeller ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                              background: "#f0fdf4",
                              border: "1.5px solid #86efac",
                              borderRadius: "6px",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={getImageUrl(selectedSeller.avatar, DEFAULT_AVATAR)}
                                alt={selectedSeller.name}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1.5px solid #22c55e",
                                  flexShrink: 0,
                                }}
                              />
                              <div style={{ overflow: "hidden" }}>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: "13.5px",
                                    color: "#14532d",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {selectedSeller.business_name || selectedSeller.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#166534",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  👤 {selectedSeller.name} (@{selectedSeller.username || "seller"})
                                  {[selectedSeller.city, selectedSeller.state].filter(Boolean).length > 0 &&
                                    ` • 📍 ${[selectedSeller.city, selectedSeller.state].filter(Boolean).join(", ")}`}
                                  {selectedSeller.phone ? ` • 📞 ${selectedSeller.phone}` : ""}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleClearSeller}
                              style={{
                                background: "#fee2e2",
                                color: "#dc2626",
                                border: "1px solid #fca5a5",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                              title="Change or Clear Seller"
                            >
                              ✕ Change
                            </button>
                          </div>
                        ) : (
                          <div>
                            {/* Search Input */}
                            <div style={{ position: "relative" }}>
                              <input
                                type="text"
                                placeholder="🔍 Search seller by farm, name, username, city, or phone..."
                                value={sellerSearchText}
                                onFocus={() => setIsSellerDropdownOpen(true)}
                                onChange={(e) => {
                                  setSellerSearchText(e.target.value);
                                  setIsSellerDropdownOpen(true);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  paddingRight: "30px",
                                  border: "1.5px solid #0284c7",
                                  borderRadius: "4px",
                                  fontSize: "13.5px",
                                  background: "#f0f9ff",
                                  color: "#0f172a",
                                  boxSizing: "border-box",
                                }}
                              />
                              {searchingSellers && (
                                <span
                                  style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: "11px",
                                    color: "#0284c7",
                                  }}
                                >
                                  ⏳
                                </span>
                              )}
                            </div>

                            {/* Dropdown Suggestions Menu */}
                            {isSellerDropdownOpen && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: 0,
                                  right: 0,
                                  zIndex: 1000,
                                  background: "#ffffff",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                  maxHeight: "230px",
                                  overflowY: "auto",
                                  marginTop: "4px",
                                }}
                              >
                                {/* Direct In-House / No Seller Option */}
                                <div
                                  onClick={() => handleSelectSeller("none")}
                                  style={{
                                    padding: "8px 12px",
                                    borderBottom: "1px solid #f1f5f9",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    color: "#64748b",
                                    fontWeight: 600,
                                    background: "#f8fafc",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                >
                                  🚫 -- Direct In-House / Sohani Farm (No Seller Assigned) --
                                </div>

                                {sellerSearchResults.length === 0 ? (
                                  <div
                                    style={{
                                      padding: "12px",
                                      textAlign: "center",
                                      color: "#94a3b8",
                                      fontSize: "12.5px",
                                    }}
                                  >
                                    No sellers found matching "{sellerSearchText}"
                                  </div>
                                ) : (
                                  sellerSearchResults.map((s) => {
                                    const sId = s.id || s._id;
                                    return (
                                      <div
                                        key={sId}
                                        onClick={() => handleSelectSeller(s)}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "10px",
                                          padding: "8px 12px",
                                          borderBottom: "1px solid #f8fafc",
                                          cursor: "pointer",
                                          transition: "background 0.1s ease",
                                        }}
                                        onMouseEnter={(e) =>
                                          (e.currentTarget.style.background = "#f0fdf4")
                                        }
                                        onMouseLeave={(e) =>
                                          (e.currentTarget.style.background = "#ffffff")
                                        }
                                      >
                                        <img
                                          src={getImageUrl(s.avatar, DEFAULT_AVATAR)}
                                          alt={s.name}
                                          style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "1px solid #cbd5e1",
                                            flexShrink: 0,
                                          }}
                                        />
                                        <div style={{ overflow: "hidden" }}>
                                          <div
                                            style={{
                                              fontSize: "13px",
                                              fontWeight: 700,
                                              color: "#0f172a",
                                            }}
                                          >
                                            {s.business_name || s.name}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "#64748b",
                                            }}
                                          >
                                            👤 {s.name} (@{s.username || "seller"})
                                            {s.city ? ` • 📍 ${s.city}` : ""}
                                            {s.phone ? ` • 📞 ${s.phone}` : ""}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <small
                          style={{
                            display: "block",
                            color: "#64748b",
                            fontSize: "11px",
                            marginTop: "4px",
                          }}
                        >
                          Auto-retrieves on edit. Search by seller name, farm, city, or phone to assign
                        </small>
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#334155",
                          marginBottom: "6px",
                        }}
                      >
                        Availability Status
                      </label>
                      <select
                        value={form.availability}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            availability: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          background: "#fff",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="reserved">Reserved</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ─── CARD 3: PRODUCT DESCRIPTION ───────────────────── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 18px",
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#0f172a",
                    }}
                  >
                    Product Description
                  </div>

                  <div style={{ padding: "18px 20px" }}>
                    {/* Short Description */}
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#334155",
                          marginBottom: "6px",
                        }}
                      >
                        Short Description
                      </label>
                      <input
                        type="text"
                        placeholder="Brief one-line summary of cattle or key selling point"
                        value={form.short_description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            short_description: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontSize: "13.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Full Description */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#334155",
                          marginBottom: "6px",
                        }}
                      >
                        Full Description
                      </label>

                      {/* Toolbar */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 10px",
                          background: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderBottom: "none",
                          borderRadius: "4px 4px 0 0",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              description: `${prev.description} <b>Text</b>`,
                            }))
                          }
                          style={{
                            padding: "4px 8px",
                            background: "#fff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "3px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              description: `${prev.description} <u>Text</u>`,
                            }))
                          }
                          style={{
                            padding: "4px 8px",
                            background: "#fff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "3px",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                        >
                          U
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              description: `${prev.description} <s>Text</s>`,
                            }))
                          }
                          style={{
                            padding: "4px 8px",
                            background: "#fff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "3px",
                            textDecoration: "line-through",
                            cursor: "pointer",
                          }}
                        >
                          S
                        </button>
                        <span style={{ color: "#cbd5e1" }}>|</span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              description: `${prev.description}\n• Point 1\n• Point 2`,
                            }))
                          }
                          style={{
                            padding: "4px 8px",
                            background: "#fff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "3px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              description: `${prev.description}\n1. Step 1\n2. Step 2`,
                            }))
                          }
                          style={{
                            padding: "4px 8px",
                            background: "#fff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "3px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          1. Numbered
                        </button>
                      </div>

                      <textarea
                        rows={6}
                        placeholder="Enter complete description of the cattle..."
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "0 0 4px 4px",
                          fontSize: "13.5px",
                          lineHeight: "1.6",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit & Cancel Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    marginTop: "16px",
                  }}
                >
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: "#0d6efd",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: saving ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 4px rgba(13, 110, 253, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {saving && (
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          border: "2px solid #fff",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    )}
                    <span>
                      {saving
                        ? "Saving..."
                        : form.id
                          ? "Update Cattle Listing"
                          : "Submit"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm(null)}
                    disabled={saving}
                    style={{
                      background: "#e2e8f0",
                      color: "#334155",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Products;
