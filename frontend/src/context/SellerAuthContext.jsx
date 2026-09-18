import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const SellerAuthContext = createContext(null);

export const useSellerAuth = () => useContext(SellerAuthContext);

export function SellerAuthProvider({ children }) {
  const [seller, setSeller] = useState(() => {
    try {
      const stored = localStorage.getItem("seller_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Verify and sync seller session with backend on mount
  useEffect(() => {
    const token = localStorage.getItem("seller_token");
    if (!token) {
      setSeller(null);
      localStorage.removeItem("seller_user");
      return;
    }

    api
      .get("/sellers/profile")
      .then((res) => {
        if (res.data?.data) {
          setSeller(res.data.data);
          localStorage.setItem("seller_user", JSON.stringify(res.data.data));
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("seller_token");
          localStorage.removeItem("seller_user");
          setSeller(null);
        }
      });
  }, []);

  const login = async (username, password) => {
    // Clear stale cached credentials before sending login request
    localStorage.removeItem("seller_token");
    localStorage.removeItem("seller_user");

    const { data } = await api.post("/sellers/auth/login", {
      username: username.trim(),
      password,
    });

    if (data.token) {
      localStorage.setItem("seller_token", data.token);
    }
    if (data.user) {
      localStorage.setItem("seller_user", JSON.stringify(data.user));
      setSeller(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/sellers/auth/logout");
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("seller_token");
      localStorage.removeItem("seller_user");
      setSeller(null);
    }
  };

  const updateSeller = (updatedUser) => {
    localStorage.setItem("seller_user", JSON.stringify(updatedUser));
    setSeller(updatedUser);
  };

  return (
    <SellerAuthContext.Provider value={{ seller, login, logout, updateSeller }}>
      {children}
    </SellerAuthContext.Provider>
  );
}
