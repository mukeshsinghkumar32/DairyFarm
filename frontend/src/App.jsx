import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/public/Home";
import Products from "./pages/public/Products";
import ProductDetails from "./pages/public/ProductDetails";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/admin/login" replace />;
}
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/category/:slug" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/contact-us" element={<Contact />} />
        </Route>
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={null} />
          <Route path="products" element={null} />
          <Route path="categories" element={null} />
          <Route path="enquiries" element={null} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}
