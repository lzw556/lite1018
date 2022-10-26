export type User = {
  id: number;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: number;
};

export const InitializeUserState: User = {
  id: 0,
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 0
};
