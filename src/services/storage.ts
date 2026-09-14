import type { User, Session } from '../types/user';
import type { Task } from '../types/task';

const USERS_KEY = 'app_users';
const SESSION_KEY = 'app_session';
const TASKS_KEY = 'app_tasks';

function readUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readAllTasks(): Record<string, Task[]> {
  const raw = localStorage.getItem(TASKS_KEY);
  return raw ? (JSON.parse(raw) as Record<string, Task[]>) : {};
}

function writeAllTasks(tasks: Record<string, Task[]>) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export function setSession(session: Session | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function findUserByEmail(email: string): User | undefined {
  return readUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return readUsers().find((user) => user.id === id);
}

export function createUser(user: User) {
  const users = readUsers();
  users.push(user);
  writeUsers(users);
}

export function updateUser(updated: User) {
  const users = readUsers().map((user) => (user.id === updated.id ? updated : user));
  writeUsers(users);
}

export function deleteUser(userId: string) {
  const users = readUsers().filter((user) => user.id !== userId);
  writeUsers(users);
  const allTasks = readAllTasks();
  delete allTasks[userId];
  writeAllTasks(allTasks);
}

export function getTasks(userId: string): Task[] {
  return readAllTasks()[userId] ?? [];
}

export function saveTasks(userId: string, tasks: Task[]) {
  const allTasks = readAllTasks();
  allTasks[userId] = tasks;
  writeAllTasks(allTasks);
}

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

export const DEFAULT_AVATAR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI2NCIgY3k9IjQ4IiByPSIyNCIgZmlsbD0iI2JkYjRiNCIvPjxwYXRoIGQ9Ik0yNCAxMDhjMC0yMi4xIDE3LjktNDAgNDAtNDBoMGMyMi4xIDAgNDAgMTcuOSA0MCA0MHY4SDI0di04eiIgZmlsbD0iI2JkYjRiNCIvPjwvc3ZnPg==';
