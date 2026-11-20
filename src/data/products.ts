import { BrewMethodSpec, Product } from '../types/shop';

export const HERO_IMAGE = '/src/assets/images/hero_coffee_atelier_1795140495466.jpg';
export const ROASTERY_IMAGE = '/src/assets/images/roastery_craft_drum_1795140496311.jpg';

export const PRODUCTS: Product[] = [
  {
    id: 'rung-gia-phin',
    slug: 'rung-gia-phin-co-dien',
    name: 'Rừng Già · Phin Cổ Điển',
    subtitle: 'Phối trộn truyền thống Cầu Đất & Buôn Ma Thuột',
    category: 'phin-blend',
    categoryLabel: 'Phối Trộn Phin',
    origin: 'Cầu Đất & Đắk Lắk, Việt Nam',
    elevation: '850 – 1.550 m',
    process: 'Chế biến ướt & Tự nhiên',
    roastLevel: 'Rang đậm',
    tastingNotes: ['Sô-cô-la đen 75%', 'Đường thắng', 'Hạt dẻ rang'],
    description:
      'Bản phối mang tinh thần cà phê phin Việt Nam cổ điển: thể chất dày dặn, hậu vị ngọt sâu không gắt, cân bằng giữa hương thơm thanh tao của Arabica Đà Lạt và độ đậm chắc của Fine Robusta Tây Nguyên.',
    basePrice: 245000,
    defaultWeight: '250g',
    availableWeights: ['250g', '500g', '1kg'],
    availableGrinds: ['Nguyên hạt', 'Xay Pha Phin', 'Xay Espresso'],
    batchCode: 'LS-2611-RG',
    stock: 28,
    statusNote: 'Bán chạy nhất',
    image: '/src/assets/images/coffee_phin_heritage_1795140496250.jpg',
    imageAlt: 'Hộp cà phê Rừng Già màu xanh rêu đặt cạnh phin thép không gỉ và ly thủy tinh',
  },
  {
    id: 'midnight-bloom-ethiopia',
    slug: 'midnight-bloom-ethiopia',
    name: 'Midnight Bloom · Ethiopia',
    subtitle: 'Hạt đơn vùng Yirgacheffe chế biến ướt',
    category: 'single-origin',
    categoryLabel: 'Hạt Đơn Vùng',
    origin: 'Yirgacheffe, Ethiopia',
    elevation: '1.950 – 2.150 m',
    process: 'Chế biến ướt (Washed)',
    roastLevel: 'Rang sáng vừa',
    tastingNotes: ['Hoa nhài trắng', 'Quả mọng rừng', 'Vỏ cam vàng'],
    description:
      'Mẻ rang sáng vừa dành riêng cho Pour-over và pha giấy lọc. Cấu trúc hương trong trẻo, độ chua thanh tao của cam quýt mở ra tầng hương hoa nhài kéo dài khi cà phê hạ nhiệt.',
    basePrice: 340000,
    defaultWeight: '250g',
    availableWeights: ['250g', '500g', '1kg'],
    availableGrinds: ['Nguyên hạt', 'Xay Pour-over', 'Xay Pha Phin'],
    batchCode: 'LS-2611-MB',
    stock: 16,
    statusNote: 'Lô vụ mùa 2026',
    image: '/src/assets/images/coffee_cau_dat_arabica_1795140494061.jpg',
    imageAlt: 'Túi cà phê giấy màu ngà nhãn xanh rêu Midnight Bloom trên khối đá vôi',
  },
  {
    id: 'guji-heirloom-canister',
    slug: 'ethiopia-guji-hop-thiec',
    name: 'Ethiopia Guji · Hộp Thiếc Đen',
    subtitle: 'Giống bản địa Heirloom chế biến tự nhiên',
    category: 'single-origin',
    categoryLabel: 'Hạt Đơn Vùng',
    origin: 'Guji Zone, Ethiopia',
    elevation: '2.050 m',
    process: 'Phơi giàn tự nhiên (Natural)',
    roastLevel: 'Rang sáng',
    tastingNotes: ['Việt quất chín', 'Hoa trắng', 'Cam Bergamot'],
    description:
      'Được bảo quản trong hộp thiếc đen mờ kín khí kèm túi nạp nguyên hạt. Hương trái cây chín mọng nổi bật, vị ngọt siro mượt mà phù hợp làm quà biếu trang trọng hoặc thưởng thức hằng ngày.',
    basePrice: 420000,
    defaultWeight: '250g',
    availableWeights: ['250g', '500g'],
    availableGrinds: ['Nguyên hạt', 'Xay Pour-over', 'Xay Espresso'],
    batchCode: 'LS-2611-GJ',
    stock: 12,
    statusNote: 'Phiên bản hộp thiếc',
    image: '/src/assets/images/coffee_buon_ma_thuot_robusta_1795140497128.jpg',
    imageAlt: 'Hộp thiếc đen mờ và túi cà phê Ethiopia Guji đặt cạnh muỗng đồng trên mặt đá',
  },
  {
    id: 'alo-guji-honey',
    slug: 'alo-guji-che-bien-mat-ong',
    name: 'Alo Guji · Chế Biến Mật Ong',
    subtitle: 'Lô vi vùng cao nguyên Alo phơi mật ong',
    category: 'single-origin',
    categoryLabel: 'Hạt Đơn Vùng',
    origin: 'Alo Village, Guji, Ethiopia',
    elevation: '2.200 m',
    process: 'Chế biến mật ong (Honey)',
    roastLevel: 'Rang sáng vừa',
    tastingNotes: ['Mật hoa rừng', 'Đào chín', 'Trà đen Ceylon'],
    description:
      'Thu hoạch thủ công ở độ cao 2.200m và phơi chậm cùng lớp nhầy tự nhiên trong 18 ngày. Ly cà phê mang độ ngọt tròn trịa, hậu vị mượt như mật ong và hương trà đen thanh lịch.',
    basePrice: 365000,
    defaultWeight: '250g',
    availableWeights: ['250g', '500g', '1kg'],
    availableGrinds: ['Nguyên hạt', 'Xay Pour-over', 'Xay Pha Phin'],
    batchCode: 'LS-2611-AH',
    stock: 14,
    statusNote: 'Số lượng giới hạn',
    image: '/src/assets/images/coffee_typica_honey_1795140497612.jpg',
    imageAlt: 'Túi cà phê giấy màu đá Alo Guji Honey Processed đặt cạnh tách gốm thủ công',
  },
  {
    id: 'cold-brew-specialty',
    slug: 'cold-brew-u-lanh-nguyen-ban',
    name: 'Cold Brew Nguyên Bản · 350ml',
    subtitle: 'Chiết xuất lạnh 18 giờ từ hạt Ethiopia đơn vùng',
    category: 'cold-brew',
    categoryLabel: 'Cà Phê Ủ Lạnh',
    origin: 'Ethiopia · Ủ lạnh tại Lạc Sơn',
    elevation: '1.950 m',
    process: 'Ủ lạnh 18 giờ ở 4°C',
    roastLevel: 'Rang sáng vừa',
    tastingNotes: ['Ca cao thanh', 'Mận chín', 'Hậu ngọt sạch'],
    description:
      'Đóng chai thủy tinh hổ phách dày giúp ngăn tia UV và giữ nguyên tầng hương tinh tế. Dùng trực tiếp cùng đá viên lớn cho buổi sáng thanh tỉnh mà không cần pha chế.',
    basePrice: 135000,
    defaultWeight: '350ml',
    availableWeights: ['350ml'],
    availableGrinds: ['Uống liền'],
    isSingleUnit: true,
    batchCode: 'LS-2611-CB',
    stock: 22,
    statusNote: 'Ủ mới mỗi sáng',
    image: '/src/assets/images/coffee_cold_brew_bottle_1795140494932.jpg',
    imageAlt: 'Chai thủy tinh nâu Cold Brew Coffee đặt cạnh ly pha lê có viên đá vuông lớn',
  },
  {
    id: 'lac-son-giesen-reserve',
    slug: 'lac-son-me-rang-giesen',
    name: 'Lạc Sơn Tuyển Chọn · Mẻ Giesen',
    subtitle: 'Phối trộn cân bằng cho Phin hiện đại & Espresso',
    category: 'phin-blend',
    categoryLabel: 'Phối Trộn Phin',
    origin: 'Cầu Đất 70% & Bảo Lộc 30%',
    elevation: '1.450 – 1.650 m',
    process: 'Rang trống gang Giesen 12kg',
    roastLevel: 'Rang vừa',
    tastingNotes: ['Hạnh nhân nướng', 'Caramel mặn', 'Ca cao sữa'],
    description:
      'Mẻ rang chữ ký của Nhà Rang Lạc Sơn trên trống gang Giesen cổ điển. Độ rang vừa giúp giữ vị ngọt đường nâu tự nhiên, phù hợp hoàn hảo cho cả pha phin không đường, sữa đá lẫn máy Espresso tại gia.',
    basePrice: 275000,
    defaultWeight: '250g',
    availableWeights: ['250g', '500g', '1kg'],
    availableGrinds: ['Nguyên hạt', 'Xay Pha Phin', 'Xay Espresso'],
    batchCode: 'LS-2611-GS',
    stock: 35,
    statusNote: 'Rang mới trong 48 giờ',
    image: '/src/assets/images/roastery_craft_drum_1795140496311.jpg',
    imageAlt: 'Hạt cà phê đặc sản mới rang đang làm nguội trong khay trống gang Giesen',
  },
];

export const BREW_METHODS: BrewMethodSpec[] = [
  {
    id: 'phin',
    name: 'Pha Phin Cổ Điển',
    originNote: 'Phù hợp Rừng Già & Mẻ Giesen',
    coffeeGramsPerCup: 20,
    waterMlPerCup: 90,
    waterTempC: 94,
    ratioLabel: '1 : 4,5',
    brewTime: '5 phút 30 giây',
    grindRecommendation: 'Xay cỡ vừa thô (cỡ hạt đường cát)',
    steps: [
      'Tráng nóng phin bằng nước sôi và cho cà phê vào, lắc nhẹ cho phẳng mặt.',
      'Rót 30ml nước 94°C ủ nở hạt trong 45 giây để giải phóng khí CO₂.',
      'Đặt nắp gài nhẹ tay, rót tiếp phần nước còn lại và chờ cà phê nhỏ giọt chậm rãi.',
    ],
  },
  {
    id: 'v60',
    name: 'Pour-over V60',
    originNote: 'Phù hợp Midnight Bloom, Guji & Alo Honey',
    coffeeGramsPerCup: 15,
    waterMlPerCup: 240,
    waterTempC: 92,
    ratioLabel: '1 : 16',
    brewTime: '2 phút 45 giây',
    grindRecommendation: 'Xay cỡ trung bình (cỡ muối biển mịn)',
    steps: [
      'Tráng giấy lọc và làm ấm bình chiết xuất với nước nóng, đổ bỏ nước tráng.',
      'Rót vòng tròn 40ml nước 92°C ủ bloom trong 40 giây.',
      'Chia lượng nước còn lại thành 2 lần rót đều tâm ra rìa, kết thúc ở 2 phút 45 giây.',
    ],
  },
  {
    id: 'espresso',
    name: 'Espresso Thủ Công',
    originNote: 'Phù hợp Mẻ Giesen & Rừng Già',
    coffeeGramsPerCup: 18,
    waterMlPerCup: 36,
    waterTempC: 93,
    ratioLabel: '1 : 2',
    brewTime: '27 – 30 giây',
    grindRecommendation: 'Xay siêu mịn đồng nhất',
    steps: [
      'Cân chính xác 18g cà phê xay mịn, dàn đều và nén phẳng lực ổn định.',
      'Xả nước đầu họng máy 3 giây để ổn định nhiệt độ 93°C.',
      'Chiết xuất áp suất 9 bar thu về 36g nước cốt dày mịn lớp crema màu hạt dẻ.',
    ],
  },
];

export interface StoreBranch {
  id: 'dalat' | 'hanoi';
  name: string;
  role: string;
  address: string;
  district: string;
  hours: string;
  phone: string;
  coordsLabel: string;
  lat: number;
  lng: number;
  osmUrl: string;
  directionsOrigin: string;
  distanceLabel: string;
  durationLabel: string;
  routeSteps: string[];
  landmarks: { label: string; x: number; y: number }[];
  pinPos: { x: number; y: number };
}

export const STORE_BRANCHES: StoreBranch[] = [
  {
    id: 'dalat',
    name: 'Xưởng Rang & Phòng Nếm Đà Lạt',
    role: 'Trụ sở chính · Xưởng rang Giesen',
    address: '18 Trần Hưng Đạo, Phường 10',
    district: 'TP. Đà Lạt, Lâm Đồng',
    hours: '07:30 – 20:30 (Thứ Hai – Chủ Nhật)',
    phone: '0263 382 4190',
    coordsLabel: '11.9365° N, 108.4548° E',
    lat: 11.9365,
    lng: 108.4548,
    osmUrl: 'https://www.openstreetmap.org/?mlat=11.9365&mlon=108.4548#map=16/11.9365/108.4548',
    directionsOrigin: 'Hồ Xuân Hương (Quảng trường Lâm Viên)',
    distanceLabel: '1,4 km',
    durationLabel: '5 phút lái xe · 16 phút đi bộ',
    routeSteps: [
      'Xuất phát từ Quảng trường Lâm Viên, đi về hướng Đông Nam theo đường Trần Quốc Toản.',
      'Qua vòng xoay Hồ Xuân Hương, rẽ vào đường Trần Hưng Đạo (dọc dãy biệt thự cổ).',
      'Tiếp tục 700m, Xưởng Rang Lạc Sơn nằm bên tay phải tại số 18, có sân đỗ ô tô.',
    ],
    landmarks: [
      { label: 'Hồ Xuân Hương', x: 105, y: 88 },
      { label: 'Quảng trường Lâm Viên', x: 155, y: 150 },
      { label: 'Dinh II', x: 355, y: 225 },
      { label: 'Nhà ga Đà Lạt', x: 385, y: 90 },
    ],
    pinPos: { x: 278, y: 145 },
  },
  {
    id: 'hanoi',
    name: 'Phòng Thử Nếm Hà Nội',
    role: 'Cửa hàng trưng bày & Thử nếm',
    address: '42 Hàng Bông, Quận Hoàn Kiếm',
    district: 'TP. Hà Nội',
    hours: '08:00 – 21:30 (Thứ Hai – Chủ Nhật)',
    phone: '024 3928 6510',
    coordsLabel: '21.0294° N, 105.8476° E',
    lat: 21.0294,
    lng: 105.8476,
    osmUrl: 'https://www.openstreetmap.org/?mlat=21.0294&mlon=105.8476#map=17/21.0294/105.8476',
    directionsOrigin: 'Hồ Hoàn Kiếm (Quảng trường Đông Kinh Nghĩa Thục)',
    distanceLabel: '650 m',
    durationLabel: '8 phút đi bộ · 4 phút xe máy',
    routeSteps: [
      'Từ Quảng trường Đông Kinh Nghĩa Thục, đi thẳng vào phố Hàng Gai theo hướng Tây.',
      'Qua ngã tư Hàng Trống – Lương Văn Can, đi thẳng sang phố Hàng Bông.',
      'Đi thêm 220m, Phòng Thử Nếm Lạc Sơn nằm bên tay trái tại số 42 Hàng Bông.',
    ],
    landmarks: [
      { label: 'Hồ Hoàn Kiếm', x: 385, y: 195 },
      { label: 'Quảng trường ĐKNT', x: 345, y: 132 },
      { label: 'Nhà Thờ Lớn', x: 295, y: 232 },
      { label: 'Cửa Nam', x: 95, y: 180 },
    ],
    pinPos: { x: 215, y: 138 },
  },
];
