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

export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  error: string | null;
}

export interface UserProviderProps {
  children: React.ReactNode;
}

export interface Review {
  id: string;
  content: string;
  rating: number;
}

export interface ReviewListProps {
  reviews: Review[];
}
