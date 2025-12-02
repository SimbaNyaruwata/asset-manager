import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryDialog } from '@/components/forms/category-dialog'
import { formatDate } from '@/lib/utils'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  // Fetch all categories
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*, users:created_by(name, email)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories Management</h2>
          <p className="text-muted-foreground">
            Create and manage asset categories
          </p>
        </div>
        <CategoryDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            {categories?.length || 0} categories in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>Error loading categories: {error.message}</p>
            </div>
          )}

          {!error && categories && categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No categories yet</p>
              <p className="text-xs mt-1">Create your first category to get started</p>
            </div>
          )}

          {!error && categories && categories.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-1">
                    <p>Created: {formatDate(category.created_at)}</p>
                    {category.users && (
                      <p>By: {category.users.name || category.users.email}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}