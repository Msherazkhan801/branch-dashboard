export type UserRole = "viewer" | "admin" | "data-entry";
export type Permission = "view" | "create" | "edit" | "delete";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface UserSchema {
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Firestore users collection schema (if you later migrate to real DB auth):
 * collection: users
 * document ID: uid
 * fields:
 *   email: string
 *   name: string
 *   role: "viewer" | "admin" | "data-entry"
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 */

export const AUTH_USERS: UserRecord[] = [
  {
    id: "admin",
    email: "admin@gmail.com",
    name: "Administrator",
    role: "admin",
  },
  {
    id: "manager",
    email: "manger@gmail.com",
    name: "Manager",
    role: "admin",
  },
  {
    id: "data-entry",
    email: "user@gmail.com",
    name: "Data Entry",
    role: "data-entry",
  },
];

export const AUTH_CREDENTIALS: Record<string, string> = {
  "admin@gmail.com": "admin123",
  "manger@gmail.com": "manger123",
  "user@gmail.com": "user123",
};

export const PERMISSIONS: Record<UserRole, Record<Permission, boolean>> = {
  viewer: {
    view: true,
    create: false,
    edit: false,
    delete: false,
  },
  admin: {
    view: true,
    create: true,
    edit: true,
    delete: true,
  },
  "data-entry": {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
};

export function getUserByCredentials(email: string, password: string): UserRecord | null {
  const normalizedEmail = email.trim().toLowerCase();
  const storedPassword = AUTH_CREDENTIALS[normalizedEmail];
  if (storedPassword !== password) {
    return null;
  }
  return AUTH_USERS.find((user) => user.email === normalizedEmail) ?? null;
}
