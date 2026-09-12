import axios from "axios";
import { sampleClubs, getSampleClub } from "./data/clubs.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

function filterClubs(clubs, params = {}) {
	const search = (params.search || "").toLowerCase();
	return clubs.filter((club) => {
		const matchesCategory = !params.category || club.category === params.category;
		const searchable = [club.name, club.tagline, club.description, ...(club.tags || [])].join(" ").toLowerCase();
		return matchesCategory && (!search || searchable.includes(search));
	});
}

export const fetchClubs = (params = {}) => api.get("/clubs", { params })
	.then((r) => filterClubs([...r.data, ...readLocal("campuspulse-admin-clubs"), ...sampleClubs], params))
	.catch(() => filterClubs([...readLocal("campuspulse-admin-clubs"), ...sampleClubs], params));
export const fetchClub = (id) => api.get(`/clubs/${id}`).then((r) => r.data).catch(() => readLocal("campuspulse-admin-clubs").find((club) => club.id === id) || getSampleClub(id));
export const fetchEvents = (params = {}) => api.get("/events", { params }).then((r) => [...r.data, ...readLocal("campuspulse-admin-events")]).catch(() => readLocal("campuspulse-admin-events"));
export const fetchEvent = (id) => api.get(`/events/${id}`).then((r) => r.data);
export const fetchAnnouncements = (params = {}) => api.get("/announcements", { params }).then((r) => r.data);
export const fetchStats = () => api.get("/stats").then((r) => r.data);
export const postMembership = (payload) => api.post("/membership-requests", payload).then((r) => r.data);
export const postRSVP = (payload) => api.post("/rsvps", payload).then((r) => r.data);
export const postClub = (payload) => api.post("/clubs", payload).then((r) => r.data);
export const postEvent = (payload) => api.post("/events", payload).then((r) => r.data);

function readLocal(key) {
	try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
