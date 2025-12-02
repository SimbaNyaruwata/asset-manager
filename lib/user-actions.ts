'use server'

import { createClient } from '@/lib/supabase/server'
import { type UserFormData } from '@/lib/validations/schemas'

export async function createUserAction(data: UserFormData) {
  try {
    const supabase = await createClient()

    // Verify auth session
    const { data: currentUser } = await supabase.auth.getUser()
    if (!currentUser.user) return { success: false, error: 'Not authenticated' }

    // Check admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single()

    if (userData?.role !== 'admin') {
      return { success: false, error: 'Only admins can create users' }
    }

    // Create new user in Supabase Auth (SERVICE KEY)
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { name: data.name, role: data.role },
      }),
    })

    if (!response.ok) return { success: false, error: 'Failed to create auth user' }

    const authData = await response.json()

    // Insert into public.users table
    await supabase.from('users').insert({
      id: authData.user.id,
      name: data.name,
      email: data.email,
      role: data.role,
    })

    return { success: true, data: authData.user }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Unexpected server error' }
  }
}
