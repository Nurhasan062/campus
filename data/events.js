const types = ["Competition", "Workshop", "Seminar", "Cultural", "Fest"];
const venues = ["Innovation Lab", "Main Quad", "Central Library", "Student Commons", "Auditorium"];
const themes = ["Design Sprint", "AI Study Jam", "Open Mic", "Community Mixer", "Career Lab", "Build Night", "Wellness Hour", "Idea Showcase", "Debate Forum", "Makers Fair"];
const imageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

export const sampleEvents = Array.from({ length: 500 }, (_, index) => {
  const start = new Date(Date.now() + (index + 1) * 86400000);
  start.setHours(10 + (index % 8), index % 2 ? 30 : 0, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const type = types[index % types.length];
  const theme = themes[index % themes.length];
  return {
    id: `sample-event-${String(index + 1).padStart(3, "0")}`,
    title: `${theme} ${String(index + 1).padStart(3, "0")}`,
    description: `Join students from across campus for a practical ${theme.toLowerCase()} session with friendly hosts, useful takeaways, and room to meet new people.`,
    event_type: type,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    venue: venues[index % venues.length],
    organizer_club_id: `sample-club-${String((index % 500) + 1).padStart(3, "0")}`,
    organizer_name: `${["North Innovation", "Campus Arts", "Student Wellness", "Open Learning", "Community Action"][index % 5]} Collective`,
    image_url: imageUrl,
    tags: [type, theme],
    capacity: 40 + ((index * 13) % 260),
    registered_count: index % 4 === 0 ? 12 : index % 17,
    registration_status: "open",
    created_at: new Date().toISOString(),
  };
});

export function getSampleEvent(id) {
  return sampleEvents.find((event) => event.id === id);
}
