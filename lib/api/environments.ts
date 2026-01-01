import { BaseApiClient } from './client'

class EnvironmentsApiClient extends BaseApiClient {
  async getEnvironments(owner: string, repo: string): Promise<string[]> {
    const response = await this.request<{
      data: { environments: string[] }
      meta: { requestId: string }
    }>(`/v1/vaults/${owner}/${repo}/environments`)
    return response.data.environments
  }

  async createEnvironment(owner: string, repo: string, name: string): Promise<{ environment: string; environments: string[] }> {
    const response = await this.request<{
      data: { environment: string; environments: string[] }
      meta: { requestId: string }
    }>(`/v1/vaults/${owner}/${repo}/environments`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    return response.data
  }

  async renameEnvironment(owner: string, repo: string, oldName: string, newName: string): Promise<{ oldName: string; newName: string; environments: string[] }> {
    const response = await this.request<{
      data: { oldName: string; newName: string; environments: string[] }
      meta: { requestId: string }
    }>(`/v1/vaults/${owner}/${repo}/environments/${encodeURIComponent(oldName)}`, {
      method: 'PATCH',
      body: JSON.stringify({ newName }),
    })
    return response.data
  }

  async deleteEnvironment(owner: string, repo: string, name: string): Promise<{ deleted: string; environments: string[] }> {
    const response = await this.request<{
      data: { deleted: string; environments: string[] }
      meta: { requestId: string }
    }>(`/v1/vaults/${owner}/${repo}/environments/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
    return response.data
  }
}

export const environmentsApi = new EnvironmentsApiClient()
