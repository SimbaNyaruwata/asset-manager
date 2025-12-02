import { z } from 'zod'

// User validation schema
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(["admin", "user"]).refine((val) => val !== undefined, {
  message: "Please select a role"
})
,
})

export type UserFormData = z.infer<typeof userSchema>

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// Department validation schema
export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
})

export type DepartmentFormData = z.infer<typeof departmentSchema>

// Asset validation schema
export const assetSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  department_id: z.string().min(1, 'Please select a department'),
  date_purchased: z.string().min(1, 'Please select a purchase date'),
  cost: z.string().min(1, 'Please enter a cost').refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    'Cost must be a positive number'
  ),
})

export type AssetFormData = z.infer<typeof assetSchema>