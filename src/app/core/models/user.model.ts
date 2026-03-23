export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserResponse {
  data: User;
  token: string;
}

export interface CreateUserPayload {
  email: string;
}
