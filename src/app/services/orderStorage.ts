import type { Order, OrderStatus, Review, SupportTicket, SystemConfig, MenuItemData } from '../data/authTypes';

const ORDERS_KEY = 'yummy_orders';
const REVIEWS_KEY = 'yummy_reviews';
const TICKETS_KEY = 'yummy_tickets';
const CONFIG_KEY = 'yummy_config';
const MENU_KEY = 'yummy_restaurant_menu';
const ONLINE_KEY = 'yummy_user_online';

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Online Status ─────────────────────────────────────────────────────────────

export function getUserOnlineStatus(userId: string): boolean {
  try {
    const s = JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}');
    return s[userId] ?? true;
  } catch { return true; }
}

export function setUserOnlineStatus(userId: string, online: boolean): void {
  try {
    const s = JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}');
    s[userId] = online;
    localStorage.setItem(ONLINE_KEY, JSON.stringify(s));
  } catch {}
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export function getAllOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch { return []; }
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrdersByRestaurant(restaurantId: string): Order[] {
  return getAllOrders().filter(o => o.restaurantId === restaurantId);
}

export function getOrdersByCustomer(customerId: string): Order[] {
  return getAllOrders().filter(o => o.customerId === customerId);
}

export function getOrdersByShipper(shipperId: string): Order[] {
  return getAllOrders().filter(o => o.shipperId === shipperId);
}

export function getAvailableOrders(): Order[] {
  return getAllOrders().filter(o => o.status === 'finding_driver' && !o.shipperId);
}

export function getOrderById(id: string): Order | undefined {
  return getAllOrders().find(o => o.id === id);
}

export function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
  const orders = getAllOrders();
  const order: Order = {
    ...data,
    id: genId('ord'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(order);
  saveOrders(orders);
  return order;
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extra?: { shipperId?: string; shipperName?: string; cancelReason?: string }
): { success: boolean; error?: string } {
  const orders = getAllOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return { success: false, error: 'Không tìm thấy đơn hàng' };
  orders[idx] = {
    ...orders[idx],
    status,
    updatedAt: new Date().toISOString(),
    ...(extra?.shipperId !== undefined && { shipperId: extra.shipperId }),
    ...(extra?.shipperName !== undefined && { shipperName: extra.shipperName }),
    ...(extra?.cancelReason !== undefined && { cancelReason: extra.cancelReason }),
  };
  saveOrders(orders);
  return { success: true };
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

export function getAllReviews(): Review[] {
  try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]'); } catch { return []; }
}

function saveReviews(reviews: Review[]): void {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export function getReviewsByRestaurant(restaurantId: string): Review[] {
  return getAllReviews().filter(r => r.restaurantId === restaurantId);
}

export function getReviewsByShipper(shipperId: string): Review[] {
  return getAllReviews().filter(r => r.shipperId === shipperId);
}

export function getReviewsByCustomer(customerId: string): Review[] {
  return getAllReviews().filter(r => r.customerId === customerId);
}

export function getOrderReview(orderId: string): Review | undefined {
  return getAllReviews().find(r => r.orderId === orderId);
}

export function createReview(data: Omit<Review, 'id' | 'createdAt'>): Review {
  const reviews = getAllReviews();
  const review: Review = { ...data, id: genId('rev'), createdAt: new Date().toISOString() };
  reviews.push(review);
  saveReviews(reviews);
  return review;
}

export function updateReview(reviewId: string, stars: number, content: string): { success: boolean; error?: string } {
  const reviews = getAllReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx === -1) return { success: false, error: 'Không tìm thấy đánh giá' };
  if (reviews[idx].isHidden) return { success: false, error: 'Đánh giá đang bị ẩn do vi phạm, không thể chỉnh sửa' };
  reviews[idx] = { ...reviews[idx], stars, content };
  saveReviews(reviews);
  return { success: true };
}

export function deleteReview(reviewId: string): { success: boolean } {
  saveReviews(getAllReviews().filter(r => r.id !== reviewId));
  return { success: true };
}

export function hideReview(reviewId: string, reason: string): { success: boolean } {
  const reviews = getAllReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx === -1) return { success: false };
  reviews[idx] = { ...reviews[idx], isHidden: true, hiddenReason: reason };
  saveReviews(reviews);
  return { success: true };
}

export function unhideReview(reviewId: string): { success: boolean } {
  const reviews = getAllReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx === -1) return { success: false };
  reviews[idx] = { ...reviews[idx], isHidden: false, hiddenReason: undefined };
  saveReviews(reviews);
  return { success: true };
}

export function reportReview(reviewId: string, reporterId: string, reason: string): { success: boolean } {
  const reviews = getAllReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx === -1) return { success: false };
  const reportedBy = [...(reviews[idx].reportedBy || [])];
  const reportReasons = [...(reviews[idx].reportReasons || [])];
  const existingIdx = reportedBy.indexOf(reporterId);
  if (existingIdx >= 0) {
    reportReasons[existingIdx] = reason;
  } else {
    reportedBy.push(reporterId);
    reportReasons.push(reason);
  }
  reviews[idx] = { ...reviews[idx], reportedBy, reportReasons };
  saveReviews(reviews);
  return { success: true };
}

// ─── Support Tickets ───────────────────────────────────────────────────────────

export function getAllTickets(): SupportTicket[] {
  try { return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]'); } catch { return []; }
}

function saveTickets(tickets: SupportTicket[]): void {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export function getTicketsByCustomer(customerId: string): SupportTicket[] {
  return getAllTickets().filter(t => t.customerId === customerId);
}

export function createTicket(data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): SupportTicket {
  const tickets = getAllTickets();
  const ticket: SupportTicket = {
    ...data,
    id: genId('tkt'),
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tickets.push(ticket);
  saveTickets(tickets);
  return ticket;
}

export function updateTicket(ticketId: string, update: { status?: SupportTicket['status']; resolution?: string }): { success: boolean } {
  const tickets = getAllTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx === -1) return { success: false };
  tickets[idx] = { ...tickets[idx], ...update, updatedAt: new Date().toISOString() };
  saveTickets(tickets);
  return { success: true };
}

// ─── System Config ─────────────────────────────────────────────────────────────

export function getSystemConfig(): SystemConfig {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { serviceFeePercent: 10, deliveryFeePerKm: 5000, discountPercent: 0, updatedAt: new Date().toISOString(), updatedBy: 'system' };
}

export function saveSystemConfig(config: SystemConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// ─── Restaurant Menu ────────────────────────────────────────────────────────────

function getAllMenuItems(): MenuItemData[] {
  try { return JSON.parse(localStorage.getItem(MENU_KEY) || '[]'); } catch { return []; }
}

function saveAllMenuItems(items: MenuItemData[]): void {
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

export function getRestaurantMenu(restaurantId: string): MenuItemData[] {
  return getAllMenuItems().filter(m => m.restaurantId === restaurantId);
}

export function addMenuItem(item: Omit<MenuItemData, 'id' | 'createdAt'>): MenuItemData {
  const all = getAllMenuItems();
  const newItem: MenuItemData = { ...item, id: genId('mi'), createdAt: new Date().toISOString() };
  all.push(newItem);
  saveAllMenuItems(all);
  return newItem;
}

export function updateMenuItem(id: string, data: Partial<Omit<MenuItemData, 'id' | 'restaurantId' | 'createdAt'>>): void {
  const all = getAllMenuItems();
  const idx = all.findIndex(m => m.id === id);
  if (idx !== -1) { all[idx] = { ...all[idx], ...data }; saveAllMenuItems(all); }
}

export function deleteMenuItem(id: string): void {
  saveAllMenuItems(getAllMenuItems().filter(m => m.id !== id));
}

// ─── Seed Data ─────────────────────────────────────────────────────────────────

export function seedRestaurantData(restaurantUserId: string): void {
  // Seed menu
  if (getRestaurantMenu(restaurantUserId).length === 0) {
    const items: Omit<MenuItemData, 'id' | 'createdAt'>[] = [
      { restaurantId: restaurantUserId, name: 'Phở Bò Tái', price: 65000, description: 'Thịt bò tái mỏng, nước dùng trong vắt hầm 24 giờ', category: 'Phở Bò', isAvailable: true, isHidden: false },
      { restaurantId: restaurantUserId, name: 'Phở Bò Chín', price: 65000, description: 'Thịt bò chín mềm, nước dùng đậm đà truyền thống', category: 'Phở Bò', isAvailable: true, isHidden: false },
      { restaurantId: restaurantUserId, name: 'Phở Đặc Biệt', price: 85000, description: 'Tổng hợp bò tái, chín, gầu, gân — đầy đặn nhất', category: 'Phở Bò', isAvailable: true, isHidden: false },
      { restaurantId: restaurantUserId, name: 'Phở Gà Ta', price: 60000, description: 'Gà ta tự nhiên, nước dùng thanh ngọt', category: 'Phở Gà', isAvailable: true, isHidden: false },
      { restaurantId: restaurantUserId, name: 'Bún Bò Huế', price: 70000, description: 'Bún bò đậm đà với chả, giò heo, mắm ruốc', category: 'Bún', isAvailable: false, isHidden: false },
    ];
    const all = getAllMenuItems();
    items.forEach((item, i) => all.push({ ...item, id: `mi_${restaurantUserId}_${i}`, createdAt: new Date().toISOString() }));
    saveAllMenuItems(all);
  }

  // Seed orders
  if (getOrdersByRestaurant(restaurantUserId).length > 0) return;
  const now = new Date();
  const orders: Order[] = [
    {
      id: `ord_r_${restaurantUserId}_1`,
      customerId: 'cust_mock_1', customerName: 'Nguyễn Văn An', customerPhone: '0901234567',
      restaurantId: restaurantUserId, restaurantName: 'Nhà hàng của tôi',
      items: [
        { dishId: 'ph1', dishName: 'Phở Bò Tái', price: 65000, quantity: 2 },
        { dishId: 'ph4', dishName: 'Phở Gà Ta', price: 60000, quantity: 1 },
      ],
      subtotal: 190000, deliveryFee: 15000, total: 205000,
      status: 'pending', address: '12 Lê Lợi, Quận 1, TP.HCM',
      createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    },
    {
      id: `ord_r_${restaurantUserId}_2`,
      customerId: 'cust_mock_2', customerName: 'Trần Thị Bích', customerPhone: '0912345678',
      restaurantId: restaurantUserId, restaurantName: 'Nhà hàng của tôi',
      items: [{ dishId: 'ph3', dishName: 'Phở Đặc Biệt', price: 85000, quantity: 1, note: 'Ít ớt' }],
      subtotal: 85000, deliveryFee: 15000, total: 100000,
      status: 'confirmed', address: '45 Nguyễn Huệ, Quận 1, TP.HCM',
      createdAt: new Date(now.getTime() - 20 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 18 * 60000).toISOString(),
    },
    {
      id: `ord_r_${restaurantUserId}_3`,
      customerId: 'cust_mock_3', customerName: 'Lê Minh Cường', customerPhone: '0923456789',
      restaurantId: restaurantUserId, restaurantName: 'Nhà hàng của tôi',
      shipperId: 'shipper_mock_1', shipperName: 'Phạm Văn Giao',
      items: [{ dishId: 'ph2', dishName: 'Phở Bò Chín', price: 65000, quantity: 2 }],
      subtotal: 130000, deliveryFee: 20000, total: 150000,
      status: 'delivering', address: '89 Đinh Tiên Hoàng, Quận Bình Thạnh',
      createdAt: new Date(now.getTime() - 45 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 20 * 60000).toISOString(),
    },
    {
      id: `ord_r_${restaurantUserId}_4`,
      customerId: 'cust_mock_1', customerName: 'Nguyễn Văn An', customerPhone: '0901234567',
      restaurantId: restaurantUserId, restaurantName: 'Nhà hàng của tôi',
      shipperId: 'shipper_mock_1', shipperName: 'Phạm Văn Giao',
      items: [{ dishId: 'ph1', dishName: 'Phở Bò Tái', price: 65000, quantity: 1 }],
      subtotal: 65000, deliveryFee: 15000, total: 80000,
      status: 'completed', address: '12 Lê Lợi, Quận 1, TP.HCM',
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 23 * 3600000).toISOString(),
    },
    {
      id: `ord_r_${restaurantUserId}_5`,
      customerId: 'cust_mock_2', customerName: 'Trần Thị Bích', customerPhone: '0912345678',
      restaurantId: restaurantUserId, restaurantName: 'Nhà hàng của tôi',
      shipperId: 'shipper_mock_2', shipperName: 'Võ Thị Hoa',
      items: [{ dishId: 'ph3', dishName: 'Phở Đặc Biệt', price: 85000, quantity: 2 }],
      subtotal: 170000, deliveryFee: 20000, total: 190000,
      status: 'completed', address: '45 Nguyễn Huệ, Quận 1, TP.HCM',
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 47 * 3600000).toISOString(),
    },
    {
      id: `ord_r_${restaurantUserId}_6`,
      customerId: 'cust_mock_3', customerName: 'Lê Minh Cường', customerPhone: '0923456789',
      restaurantId: restaurantUserId, restaurantName: 'Nhà hàng của tôi',
      items: [{ dishId: 'ph4', dishName: 'Phở Gà Ta', price: 60000, quantity: 1 }],
      subtotal: 60000, deliveryFee: 15000, total: 75000,
      status: 'cancelled_restaurant', cancelReason: 'Hết nguyên liệu',
      address: '89 Đinh Tiên Hoàng, Quận Bình Thạnh',
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 47.5 * 3600000).toISOString(),
    },
    {
      id: `ord_r_${restaurantUserId}_7`,
      customerId: 'cust_mock_4', customerName: 'Hoàng Thị Mai', customerPhone: '0934567890',
      restaurantId: restaurantUserId, restaurantName: 'Nhà hàng của tôi',
      shipperId: 'shipper_mock_1', shipperName: 'Phạm Văn Giao',
      items: [
        { dishId: 'ph1', dishName: 'Phở Bò Tái', price: 65000, quantity: 1 },
        { dishId: 'ph2', dishName: 'Phở Bò Chín', price: 65000, quantity: 1 },
      ],
      subtotal: 130000, deliveryFee: 20000, total: 150000,
      status: 'completed', address: '77 Trần Hưng Đạo, Quận 5',
      createdAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 71 * 3600000).toISOString(),
    },
  ];
  const existing = getAllOrders();
  saveOrders([...existing, ...orders]);

  // Seed reviews
  if (getReviewsByRestaurant(restaurantUserId).length === 0) {
    const reviews: Review[] = [
      {
        id: `rev_r_${restaurantUserId}_1`,
        orderId: `ord_r_${restaurantUserId}_4`,
        customerId: 'cust_mock_1', customerName: 'Nguyễn Văn An',
        restaurantId: restaurantUserId, stars: 5,
        content: 'Phở ngon tuyệt vời! Nước dùng trong, thịt mềm. Sẽ quay lại lần sau.',
        createdAt: new Date(now.getTime() - 22 * 3600000).toISOString(),
      },
      {
        id: `rev_r_${restaurantUserId}_2`,
        orderId: `ord_r_${restaurantUserId}_5`,
        customerId: 'cust_mock_2', customerName: 'Trần Thị Bích',
        restaurantId: restaurantUserId, stars: 4,
        content: 'Đồ ăn ngon, giao hàng nhanh. Tuy nhiên hơi mặn một chút.',
        createdAt: new Date(now.getTime() - 45 * 3600000).toISOString(),
      },
      {
        id: `rev_r_${restaurantUserId}_3`,
        orderId: `ord_r_${restaurantUserId}_7`,
        customerId: 'cust_mock_4', customerName: 'Hoàng Thị Mai',
        restaurantId: restaurantUserId, stars: 5,
        content: 'Quán phở ngon nhất khu vực. Phục vụ chuyên nghiệp!',
        createdAt: new Date(now.getTime() - 70 * 3600000).toISOString(),
      },
    ];
    const allReviews = getAllReviews();
    saveReviews([...allReviews, ...reviews]);
  }
}

export function seedShipperData(shipperUserId: string): void {
  if (getOrdersByShipper(shipperUserId).length > 0) return;
  const now = new Date();
  const rId = 'rest_mock_demo';
  const orders: Order[] = [
    {
      id: `ord_s_${shipperUserId}_1`,
      customerId: 'cust_mock_4', customerName: 'Hoàng Thị Mai', customerPhone: '0934567890',
      restaurantId: rId, restaurantName: 'Phở Thìn Demo',
      items: [
        { dishId: 'dm1', dishName: 'Phở Bò Tái', price: 65000, quantity: 1 },
        { dishId: 'dm2', dishName: 'Phở Bò Chín', price: 65000, quantity: 1 },
      ],
      subtotal: 130000, deliveryFee: 20000, total: 150000,
      status: 'finding_driver', address: '15 Trần Hưng Đạo, Quận 5, TP.HCM',
      createdAt: new Date(now.getTime() - 3 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 60000).toISOString(),
    },
    {
      id: `ord_s_${shipperUserId}_2`,
      customerId: 'cust_mock_5', customerName: 'Ngô Quang Đức', customerPhone: '0945678901',
      restaurantId: rId, restaurantName: 'Phở Thìn Demo',
      items: [{ dishId: 'dm3', dishName: 'Phở Đặc Biệt', price: 85000, quantity: 2 }],
      subtotal: 170000, deliveryFee: 25000, total: 195000,
      status: 'finding_driver', address: '22 Võ Thị Sáu, Quận 3, TP.HCM',
      createdAt: new Date(now.getTime() - 7 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 7 * 60000).toISOString(),
    },
    {
      id: `ord_s_${shipperUserId}_3`,
      customerId: 'cust_mock_4', customerName: 'Hoàng Thị Mai', customerPhone: '0934567890',
      restaurantId: rId, restaurantName: 'Phở Thìn Demo',
      shipperId: shipperUserId, shipperName: 'Shipper',
      items: [{ dishId: 'dm1', dishName: 'Phở Bò Tái', price: 65000, quantity: 2 }],
      subtotal: 130000, deliveryFee: 20000, total: 150000,
      status: 'completed', address: '15 Trần Hưng Đạo, Quận 5, TP.HCM',
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 23 * 3600000).toISOString(),
    },
    {
      id: `ord_s_${shipperUserId}_4`,
      customerId: 'cust_mock_5', customerName: 'Ngô Quang Đức', customerPhone: '0945678901',
      restaurantId: rId, restaurantName: 'Phở Thìn Demo',
      shipperId: shipperUserId, shipperName: 'Shipper',
      items: [{ dishId: 'dm2', dishName: 'Phở Bò Chín', price: 65000, quantity: 1 }],
      subtotal: 65000, deliveryFee: 15000, total: 80000,
      status: 'completed', address: '22 Võ Thị Sáu, Quận 3, TP.HCM',
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 47 * 3600000).toISOString(),
    },
    {
      id: `ord_s_${shipperUserId}_5`,
      customerId: 'cust_mock_6', customerName: 'Phan Thị Loan', customerPhone: '0956789012',
      restaurantId: rId, restaurantName: 'Phở Thìn Demo',
      shipperId: shipperUserId, shipperName: 'Shipper',
      items: [{ dishId: 'dm4', dishName: 'Phở Gà Ta', price: 60000, quantity: 3 }],
      subtotal: 180000, deliveryFee: 25000, total: 205000,
      status: 'completed', address: '100 Bà Triệu, Quận Hai Bà Trưng, Hà Nội',
      createdAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 71 * 3600000).toISOString(),
    },
  ];
  const existing = getAllOrders();
  saveOrders([...existing, ...orders]);

  // Seed shipper reviews
  if (getReviewsByShipper(shipperUserId).length === 0) {
    const reviews: Review[] = [
      {
        id: `rev_s_${shipperUserId}_1`,
        orderId: `ord_s_${shipperUserId}_3`,
        customerId: 'cust_mock_4', customerName: 'Hoàng Thị Mai',
        shipperId: shipperUserId, stars: 5,
        content: 'Giao hàng nhanh, thái độ lịch sự. Rất hài lòng!',
        createdAt: new Date(now.getTime() - 22 * 3600000).toISOString(),
      },
      {
        id: `rev_s_${shipperUserId}_2`,
        orderId: `ord_s_${shipperUserId}_4`,
        customerId: 'cust_mock_5', customerName: 'Ngô Quang Đức',
        shipperId: shipperUserId, stars: 4,
        content: 'Giao đúng giờ, thức ăn còn nóng. Sẽ gọi lại.',
        createdAt: new Date(now.getTime() - 46 * 3600000).toISOString(),
      },
      {
        id: `rev_s_${shipperUserId}_3`,
        orderId: `ord_s_${shipperUserId}_5`,
        customerId: 'cust_mock_6', customerName: 'Phan Thị Loan',
        shipperId: shipperUserId, stars: 5,
        content: 'Tuyệt vời! Giao nhanh hơn dự kiến 10 phút.',
        createdAt: new Date(now.getTime() - 70 * 3600000).toISOString(),
      },
    ];
    const allReviews = getAllReviews();
    saveReviews([...allReviews, ...reviews]);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đang chuẩn bị',
    finding_driver: 'Đang tìm tài xế',
    waiting_pickup: 'Chờ tài xế lấy',
    delivering: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled_restaurant: 'Hủy bởi nhà hàng',
    cancelled_customer: 'Hủy bởi khách',
    cancelled_failed: 'Giao thất bại',
  };
  return labels[status] || status;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}
