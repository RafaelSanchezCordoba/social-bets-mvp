"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  isEmailIdentifier,
  isValidEmail,
  isValidUsername,
  normalizeEmail,
  normalizeUsername,
} from "@/lib/auth/validators";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function getAuthCallbackUrl() {
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  return `${origin}/auth/callback`;
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(getString(formData, "email"));
  const username = normalizeUsername(getString(formData, "username"));
  const password = getString(formData, "password");

  if (!isValidEmail(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (!isValidUsername(username)) {
    return {
      status: "error",
      message:
        "Username must be 3 to 20 characters and use only letters, numbers, or underscores.",
    };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters long.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: await getAuthCallbackUrl(),
      data: {
        username,
      },
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  if (data.session) {
    redirect("/home");
  }

  return {
    status: "success",
    message:
      "Account created. If email confirmation is enabled, check your inbox to continue.",
  };
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const identifier = getString(formData, "identifier").trim();
  const password = getString(formData, "password");

  if (!identifier) {
    return { status: "error", message: "Enter your email or username." };
  }

  if (!password) {
    return { status: "error", message: "Enter your password." };
  }

  let email = normalizeEmail(identifier);

  if (!isEmailIdentifier(identifier)) {
    const username = normalizeUsername(identifier);

    if (!isValidUsername(username)) {
      return {
        status: "error",
        message:
          "Username must be 3 to 20 characters and use only letters, numbers, or underscores.",
      };
    }

    if (!hasServiceRoleKey()) {
      return {
        status: "error",
        message:
          "Username login requires SUPABASE_SERVICE_ROLE_KEY in the server environment.",
      };
    }

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("username", username)
      .maybeSingle();

    if (profileError) {
      return { status: "error", message: profileError.message };
    }

    if (!profile) {
      return {
        status: "error",
        message: "No account exists with that username.",
      };
    }

    email = profile.email;
  } else if (!isValidEmail(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  redirect("/home");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
