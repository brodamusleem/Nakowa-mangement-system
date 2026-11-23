import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const roles = ["admin", "manager", "cashier", "waiter", "kitchen"] as const

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405)

  const url = Deno.env.get("SUPABASE_URL")!
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  const authorization = request.headers.get("Authorization")
  if (!authorization) return json({ error: "Sign in as an administrator" }, 401)

  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
  })
  const { data: callerResult, error: callerError } = await callerClient.auth.getUser()
  if (callerError || !callerResult.user) return json({ error: "Invalid session" }, 401)

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: callerProfile, error: profileError } = await admin
    .from("profiles")
    .select("role,active")
    .eq("id", callerResult.user.id)
    .single()
  if (profileError || callerProfile?.role !== "admin" || !callerProfile.active) {
    return json({ error: "Administrator access required" }, 403)
  }

  let body: { action?: string; user?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return json({ error: "Invalid request body" }, 400)
  }
  const user = body.user || {}
  const action = body.action

  try {
    if (action === "create") {
      const name = String(user.name || "").trim()
      const email = String(user.email || "").trim().toLowerCase()
      const password = String(user.password || "")
      const role = String(user.role || "")
      if (!name || !email || password.length < 8 || !roles.includes(role as typeof roles[number])) {
        return json({ error: "Enter a name, valid email, role, and password with at least 8 characters" }, 400)
      }

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      })
      if (error || !data.user) return json({ error: error?.message || "Could not create account" }, 400)

      const { data: profile, error: insertError } = await admin
        .from("profiles")
        .insert({ id: data.user.id, name, email, role, active: true })
        .select("id,legacy_id,name,email,role,avatar,active")
        .single()
      if (insertError) {
        await admin.auth.admin.deleteUser(data.user.id)
        return json({ error: insertError.message }, 400)
      }
      return json({ user: profile })
    }

    const profileId = String(user.id || "")
    if (!profileId) return json({ error: "User ID is required" }, 400)
    const { data: existing, error: lookupError } = await admin
      .from("profiles")
      .select("id")
      .or(`legacy_id.eq.${profileId},id.eq.${profileId}`)
      .single()
    if (lookupError || !existing) return json({ error: "User not found" }, 404)

    if (action === "disable") {
      const { error } = await admin.from("profiles").update({ active: false }).eq("id", existing.id)
      if (error) return json({ error: error.message }, 400)
      const { error: banError } = await admin.auth.admin.updateUserById(existing.id, { ban_duration: "876000h" })
      if (banError) return json({ error: banError.message }, 400)
    } else if (action === "update") {
      const update: Record<string, unknown> = {}
      if (user.name !== undefined) update.name = String(user.name).trim()
      if (user.email !== undefined) update.email = String(user.email).trim().toLowerCase()
      if (user.role !== undefined && roles.includes(String(user.role) as typeof roles[number])) update.role = user.role
      if (user.avatar !== undefined) update.avatar = user.avatar
      if (user.active !== undefined) update.active = Boolean(user.active)
      if (user.password) {
        const password = String(user.password)
        if (password.length < 8) return json({ error: "Password must have at least 8 characters" }, 400)
        update.password = password
      }

      if (update.email || update.password || update.active !== undefined) {
        const authUpdate: { email?: string; password?: string; ban_duration?: string } = {}
        if (update.email) authUpdate.email = String(update.email)
        if (update.password) authUpdate.password = String(update.password)
        if (update.active !== undefined) authUpdate.ban_duration = update.active ? "none" : "876000h"
        const { error } = await admin.auth.admin.updateUserById(existing.id, authUpdate)
        if (error) return json({ error: error.message }, 400)
      }

      const { data: profile, error } = await admin
        .from("profiles")
        .update(update)
        .eq("id", existing.id)
        .select("id,legacy_id,name,email,role,avatar,active")
        .single()
      if (error) return json({ error: error.message }, 400)
      return json({ user: profile })
    } else {
      return json({ error: "Unknown action" }, 400)
    }

    const { data: profile, error } = await admin
      .from("profiles")
      .select("id,legacy_id,name,email,role,avatar,active")
      .eq("id", existing.id)
      .single()
    if (error) return json({ error: error.message }, 400)
    return json({ user: profile })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected server error" }, 500)
  }
})
