from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

database_url = os.environ.get('DATABASE_URL')
if not database_url:
    raise RuntimeError('DATABASE_URL is required')


def connection():
    return psycopg.connect(database_url, row_factory=dict_row)


def prepare_values(data):
    values = dict(data)
    if 'tags' in values:
        values['tags'] = Jsonb(values['tags'])
    return values


def insert_row(table, data):
    values = prepare_values(data)
    columns = list(values)
    placeholders = ', '.join(f'%({column})s' for column in columns)
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                f'INSERT INTO {table} ({", ".join(columns)}) VALUES ({placeholders})',
                values,
            )


def insert_rows(table, rows):
    for row in rows:
        insert_row(table, row)


def setup_schema():
    statements = [
        '''CREATE TABLE IF NOT EXISTS clubs (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, tagline TEXT NOT NULL,
            description TEXT NOT NULL, category TEXT NOT NULL, eligibility TEXT NOT NULL,
            membership_process TEXT NOT NULL, meeting_schedule TEXT NOT NULL,
            contact_email TEXT NOT NULL, lead_name TEXT NOT NULL, image_url TEXT NOT NULL,
            tags JSONB NOT NULL DEFAULT '[]', member_count INTEGER NOT NULL DEFAULT 0,
            founded_year INTEGER NOT NULL DEFAULT 2020, created_at TEXT NOT NULL
        )''',
        '''CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
            event_type TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL,
            venue TEXT NOT NULL, organizer_club_id TEXT, organizer_name TEXT NOT NULL,
            image_url TEXT NOT NULL, tags JSONB NOT NULL DEFAULT '[]',
            capacity INTEGER NOT NULL DEFAULT 100, registered_count INTEGER NOT NULL DEFAULT 0,
            registration_status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL
        )''',
        '''CREATE TABLE IF NOT EXISTS announcements (
            id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL,
            category TEXT NOT NULL, is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
            posted_by TEXT NOT NULL, created_at TEXT NOT NULL
        )''',
        '''CREATE TABLE IF NOT EXISTS membership_requests (
            id TEXT PRIMARY KEY, club_id TEXT NOT NULL, name TEXT NOT NULL,
            email TEXT NOT NULL, department TEXT NOT NULL, academic_year TEXT NOT NULL,
            motivation TEXT NOT NULL, experience_level TEXT NOT NULL DEFAULT 'beginner',
            status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL
        )''',
        '''CREATE TABLE IF NOT EXISTS rsvps (
            id TEXT PRIMARY KEY, event_id TEXT NOT NULL, name TEXT NOT NULL,
            email TEXT NOT NULL, department TEXT NOT NULL, academic_year TEXT NOT NULL,
            questions TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'confirmed',
            created_at TEXT NOT NULL
        )''',
    ]
    with connection() as conn:
        with conn.cursor() as cursor:
            for statement in statements:
                cursor.execute(statement)

app = FastAPI(title="CampusPulse API")
api_router = APIRouter(prefix="/api")


# =========================
# Models
# =========================
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Club(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tagline: str
    description: str
    category: str  # Tech, Arts, Cultural, Sports, Social, Academic
    eligibility: str
    membership_process: str
    meeting_schedule: str
    contact_email: EmailStr
    lead_name: str
    image_url: str
    tags: List[str] = []
    member_count: int = 0
    founded_year: int = 2020
    created_at: str = Field(default_factory=now_iso)


class ClubCreate(BaseModel):
    name: str
    tagline: str
    description: str
    category: str
    eligibility: str
    membership_process: str
    meeting_schedule: str
    contact_email: EmailStr
    lead_name: str
    image_url: str
    tags: List[str] = []
    member_count: int = 0
    founded_year: int = 2020


class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    event_type: str  # Competition, Workshop, Seminar, Cultural, Fest
    start_time: str  # ISO
    end_time: str  # ISO
    venue: str
    organizer_club_id: Optional[str] = None
    organizer_name: str
    image_url: str
    tags: List[str] = []
    capacity: int = 100
    registered_count: int = 0
    registration_status: str = "open"  # open, limited, closed
    created_at: str = Field(default_factory=now_iso)


class EventCreate(BaseModel):
    title: str
    description: str
    event_type: str
    start_time: str
    end_time: str
    venue: str
    organizer_club_id: Optional[str] = None
    organizer_name: str
    image_url: str
    tags: List[str] = []
    capacity: int = 100
    registration_status: str = "open"


class Announcement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    body: str
    category: str  # General, Urgent, Academic, Event
    is_pinned: bool = False
    posted_by: str
    created_at: str = Field(default_factory=now_iso)


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    category: str
    is_pinned: bool = False
    posted_by: str


class MembershipRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    club_id: str
    name: str
    email: EmailStr
    department: str
    academic_year: str
    motivation: str
    experience_level: str = "beginner"
    status: str = "pending"
    created_at: str = Field(default_factory=now_iso)


class MembershipRequestCreate(BaseModel):
    club_id: str
    name: str
    email: EmailStr
    department: str
    academic_year: str
    motivation: str
    experience_level: str = "beginner"


class EventRSVP(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    name: str
    email: EmailStr
    department: str
    academic_year: str
    questions: Optional[str] = ""
    status: str = "confirmed"
    created_at: str = Field(default_factory=now_iso)


class EventRSVPCreate(BaseModel):
    event_id: str
    name: str
    email: EmailStr
    department: str
    academic_year: str
    questions: Optional[str] = ""


# =========================
# Routes
# =========================
@api_router.get("/")
async def root():
    return {"message": "CampusPulse API is live"}


@api_router.get("/stats")
async def get_stats():
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS count FROM clubs")
            clubs = cursor.fetchone()["count"]
            cursor.execute("SELECT COUNT(*) AS count FROM events WHERE start_time >= %s", (now_iso(),))
            upcoming = cursor.fetchone()["count"]
            cursor.execute("SELECT COUNT(*) AS count FROM events WHERE event_type = 'Workshop'")
            workshops = cursor.fetchone()["count"]
            cursor.execute("SELECT COALESCE(SUM(member_count), 0) AS total FROM clubs")
            members = cursor.fetchone()["total"]
    return {
        "total_clubs": clubs,
        "upcoming_events": upcoming,
        "weekly_workshops": workshops,
        "active_members": members,
    }


# ---- Clubs ----
@api_router.get("/clubs", response_model=List[Club])
async def list_clubs(category: Optional[str] = None, search: Optional[str] = None):
    conditions, values = [], []
    if category and category.lower() != "all":
        conditions.append("category = %s")
        values.append(category)
    if search:
        conditions.append("(name ILIKE %s OR tagline ILIKE %s OR description ILIKE %s OR tags::text ILIKE %s)")
        values.extend([f"%{search}%"] * 4)
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT * FROM clubs {where} ORDER BY member_count DESC LIMIT 500", values)
            docs = cursor.fetchall()
    return docs


@api_router.get("/clubs/{club_id}", response_model=Club)
async def get_club(club_id: str):
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM clubs WHERE id = %s", (club_id,))
            doc = cursor.fetchone()
    if not doc:
        raise HTTPException(404, "Club not found")
    return doc


@api_router.post("/clubs", response_model=Club)
async def create_club(payload: ClubCreate):
    club = Club(**payload.model_dump())
    insert_row("clubs", club.model_dump())
    return club


# ---- Events ----
@api_router.get("/events", response_model=List[Event])
async def list_events(event_type: Optional[str] = None, search: Optional[str] = None, club_id: Optional[str] = None):
    conditions, values = [], []
    if event_type and event_type.lower() != "all":
        conditions.append("event_type = %s")
        values.append(event_type)
    if club_id:
        conditions.append("organizer_club_id = %s")
        values.append(club_id)
    if search:
        conditions.append("(title ILIKE %s OR description ILIKE %s OR venue ILIKE %s)")
        values.extend([f"%{search}%"] * 3)
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT * FROM events {where} ORDER BY start_time ASC LIMIT 500", values)
            docs = cursor.fetchall()
    return docs


@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM events WHERE id = %s", (event_id,))
            doc = cursor.fetchone()
    if not doc:
        raise HTTPException(404, "Event not found")
    return doc


@api_router.post("/events", response_model=Event)
async def create_event(payload: EventCreate):
    event = Event(**payload.model_dump())
    insert_row("events", event.model_dump())
    return event


# ---- Announcements ----
@api_router.get("/announcements", response_model=List[Announcement])
async def list_announcements(category: Optional[str] = None):
    values = []
    where = ""
    if category and category.lower() != "all":
        where = "WHERE category = %s"
        values.append(category)
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT * FROM announcements {where} ORDER BY is_pinned DESC, created_at DESC LIMIT 500", values)
            docs = cursor.fetchall()
    return docs


@api_router.post("/announcements", response_model=Announcement)
async def create_announcement(payload: AnnouncementCreate):
    ann = Announcement(**payload.model_dump())
    insert_row("announcements", ann.model_dump())
    return ann


# ---- Membership Requests ----
@api_router.post("/membership-requests", response_model=MembershipRequest)
async def submit_membership_request(payload: MembershipRequestCreate):
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM clubs WHERE id = %s", (payload.club_id,))
            club = cursor.fetchone()
    if not club:
        raise HTTPException(404, "Club not found")
    req = MembershipRequest(**payload.model_dump())
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO membership_requests (id, club_id, name, email, department, academic_year, motivation, experience_level, status, created_at) VALUES (%(id)s, %(club_id)s, %(name)s, %(email)s, %(department)s, %(academic_year)s, %(motivation)s, %(experience_level)s, %(status)s, %(created_at)s)", req.model_dump())
            cursor.execute("UPDATE clubs SET member_count = member_count + 1 WHERE id = %s", (payload.club_id,))
    return req


@api_router.get("/membership-requests", response_model=List[MembershipRequest])
async def list_membership_requests(club_id: Optional[str] = None):
    where = "WHERE club_id = %s" if club_id else ""
    values = (club_id,) if club_id else ()
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT * FROM membership_requests {where} ORDER BY created_at DESC LIMIT 500", values)
            docs = cursor.fetchall()
    return docs


# ---- RSVPs ----
@api_router.post("/rsvps", response_model=EventRSVP)
async def submit_rsvp(payload: EventRSVPCreate):
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM events WHERE id = %s", (payload.event_id,))
            event = cursor.fetchone()
    if not event:
        raise HTTPException(404, "Event not found")
    if event.get("registration_status") == "closed":
        raise HTTPException(400, "Registration is closed for this event")
    if event.get("registered_count", 0) >= event.get("capacity", 100):
        raise HTTPException(400, "Event is fully booked")
    rsvp = EventRSVP(**payload.model_dump())
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO rsvps (id, event_id, name, email, department, academic_year, questions, status, created_at) VALUES (%(id)s, %(event_id)s, %(name)s, %(email)s, %(department)s, %(academic_year)s, %(questions)s, %(status)s, %(created_at)s)", rsvp.model_dump())
            cursor.execute("UPDATE events SET registered_count = registered_count + 1 WHERE id = %s", (payload.event_id,))
    return rsvp


@api_router.get("/rsvps", response_model=List[EventRSVP])
async def list_rsvps(event_id: Optional[str] = None):
    where = "WHERE event_id = %s" if event_id else ""
    values = (event_id,) if event_id else ()
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT * FROM rsvps {where} ORDER BY created_at DESC LIMIT 500", values)
            docs = cursor.fetchall()
    return docs


# ---- Seed ----
@api_router.post("/seed")
async def seed_data():
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE clubs, events, announcements CASCADE")

    now = datetime.now(timezone.utc)

    clubs_data = [
        {"name": "Byte Labs Coding Club", "tagline": "Where curiosity meets code", "description": "A community of coders exploring web, AI, and open source. We run weekly hack nights, contribute to real repos, and prep for competitive programming.", "category": "Tech", "eligibility": "Open to all undergraduates. Basic programming knowledge preferred, not required.", "membership_process": "Fill the interest form. Attend an intro session. Complete a warm-up coding kata within 2 weeks.", "meeting_schedule": "Thursdays 6:00–8:00 PM · Innovation Lab, Block C", "contact_email": "byte-labs@campus.edu", "lead_name": "Ananya Rao", "image_url": "https://images.unsplash.com/photo-1782388716252-d598f84ea62f?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Python", "AI", "Web", "Open Source"], "member_count": 214, "founded_year": 2016},
        {"name": "Verse & Vellum Literary Society", "tagline": "Sentences that outlast semesters", "description": "A haven for readers, poets, and essayists. Monthly zine, open-mic nights, and workshops with visiting authors.", "category": "Arts", "eligibility": "Any student who reads or writes in any language.", "membership_process": "Send a short writing sample or reading list to the lead. No judgement, no gatekeeping.", "meeting_schedule": "Tuesdays 5:30–7:00 PM · Central Library, Reading Room 2", "contact_email": "verse-vellum@campus.edu", "lead_name": "Kabir Menon", "image_url": "https://images.unsplash.com/photo-1762512346988-045f4d5ad2b3?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Poetry", "Zine", "Book Club"], "member_count": 132, "founded_year": 2011},
        {"name": "Rhythm Republic Dance Crew", "tagline": "Move loud. Move together.", "description": "Hip-hop, contemporary, folk fusion. We perform at fests, compete inter-college, and welcome all skill levels.", "category": "Cultural", "eligibility": "All years. Auditions held twice a year for competition squad only.", "membership_process": "Attend two open practices, then meet the choreography leads.", "meeting_schedule": "Mon, Wed, Fri 7:00–9:00 PM · Amphitheatre", "contact_email": "rhythm-republic@campus.edu", "lead_name": "Ishaan Kapoor", "image_url": "https://images.unsplash.com/photo-1781583716707-26ec9170ca0d?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Hip-hop", "Contemporary", "Performance"], "member_count": 96, "founded_year": 2013},
        {"name": "Trailblazers Trekking & Adventure", "tagline": "Class every day. Summit on weekends.", "description": "Weekend treks, rock-climbing meetups, cycling brevets, and stargazing camps. Safety-first, inclusive of first-timers.", "category": "Sports", "eligibility": "18+ students. Medical clearance for high-altitude treks.", "membership_process": "Register, complete a fitness self-check, attend the pre-trek briefing.", "meeting_schedule": "Saturdays · Outdoor sessions at Sports Complex Ground", "contact_email": "trailblazers@campus.edu", "lead_name": "Meera Suresh", "image_url": "https://images.unsplash.com/photo-1758270705482-cee87ea98738?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Trekking", "Climbing", "Outdoors"], "member_count": 178, "founded_year": 2009},
        {"name": "Aegis Debate & Model UN", "tagline": "Arguments sharpened. Perspectives widened.", "description": "British Parliamentary, Asian Parliamentary, MUN circuits. We travel, we compete, we train hard.", "category": "Academic", "eligibility": "Passion for current affairs. Prior debating helpful but not required.", "membership_process": "Two-round tryout: prepared speech + spontaneous rebuttal.", "meeting_schedule": "Sundays 4:00–7:00 PM · Seminar Hall A", "contact_email": "aegis-debate@campus.edu", "lead_name": "Rohan Chatterjee", "image_url": "https://images.unsplash.com/photo-1784775621595-ab47d874f741?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Debate", "MUN", "Public Speaking"], "member_count": 84, "founded_year": 2014},
        {"name": "Kindred Community Outreach", "tagline": "Small hands, big change.", "description": "Weekend teaching at nearby government schools, blood drives, sustainability drives, and disaster-response volunteering.", "category": "Social", "eligibility": "Any student willing to commit 4 hours a month.", "membership_process": "Fill the intent form and attend the onboarding orientation.", "meeting_schedule": "Saturdays 10:00 AM–1:00 PM · Community Hall", "contact_email": "kindred@campus.edu", "lead_name": "Zara Ahmed", "image_url": "https://images.unsplash.com/photo-1781583847268-46d15bfe5609?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Volunteering", "Teaching", "Sustainability"], "member_count": 241, "founded_year": 2010},
        {"name": "Palette Fine Arts Circle", "tagline": "Because blank walls deserve better.", "description": "Watercolour, oils, digital illustration, and street-art projects across campus. Annual gallery in March.", "category": "Arts", "eligibility": "All welcome. Bring supplies for first session, or borrow ours.", "membership_process": "Attend one open studio; submit any two artworks for the portfolio wall.", "meeting_schedule": "Fridays 5:00–7:30 PM · Art Studio, Block D", "contact_email": "palette@campus.edu", "lead_name": "Nikhil Verma", "image_url": "https://images.unsplash.com/photo-1762512346988-045f4d5ad2b3?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Painting", "Illustration", "Gallery"], "member_count": 71, "founded_year": 2017},
        {"name": "Quantum Robotics Guild", "tagline": "Build. Break. Build again.", "description": "Autonomous bots, drones, and IoT installations. We compete in Robocon and host the annual RoboSprint.", "category": "Tech", "eligibility": "Preferably engineering years 2–4. Enthusiast tinkerers from other streams welcome.", "membership_process": "Team-based tryout: 48-hour build sprint with kit provided.", "meeting_schedule": "Tue & Thu 6:30–9:00 PM · Robotics Lab, Block E", "contact_email": "quantum-robotics@campus.edu", "lead_name": "Aditi Sharma", "image_url": "https://images.unsplash.com/photo-1782388716252-d598f84ea62f?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Robotics", "Drones", "IoT", "Robocon"], "member_count": 108, "founded_year": 2015},
        {"name": "Hearth Culinary Society", "tagline": "Recipes as passports.", "description": "Regional food nights, campus pop-ups, and food-history talks. We cook, we share, we clean up.", "category": "Cultural", "eligibility": "Any student who can chop an onion — or is willing to learn.", "membership_process": "Sign up and bring one home recipe to your first meet.", "meeting_schedule": "Sundays 11:00 AM–2:00 PM · Hostel Common Kitchen", "contact_email": "hearth-culinary@campus.edu", "lead_name": "Priya Nambiar", "image_url": "https://images.unsplash.com/photo-1781583847268-46d15bfe5609?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Food", "Culture", "Pop-up"], "member_count": 62, "founded_year": 2019},
    ]

    club_objs = [Club(**c) for c in clubs_data]
    insert_rows("clubs", [c.model_dump() for c in club_objs])

    # id lookups
    by_name = {c.name: c.id for c in club_objs}

    events_data = [
        {"title": "HackNight #14: AI Agents Marathon", "description": "12-hour overnight hack focused on building autonomous AI agents. Snacks, mentors, and prizes on the table.", "event_type": "Competition", "start_time": (now + timedelta(days=3, hours=18)).isoformat(), "end_time": (now + timedelta(days=4, hours=6)).isoformat(), "venue": "Innovation Lab, Block C", "organizer_club_id": by_name["Byte Labs Coding Club"], "organizer_name": "Byte Labs Coding Club", "image_url": "https://images.unsplash.com/photo-1782388716252-d598f84ea62f?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Hackathon", "AI", "Overnight"], "capacity": 120, "registration_status": "open"},
        {"title": "Poetry Under Stars — Open Mic", "description": "An evening of poetry, spoken word, and acoustic sets. Sign up on arrival to perform.", "event_type": "Cultural", "start_time": (now + timedelta(days=5, hours=19)).isoformat(), "end_time": (now + timedelta(days=5, hours=22)).isoformat(), "venue": "Amphitheatre Lawn", "organizer_club_id": by_name["Verse & Vellum Literary Society"], "organizer_name": "Verse & Vellum Literary Society", "image_url": "https://images.unsplash.com/photo-1762512346988-045f4d5ad2b3?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Open Mic", "Poetry", "Music"], "capacity": 250, "registration_status": "open"},
        {"title": "Intro to Rock Climbing", "description": "A beginner-friendly workshop covering belaying, knots, and top-rope basics. Gear provided.", "event_type": "Workshop", "start_time": (now + timedelta(days=7, hours=9)).isoformat(), "end_time": (now + timedelta(days=7, hours=12)).isoformat(), "venue": "Sports Complex Wall", "organizer_club_id": by_name["Trailblazers Trekking & Adventure"], "organizer_name": "Trailblazers Trekking & Adventure", "image_url": "https://images.unsplash.com/photo-1758270705482-cee87ea98738?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Climbing", "Beginner"], "capacity": 30, "registration_status": "limited"},
        {"title": "MUN Bootcamp: BP Debate Fundamentals", "description": "Two-hour crash course on British Parliamentary format, POIs, rebuttals, and speaker roles.", "event_type": "Workshop", "start_time": (now + timedelta(days=10, hours=16)).isoformat(), "end_time": (now + timedelta(days=10, hours=18)).isoformat(), "venue": "Seminar Hall A", "organizer_club_id": by_name["Aegis Debate & Model UN"], "organizer_name": "Aegis Debate & Model UN", "image_url": "https://images.unsplash.com/photo-1784775621595-ab47d874f741?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Debate", "MUN"], "capacity": 60, "registration_status": "open"},
        {"title": "RoboSprint 2026 — Autonomous Bot Challenge", "description": "Design, build, and race an autonomous line-follower and obstacle-avoider. Teams of 3.", "event_type": "Competition", "start_time": (now + timedelta(days=14, hours=10)).isoformat(), "end_time": (now + timedelta(days=15, hours=18)).isoformat(), "venue": "Robotics Lab, Block E", "organizer_club_id": by_name["Quantum Robotics Guild"], "organizer_name": "Quantum Robotics Guild", "image_url": "https://images.unsplash.com/photo-1782388716252-d598f84ea62f?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Robotics", "Team", "Competition"], "capacity": 90, "registration_status": "open"},
        {"title": "The Ethics of AI — Guest Lecture", "description": "A conversation on responsibility, bias, and the human side of intelligent systems. Speaker: Dr. Leela Raghavan.", "event_type": "Seminar", "start_time": (now + timedelta(days=6, hours=17)).isoformat(), "end_time": (now + timedelta(days=6, hours=19)).isoformat(), "venue": "Auditorium, Main Block", "organizer_club_id": by_name["Byte Labs Coding Club"], "organizer_name": "Byte Labs · Guest Speaker Series", "image_url": "https://images.unsplash.com/photo-1781583716707-26ec9170ca0d?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["AI", "Ethics", "Lecture"], "capacity": 300, "registration_status": "open"},
        {"title": "Spring Fest — Rhythm Republic Showcase", "description": "The dance crew's annual showcase across five styles. Doors open 30 minutes before start.", "event_type": "Cultural", "start_time": (now + timedelta(days=20, hours=19)).isoformat(), "end_time": (now + timedelta(days=20, hours=22)).isoformat(), "venue": "Main Amphitheatre", "organizer_club_id": by_name["Rhythm Republic Dance Crew"], "organizer_name": "Rhythm Republic Dance Crew", "image_url": "https://images.unsplash.com/photo-1781583716707-26ec9170ca0d?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Dance", "Fest", "Showcase"], "capacity": 500, "registration_status": "open"},
        {"title": "Regional Kitchens — Assam Pop-up Night", "description": "A four-course tasting from Upper Assam with stories behind every dish. Vegetarian & non-veg options.", "event_type": "Cultural", "start_time": (now + timedelta(days=12, hours=19)).isoformat(), "end_time": (now + timedelta(days=12, hours=22)).isoformat(), "venue": "Hostel Common Kitchen", "organizer_club_id": by_name["Hearth Culinary Society"], "organizer_name": "Hearth Culinary Society", "image_url": "https://images.unsplash.com/photo-1781583847268-46d15bfe5609?crop=entropy&cs=srgb&fm=jpg&q=85", "tags": ["Food", "Assam", "Tasting"], "capacity": 40, "registration_status": "limited"},
    ]
    event_objs = [Event(**e) for e in events_data]
    insert_rows("events", [e.model_dump() for e in event_objs])

    announcements_data = [
        {"title": "Spring Fest 2026 · Central line-up dropped", "body": "Tickets for the Spring Fest headliner night open Friday 6 PM. Priority window for verified club members starts Thursday 9 PM.", "category": "Event", "is_pinned": True, "posted_by": "Student Council"},
        {"title": "Reminder: Mid-semester break schedule", "body": "Classes pause from Friday next week and resume the following Monday. Library remains open 9 AM–8 PM with limited services.", "category": "Academic", "is_pinned": True, "posted_by": "Academic Office"},
        {"title": "Blood donation drive · Register today", "body": "Kindred Outreach is hosting the campus blood donation drive on Saturday at Community Hall. Slots limited to 120 donors.", "category": "General", "is_pinned": False, "posted_by": "Kindred Community Outreach"},
        {"title": "Late-night library hours resumed", "body": "Central Library returns to 24-hour access from tonight until end of semester. Bring your ID for after-11 PM entry.", "category": "Academic", "is_pinned": False, "posted_by": "Library Services"},
        {"title": "Weather advisory · Trek plans rescheduled", "body": "Trailblazers' weekend trek to Kudremukh is pushed by one week due to heavy rain forecast. Refunds not required — dates auto-shifted.", "category": "Urgent", "is_pinned": False, "posted_by": "Trailblazers Trekking & Adventure"},
        {"title": "New club spotlight: Hearth Culinary Society", "body": "The newest addition to the campus roster. Open house this Sunday — bring one home recipe.", "category": "General", "is_pinned": False, "posted_by": "Student Affairs"},
    ]
    ann_objs = [Announcement(**a) for a in announcements_data]
    insert_rows("announcements", [a.model_dump() for a in ann_objs])

    return {"status": "seeded", "clubs": len(club_objs), "events": len(event_objs), "announcements": len(ann_objs)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_seed():
    try:
        setup_schema()
        with connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) AS count FROM clubs")
                count = cursor.fetchone()["count"]
        if count == 0:
            logger.info("Empty DB detected — seeding demo data.")
            await seed_data()
    except Exception as e:
        logger.exception("Startup seed failed: %s", e)


