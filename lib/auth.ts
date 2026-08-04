export type UserRole = "viewer" | "admin" | "data-entry" | "manager";
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
  manager: {
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

export async function getUserByCredentials(email: string, password: string): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1) Check static seed users
  const seedUser = AUTH_USERS.find((user) => user.email === normalizedEmail);
  if (seedUser) {
    const storedPassword = AUTH_CREDENTIALS[normalizedEmail];
    if (storedPassword === password) {
      return seedUser;
    }
    return null;
  }

  // 2) Check admin-created users stored in Firestore
  try {
    const { fetchUsers } = await import("./firestoreService");
    const dbUsers = await fetchUsers();
    const match = dbUsers.find((u) => u.email === normalizedEmail);
    if (match && match.password === password) {
      return {
        id: match.id,
        email: match.email,
        name: match.name,
        role: match.role,
      };
    }
  } catch (err) {
    console.error("Error authenticating against Firestore users:", err);
  }

  return null;
}
