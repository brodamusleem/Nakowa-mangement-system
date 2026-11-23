import { createClient } from "@supabase/supabase-js"

const url = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.NAKOWA_ADMIN_EMAIL?.trim().toLowerCase()
const name = process.env.NAKOWA_ADMIN_NAME?.trim()
const password = process.env.NAKOWA_ADMIN_PASSWORD

if (!url || !serviceRoleKey || !email || !name || !password) {
  throw new Error(
    "Set VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NAKOWA_ADMIN_EMAIL, NAKOWA_ADMIN_NAME, and NAKOWA_ADMIN_PASSWORD in .env.local."
  )
}
if (password.length < 8) throw new Error("NAKOWA_ADMIN_PASSWORD must have at least 8 characters.")

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
if (listError) throw new Error(listError.message)
if (existingUsers.users.some((user) => user.email?.toLowerCase() === email)) {
  throw new Error(`An Auth account already exists for ${email}; bootstrap was not applied.`)
}

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name },
})

if (createError || !created.user) throw new Error(`Could not create administrator: ${createError?.message || "No user returned"}`)

const { error: profileError } = await supabase.from("profiles").insert({
  id: created.user.id,
  name,
  email,
  role: "admin",
  active: true,
})
if (profileError) throw new Error(`Could not create administrator profile: ${profileError.message}`)

console.log(`Administrator account is ready for ${email}.`)
