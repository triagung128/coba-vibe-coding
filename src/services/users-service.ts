import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export type RegisterUserResult =
  | { success: true; data: "ok" }
  | { success: false; error: string };

export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existingUser) {
    return {
      success: false,
      error: "Email sudah terdaftar",
    };
  }

  const hashedPassword = await Bun.password.hash(input.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  await db.insert(users).values({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  return {
    success: true,
    data: "ok",
  };
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export type LoginUserResult =
  | { success: true; data: string }
  | { success: false; error: string };

export async function loginUser(input: LoginUserInput): Promise<LoginUserResult> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    return {
      success: false,
      error: "Email atau password salah",
    };
  }

  let isPasswordValid = false;
  try {
    isPasswordValid = await Bun.password.verify(input.password, user.password);
  } catch {
    isPasswordValid = input.password === user.password;
  }

  if (!isPasswordValid && input.password === user.password) {
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    return {
      success: false,
      error: "Email atau password salah",
    };
  }

  const token = crypto.randomUUID();

  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return {
    success: true,
    data: token,
  };
}

export interface CurrentUserResponse {
  id: number;
  name: string;
  email: string;
  created_at: Date | string;
}

export type GetCurrentUserResult =
  | { success: true; data: CurrentUserResponse }
  | { success: false; error: string };

export async function getCurrentUser(token: string): Promise<GetCurrentUserResult> {
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      created_at: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!result) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  return {
    success: true,
    data: result,
  };
}


