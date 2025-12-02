import { getCurrentUser } from '@/lib/auth-actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Package, DollarSign, TrendingUp, Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import Link from 'next/link'

export default async function UserDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'user') {
    redirect('/admin/dashboard')
  }

  const supabase = await createClient()

  // Fetch user's assets
  const { data: assets } = await supabase
    .from('assets')
    .select('*, categories(name), departments(name)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const totalAssets = assets?.length || 0
  const totalValue = assets?.reduce((sum, asset) => sum + (asset.cost || 0), 0) || 0
  
  // Assets created this month
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const assetsThisMonth = assets?.filter(
    (asset) => new Date(asset.created_at) >= firstDayOfMonth
  ).length || 0

  // Most recent asset
  const lastAsset = assets?.[0]
  const lastPurchaseDate = lastAsset ? formatDateShort(lastAsset.date_purchased) : 'Never'

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h2>
        <p className="text-muted-foreground">
          Manage and track your assets efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Assets"
          value={totalAssets}
          description={totalAssets === 0 ? 'No assets yet' : 'Total assets'}
          icon={Package}
        />
        <StatsCard
          title="Total Value"
          value={formatCurrency(totalValue)}
          description="Combined asset value"
          icon={DollarSign}
        />
        <StatsCard
          title="This Month"
          value={assetsThisMonth}
          description="Assets added this month"
          icon={TrendingUp}
        />
        <StatsCard
          title="Last Purchase"
          value={lastPurchaseDate}
          description="Most recent asset"
          icon={Calendar}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your asset management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/user/assets" className="flex-1">
              <Button className="w-full">
                <Package className="mr-2 h-4 w-4" />
                View All Assets
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assets</CardTitle>
          <CardDescription>Your latest additions</CardDescription>
        </CardHeader>
        <CardContent>
          {!assets || assets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No assets yet</p>
              <p className="text-xs mt-1">Create your first asset to get started</p>
              <Link href="/user/assets">
                <Button className="mt-4" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Asset
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {assets.slice(0, 5).map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {asset.categories?.name} • {asset.departments?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(asset.cost)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateShort(asset.date_purchased)}
                    </p>
                  </div>
                </div>
              ))}
              {assets.length > 5 && (
                <Link href="/user/assets">
                  <Button variant="outline" className="w-full mt-2">
                    View All {assets.length} Assets
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-green-600">● Active</span>
          </div>
        </CardContent>
      </Card>

     
    </div>
  )
}