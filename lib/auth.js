const USERS_KEY = "campuspulse-users";
const SESSION_KEY = "campuspulse-session";
const ADMIN_EMAIL = "admin@campuspulse.local";
const ADMIN_PASSWORD = "Admin123!";

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

export function registerUser({ name, email, password }) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === ADMIN_EMAIL) throw new Error("That email is reserved.");
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }
  const user = { id: `user-${Date.now()}`, name: name.trim(), email: normalizedEmail, password, role: "user" };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  return createSession(user);
}

export function loginUser({ email, password }) {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return createSession({ id: "admin", name: "Campus Administrator", email: ADMIN_EMAIL, role: "admin" });
  }
  const user = readUsers().find((candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password);
  if (!user) throw new Error("That email and password combination was not found.");
  return createSession(user);
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("campuspulse-auth-changed"));
}

function createSession({ id, name, email, role = "user" }) {
  const session = { id, name, email, role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("campuspulse-auth-changed"));
  return session;
}

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
