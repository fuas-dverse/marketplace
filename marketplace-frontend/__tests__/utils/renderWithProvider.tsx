import { UserContext } from "@/contexts/UserProvider";
import { User, UserContextType } from "@/types/marketplace.types";
import { render } from "@testing-library/react";

const mockUser = (isNull: boolean): User | null => {
  if (isNull) {
    return null;
  }
  return {
    id: "user123",
    username: "TestUser",
    email: "testuser@example.com",
    password: "password",
  };
};

const userContext = (
  isNull: boolean,
  mockSetUser?: jest.Mock
): UserContextType => {
  return {
    user: mockUser(isNull),
    setUser: mockSetUser || jest.fn(),
    loading: false,
    error: null,
  };
};

const MockUserProvider = ({
  children,
  mockSetUser,
}: {
  children: React.ReactNode;
  mockSetUser?: jest.Mock;
}) => {
  return (
    <UserContext.Provider
      value={mockSetUser ? userContext(false, mockSetUser) : userContext(false)}
    >
      {children}
    </UserContext.Provider>
  );
};

const MockNullUserProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserContext.Provider value={userContext(true)}>
      {children}
    </UserContext.Provider>
  );
};

export const renderWithUserProvider = (
  component: React.ReactElement,
  mockSetUser?: jest.Mock<any, any, any>
) => {
  return render(
    <MockUserProvider mockSetUser={mockSetUser}>{component}</MockUserProvider>
  );
};

export const renderWithNullUserProvider = (component: React.ReactElement) => {
  return render(<MockNullUserProvider>{component}</MockNullUserProvider>);
};
