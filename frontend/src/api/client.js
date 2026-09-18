import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
});
api.interceptors.request.use((config) => {
  const isAuthEndpoint =
    config.url &&
    (config.url.includes("/auth/login") ||
      config.url.includes("/auth/send-register-otp") ||
      config.url.includes("/auth/verify-register-otp") ||
      config.url.includes("/admin/login"));

  if (isAuthEndpoint) {
    delete config.headers.Authorization;
    return config;
  }

  const isSellerReq =
    (config.url && config.url.includes("/sellers")) ||
    (typeof window !== "undefined" &&
      window.location.pathname.startsWith("/seller"));

  const sellerToken = localStorage.getItem("seller_token");
  const adminToken = localStorage.getItem("admin_token");

  if (isSellerReq && sellerToken) {
    config.headers.Authorization = `Bearer ${sellerToken}`;
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (sellerToken) {
    config.headers.Authorization = `Bearer ${sellerToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      const isSeller =
        (e.config?.url && e.config.url.includes("/sellers")) ||
        (typeof window !== "undefined" &&
          window.location.pathname.startsWith("/seller"));

      if (isSeller) {
        localStorage.removeItem("seller_token");
        localStorage.removeItem("seller_user");
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/seller/login")
        ) {
          window.location.href = "/seller/login";
        }
      } else {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/admin/login")
        ) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(e);
  },
);
export default api;
