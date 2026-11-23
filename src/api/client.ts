import { supabase } from "@/lib/supabase"

type RequestConfig = {
  params?: Record<string, string | number | boolean | undefined>
}

type Response<T = any> = { data: T }

function databaseError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

function mapCategory(row: any) {
  return row && {
    ...row,
    sortOrder: row.sort_order,
  }
}

function mapMenuItem(row: any) {
  return row && {
    ...row,
    categoryId: row.category_id,
    prepTime: row.prep_time,
  }
}

function mapOrder(row: any) {
  if (!row) return row
  return {
    id: row.id,
    orderNumber: row.order_number,
    type: row.type,
    tableId: row.table_id,
    tableName: row.table_name,
    waiterId: row.legacy_waiter_id || row.waiter_id,
    waiterName: row.waiter_name,
    status: row.status,
    kitchenStatus: row.kitchen_status,
    paymentStatus: row.payment_status,
    items: (row.order_items || []).map((item: any) => ({
      menuItemId: item.menu_item_id,
      name: item.name,
      qty: item.qty,
      price: Number(item.price),
      note: item.note,
    })),
    subtotal: Number(row.subtotal),
    vat: Number(row.vat),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapInventory(row: any) {
  return row && {
    ...row,
    minQuantity: Number(row.min_quantity),
    reorderLevel: Number(row.reorder_level),
    costPerUnit: Number(row.cost_per_unit),
    quantity: Number(row.quantity),
    cost: Number(row.cost),
  }
}

function mapEvent(row: any) {
  return row && {
    id: row.id,
    title: row.title,
    hall: row.hall,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    guestCount: row.guest_count,
    status: row.status,
    depositPaid: Number(row.deposit_paid),
    totalAmount: Number(row.total_amount),
    balance: Number(row.balance),
    notes: row.notes,
    createdAt: row.created_at,
  }
}

function mapTransaction(row: any) {
  if (!row) return row
  const createdAt = row.created_at
  return row && {
    id: row.id,
    orderNumber: row.order_number,
    reference: row.receipt_number,
    cashierId: row.legacy_cashier_id || row.cashier_id,
    cashierName: row.cashier_name,
    amount: Number(row.amount),
    method: row.method,
    amountGiven: Number(row.amount_given),
    change: Number(row.change),
    status: row.status,
    receiptNumber: row.receipt_number,
    date: createdAt?.slice(0, 10) || "",
    time: createdAt?.slice(11, 16) || "",
    createdAt,
  }
}

function mapProfile(row: any) {
  return row && {
    id: row.legacy_id || row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar,
    active: row.active,
  }
}

async function getResource(path: string, config?: RequestConfig): Promise<Response> {
  const params = config?.params || {}

  if (path === "/menu/categories") {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order")
    databaseError(error)
    return { data: (data || []).map(mapCategory) }
  }

  if (path === "/menu/menu-items") {
    let query = supabase.from("menu_items").select("*")
    if (params.categoryId) query = query.eq("category_id", String(params.categoryId))
    if (params.available !== undefined) query = query.eq("available", Boolean(params.available))
    const { data, error } = await query
    databaseError(error)
    return { data: (data || []).map(mapMenuItem) }
  }

  if (path === "/menu/tables") {
    const { data, error } = await supabase.from("tables").select("*")
    databaseError(error)
    return { data: data || [] }
  }

  if (path === "/orders") {
    let query = supabase.from("orders").select("*,order_items(*)")
    if (params.kitchenStatus) query = query.eq("kitchen_status", String(params.kitchenStatus))
    if (params.paymentStatus) query = query.eq("payment_status", String(params.paymentStatus))
    if (params.tableId) query = query.eq("table_id", String(params.tableId))
    if (params.status) query = query.eq("status", String(params.status))
    const { data, error } = await query.order("created_at", { ascending: false })
    databaseError(error)
    return { data: (data || []).map(mapOrder) }
  }

  if (path.startsWith("/orders/")) {
    const id = path.split("/").pop()
    const { data, error } = await supabase
      .from("orders")
      .select("*,order_items(*)")
      .eq("id", id)
      .single()
    databaseError(error)
    return { data: mapOrder(data) }
  }

  if (path === "/transactions") {
    const { data, error } = await supabase.from("transactions").select("*")
    databaseError(error)
    return { data: (data || []).map(mapTransaction) }
  }

  if (path === "/inventory") {
    const { data, error } = await supabase.from("inventory").select("*")
    databaseError(error)
    return { data: (data || []).map(mapInventory) }
  }

  if (path === "/inventory/low-stock") {
    const { data, error } = await supabase.from("inventory").select("*")
    databaseError(error)
    return {
      data: (data || [])
        .filter((item) => Number(item.quantity) <= Number(item.min_quantity))
        .map(mapInventory),
    }
  }

  if (path === "/events") {
    let query = supabase.from("events").select("*")
    if (params.status) query = query.eq("status", String(params.status))
    const { data, error } = await query
    databaseError(error)
    return { data: (data || []).map(mapEvent) }
  }

  if (path === "/users") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,legacy_id,name,email,role,avatar,active")
    databaseError(error)
    return { data: (data || []).map(mapProfile) }
  }

  if (path === "/analytics/summary") {
    const [transactions, orders, inventory, events] = await Promise.all([
      supabase.from("transactions").select("amount,status"),
      supabase.from("orders").select("payment_status"),
      supabase.from("inventory").select("quantity,min_quantity"),
      supabase.from("events").select("status"),
    ])

    const paidTransactions = (transactions.data || []).filter((item) => item.status === "paid")
    return {
      data: {
        totalRevenue: paidTransactions.reduce((sum, item) => sum + Number(item.amount), 0),
        pendingOrders: (orders.data || []).filter((item) => item.payment_status === "unpaid").length,
        lowStockCount: (inventory.data || []).filter(
          (item) => Number(item.quantity) <= Number(item.min_quantity)
        ).length,
        confirmedEvents: (events.data || []).filter((item) => item.status === "confirmed").length,
        totalTransactions: paidTransactions.length,
        totalSales: paidTransactions.reduce((sum, item) => sum + Number(item.amount), 0),
        totalOrders: (orders.data || []).length,
        totalCustomers: 0,
        totalBookings: (events.data || []).length,
        netProfit: 0,
        totalExpenses: 0,
      },
    }
  }

  if (path === "/analytics/today" || path === "/analytics/monthly") {
    const summary = await getResource("/analytics/summary")
    if (path === "/analytics/today") {
      return {
        data: {
          totalSales: summary.data.totalSales,
          totalOrders: summary.data.totalOrders,
          totalCustomers: summary.data.totalCustomers,
          totalBookings: summary.data.totalBookings,
          netProfit: summary.data.netProfit,
          totalExpenses: summary.data.totalExpenses,
        },
      }
    }
    return {
      data: {
        totalSales: summary.data.totalSales,
        totalExpenses: summary.data.totalExpenses,
        netProfit: summary.data.netProfit,
        salesByDay: [],
      },
    }
  }

  throw new Error(`Unsupported Supabase GET endpoint: ${path}`)
}

async function postResource(path: string, body: any): Promise<Response> {
  if (path === "/users") {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "create", user: body },
    })
    databaseError(error)
    return { data: data.user }
  }

  if (path === "/orders") {
    const { data, error } = await supabase.rpc("create_order", {
      p_type: body.type,
      p_table_id: body.tableId,
      p_table_name: body.tableName,
      p_items: body.items,
    })
    databaseError(error)
    return getResource(`/orders/${data.id}`)
  }

  if (path === "/transactions") {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", body.orderNumber)
      .single()
    databaseError(orderError)
    if (!order) throw new Error("Order not found")

    const { data, error } = await supabase.rpc("complete_payment", {
      p_order_id: order.id,
      p_payment_method: body.method,
      p_amount_given: body.amountGiven,
    })
    databaseError(error)
    return { data: mapTransaction(data) }
  }

  if (path === "/menu/menu-items") {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        id: `m-${crypto.randomUUID()}`,
        category_id: body.categoryId,
        name: body.name,
        price: body.price,
        unit: body.unit,
        available: body.available ?? true,
        prep_time: body.prepTime ?? 0,
        image: body.image,
      })
      .select("*")
      .single()
    databaseError(error)
    return { data: mapMenuItem(data) }
  }

  if (path.endsWith("/restock")) {
    const id = path.split("/")[2]
    const { data: item, error: readError } = await supabase
      .from("inventory")
      .select("*")
      .eq("id", id)
      .single()
    databaseError(readError)
    const { data, error } = await supabase
      .from("inventory")
      .update({ quantity: Number(item.quantity) + Number(body.amount) })
      .eq("id", id)
      .select("*")
      .single()
    databaseError(error)
    return { data: mapInventory(data) }
  }

  if (path === "/events") {
    const totalAmount = Number(body.totalAmount)
    const depositPaid = Number(body.depositPaid || 0)
    const { data, error } = await supabase
      .from("events")
      .insert({
        id: `ev-${crypto.randomUUID()}`,
        title: body.title,
        hall: body.hall,
        date: body.date,
        start_time: body.startTime,
        end_time: body.endTime,
        client_name: body.clientName,
        client_phone: body.clientPhone,
        guest_count: body.guestCount,
        status: body.status,
        deposit_paid: depositPaid,
        total_amount: totalAmount,
        balance: totalAmount - depositPaid,
        notes: body.notes || "",
      })
      .select("*")
      .single()
    databaseError(error)
    return { data: mapEvent(data) }
  }

  if (/^\/events\/[^/]+\/deposit$/.test(path)) {
    const id = path.split("/")[2]
    const { data: event, error: readError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()
    databaseError(readError)
    const depositPaid = Number(event.deposit_paid) + Number(body.amount)
    const { data, error } = await supabase
      .from("events")
      .update({
        deposit_paid: depositPaid,
        balance: Number(event.total_amount) - depositPaid,
      })
      .eq("id", id)
      .select("*")
      .single()
    databaseError(error)
    return { data: mapEvent(data) }
  }

  if (path === "/users") {
    throw new Error(
      "Creating staff accounts requires the Supabase Admin API and should be added as a protected Edge Function."
    )
  }

  throw new Error(`Unsupported Supabase POST endpoint: ${path}`)
}

async function patchResource(path: string, body: any): Promise<Response> {
  if (path.startsWith("/menu/menu-items/")) {
    const id = path.split("/").pop()
    const update: any = {}
    if (body.available !== undefined) update.available = body.available
    if (body.categoryId !== undefined) update.category_id = body.categoryId
    if (body.name !== undefined) update.name = body.name
    if (body.price !== undefined) update.price = body.price
    if (body.unit !== undefined) update.unit = body.unit
    if (body.prepTime !== undefined) update.prep_time = body.prepTime
    if (body.image !== undefined) update.image = body.image
    const { data, error } = await supabase
      .from("menu_items")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()
    databaseError(error)
    return { data: mapMenuItem(data) }
  }

  if (path.startsWith("/menu/tables/")) {
    const id = path.split("/").pop()
    const { data, error } = await supabase
      .from("tables")
      .update({ status: body.status })
      .eq("id", id)
      .select("*")
      .single()
    databaseError(error)
    return { data }
  }

  if (path.startsWith("/orders/")) {
    const id = path.split("/").pop()
    const update: any = {}
    if (body.status !== undefined) update.status = body.status
    if (body.kitchenStatus !== undefined) update.kitchen_status = body.kitchenStatus
    if (body.paymentStatus !== undefined) update.payment_status = body.paymentStatus
    if (body.paymentMethod !== undefined) update.payment_method = body.paymentMethod
    if (body.subtotal !== undefined) update.subtotal = body.subtotal
    if (body.vat !== undefined) update.vat = body.vat
    if (body.total !== undefined) update.total = body.total

    if (body.items) {
      await supabase.from("order_items").delete().eq("order_id", id)
      const itemRows = body.items.map((item: any) => ({
        order_id: id,
        menu_item_id: item.menuItemId,
        name: item.name,
        qty: item.qty,
        price: item.price,
        note: item.note || "",
      }))
      const { error: itemsError } = await supabase.from("order_items").insert(itemRows)
      databaseError(itemsError)
    }

    const { data, error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id)
      .select("*,order_items(*)")
      .single()
    databaseError(error)
    return { data: mapOrder(data) }
  }

  if (path.startsWith("/inventory/")) {
    const id = path.split("/").pop()
    const update: any = {}
    if (body.name !== undefined) update.name = body.name
    if (body.category !== undefined) update.category = body.category
    if (body.unit !== undefined) update.unit = body.unit
    if (body.quantity !== undefined) update.quantity = body.quantity
    if (body.minQuantity !== undefined) update.min_quantity = body.minQuantity
    if (body.reorderLevel !== undefined) update.reorder_level = body.reorderLevel
    if (body.costPerUnit !== undefined) update.cost_per_unit = body.costPerUnit
    if (body.cost !== undefined) update.cost = body.cost
    const { data, error } = await supabase
      .from("inventory")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()
    databaseError(error)
    return { data: mapInventory(data) }
  }

  if (path.startsWith("/events/")) {
    const id = path.split("/").pop()
    const update: any = {}
    if (body.title !== undefined) update.title = body.title
    if (body.hall !== undefined) update.hall = body.hall
    if (body.date !== undefined) update.date = body.date
    if (body.startTime !== undefined) update.start_time = body.startTime
    if (body.endTime !== undefined) update.end_time = body.endTime
    if (body.clientName !== undefined) update.client_name = body.clientName
    if (body.clientPhone !== undefined) update.client_phone = body.clientPhone
    if (body.guestCount !== undefined) update.guest_count = body.guestCount
    if (body.status !== undefined) update.status = body.status
    if (body.notes !== undefined) update.notes = body.notes
    if (body.depositPaid !== undefined) update.deposit_paid = body.depositPaid
    if (body.totalAmount !== undefined) update.total_amount = body.totalAmount
    if (body.depositPaid !== undefined || body.totalAmount !== undefined) {
      const { data: event } = await supabase
        .from("events")
        .select("deposit_paid,total_amount")
        .eq("id", id)
        .single()
      const deposit = body.depositPaid ?? Number(event?.deposit_paid)
      const total = body.totalAmount ?? Number(event?.total_amount)
      update.balance = total - deposit
    }
    const { data, error } = await supabase
      .from("events")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()
    databaseError(error)
    return { data: mapEvent(data) }
  }

  if (path.startsWith("/users/")) {
    const id = path.split("/").pop()
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "update", user: { ...body, id } },
    })
    databaseError(error)
    return { data: mapProfile(data.user) }
  }

  throw new Error(`Unsupported Supabase PATCH endpoint: ${path}`)
}

async function deleteResource(path: string): Promise<Response> {
  if (path.startsWith("/events/")) {
    const id = path.split("/").pop()
    const { error } = await supabase.from("events").delete().eq("id", id)
    databaseError(error)
    return { data: null }
  }

  if (path.startsWith("/users/")) {
    const id = path.split("/").pop()
    const { error } = await supabase.functions.invoke("admin-users", {
      body: { action: "disable", user: { id } },
    })
    databaseError(error)
    return { data: null }
  }

  throw new Error(`Unsupported Supabase DELETE endpoint: ${path}`)
}

export const apiClient = {
  get: (path: string, config?: RequestConfig) => getResource(path, config),
  post: (path: string, body: any) => postResource(path, body),
  patch: (path: string, body: any) => patchResource(path, body),
  delete: (path: string) => deleteResource(path),
}
