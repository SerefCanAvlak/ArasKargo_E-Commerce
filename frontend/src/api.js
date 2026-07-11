const API_BASE = 'http://localhost:5086';

const getHeaders = (includeAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = localStorage.getItem('aras_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Bir hata oluştu.' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ─── Auth ────────────────────────────────────────────
export const loginCustomer = (email, password) =>
  fetch(`${API_BASE}/api/Auth/customer/login`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify({ email, password })
  }).then(handleResponse);

export const registerCustomer = (data) =>
  fetch(`${API_BASE}/api/Auth/customer/register`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
  }).then(handleResponse);

export const loginSeller = (email, password) =>
  fetch(`${API_BASE}/api/Auth/seller/login`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify({ email, password })
  }).then(handleResponse);

export const registerSeller = (data) =>
  fetch(`${API_BASE}/api/Auth/seller/register`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
  }).then(handleResponse);

// ─── Products ────────────────────────────────────────
export const getProducts = (page = 1, pageSize = 20) =>
  fetch(`${API_BASE}/api/products?page=${page}&pageSize=${pageSize}`).then(handleResponse);

export const getProductBySlug = (slug) =>
  fetch(`${API_BASE}/api/products/link/${slug}`).then(handleResponse);

export const getProductById = (id) =>
  fetch(`${API_BASE}/api/products/${id}`).then(handleResponse);

export const getSellerProducts = (page = 1, pageSize = 50) =>
  fetch(`${API_BASE}/api/products/seller?page=${page}&pageSize=${pageSize}`, {
    headers: getHeaders(true)
  }).then(handleResponse);

export const createProduct = (data) =>
  fetch(`${API_BASE}/api/products`, {
    method: 'POST', headers: getHeaders(true), body: JSON.stringify(data)
  }).then(handleResponse);

export const updateProduct = (id, data) =>
  fetch(`${API_BASE}/api/products/${id}`, {
    method: 'PUT', headers: getHeaders(true), body: JSON.stringify(data)
  }).then(handleResponse);

export const deleteProduct = (id) =>
  fetch(`${API_BASE}/api/products/${id}`, {
    method: 'DELETE', headers: getHeaders(true)
  }).then(handleResponse);

// ─── Basket ──────────────────────────────────────────
export const getBasket = () =>
  fetch(`${API_BASE}/api/baskets`, { headers: getHeaders(true) }).then(handleResponse);

export const addToBasket = (productId, quantity = 1) =>
  fetch(`${API_BASE}/api/baskets/items`, {
    method: 'POST', headers: getHeaders(true), body: JSON.stringify({ productId, quantity })
  }).then(handleResponse);

export const updateBasketItem = (productId, quantity) =>
  fetch(`${API_BASE}/api/baskets/items/${productId}?quantity=${quantity}`, {
    method: 'PUT', headers: getHeaders(true)
  }).then(handleResponse);

export const removeBasketItem = (productId) =>
  fetch(`${API_BASE}/api/baskets/items/${productId}`, {
    method: 'DELETE', headers: getHeaders(true)
  }).then(handleResponse);

export const clearBasket = () =>
  fetch(`${API_BASE}/api/baskets`, {
    method: 'DELETE', headers: getHeaders(true)
  }).then(handleResponse);

// ─── Orders ──────────────────────────────────────────
export const createOrder = (productId, customerId, amount) =>
  fetch(`${API_BASE}/api/orders`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify({ productId, customerId, amount })
  }).then(handleResponse);

export const getOrders = () =>
  fetch(`${API_BASE}/api/orders`).then(handleResponse);

export const callCourier = (orderId) =>
  fetch(`${API_BASE}/api/orders/${orderId}/call-courier`, {
    method: 'POST'
  }).then(handleResponse);

export const updateOrderStatus = (orderId, status) =>
  fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(status)
  }).then(handleResponse);

// ─── Dashboard & Wallet ──────────────────────────────
export const getSellerDashboard = () =>
  fetch(`${API_BASE}/api/seller/dashboard`, { headers: getHeaders(true) }).then(handleResponse);

export const getSellerWallet = () =>
  fetch(`${API_BASE}/api/seller/wallet`, { headers: getHeaders(true) }).then(handleResponse);

export { API_BASE };
