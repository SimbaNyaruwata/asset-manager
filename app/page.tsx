import { redirect } from 'next/navigation'

export default function Home() {
  // This will redirect to login via middleware
  redirect('/login')
}