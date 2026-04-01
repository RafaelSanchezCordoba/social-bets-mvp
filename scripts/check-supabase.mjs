const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  },
});

if (!response.ok) {
  const body = await response.text();

  throw new Error(
    `Supabase check failed (${response.status} ${response.statusText}): ${body}`,
  );
}

const data = await response.json();

console.log("Supabase connection OK");
console.log(`- Project URL: ${supabaseUrl}`);
console.log(`- Email auth enabled: ${data.external.email}`);
console.log(`- Google auth enabled: ${data.external.google}`);
console.log(`- Username login ready: ${Boolean(supabaseServiceRoleKey)}`);
