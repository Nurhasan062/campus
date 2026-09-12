const categories = ["General", "Urgent", "Academic", "Event"];
const topics = ["Library hours", "Spring Fest", "Club registration", "Campus transport", "Scholarship office", "Wellness center", "Career services", "Student council", "Exam schedule", "Volunteer drive"];

export const sampleAnnouncements = Array.from({ length: 50 }, (_, index) => {
  const topic = topics[index % topics.length];
  return {
    id: `sample-announcement-${String(index + 1).padStart(3, "0")}`,
    title: `${topic} update ${String(index + 1).padStart(3, "0")}`,
    body: `Campus services shared a new ${topic.toLowerCase()} update for students. Check the latest details and plan ahead for this week on campus.`,
    category: categories[index % categories.length],
    is_pinned: index < 4,
    posted_by: ["Student Council", "Student Affairs", "Academic Office", "Campus Services"][index % 4],
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
  };
});
