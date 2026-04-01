const INVITE_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INVITE_CODE_LENGTH = 6;

export function generateInviteCode() {
  let code = "";

  for (let index = 0; index < INVITE_CODE_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * INVITE_CODE_CHARACTERS.length);
    code += INVITE_CODE_CHARACTERS[randomIndex];
  }

  return code;
}

export function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase();
}
