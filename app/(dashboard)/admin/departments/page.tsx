import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DepartmentDialog } from '@/components/forms/department-dialog'
import { formatDate } from '@/lib/utils'

export default async function AdminDepartmentsPage() {
  const supabase = await createClient()

  // Fetch all departments
  const { data: departments, error } = await supabase
    .from('departments')
    .select('*, users:created_by(name, email)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments Management</h2>
          <p className="text-muted-foreground">
            Create and manage departments
          </p>
        </div>
        <DepartmentDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            {departments?.length || 0} departments in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>Error loading departments: {error.message}</p>
            </div>
          )}

          {!error && departments && departments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No departments yet</p>
              <p className="text-xs mt-1">Create your first department to get started</p>
            </div>
          )}

          {!error && departments && departments.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <Card key={department.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{department.name}</CardTitle>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-1">
                    <p>Created: {formatDate(department.created_at)}</p>
                    {department.users && (
                      <p>By: {department.users.name || department.users.email}</p>
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