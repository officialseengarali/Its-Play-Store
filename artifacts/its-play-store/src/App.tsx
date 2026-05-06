import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AppDetail from "@/pages/AppDetail";
import Search from "@/pages/Search";
import Category from "@/pages/Category";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import Wishlist from "@/pages/Wishlist";
import AdminDashboard from "@/pages/admin/Dashboard";
import ManageApps from "@/pages/admin/ManageApps";
import AppForm from "@/pages/admin/AppForm";
import ManageCategories from "@/pages/admin/ManageCategories";

function App() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/:id" element={<AppDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category/:name" element={<Category />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/apps" element={<ManageApps />} />
        <Route path="/admin/apps/new" element={<AppForm />} />
        <Route path="/admin/apps/edit/:id" element={<AppForm />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/categories/new" element={<ManageCategories />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
