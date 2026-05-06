import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AppDetail from "@/pages/AppDetail";
import Search from "@/pages/Search";
import Category from "@/pages/Category";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
