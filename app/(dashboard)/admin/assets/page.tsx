import { createClient } from '@/lib/supabase/server'
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
import { DeleteAssetButton } from '@/components/tables/delete-asset-button'
import { formatCurrency, formatDateShort } from '@/lib/utils'

export default async function AdminAssetsPage() {
  const supabase = await createClient()

  // Fetch all assets with related data
  const { data: assets, error } = await supabase
    .from('assets')
    .select(`
      *,
      categories(name),
      departments(name),
      users:created_by(name, email)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assets Management</h2>
          <p className="text-muted-foreground">
            View and manage all assets in the system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assets</CardTitle>
          <CardDescription>
            {assets?.length || 0} assets in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>Error loading assets: {error.message}</p>
            </div>
          )}

          {!error && assets && assets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No assets yet</p>
              <p className="text-xs mt-1">Users can create assets from their dashboard</p>
            </div>
          )}

          {!error && assets && assets.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Value</TableHead>
                    
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell className="text-muted-foreground">{asset.serial_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {asset.categories?.name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asset.departments?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(asset.cost || 0)}
                      </TableCell>
                                             
                      <TableCell>
                        <p className="font-medium">{asset.users?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{asset.users?.email}</p>
                      </TableCell>
                      <TableCell>
                        {formatDateShort(asset.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteAssetButton assetId={asset.id} assetName={''} />
                      </TableCell>
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