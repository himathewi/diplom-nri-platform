import type { ItemTemplateResponse } from '../types/items'
import { httpClient } from './httpClient'

export function getItemTemplates(): Promise<ItemTemplateResponse[]> {
  return httpClient.get<ItemTemplateResponse[]>('/items')
}
