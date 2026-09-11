# CampusPulse — Centralized Student Club & Campus Information Platform

## Problem Statement
College students face difficulty discovering clubs and events on campus; information is scattered. Build a single, searchable, engagement-ready hub for clubs, events, announcements, and interest signals.

## User Choices (v1)
- Authentication: **None** (open browsing; forms capture name/email/dept/year)
- Full flow: club interest requests + event RSVPs
- Seed data: 9 clubs, 8 events, 6 announcements

## User Personas
- **New student**: quickly discovers clubs & events by interest
- **Active student**: RSVPs, tracks upcoming events
- **Club lead**: currently read-only (future: club-admin dashboards)

## Architecture
- Backend: FastAPI (`server.py`), PostgreSQL via Supabase, all routes under `/api`. Auto-creates tables and seeds an empty database at startup.
- Frontend: React + React Router + shadcn/ui + Tailwind + Sonner. Fonts: Outfit (display) + Plus Jakarta Sans (body) + JetBrains Mono (accents).
- Design archetype: Swiss High-Contrast Editorial × vibrant campus energy, light theme, glass header, marquee ticker.

## Data Models
- `Club` — name, tagline, description, category, eligibility, membership_process, meeting_schedule, contact_email, lead_name, image_url, tags[], member_count, founded_year
- `Event` — title, description, event_type, start_time, end_time, venue, organizer_club_id, organizer_name, capacity, registered_count, registration_status
- `Announcement` — title, body, category, is_pinned, posted_by
- `MembershipRequest` — club_id, name, email, department, academic_year, motivation, experience_level
- `EventRSVP` — event_id, name, email, department, academic_year, questions

## Routes (Frontend)
- `/` Home (hero, stats, ticker, featured clubs, upcoming events, announcements)
- `/clubs` + `/clubs/:id` (tabs: About / Eligibility / How to Join / Events)
- `/events` + `/events/:id` (countdown + RSVP)
- `/announcements`

## Implemented (Feb 2026)
- All backend endpoints (100% test pass)
- All frontend pages (100% test pass)
- Seed data auto-load on startup
- Search + category filters on Clubs and Events
- Sorted announcements with pinned-first
- Sonner toasts on all form submissions

## Backlog / Next Phase
- **P1**: Save/bookmark clubs & events (localStorage drawer)
- **P1**: Real-time announcement subscriptions (WebSocket) or polling refresh
- **P1**: Club admin dashboards (moderate requests, post events)
- **P2**: iCal export / Add-to-Calendar for RSVPs
- **P2**: Filter events by date range and “this week / next week”
- **P2**: Auth (JWT or Emergent Google) if user requests it
- **P2**: Email confirmation for RSVPs via Resend
