import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AssetDialog } from '@/components/forms/asset-dialog'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function UserAssetsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Fetch only the current user's assets
  const { data: assets, error } = await supabase
    .from('assets')
    .select(`
      id,
      name,
      category_id,
      department_id,
      date_purchased,
      cost,
      created_at,
      categories(name),
      departments(name)
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Assets</h2>
          <p className="text-muted-foreground">
            View and manage your assets
          </p>
        </div>
        <AssetDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Assets</CardTitle>
          <CardDescription>
            {assets?.length || 0} assets in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>Error loading assets: {error.message}</p>
            </div>
          )}

          {!error && assets && assets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm font-medium">No assets yet</p>
              <p className="text-xs mt-1">Click "Create Asset" to add your first asset</p>
            </div>
          )}

          {!error && assets && assets.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {asset.categories?.name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {asset.departments?.name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateShort(asset.date_purchased)}</TableCell>
                      <TableCell>{formatCurrency(asset.cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}