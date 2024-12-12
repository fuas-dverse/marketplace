global.fetch = jest.fn((url, options) => {
  if (url.includes("/api/products/")) {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          id: "1",
          title: "Test Product",
          description: "This is a test product.",
          price: "100",
        }),
      ok: true,
    });
  }
  if (url.includes("/api/transactions/")) {
    return Promise.resolve({
      json: () => Promise.resolve({ message: "Transaction complete" }),
      ok: true,
    });
  }
  return Promise.reject(new Error("Unknown URL"));
}) as jest.Mock;
