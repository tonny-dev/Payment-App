export interface User {
  id: number;
  email: string;
  password: string;
  role: 'psp' | 'dev';
  created_at: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  role: 'psp' | 'dev';
}

export interface UserResponse {
  id: number;
  email: string;
  role: 'psp' | 'dev';
  created_at: string;
}
