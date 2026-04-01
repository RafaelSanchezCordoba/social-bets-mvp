"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type BetFormState = {
  status: "idle" | "error";
  message: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const errorState = (message: string): BetFormState => ({
  status: "error",
  message,
});

function revalidateGroup(groupId: string) {
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/groups");
  revalidatePath("/home");
}

function buildGroupRedirectUrl(groupId: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return `/groups/${groupId}?${searchParams.toString()}`;
}

export async function createBetAction(
  _previousState: BetFormState,
  formData: FormData,
): Promise<BetFormState> {
  const supabase = await createClient();
  const groupId = getString(formData, "groupId");
  const title = getString(formData, "title");
  const options = formData
    .getAll("options")
    .filter((value): value is string => typeof value === "string");
  const endsAtRaw = getString(formData, "endsAt");

  if (!groupId) {
    return errorState("Group not found.");
  }

  const targetEndsAt = endsAtRaw ? new Date(endsAtRaw) : null;

  if (targetEndsAt && Number.isNaN(targetEndsAt.getTime())) {
    return errorState("Enter a valid closing date and time.");
  }

  const { error } = await supabase.rpc("create_bet", {
    target_group_id: groupId,
    bet_title: title,
    option_texts: options,
    target_ends_at: targetEndsAt ? targetEndsAt.toISOString() : null,
  });

  if (error) {
    return errorState(error.message);
  }

  revalidateGroup(groupId);
  redirect(`/groups/${groupId}`);
}

export async function placeWagerAction(
  _previousState: BetFormState,
  formData: FormData,
): Promise<BetFormState> {
  const supabase = await createClient();
  const groupId = getString(formData, "groupId");
  const betId = getString(formData, "betId");
  const optionId = getString(formData, "optionId");
  const points = Number(getString(formData, "points"));

  if (!groupId || !betId || !optionId) {
    return errorState("Missing wager information.");
  }

  if (!Number.isInteger(points) || points <= 0) {
    return errorState("Points must be a whole number greater than zero.");
  }

  const { error } = await supabase.rpc("place_wager", {
    target_bet_id: betId,
    target_option_id: optionId,
    wager_points: points,
  });

  if (error) {
    return errorState(error.message);
  }

  revalidateGroup(groupId);
  redirect(`/groups/${groupId}`);
}

export async function closeBetAction(formData: FormData) {
  const supabase = await createClient();
  const groupId = getString(formData, "groupId");
  const betId = getString(formData, "betId");

  if (!groupId || !betId) {
    redirect("/groups");
  }

  const { error } = await supabase.rpc("close_bet", {
    target_bet_id: betId,
  });

  if (error) {
    redirect(buildGroupRedirectUrl(groupId, { actionError: error.message }));
  }

  revalidateGroup(groupId);
  redirect(`/groups/${groupId}`);
}

export async function cancelBetAction(formData: FormData) {
  const supabase = await createClient();
  const groupId = getString(formData, "groupId");
  const betId = getString(formData, "betId");

  if (!groupId || !betId) {
    redirect("/groups");
  }

  const { error } = await supabase.rpc("cancel_bet", {
    target_bet_id: betId,
  });

  if (error) {
    redirect(buildGroupRedirectUrl(groupId, { actionError: error.message }));
  }

  revalidateGroup(groupId);
  redirect(`/groups/${groupId}`);
}

export async function resolveBetAction(formData: FormData) {
  const supabase = await createClient();
  const groupId = getString(formData, "groupId");
  const betId = getString(formData, "betId");
  const optionId = getString(formData, "winningOptionId");

  if (!groupId || !betId || !optionId) {
    redirect("/groups");
  }

  const { error } = await supabase.rpc("resolve_bet", {
    target_bet_id: betId,
    target_option_id: optionId,
  });

  if (error) {
    redirect(buildGroupRedirectUrl(groupId, { actionError: error.message }));
  }

  revalidateGroup(groupId);
  redirect(`/groups/${groupId}`);
}
