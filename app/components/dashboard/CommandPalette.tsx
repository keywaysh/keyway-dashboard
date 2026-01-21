'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { groupVaultsByOwner } from '@/lib/utils/vaults'
import type { Vault } from '@/lib/types'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const { data: vaults = [], isLoading } = useQuery({
    queryKey: ['vaults'],
    queryFn: () => api.getVaults(),
    enabled: open,
    staleTime: 30_000, // 30s - avoid refetch on rapid open/close
  })

  const vaultGroups = useMemo(
    () => groupVaultsByOwner(vaults, user?.github_username),
    [vaults, user?.github_username]
  )

  const filteredGroups = useMemo(() => {
    if (!search) return vaultGroups
    const query = search.toLowerCase()
    return vaultGroups
      .map(group => ({
        ...group,
        vaults: group.vaults.filter(v =>
          v.repo_name.toLowerCase().includes(query) ||
          v.repo_owner.toLowerCase().includes(query)
        ),
      }))
      .filter(group => group.vaults.length > 0)
  }, [vaultGroups, search])

  const handleSelect = useCallback(
    (vault: Vault) => {
      router.push(`/vaults/${vault.repo_owner}/${vault.repo_name}`)
      onOpenChange(false)
      setSearch('')
    },
    [router, onOpenChange]
  )

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen)
      if (!newOpen) setSearch('')
    },
    [onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 gap-0">
        <DialogTitle className="sr-only">Search vaults</DialogTitle>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          <CommandInput
            placeholder="Search vaults..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                Loading vaults...
              </div>
            ) : filteredGroups.length === 0 ? (
              <CommandEmpty>No vaults found.</CommandEmpty>
            ) : (
              filteredGroups.map(group => (
                <CommandGroup
                  key={group.owner}
                  heading={group.isPersonal ? 'Personal' : group.owner}
                >
                  {group.vaults.map(vault => (
                    <CommandItem
                      key={`${vault.repo_owner}/${vault.repo_name}`}
                      value={`${vault.repo_owner}/${vault.repo_name}`}
                      onSelect={() => handleSelect(vault)}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="size-5">
                        <AvatarImage src={vault.repo_avatar} alt={vault.repo_name} />
                        <AvatarFallback className="text-[10px]">
                          {vault.repo_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">{vault.repo_name}</span>
                      {vault.secrets_count > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {vault.secrets_count} secret{vault.secrets_count > 1 ? 's' : ''}
                        </span>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
