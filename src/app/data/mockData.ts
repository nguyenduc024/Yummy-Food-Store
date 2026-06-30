import phoBoImg from '../../../assest/phở bò.jpg';
import phoGaImg from '../../../assest/phở gà.jpg';
import banhMiHoiAnImg from '../../../assest/bánh mì.jpg';
import lauEchImg from '../../../assest/lẩu ếch.jpeg';
import sinhToBo from '../../../assest/sinh tố bơ mật ong.jpg';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  distance: string;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  topDishes: string[];
  image: string;
  description: string;
  address: string;
  categories: MenuCategory[];
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  isPopular?: boolean;
  ingredients?: string[];
  portionSize?: string;
  customizations?: string[];
}

export interface Dish {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  price: number;
  rating: number;
  deliveryTime: string;
  distance: string;
  description: string;
  label?: string;
  labelReason?: string;
  category: string;
  image: string;
  isSponsored?: boolean;
}

export const categories = [
  { id: 'rice', name: 'Cơm', icon: '🍚' },
  { id: 'noodles', name: 'Phở & Bún', icon: '🍜' },
  { id: 'coffee', name: 'Cà Phê', icon: '☕' },
  { id: 'milktea', name: 'Trà Sữa', icon: '🧋' },
  { id: 'fastfood', name: 'Đồ Nhanh', icon: '🍔' },
  { id: 'healthy', name: 'Lành Mạnh', icon: '🥗' },
  { id: 'streetfood', name: 'Đường Phố', icon: '🥢' },
  { id: 'dessert', name: 'Tráng Miệng', icon: '🍮' },
  { id: 'breakfast', name: 'Sáng', icon: '🥐' },
  { id: 'latenight', name: 'Khuya', icon: '🌙' },
];

export const restaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Phở Thìn Bờ Hồ',
    cuisine: 'Phở Bắc',
    rating: 4.8,
    reviews: 2341,
    distance: '1.2 km',
    deliveryTime: '20–30 phút',
    deliveryFee: 15000,
    minOrder: 50000,
    isOpen: true,
    topDishes: ['Phở Bò Tái', 'Phở Gà', 'Phở Đặc Biệt'],
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop&auto=format',
    description: 'Quán phở truyền thống Hà Nội với nước dùng hầm 24 giờ từ xương bò.',
    address: '61 Nguyễn Huệ, Quận 1, TP.HCM',
    categories: [
      {
        name: 'Phở Bò',
        items: [
          { id: 'm1', name: 'Phở Bò Tái', price: 65000, description: 'Phở với thịt bò tái mỏng, nước dùng trong vắt', image: phoBoImg, isPopular: true, ingredients: ['Bánh phở', 'Thịt bò tái', 'Hành tươi', 'Húng quế'], portionSize: 'Tô lớn 500ml' },
          { id: 'm2', name: 'Phở Bò Chín', price: 65000, description: 'Phở với thịt bò chín mềm, nước dùng đậm đà', image: phoBoImg, ingredients: ['Bánh phở', 'Thịt bò chín', 'Hành tây', 'Ngò'], portionSize: 'Tô lớn 500ml' },
          { id: 'm3', name: 'Phở Đặc Biệt', price: 85000, description: 'Tổng hợp bò tái, chín, gầu, gân', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Bánh phở', 'Bò tái', 'Bò chín', 'Gầu', 'Gân'], portionSize: 'Tô extra lớn 650ml' },
        ],
      },
      {
        name: 'Phở Gà',
        items: [
          { id: 'm4', name: 'Phở Gà Ta', price: 60000, description: 'Phở gà ta tự nhiên, thịt ngọt mềm', image: phoGaImg, ingredients: ['Bánh phở', 'Gà ta', 'Hành tươi'], portionSize: 'Tô vừa 450ml' },
        ],
      },
    ],
  },
  {
    id: 'r2',
    name: 'Bún Bò Huế Mụ Rớt',
    cuisine: 'Bún Bò Huế',
    rating: 4.6,
    reviews: 1876,
    distance: '0.8 km',
    deliveryTime: '15–25 phút',
    deliveryFee: 12000,
    minOrder: 45000,
    isOpen: true,
    topDishes: ['Bún Bò Đặc Biệt', 'Bún Bò Chả Cua', 'Bánh Mì Huế'],
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&h=400&fit=crop&auto=format',
    description: 'Bún bò Huế chính gốc với gia vị đặc trưng miền Trung.',
    address: '23 Lê Duẩn, Quận 1, TP.HCM',
    categories: [
      {
        name: 'Bún Bò',
        items: [
          { id: 'm5', name: 'Bún Bò Đặc Biệt', price: 75000, description: 'Bún bò đầy đủ: bắp bò, chả, mọc', image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Bún', 'Bắp bò', 'Chả Huế', 'Mọc', 'Sả'], portionSize: 'Tô lớn' },
          { id: 'm6', name: 'Bún Bò Chả Cua', price: 85000, description: 'Thêm chả cua đặc biệt của Huế', image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Bún', 'Bắp bò', 'Chả cua', 'Sả', 'Mắm ruốc'], portionSize: 'Tô lớn' },
        ],
      },
    ],
  },
  {
    id: 'r3',
    name: 'Cà Phê Nhân',
    cuisine: 'Cà Phê Việt',
    rating: 4.7,
    reviews: 3102,
    distance: '0.5 km',
    deliveryTime: '10–20 phút',
    deliveryFee: 8000,
    minOrder: 30000,
    isOpen: true,
    topDishes: ['Bạc Xỉu', 'Cà Phê Trứng', 'Cà Phê Đen Đá'],
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop&auto=format',
    description: 'Rang xay tại chỗ, pha phin truyền thống. Không vội, không ào.',
    address: '39 Mạc Thị Bưởi, Quận 1, TP.HCM',
    categories: [
      {
        name: 'Cà Phê Phin',
        items: [
          { id: 'm7', name: 'Cà Phê Đen Đá', price: 25000, description: 'Cà phê phin nguyên chất, đá viên to', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Cà phê arabica rang xay', 'Đá'], portionSize: '250ml' },
          { id: 'm8', name: 'Bạc Xỉu', price: 30000, description: 'Cà phê sữa đặc kiểu Sài Gòn', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Cà phê', 'Sữa đặc Ông Thọ', 'Đá'], portionSize: '300ml' },
          { id: 'm9', name: 'Cà Phê Trứng', price: 45000, description: 'Đặc sản Hà Nội - cà phê kem trứng đánh bông', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Cà phê', 'Trứng gà', 'Đường', 'Sữa đặc'], portionSize: '200ml' },
        ],
      },
    ],
  },
  {
    id: 'r4',
    name: 'Cơm Tấm Sài Gòn 75',
    cuisine: 'Cơm Tấm',
    rating: 4.5,
    reviews: 4201,
    distance: '2.1 km',
    deliveryTime: '25–35 phút',
    deliveryFee: 18000,
    minOrder: 55000,
    isOpen: true,
    topDishes: ['Cơm Sườn Nướng', 'Cơm Đặc Biệt', 'Cơm Bì Chả'],
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop&auto=format',
    description: 'Cơm tấm vỉa hè Sài Gòn chính gốc từ 1975, sườn nướng bếp than.',
    address: '75 Võ Văn Tần, Quận 3, TP.HCM',
    categories: [
      {
        name: 'Cơm Tấm',
        items: [
          { id: 'm10', name: 'Cơm Sườn Nướng', price: 55000, description: 'Cơm tấm với sườn cốt lết nướng than hoa', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Cơm tấm', 'Sườn cốt lết', 'Đồ chua', 'Nước mắm'], portionSize: '1 phần đầy đủ' },
          { id: 'm11', name: 'Cơm Đặc Biệt', price: 75000, description: 'Sườn + bì + chả + trứng ốp la', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Cơm tấm', 'Sườn', 'Bì', 'Chả', 'Trứng'], portionSize: '1 phần đặc biệt' },
        ],
      },
    ],
  },
  {
    id: 'r5',
    name: 'Bánh Mì Hội An Madam Khánh',
    cuisine: 'Bánh Mì',
    rating: 4.9,
    reviews: 5678,
    distance: '3.0 km',
    deliveryTime: '30–45 phút',
    deliveryFee: 25000,
    minOrder: 40000,
    isOpen: false,
    topDishes: ['Bánh Mì Đặc Biệt', 'Bánh Mì Gà', 'Bánh Mì Chả Cá'],
    image: banhMiHoiAnImg,
    description: 'Bánh mì Hội An nổi tiếng nhất — vỏ giòn tan, nhân đầy ắp.',
    address: '115 Nguyễn Thị Minh Khai, Quận 2, TP.HCM',
    categories: [
      {
        name: 'Bánh Mì',
        items: [
          { id: 'm12', name: 'Bánh Mì Đặc Biệt', price: 45000, description: 'Thịt nướng, chả, pate, rau sống, tương đặc biệt', image: banhMiHoiAnImg, isPopular: true, ingredients: ['Bánh mì', 'Thịt nướng', 'Chả', 'Pate', 'Rau', 'Tương'], portionSize: '1 ổ 25cm' },
        ],
      },
    ],
  },
  {
    id: 'r6',
    name: 'Lẩu Tư Ếch Thập Cẩm',
    cuisine: 'Lẩu',
    rating: 4.4,
    reviews: 987,
    distance: '1.7 km',
    deliveryTime: '35–50 phút',
    deliveryFee: 30000,
    minOrder: 200000,
    isOpen: true,
    topDishes: ['Lẩu Ếch Sả Ớt', 'Lẩu Hải Sản', 'Lẩu Bò Phúc Kiến'],
    image: lauEchImg,
    description: 'Lẩu tươi ngon, nguyên liệu nhập hàng ngày từ chợ đầu mối.',
    address: '88 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
    categories: [
      {
        name: 'Lẩu',
        items: [
          { id: 'm13', name: 'Lẩu Ếch Sả Ớt', price: 280000, description: 'Lẩu ếch đồng với sả ớt cay nồng (2-3 người)', image: lauEchImg, isPopular: true, ingredients: ['Ếch đồng', 'Sả', 'Ớt', 'Nấm', 'Rau'], portionSize: 'Nồi 2-3 người' },
        ],
      },
    ],
  },
  {
    id: 'r7',
    name: 'Trà & Sinh Tố Ô Long',
    cuisine: 'Trà Sữa & Đồ Uống',
    rating: 4.6,
    reviews: 1540,
    distance: '1.3 km',
    deliveryTime: '15–25 phút',
    deliveryFee: 10000,
    minOrder: 30000,
    isOpen: true,
    topDishes: ['Trà Sữa Đường Đen', 'Sinh Tố Bơ Mật Ong', 'Nước Ép Dưa Hấu Tắc'],
    image: 'https://images.unsplash.com/photo-1558857563-c0c3f58f5e16?w=600&h=400&fit=crop&auto=format',
    description: 'Trà sữa pha tươi, trân châu nấu tại chỗ. Sinh tố trái cây nguyên chất — không đường hóa học.',
    address: '42 Phan Xích Long, Phú Nhuận, TP.HCM',
    categories: [
      {
        name: 'Trà Sữa',
        items: [
          { id: 'm14', name: 'Trà Sữa Trân Châu Đường Đen', price: 50000, description: 'Trà ô long pha sữa tươi, trân châu đường đen dẻo mềm', image: 'https://images.unsplash.com/photo-1558857563-c0c3f58f5e16?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Trà ô long', 'Sữa tươi', 'Trân châu đường đen', 'Syrup'], portionSize: '500ml' },
          { id: 'm15', name: 'Trà Đào Cam Sả', price: 45000, description: 'Trà thanh mát với đào tươi, cam vắt và sả thơm', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&auto=format', ingredients: ['Trà xanh', 'Đào tươi', 'Cam', 'Sả', 'Đá'], portionSize: '500ml' },
        ],
      },
      {
        name: 'Sinh Tố',
        items: [
          { id: 'm16', name: 'Sinh Tố Bơ Mật Ong', price: 55000, description: 'Bơ Đắk Lắk chín mềm xay với mật ong rừng và sữa tươi', image: sinhToBo, isPopular: true, ingredients: ['Bơ Đắk Lắk', 'Mật ong rừng', 'Sữa tươi', 'Đá'], portionSize: '400ml' },
        ],
      },
      {
        name: 'Nước Ép',
        items: [
          { id: 'm17', name: 'Nước Ép Dưa Hấu Tắc', price: 35000, description: 'Dưa hấu ép lạnh kết hợp tắc chua ngọt, giải nhiệt tức thì', image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Dưa hấu', 'Tắc (quất)', 'Đường phèn', 'Đá'], portionSize: '450ml' },
        ],
      },
    ],
  },
  {
    id: 'r8',
    name: 'Quán Ăn Dân Dã Bà Năm',
    cuisine: 'Ẩm Thực Miền Trung',
    rating: 4.5,
    reviews: 2108,
    distance: '2.8 km',
    deliveryTime: '25–40 phút',
    deliveryFee: 20000,
    minOrder: 60000,
    isOpen: true,
    topDishes: ['Mì Quảng Gà Trứng', 'Bánh Xèo Tôm Thịt', 'Hủ Tiếu Nam Vang'],
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop&auto=format',
    description: 'Quán ăn gia đình từ 1992. Mì Quảng gà chuẩn Hội An, bánh xèo giòn rụm, hủ tiếu thịt bằm đậm đà.',
    address: '7 Đặng Văn Bi, Thủ Đức, TP.HCM',
    categories: [
      {
        name: 'Mì & Hủ Tiếu',
        items: [
          { id: 'm18', name: 'Mì Quảng Gà Trứng', price: 60000, description: 'Mì Quảng sợi vàng nghệ, gà ta luộc xé, trứng cút, đậu phộng rang', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Mì Quảng', 'Gà ta', 'Trứng cút', 'Đậu phộng', 'Rau thơm', 'Bánh tráng'], portionSize: 'Tô lớn' },
          { id: 'm19', name: 'Hủ Tiếu Nam Vang', price: 65000, description: 'Nước dùng hầm xương trong vắt, thịt bằm, tôm, gan heo', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Hủ tiếu', 'Thịt bằm', 'Tôm', 'Gan heo', 'Hẹ'], portionSize: 'Tô lớn' },
        ],
      },
      {
        name: 'Bánh Dân Gian',
        items: [
          { id: 'm20', name: 'Bánh Xèo Tôm Thịt', price: 70000, description: 'Bánh xèo giòn rụm nhân tôm sú, thịt ba chỉ, giá sống — ăn kèm rau và nước chấm chua ngọt', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Bột gạo', 'Tôm sú', 'Thịt ba chỉ', 'Giá', 'Nghệ', 'Nước chấm'], portionSize: '2 cái / phần' },
        ],
      },
      {
        name: 'Gỏi & Cuốn',
        items: [
          { id: 'm21', name: 'Gỏi Cuốn Tôm Thịt', price: 45000, description: 'Bánh tráng cuốn tôm luộc, thịt heo, bún, rau thơm — chấm tương đậu phộng', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&auto=format', ingredients: ['Bánh tráng', 'Tôm', 'Thịt heo', 'Bún', 'Rau thơm'], portionSize: '4 cuốn / phần' },
        ],
      },
    ],
  },
  {
    id: 'r9',
    name: 'Chè & Xôi Hiển Khánh',
    cuisine: 'Chè & Tráng Miệng',
    rating: 4.7,
    reviews: 3316,
    distance: '1.6 km',
    deliveryTime: '20–30 phút',
    deliveryFee: 12000,
    minOrder: 35000,
    isOpen: true,
    topDishes: ['Chè Ba Màu', 'Xôi Gà Chiên Bơ', 'Kem Dừa Đậu Xanh'],
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop&auto=format',
    description: 'Chè truyền thống Sài Gòn từ 1988. Nguyên liệu tươi, không phẩm màu, không chất bảo quản.',
    address: '18 Hồ Xuân Hương, Quận 3, TP.HCM',
    categories: [
      {
        name: 'Chè',
        items: [
          { id: 'm22', name: 'Chè Ba Màu', price: 35000, description: 'Đậu xanh, đậu đỏ, thạch pandan — chan nước dừa béo ngậy, đá bào', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Đậu xanh', 'Đậu đỏ', 'Thạch pandan', 'Nước dừa', 'Đá bào'], portionSize: 'Ly vừa 350ml' },
          { id: 'm23', name: 'Chè Thái Bưởi Xoài', price: 45000, description: 'Sữa dừa béo ngậy, thịt bưởi, xoài thái, thạch trái cây đầy màu sắc', image: 'https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Thịt bưởi', 'Xoài', 'Thạch trái cây', 'Sữa dừa', 'Đá bào'], portionSize: 'Ly lớn 450ml' },
        ],
      },
      {
        name: 'Xôi',
        items: [
          { id: 'm24', name: 'Xôi Gà Chiên Bơ', price: 55000, description: 'Xôi nếp dẻo phủ gà chiên bơ tỏi, hành phi vàng ruộm, ăn kèm tương ớt', image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Nếp cẩm', 'Gà chiên bơ tỏi', 'Hành phi', 'Tương ớt'], portionSize: '1 hộp đầy đủ' },
        ],
      },
      {
        name: 'Kem & Đặc Biệt',
        items: [
          { id: 'm25', name: 'Kem Dừa Đậu Xanh', price: 40000, description: 'Kem dừa tươi đóng trong gáo dừa, nhân đậu xanh đánh nhuyễn, phủ dừa sợi nướng', image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop&auto=format', isPopular: true, ingredients: ['Kem dừa', 'Đậu xanh', 'Dừa sợi', 'Gáo dừa tươi'], portionSize: '1 gáo dừa' },
        ],
      },
    ],
  },
];

export const dishes: Dish[] = [
  {
    id: 'd1',
    name: 'Phở Bò Tái',
    restaurantId: 'r1',
    restaurantName: 'Phở Thìn Bờ Hồ',
    price: 65000,
    rating: 4.9,
    deliveryTime: '20–30 phút',
    distance: '1.2 km',
    description: 'Phở bò tái truyền thống Hà Nội. Nước dùng hầm 24h, thịt tái mỏng cuộn tròn.',
    label: 'Top rated',
    labelReason: 'Đánh giá cao nhất trong danh mục Phở tại khu vực của bạn.',
    category: 'noodles',
    image: phoBoImg,
  },
  {
    id: 'd2',
    name: 'Bạc Xỉu Đá',
    restaurantId: 'r3',
    restaurantName: 'Cà Phê Nhân',
    price: 30000,
    rating: 4.7,
    deliveryTime: '10–20 phút',
    distance: '0.5 km',
    description: 'Cà phê sữa đặc kiểu Sài Gòn, đá viên to không tan. Đơn giản mà nghiện.',
    label: 'Fastest delivery',
    labelReason: 'Thời gian giao hàng nhanh nhất trong khu vực: trung bình 15 phút.',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd3',
    name: 'Cơm Sườn Nướng',
    restaurantId: 'r4',
    restaurantName: 'Cơm Tấm Sài Gòn 75',
    price: 55000,
    rating: 4.5,
    deliveryTime: '25–35 phút',
    distance: '2.1 km',
    description: 'Cơm tấm vỉa hè Sài Gòn chuẩn vị. Sườn cốt lết nướng than, mỡ hành thơm.',
    label: 'Best value',
    labelReason: 'Giá thấp hơn 22% so với các món tương tự tại khu vực.',
    category: 'rice',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd4',
    name: 'Bún Bò Đặc Biệt',
    restaurantId: 'r2',
    restaurantName: 'Bún Bò Huế Mụ Rớt',
    price: 75000,
    rating: 4.6,
    deliveryTime: '15–25 phút',
    distance: '0.8 km',
    description: 'Bún bò Huế đích thực: bắp bò, chả Huế, mọc, sả thơm, mắm ruốc chuẩn vị.',
    label: 'Popular nearby',
    labelReason: 'Được đặt nhiều nhất trong phạm vi 2km trong 7 ngày qua.',
    category: 'noodles',
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd5',
    name: 'Bánh Mì Đặc Biệt',
    restaurantId: 'r5',
    restaurantName: 'Bánh Mì Hội An Madam Khánh',
    price: 45000,
    rating: 4.9,
    deliveryTime: '30–45 phút',
    distance: '3.0 km',
    description: 'Vỏ bánh giòn tan, nhân đầy đủ: thịt nướng, chả, pate, rau sống, tương bí mật.',
    label: 'Top rated',
    labelReason: 'Điểm đánh giá 4.9 — cao nhất danh mục Bánh Mì toàn thành phố.',
    category: 'streetfood',
    image: banhMiHoiAnImg,
  },
  {
    id: 'd6',
    name: 'Cà Phê Trứng',
    restaurantId: 'r3',
    restaurantName: 'Cà Phê Nhân',
    price: 45000,
    rating: 4.8,
    deliveryTime: '10–20 phút',
    distance: '0.5 km',
    description: 'Đặc sản Hà Nội. Kem trứng đánh bông mịn phủ trên nền cà phê đậm.',
    label: 'Lowest delivery fee',
    labelReason: 'Phí giao hàng chỉ 8.000₫ — thấp nhất trong bán kính 1km.',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd7',
    name: 'Cơm Đặc Biệt',
    restaurantId: 'r4',
    restaurantName: 'Cơm Tấm Sài Gòn 75',
    price: 75000,
    rating: 4.6,
    deliveryTime: '25–35 phút',
    distance: '2.1 km',
    description: 'Combo đầy đủ nhất: sườn nướng + bì + chả + trứng ốp la. No skip.',
    category: 'rice',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&h=350&fit=crop&auto=format',
    isSponsored: true,
  },
  {
    id: 'd8',
    name: 'Phở Gà Ta',
    restaurantId: 'r1',
    restaurantName: 'Phở Thìn Bờ Hồ',
    price: 60000,
    rating: 4.7,
    deliveryTime: '20–30 phút',
    distance: '1.2 km',
    description: 'Phở gà ta vườn. Nước dùng ngọt thanh, thịt gà dai mềm vừa phải.',
    category: 'noodles',
    image: phoGaImg,
  },
  {
    id: 'd9',
    name: 'Trà Sữa Trân Châu Đường Đen',
    restaurantId: 'r7',
    restaurantName: 'Trà & Sinh Tố Ô Long',
    price: 50000,
    rating: 4.6,
    deliveryTime: '15–25 phút',
    distance: '1.3 km',
    description: 'Trà ô long ủ đặc pha cùng sữa tươi, trân châu đường đen dẻo nấu tại chỗ. Không đường hóa học.',
    label: 'Trending',
    labelReason: 'Top 3 món được đặt nhiều nhất trong danh mục Trà Sữa tuần này.',
    category: 'milktea',
    image: 'https://images.unsplash.com/photo-1558857563-c0c3f58f5e16?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd10',
    name: 'Sinh Tố Bơ Mật Ong',
    restaurantId: 'r7',
    restaurantName: 'Trà & Sinh Tố Ô Long',
    price: 55000,
    rating: 4.8,
    deliveryTime: '15–25 phút',
    distance: '1.3 km',
    description: 'Bơ Đắk Lắk chín mềm xay nguyên chất với mật ong rừng và sữa tươi không đường. Mịn, béo, thanh.',
    label: 'Best value',
    labelReason: 'Bơ nguyên chất 100% — không pha nước, không đường nhân tạo.',
    category: 'healthy',
    image: sinhToBo,
  },
  {
    id: 'd11',
    name: 'Nước Ép Dưa Hấu Tắc',
    restaurantId: 'r7',
    restaurantName: 'Trà & Sinh Tố Ô Long',
    price: 35000,
    rating: 4.5,
    deliveryTime: '15–25 phút',
    distance: '1.3 km',
    description: 'Dưa hấu ép lạnh kết hợp tắc chua ngọt, đường phèn — giải nhiệt tức thì cho ngày oi bức Sài Gòn.',
    label: 'Lowest delivery fee',
    labelReason: 'Phí giao hàng chỉ 10.000₫, giao trong 15 phút.',
    category: 'healthy',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd12',
    name: 'Mì Quảng Gà Trứng',
    restaurantId: 'r8',
    restaurantName: 'Quán Ăn Dân Dã Bà Năm',
    price: 60000,
    rating: 4.5,
    deliveryTime: '25–40 phút',
    distance: '2.8 km',
    description: 'Mì Quảng sợi vàng nghệ đặc trưng, gà ta xé nhỏ, trứng cút, đậu phộng rang giòn, bánh tráng nướng.',
    label: 'Popular nearby',
    labelReason: 'Được đặt nhiều nhất trong danh mục Mì tại Thủ Đức.',
    category: 'noodles',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd13',
    name: 'Bánh Xèo Tôm Thịt',
    restaurantId: 'r8',
    restaurantName: 'Quán Ăn Dân Dã Bà Năm',
    price: 70000,
    rating: 4.6,
    deliveryTime: '25–40 phút',
    distance: '2.8 km',
    description: 'Bánh xèo đổ nóng giòn rụm, nhân tôm sú căng mẩy, thịt ba chỉ thơm. Ăn kèm rau sống và nước chấm bà Năm.',
    label: 'Top rated',
    labelReason: '4.6 sao — món bánh xèo được đánh giá cao nhất khu vực.',
    category: 'streetfood',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd14',
    name: 'Gỏi Cuốn Tôm Thịt',
    restaurantId: 'r8',
    restaurantName: 'Quán Ăn Dân Dã Bà Năm',
    price: 45000,
    rating: 4.4,
    deliveryTime: '25–40 phút',
    distance: '2.8 km',
    description: 'Bánh tráng cuốn tôm luộc đỏ hồng, thịt heo ba chỉ, bún và rau thơm — chấm tương đậu phộng truyền thống.',
    category: 'streetfood',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd15',
    name: 'Hủ Tiếu Nam Vang',
    restaurantId: 'r8',
    restaurantName: 'Quán Ăn Dân Dã Bà Năm',
    price: 65000,
    rating: 4.5,
    deliveryTime: '25–40 phút',
    distance: '2.8 km',
    description: 'Nước dùng hầm xương heo trong vắt ngọt thanh. Sợi hủ tiếu dai mềm, thịt bằm, tôm luộc, gan heo thái mỏng.',
    category: 'noodles',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&h=350&fit=crop&auto=format',
    isSponsored: true,
  },
  {
    id: 'd16',
    name: 'Chè Ba Màu',
    restaurantId: 'r9',
    restaurantName: 'Chè & Xôi Hiển Khánh',
    price: 35000,
    rating: 4.7,
    deliveryTime: '20–30 phút',
    distance: '1.6 km',
    description: 'Đậu xanh nghiền mịn, đậu đỏ hầm mềm, thạch pandan xanh mát — chan nước dừa béo, đá bào phủ trắng.',
    label: 'Best value',
    labelReason: 'Giá chỉ 35.000₫ cho ly chè đầy đủ 3 tầng, nguyên liệu tươi mỗi ngày.',
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd17',
    name: 'Xôi Gà Chiên Bơ',
    restaurantId: 'r9',
    restaurantName: 'Chè & Xôi Hiển Khánh',
    price: 55000,
    rating: 4.8,
    deliveryTime: '20–30 phút',
    distance: '1.6 km',
    description: 'Xôi nếp trắng dẻo phủ đùi gà chiên bơ tỏi vàng giòn. Hành phi thơm lừng, tương ớt đi kèm. No skip.',
    label: 'Top rated',
    labelReason: '4.8 sao — được đặt lại nhiều nhất danh mục Xôi trong tháng.',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?w=500&h=350&fit=crop&auto=format',
  },
  {
    id: 'd18',
    name: 'Kem Dừa Đậu Xanh',
    restaurantId: 'r9',
    restaurantName: 'Chè & Xôi Hiển Khánh',
    price: 40000,
    rating: 4.7,
    deliveryTime: '20–30 phút',
    distance: '1.6 km',
    description: 'Kem dừa tươi đóng trong gáo dừa non, nhân đậu xanh đánh nhuyễn béo bùi, phủ dừa sợi nướng thơm.',
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&h=350&fit=crop&auto=format',
  },
];

export interface CartItem {
  dishId: string;
  dishName: string;
  restaurantId: string;
  restaurantName: string;
  price: number;
  quantity: number;
  image: string;
  note?: string;
}
