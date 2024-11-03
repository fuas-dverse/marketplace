export interface User {
  id?: string;
  username: string;
  email?: string;
  password?: string;
}

export interface Product {
  id?: string;
  title: string;
  price: string;
  description: string;
  image?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
}
