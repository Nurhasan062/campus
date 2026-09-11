import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Clubs from "@/pages/Clubs";
import ClubDetail from "@/pages/ClubDetail";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Announcements from "@/pages/Announcements";

export default function App() {
  return (
    <div className="App">
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/clubs/:id" element={<ClubDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/announcements" element={<Announcements />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
