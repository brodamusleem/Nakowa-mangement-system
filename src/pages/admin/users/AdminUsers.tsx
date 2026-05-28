import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit2, Trash2, AlertCircle } from "lucide-react"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/types/userTypes"

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  manager: "bg-secondary/10 text-secondary border-secondary/20",
  cashier: "bg-accent/10 text-accent border-accent/20",
  kitchen: "bg-info/10 text-info border-info/20",
  waiter: "bg-muted/50 text-muted-foreground border-muted/20",
}

export default function AdminUsers() {
  const { data: users = [], isLoading } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", role: "cashier" as const })

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAddUser = () => {
    setEditingUser(null)
    setFormData({ name: "", email: "", role: "cashier" })
    setShowModal(true)
  }

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: user.email, role: user.role as any })
    setShowModal(true)
  }

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill all fields")
      return
    }

    try {
      if (editingUser) {
        await updateUser.mutateAsync({ id: editingUser.id, ...formData })
        toast.success("User updated successfully")
      } else {
        await createUser.mutateAsync(formData as any)
        toast.success("User created successfully")
      }
      setShowModal(false)
    } catch (error) {
      toast.error("Failed to save user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser.mutateAsync(userId)
      toast.success("User deleted successfully")
      setDeleteConfirm(null)
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Users & Roles</h1>
          <p className="text-sm text-muted-foreground md:text-base">Manage team members and permissions</p>
        </div>
        <Button onClick={handleOpenAddUser} className="w-full gap-2 md:w-auto">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No users found</p>
          </Card>
        ) : (
          filtered.map((user) => (
            <Card key={user.id} className="p-3 md:p-4">
              <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-0">
                <div className="flex-1">
                  <div className="font-medium text-sm md:text-base">{user.name}</div>
                  <div className="text-xs text-muted-foreground md:text-sm">{user.email}</div>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <Badge className={roleColors[user.role] || roleColors.waiter}>{user.role}</Badge>
                  <Badge variant="outline">{user.active ? "✓ Active" : "Inactive"}</Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenEditUser(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => setDeleteConfirm(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit User Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-full max-w-sm md:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user information" : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(role) => setFormData({ ...formData, role: role as any })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={createUser.isPending || updateUser.isPending}>
              {editingUser ? "Update" : "Create"} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete User
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteUser(deleteConfirm)}
              disabled={deleteUser.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}