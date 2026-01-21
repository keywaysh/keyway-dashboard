import type { Vault } from '@/lib/types'

export interface VaultGroup {
  owner: string
  avatar: string
  vaults: Vault[]
  isPersonal: boolean
}

/**
 * Groups vaults by owner (repo_owner) for display.
 * Personal vaults (matching currentUsername) are placed first,
 * followed by organization vaults sorted alphabetically.
 */
export function groupVaultsByOwner(vaults: Vault[], currentUsername?: string): VaultGroup[] {
  const groups = new Map<string, VaultGroup>()
  const currentKey = currentUsername?.toLowerCase()

  for (const vault of vaults) {
    const ownerKey = vault.repo_owner.toLowerCase()
    const existing = groups.get(ownerKey)
    if (existing) {
      existing.vaults.push(vault)
    } else {
      groups.set(ownerKey, {
        owner: vault.repo_owner,
        avatar: vault.repo_avatar,
        vaults: [vault],
        isPersonal: ownerKey === currentKey,
      })
    }
  }

  // Sort: personal vaults first, then alphabetically by owner name
  return Array.from(groups.values()).sort((a, b) => {
    if (a.isPersonal && !b.isPersonal) return -1
    if (!a.isPersonal && b.isPersonal) return 1
    return a.owner.toLowerCase().localeCompare(b.owner.toLowerCase())
  })
}
