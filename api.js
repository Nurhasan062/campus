import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fetchClubs = (params = {}) => api.get("/clubs", { params }).then((r) => r.data);
export const fetchClub = (id) => api.get(`/clubs/${id}`).then((r) => r.data);
export const fetchEvents = (params = {}) => api.get("/events", { params }).then((r) => r.data);
export const fetchEvent = (id) => api.get(`/events/${id}`).then((r) => r.data);
export const fetchAnnouncements = (params = {}) => api.get("/announcements", { params }).then((r) => r.data);
export const fetchStats = () => api.get("/stats").then((r) => r.data);
export const postMembership = (payload) => api.post("/membership-requests", payload).then((r) => r.data);
export const postRSVP = (payload) => api.post("/rsvps", payload).then((r) => r.data);
