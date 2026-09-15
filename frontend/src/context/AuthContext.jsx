import { createContext, useContext, useState } from "react";
import api from "../api/client";
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("admin_user") || "null"),
  );
  const login = async (email, password) => {
    const { data } = await api.post("/admin/login", { email, password });
    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin_user", JSON.stringify(data.user));
    setUser(data.user);
  };
  const logout = async () => {
    try {
      await api.post("/admin/logout");
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
