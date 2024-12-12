import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import ProductList from "@/components/ProductList";
import { Product } from "@/types/marketplace.types";
import { UserContext } from "@/contexts/UserProvider";

// Mock fetch response
const mockProducts: Product[] = [
  { id: "1", title: "Product 1", description: "Description 1", price: "10" },
  { id: "2", title: "Product 2", description: "Description 2", price: "20" },
  { id: "3", title: "Product 3", description: "Description 3", price: "30" },
];

// Mock user data
const mockUser = {
  id: "user123",
  name: "Test User",
  email: "testuser@example.com",
  role: "buyer",
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockProducts),
  })
) as jest.Mock;

// Mock UserProvider
const MockUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <UserContext.Provider value={{ user: mockUser }}>
      {children}
    </UserContext.Provider>
  );
};

describe("ProductList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithUserProvider = (ui: React.ReactElement) => {
    return render(<MockUserProvider>{ui}</MockUserProvider>);
  };

  it("renders the product list container", async () => {
    await act(async () => {
      renderWithUserProvider(<ProductList />);
    });
    const container = screen.getByTestId("product-list-container");
    expect(container).toBeInTheDocument();
  });

  it("fetches and displays products on initial render", async () => {
    await act(async () => {
      renderWithUserProvider(<ProductList />);
    });

    await waitFor(() => {
      const listItems = screen.getAllByRole("listitem"); // Querying list items
      expect(listItems).toHaveLength(mockProducts.length);
    });
  });

  it("updates the product list when searching", async () => {
    await act(async () => {
      renderWithUserProvider(<ProductList />);
    });

    // Wait for products to load
    await waitFor(() => {
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(mockProducts.length);
    });

    // Perform a search
    const searchBar = screen.getByTestId("search-bar");
    act(() => {
      fireEvent.change(searchBar, { target: { value: "Product 1" } });
    });

    await waitFor(() => {
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(1); // Only Product 1 should be visible
    });

    expect(screen.getByTestId("product-item-1")).toBeInTheDocument();
  });

  it("displays a message when no products match the search query", async () => {
    await act(async () => {
      renderWithUserProvider(<ProductList />);
    });

    // Wait for products to load
    await waitFor(() => {
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(mockProducts.length);
    });

    // Perform a search with no matches
    const searchBar = screen.getByTestId("search-bar");
    act(() => {
      fireEvent.change(searchBar, { target: { value: "Nonexistent Product" } });
    });

    await waitFor(() => {
      const noProductsMessage = screen.getByTestId("no-products-message");
      expect(noProductsMessage).toBeInTheDocument();
      expect(noProductsMessage).toHaveTextContent(
        "No products match your search."
      );
    });
  });

  it("opens the modal when a product's 'Buy Now' button is clicked", async () => {
    await act(async () => {
      renderWithUserProvider(<ProductList />);
    });

    // Wait for products to load
    await waitFor(() => {
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(mockProducts.length);
    });

    // Simulate clicking the 'Buy Now' button
    const buyNowButton = screen
      .getByTestId("product-item-1")
      .querySelector('[data-testid="product-buy-button"]');
    await act(async () => {
      buyNowButton && fireEvent.click(buyNowButton);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
