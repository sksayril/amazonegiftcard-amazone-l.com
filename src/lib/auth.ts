import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return false;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded && decoded.role === "admin";
  } catch (error) {
    return false;
  }
}

export async function loginAdmin() {
  const cookieStore = await cookies();
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
  
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set("admin_token", "", {
    path: "/",
    maxAge: 0,
  });
}
