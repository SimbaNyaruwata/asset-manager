'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AssetForm } from './asset-form'

export function AssetDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Asset
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px] bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-2xl border"
      >
        <DialogHeader>
          <DialogTitle>Create New Asset</DialogTitle>
          <DialogDescription>
            Add a new asset to track in your inventory.
          </DialogDescription>
        </DialogHeader>
        <AssetForm
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}