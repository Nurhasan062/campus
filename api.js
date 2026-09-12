import axios from "axios";
import { sampleClubs, getSampleClub } from "./data/clubs.js";
import { sampleEvents, getSampleEvent } from "./data/events.js";
import { sampleAnnouncements } from "./data/announcements.js";

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
export const fetchEvents = (params = {}) => api.get("/events", { params }).then((r) => filterEvents([...r.data, ...readLocal("campuspulse-admin-events"), ...sampleEvents], params)).catch(() => filterEvents([...readLocal("campuspulse-admin-events"), ...sampleEvents], params));
export const fetchEvent = (id) => api.get(`/events/${id}`).then((r) => r.data).catch(() => readLocal("campuspulse-admin-events").find((event) => event.id === id) || getSampleEvent(id));
export const fetchAnnouncements = (params = {}) => api.get("/announcements", { params }).then((r) => [...r.data, ...sampleAnnouncements]).catch(() => sampleAnnouncements);
export const fetchStats = () => api.get("/stats").then((r) => r.data);
export const postMembership = (payload) => api.post("/membership-requests", payload).then((r) => r.data);
export const postRSVP = (payload) => api.post("/rsvps", payload).then((r) => r.data);
export const postClub = (payload) => api.post("/clubs", payload).then((r) => r.data);
export const postEvent = (payload) => api.post("/events", payload).then((r) => r.data);

function readLocal(key) {
	try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

function filterEvents(events, params = {}) {
	const search = (params.search || "").toLowerCase();
	return events.filter((event) => {
		const matchesType = !params.event_type || event.event_type === params.event_type;
		const matchesClub = !params.club_id || event.organizer_club_id === params.club_id;
		const searchable = [event.title, event.description, event.venue, ...(event.tags || [])].join(" ").toLowerCase();
		return matchesType && matchesClub && (!search || searchable.includes(search));
	});
}
