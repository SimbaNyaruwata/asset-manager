import { getCurrentUser } from '@/lib/auth-actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Package, Users, FolderTree, Building2, TrendingUp, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/user/dashboard')
  }

  const supabase = await createClient()

  // Fetch real data from database
  const [
    { data: assets },
    { data: users },
    { data: categories },
    { data: departments }
  ] = await Promise.all([
    supabase.from('assets').select('*'),
    supabase.from('users').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('departments').select('*')
  ])

  // Calculate stats
  const totalAssets = assets?.length || 0
  const totalUsers = users?.length || 0
  const totalCategories = categories?.length || 0
  const totalDepartments = departments?.length || 0
  
  // Calculate total asset value
  const totalValue = assets?.reduce((sum, asset) => sum + (asset.cost || 0), 0) || 0
  
  // Assets created this month
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const assetsThisMonth = assets?.filter(
    (asset) => new Date(asset.created_at) >= firstDayOfMonth
  ).length || 0

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentActivity = assets?.filter(
    (asset) => new Date(asset.created_at) >= sevenDaysAgo
  ).length || 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your assets today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Assets"
          value={totalAssets}
          description={totalAssets === 0 ? 'No assets created yet' : 'Assets in system'}
          icon={Package}
        />
        <StatsCard
          title="Total Users"
          value={totalUsers}
          description={`${totalUsers} ${totalUsers === 1 ? 'user' : 'users'} in system`}
          icon={Users}
        />
        <StatsCard
          title="Categories"
          value={totalCategories}
          description="Available asset categories"
          icon={FolderTree}
        />
        <StatsCard
          title="Departments"
          value={totalDepartments}
          description="Active departments"
          icon={Building2}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Asset Value"
          value={formatCurrency(totalValue)}
          description="Combined value of all assets"
          icon={DollarSign}
        />
        <StatsCard
          title="Assets This Month"
          value={assetsThisMonth}
          description="New assets added"
          icon={TrendingUp}
        />
        <StatsCard
          title="Recent Activity"
          value={recentActivity}
          description="Actions in last 7 days"
          icon={Package}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Manage Users</p>
                    <p className="text-xs text-muted-foreground">Add or view users</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/admin/categories">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <FolderTree className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Manage Categories</p>
                    <p className="text-xs text-muted-foreground">View or create categories</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/admin/departments">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Manage Departments</p>
                    <p className="text-xs text-muted-foreground">View or create departments</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/admin/assets">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">View All Assets</p>
                    <p className="text-xs text-muted-foreground">Manage system assets</p>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="text-sm font-medium text-green-600">● Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Authentication</span>
              <span className="text-sm font-medium text-green-600">● Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Role</span>
              <span className="text-sm font-medium capitalize">{user.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account Email</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Summary of your asset management system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Assets</p>
              <p className="text-2xl font-bold">{totalAssets}</p>
              <p className="text-xs text-muted-foreground">Total items tracked</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Active system users</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{totalCategories}</p>
              <p className="text-xs text-muted-foreground">Asset categories</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold">{totalDepartments}</p>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      
    </div>
  )
}