const categories = [
  "Tech", "Arts", "Cultural", "Sports", "Social", "Academic",
  "Wellness", "Entrepreneurship", "Media", "Environment",
];

const nameParts = [
  "Innovation", "Makers", "Open Source", "Design", "Debate", "Data",
  "Film", "Literary", "Wellness", "Impact", "Astronomy", "Robotics",
  "Entrepreneurship", "Photography", "Music", "Adventure", "Language",
  "Sustainability", "Finance", "Theatre",
];

const imageUrls = [
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80",
];

export const sampleClubs = Array.from({ length: 500 }, (_, index) => {
  const number = index + 1;
  const category = categories[index % categories.length];
  const theme = nameParts[index % nameParts.length];
  const campus = ["North", "Central", "Riverside", "East", "West"][index % 5];
  const name = `${campus} ${theme} Collective ${String(number).padStart(3, "0")}`;

  return {
    id: `sample-club-${String(number).padStart(3, "0")}`,
    name,
    tagline: `Make room for ${theme.toLowerCase()} and good company.`,
    description: `${name} is a welcoming student community exploring ${theme.toLowerCase()} through practical sessions, peer projects, and campus-wide collaborations. New members can join at any point in the term.`,
    category,
    eligibility: "Open to all currently enrolled students and curious collaborators.",
    membership_process: "Complete the interest note and attend one open meeting.",
    meeting_schedule: `${["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays"][index % 5]} · ${index % 2 ? "5:30 PM" : "6:00 PM"} · Student Commons`,
    contact_email: `club${number}@campuspulse.example`,
    lead_name: `${["Avery", "Jordan", "Mina", "Ravi", "Taylor"][index % 5]} ${["Chen", "Patel", "Morgan", "Rivera", "Okafor"][index % 5]}`,
    image_url: imageUrls[index % imageUrls.length],
    tags: [category, theme, index % 2 ? "Beginner friendly" : "Project based"],
    member_count: 18 + ((index * 37) % 260),
    founded_year: 2012 + (index % 14),
    created_at: new Date(Date.UTC(2025, index % 12, (index % 27) + 1)).toISOString(),
  };
});

export function getSampleClub(id) {
  return sampleClubs.find((club) => club.id === id);
}
