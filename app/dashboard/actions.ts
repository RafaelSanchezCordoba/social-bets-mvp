"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateInviteCode, normalizeInviteCode } from "@/lib/groups/invite-code";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type GroupActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function normalizeGroupName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

const errorState = (message: string): GroupActionState => ({
  status: "error",
  message,
});

export async function createGroupAction(
  _previousState: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorState("You need to be signed in to create a group.");
  }

  if (!hasServiceRoleKey()) {
    return errorState(
      "Group management requires SUPABASE_SERVICE_ROLE_KEY in the server environment.",
    );
  }

  const admin = createAdminClient();

  const name = normalizeGroupName(getString(formData, "name"));

  if (name.length < 3) {
    return errorState("Group name must be at least 3 characters long.");
  }

  if (name.length > 40) {
    return errorState("Group name must be 40 characters or less.");
  }

  let inviteCode = generateInviteCode();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: existingGroup } = await admin
      .from("groups")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (!existingGroup) {
      break;
    }

    inviteCode = generateInviteCode();
  }

  const { data: group, error: groupError } = await admin
    .from("groups")
    .insert({
      name,
      invite_code: inviteCode,
      created_by: user.id,
    })
    .select("id, invite_code")
    .single();

  if (groupError) {
    if (groupError.code === "23505") {
      return errorState("That group name already exists. Choose another one.");
    }

    return errorState(groupError.message);
  }

  const { error: memberError } = await admin.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
    points: 1000,
  });

  if (memberError) {
    await admin.from("groups").delete().eq("id", group.id);
    return errorState(memberError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/groups/${group.id}`);
  redirect(`/groups/${group.id}`);
}

export async function joinGroupAction(
  _previousState: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorState("You need to be signed in to join a group.");
  }

  if (!hasServiceRoleKey()) {
    return errorState(
      "Group management requires SUPABASE_SERVICE_ROLE_KEY in the server environment.",
    );
  }

  const admin = createAdminClient();

  const inviteCode = normalizeInviteCode(getString(formData, "inviteCode"));

  if (inviteCode.length !== 6) {
    return errorState("Invite code must be 6 characters long.");
  }

  const { data: group, error: groupError } = await admin
    .from("groups")
    .select("id, name")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (groupError) {
    return errorState(groupError.message);
  }

  if (!group) {
    return errorState("That invite code does not match any group.");
  }

  const { error: memberError } = await admin.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "member",
    points: 1000,
  });

  if (memberError) {
    if (memberError.code === "23505") {
      return errorState("You are already a member of that group.");
    }

    return errorState(memberError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/groups/${group.id}`);
  redirect(`/groups/${group.id}`);
}

export async function removeMemberAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  if (!hasServiceRoleKey()) {
    return;
  }

  const admin = createAdminClient();

  const groupId = getString(formData, "groupId");
  const memberUserId = getString(formData, "memberUserId");

  if (!groupId || !memberUserId || memberUserId === user.id) {
    return;
  }

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || membership.role !== "owner") {
    return;
  }

  await admin
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", memberUserId)
    .neq("role", "owner");

  revalidatePath("/dashboard");
  revalidatePath(`/groups/${groupId}`);
}

export async function deleteGroupAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  if (!hasServiceRoleKey()) {
    return;
  }

  const admin = createAdminClient();

  const groupId = getString(formData, "groupId");

  if (!groupId) {
    return;
  }

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || membership.role !== "owner") {
    return;
  }

  await admin.from("groups").delete().eq("id", groupId);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
