export const createMockResponse = (data: any, options = {}) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve(data),
  ...options,
});

export const productsResponse = [
  { id: 1, name: "Product 1", price: 100 },
  { id: 2, name: "Product 2", price: 200 },
];
