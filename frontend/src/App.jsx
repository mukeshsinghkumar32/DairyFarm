import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/public/Home";
import Products from "./pages/public/Products";
import ProductDetails from "./pages/public/ProductDetails";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import WhyUs from "./pages/public/WhyUs";
import Blog from "./pages/public/Blog";
import Consultancy from "./pages/public/Consultancy";
import FreeListing from "./pages/public/FreeListing";
import Advertise from "./pages/public/Advertise";
import SupplierDetails from "./pages/public/SupplierDetails";
import StateWiseCompany from "./pages/public/StateWiseCompany";
import SearchResults from "./pages/public/SearchResults";
import ScrollToTop from "./components/common/ScrollToTop";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import { SellerAuthProvider, useSellerAuth } from "./context/SellerAuthContext";
import SellerLayout from "./pages/seller/SellerLayout";
import SellerLogin from "./pages/seller/SellerLogin";
import SellerRegister from "./pages/seller/SellerRegister";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerBanner from "./pages/seller/SellerBanner";
import SellerAbout from "./pages/seller/SellerAbout";
import SellerAddProduct from "./pages/seller/SellerAddProduct";
import SellerEditProduct from "./pages/seller/SellerEditProduct";
import SellerManageProducts from "./pages/seller/SellerManageProducts";
import SellerContact from "./pages/seller/SellerContact";

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/admin/login" replace />;
}

function SellerProtected({ children }) {
  const { seller } = useSellerAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("seller_token") : null;
  return seller || token ? children : <Navigate to="/seller/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <SellerAuthProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/pashu" element={<Products />} />
            <Route path="/pashu/category/:slug" element={<Products />} />
            <Route path="/pashu/:slug" element={<ProductDetails />} />
            <Route path="/products" element={<Navigate to="/pashu" replace />} />
            <Route path="/products/category/:slug" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/why-us" element={<WhyUs />} />
            <Route path="/blogs" element={<Blog />} />
            <Route path="/consultancy" element={<Consultancy />} />
            <Route path="/free-listing" element={<FreeListing />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/supplier/:id" element={<SupplierDetails />} />
            <Route path="/suppliers/:id" element={<SupplierDetails />} />
            <Route path="/seller/:id" element={<SupplierDetails />} />
            <Route path="/state-wise-company" element={<StateWiseCompany />} />
            <Route
              path="/state-wise-company/:state"
              element={<StateWiseCompany />}
            />
            <Route path="/search" element={<SearchResults />} />
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
            <Route path="sellers" element={null} />
            <Route path="products" element={null} />
            <Route path="categories" element={null} />
            <Route path="enquiries" element={null} />
            <Route path="supplier-inquiries" element={null} />
            <Route path="requirements" element={null} />
            <Route path="contacts" element={null} />
          </Route>

          {/* ─── SELLER PORTAL ────────────────────────────────────────── */}
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/register" element={<SellerRegister />} />
          <Route
            path="/seller/create-account"
            element={<Navigate to="/seller/register" replace />}
          />
          <Route
            path="/seller"
            element={
              <SellerProtected>
                <SellerLayout />
              </SellerProtected>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="banner" element={<SellerBanner />} />
            <Route path="about-us" element={<SellerAbout />} />
            <Route path="products" element={<Navigate to="manage" replace />} />
            <Route path="products/add" element={<SellerAddProduct />} />
            <Route path="products/edit/:id" element={<SellerEditProduct />} />
            <Route path="products/manage" element={<SellerManageProducts />} />
            <Route path="contact" element={<SellerContact />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SellerAuthProvider>
    </AuthProvider>
  );
}
