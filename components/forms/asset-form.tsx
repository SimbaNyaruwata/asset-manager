'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { assetSchema, type AssetFormData } from '@/lib/validations/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface AssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface Category {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
}

export function AssetForm({ onSuccess, onCancel }: AssetFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  })

  const selectedCategory = watch('category_id')
  const selectedDepartment = watch('department_id')

  // Fetch categories and departments
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        const [categoriesResult, departmentsResult] = await Promise.all([
          supabase.from('categories').select('id, name').order('name'),
          supabase.from('departments').select('id, name').order('name'),
        ])

        if (categoriesResult.data) setCategories(categoriesResult.data)
        if (departmentsResult.data) setDepartments(departmentsResult.data)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (data: AssetFormData) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        throw new Error('Not authenticated')
      }

      const { error: insertError } = await supabase.from('assets').insert({
        name: data.name,
        category_id: data.category_id,
        department_id: data.department_id,
        date_purchased: data.date_purchased,
        cost: parseFloat(data.cost),
        created_by: userData.user.id,
      })

      if (insertError) {
        setError(insertError.message)
        toast.error('Failed to create asset', {
          description: insertError.message,
        })
        return
      }

      toast.success('Asset created successfully!', {
        description: `${data.name} has been added to your assets.`,
      })

      router.refresh()
      onSuccess?.()
    } catch (err) {
      console.error('Create asset error:', err)
      setError('An unexpected error occurred. Please try again.')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Asset Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., MacBook Pro 2023"
          disabled={loading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setValue('category_id', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.length === 0 ? (
                <SelectItem value="none" disabled>
                  No categories available
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.category_id && (
            <p className="text-sm text-red-500">{errors.category_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={selectedDepartment}
            onValueChange={(value) => setValue('department_id', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.length === 0 ? (
                <SelectItem value="none" disabled>
                  No departments available
                </SelectItem>
              ) : (
                departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.department_id && (
            <p className="text-sm text-red-500">{errors.department_id.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_purchased">Purchase Date</Label>
          <Input
            id="date_purchased"
            type="date"
            {...register('date_purchased')}
            disabled={loading}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.date_purchased && (
            <p className="text-sm text-red-500">{errors.date_purchased.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Cost ($)</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            {...register('cost')}
            placeholder="0.00"
            disabled={loading}
          />
          {errors.cost && (
            <p className="text-sm text-red-500">{errors.cost.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Asset'
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}