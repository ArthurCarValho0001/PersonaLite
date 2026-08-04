import { httpClient } from './httpClient'
import type { LoginDto, RegistrarUsuarioDto, TokenDto } from '../types'

export async function registrar(dto: RegistrarUsuarioDto): Promise<TokenDto> {
  const { data } = await httpClient.post<TokenDto>('/api/auth/registrar', dto)
  return data
}

export async function login(dto: LoginDto): Promise<TokenDto> {
  const { data } = await httpClient.post<TokenDto>('/api/auth/login', dto)
  return data
}