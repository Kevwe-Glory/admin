export type User = {
  fullName: string
  email: string
  phoneNumber: string
}

export interface LoginResponse {
  status: boolean;
  access_token?: string;
  message?: string;
}