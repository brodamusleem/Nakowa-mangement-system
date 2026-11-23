import fs from "node:fs"
import { createClient } from "@supabase/supabase-js"

const url = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  throw new Error(
    "Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before running migration."
  )
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const db = JSON.parse(
  fs.readFileSync(new URL("../data/db.json", import.meta.url), "utf8")
)

async function required(operation, label) {
  const { error } = await operation
  if (error) throw new Error(`${label}: ${error.message}`)
}

for (const user of db.users) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: String(user.pin),
    email_confirm: true,
    user_metadata: { name: user.name, role: user.role },
  })

  if (error && !error.message.includes("already been registered")) {
    throw new Error(`Creating auth user ${user.email}: ${error.message}`)
  }

  let authUserId = data?.user?.id
  if (!authUserId) {
    const { data: existing, error: lookupError } =
      await supabase.auth.admin.listUsers()
    if (lookupError) throw new Error(lookupError.message)
    authUserId = existing.users.find((item) => item.email === user.email)?.id
  }
  if (!authUserId) throw new Error(`Could not resolve auth user ${user.email}`)

  await required(
    supabase.from("profiles").upsert({
      id: authUserId,
      legacy_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      active: user.active,
    }),
    `Profile ${user.email}`
  )
}
console.log(`Created or updated ${db.users.length} staff profiles. No business data was imported.`)
