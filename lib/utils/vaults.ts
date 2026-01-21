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

  for (const vault of vaults) {
    const existing = groups.get(vault.repo_owner)
    if (existing) {
      existing.vaults.push(vault)
    } else {
      groups.set(vault.repo_owner, {
        owner: vault.repo_owner,
        avatar: vault.repo_avatar,
        vaults: [vault],
        isPersonal: vault.repo_owner === currentUsername,
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
