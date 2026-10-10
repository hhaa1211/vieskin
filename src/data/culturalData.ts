import { 
  GarmentLore, 
  TrendingRemixItem, 
  CulturalBadge, 
  ExtractedAsset,
  GarmentLayerState,
  MannequinSettings,
  DynamicLayerItem
} from '../types';

export const GARMENTS_LORE: GarmentLore[] = [
  {
    id: 'ao_tac',
    name: 'Áo Tấc (Ngũ Thân Tay Thụng)',
    family: 'ao_tac',
    era: 'Triều Nguyễn (Thế kỷ 19 - đầu thế kỷ 20)',
    region: 'central',
    suitableOccasions: ['gala_formal', 'lunar_new_year', 'yearbook_graduation'],
    originalRank: 'Toàn dân (Thường dân đến Quý tộc, Tế lễ & Hôn lễ)',
    etiquetteRules: [
      'Tay áo thụng rộng 40-50cm, khi đứng hành lễ cần chắp hai tay lại phía trước che kín đầu ngón tay.',
      'Cúc áo ngũ thường (5 cúc) đại diện cho: Nhân - Lễ - Nghĩa - Trí - Tín.',
      'Vạt phải đè vạt trái (Hữu nhiệm), tuyệt đối không gài ngược sang nách phải (Tả nhiệm).'
    ],
    patternSymbolism: [
      'Hoa văn sóng nước Thủy Ba (sự trường tồn, thuận buồm xuôi gió)',
      'Họa tiết Vân mây Ngũ sắc (khí lành cát tường)',
      'Hoa cúc chữ Vạn (thanh cao, trường thọ)'
    ],
    description: 'Lễ phục trang trọng của người Việt thời Nguyễn. Tà áo dài quá gối, cổ đứng khép kín với cổ áo trong màu trắng (trung đơn), tay thụng dài quá đầu ngón tay.',
    historicalContext: 'Được ban hành định chế dưới thời Chúa Nguyễn Phúc Khoát (1744) và hoàn thiện dưới triều Vua Minh Mạng. Là y phục đại diện cho tinh thần lễ nghi, trang trọng trong mọi sự kiện trọng đại của người Việt.',
    defaultColors: {
      robe: '#1E3A8A', // Xanh chàm thẫm
      collar: '#FAF9F5', // Trắng ngà trung đơn
      trim: '#D97706' // Viền vàng hoàng kim
    },
    fiveElement: 'Thủy',
    imageSilhouette: 'ao_tac_silhouette'
  },
  {
    id: 'ao_nhat_binh',
    name: 'Áo Nhật Bình',
    family: 'ao_nhat_binh',
    era: 'Triều Nguyễn (Năm 1807 - 1945)',
    region: 'central',
    suitableOccasions: ['gala_formal', 'yearbook_graduation'],
    originalRank: 'Hậu phi, Công chúa & Mệnh phụ quý tộc',
    etiquetteRules: [
      'Cổ áo hình chữ nhật ghép dải ngũ sắc, đối ngực gài bằng cúc kim loại hoặc ngọc.',
      'Màu sắc gốc quy định chặt chẽ theo phẩm cấp: Hoàng hậu (Vàng), Công chúa (Đỏ son), Nhất nhị phẩm (Tím), Tam tứ phẩm (Xanh lam).',
      'Phần tay áo viền ngũ sắc tượng trưng cho ngũ hành tương sinh âm dương.'
    ],
    patternSymbolism: [
      'Chim Phượng hoàng vần vũ (quyền quý, đức hạnh mẫu nghi)',
      'Sóng nước Thủy Ba kết hợp mây ngũ sắc (quốc thái dân an)',
      'Hoa sen bách hợp thêu kim tuyến (thanh khiết cung đình)'
    ],
    description: 'Tuyệt tác triều phục nữ giới Cố đô Huế. Tên gọi bắt nguồn từ phần cổ áo khi khép lại tạo thành hình chữ nhật (chữ Nhật) trước ngực, phối cùng các dải ngũ sắc rực rỡ.',
    historicalContext: 'Được định chế năm Gia Long thứ 6 (1807). Khi nhà Nguyễn kết thúc, áo Nhật Bình trở thành áo cưới trang trọng của con gái gia đình quyền quý xứ Huế.',
    defaultColors: {
      robe: '#DC2626', // Đỏ son cung đình
      collar: '#D97706', // Cổ ngũ sắc viền vàng
      trim: '#0D9488' // Ngọc bích
    },
    fiveElement: 'Hỏa',
    imageSilhouette: 'ao_nhat_binh_silhouette'
  },
  {
    id: 'ao_ngu_than_chen',
    name: 'Áo Ngũ Thân Tay Chẽn',
    family: 'ao_ngu_than_chen',
    era: 'Thời Nguyễn chấn hưng (Năm 1744 - thế kỷ 20)',
    region: 'south',
    suitableOccasions: ['streetwear_cafe', 'yearbook_graduation', 'lunar_new_year'],
    originalRank: 'Đại chúng (Trí thức, Nho sĩ, Thị dân & Quan lại thường nhật)',
    etiquetteRules: [
      'Tay áo may ôm gọn sát cổ tay (tay chẽn), thuận tiện cho sinh hoạt và làm việc hàng ngày.',
      '5 thân áo gồm: 2 thân trước, 2 thân sau và 1 thân con (vạt con nằm bên trong tượng trưng cho bản thân).',
      'Bốn thân ngoài tượng trưng cho tứ thân phụ mẫu (cha mẹ ruột và cha mẹ vợ/chồng).'
    ],
    patternSymbolism: [
      'Lụa trơn hoặc gấm dệt chìm hoa cúc, chữ Thọ',
      'Đường may giấu chỉ tinh tế thể hiện đức tính khiêm tốn, hòa nhã',
      'Cổ đứng 4-5cm ngay ngắn thể hiện phong thái đĩnh đạc'
    ],
    description: 'Tiền thân trực tiếp nhất của Áo Dài hiện đại. Phom dáng cân đối, tay chẽn năng động kết hợp cổ đứng và khuy gài bên sườn phải.',
    historicalContext: 'Là cuộc cải cách y phục quy mô quốc gia của Chúa Sãi và Vua Minh Mạng để thống nhất phong hóa trang phục hai miền Nam Bắc, tạo nên bản sắc quốc phục chung.',
    defaultColors: {
      robe: '#0F172A', // Đen mun / Xanh tím than
      collar: '#FAF9F5', // Cổ trắng
      trim: '#475569'
    },
    fiveElement: 'Kim',
    imageSilhouette: 'ao_ngu_than_chen_silhouette'
  },
  {
    id: 'ao_tu_than',
    name: 'Áo Tứ Thân',
    family: 'ao_tu_than',
    era: 'Thế kỷ 12 đến đầu thế kỷ 20',
    region: 'north',
    suitableOccasions: ['folk_festival', 'streetwear_cafe', 'yearbook_graduation'],
    originalRank: 'Bình dân Bắc Bộ & Thiếu nữ Kinh Bắc',
    etiquetteRules: [
      'Phía trước có 2 vạt tách rời để buông lơi hoặc buộc thắt gút duyên dáng trước bụng.',
      'Bên trong bắt buộc mặc Yếm (Yếm đào, yếm cánh sen hoặc yếm cổ tròn), bên ngoài buộc thắt lưng xanh hay thắt lưng điều.',
      'Không gài cúc kín như ngũ thân; tạo nét mềm mại uyển chuyển khi di chuyển.'
    ],
    patternSymbolism: [
      'Bốn vạt áo tượng trưng cho Tứ Đức: Công - Dung - Ngôn - Hạnh',
      'Thắt lưng lụa buông dài như dải lụa sông Đuống Kinh Bắc',
      'Nón quai thao che nghiêng e ấp tình tứ quan họ'
    ],
    description: 'Biểu tượng hồn nhiên thuần hậu của người phụ nữ nông thôn Bắc Bộ và các liền chị Quan họ. Kết hợp hài hòa giữa áo khoác màu nâu/then, yếm thắm và dải thắt lưng rực rỡ.',
    historicalContext: 'Xuất hiện từ rất sớm trong lịch sử dân gian Việt Nam, thích nghi hoàn hảo với lao động đồng áng lẫn các dịp hội làng trẩy hội mùa xuân.',
    defaultColors: {
      robe: '#78350F', // Nâu củ nâu / Hạt dẻ
      collar: '#DC2626', // Lộ yếm đào đỏ
      trim: '#16A34A' // Thắt lưng xanh lá
    },
    fiveElement: 'Thổ',
    imageSilhouette: 'ao_tu_than_silhouette'
  },
  {
    id: 'ao_giao_linh',
    name: 'Áo Giao Lĩnh (Trực Lĩnh)',
    family: 'ao_giao_linh',
    era: 'Thời Lý - Trần - Lê sơ (Thế kỷ 11 - 16)',
    region: 'north',
    suitableOccasions: ['gala_formal', 'folk_festival'],
    originalRank: 'Quý tộc hoàng gia & Nho sĩ triều đình',
    etiquetteRules: [
      'Hai vạt áo chéo nhau trước ngực (Giao Lĩnh). Chuẩn mực luôn là vạt bên phải vắt qua thân bên trái.',
      'Thường dùng đai lưng (thường hoặc ngọc đới) cố định eo.',
      'Tà áo mở rộng, tay thụng lớn tạo dáng dấp uyển chuyển cổ phong Đại Việt.'
    ],
    patternSymbolism: [
      'Hoa văn rồng thời Lý giun uốn lượn hình chữ S biểu tượng nguồn nước và vũ trụ',
      'Hoa sen gốm hoa nâu thời Trần mộc mạc, hào khí Đông A',
      'Đất trời vuông tròn trong sự giao thoa vạt áo'
    ],
    description: 'Cổ phục uy nghi thời kỳ độc lập tự chủ Lý - Trần - Lê. Vạt áo bắt chéo trang trọng, ống tay bay bổng và đai lưng đính ngọc quý phái.',
    historicalContext: 'Được ghi chép trong Đại Việt Sử Ký Toàn Thư và các bức tượng chùa cổ (tượng chùa Phật Tích, chùa Bút Tháp). Đại diện cho kỷ nguyên vàng son của văn minh Đại Việt.',
    defaultColors: {
      robe: '#047857', // Xanh bích ngọc
      collar: '#FAF9F5',
      trim: '#F59E0B'
    },
    fiveElement: 'Mộc',
    imageSilhouette: 'ao_giao_linh_silhouette'
  },
  {
    id: 'ao_dai',
    name: 'Áo Dài Tân Thời (Modernized)',
    family: 'ao_dai',
    era: 'Thập niên 1930s đến Đương đại Gen Z',
    region: 'all',
    suitableOccasions: ['yearbook_graduation', 'lunar_new_year', 'streetwear_cafe', 'gala_formal'],
    originalRank: 'Toàn dân hiện đại (Nữ sinh, Giới trẻ, Công sở)',
    etiquetteRules: [
      'Tà trước và tà sau buông rủ thanh mảnh; tà cao từ eo trở xuống.',
      'Cổ áo linh hoạt: cổ trụ cao 3cm truyền thống, cổ thuyền hoặc cổ tròn cách tân.',
      'Mặc cùng quần lụa suông, quần culottes hoặc phối chân váy xòe đương đại.'
    ],
    patternSymbolism: [
      'Họa tiết gốm hoa lam Bát Tràng, tranh Đông Hồ',
      'Sự giải phóng nét đẹp hình thể người phụ nữ Việt tân tiến',
      'Tinh thần tự do và hội nhập quốc tế của thế hệ trẻ'
    ],
    description: 'Sự tiến hóa thần kỳ từ Áo Ngũ Thân qua bàn tay họa sĩ Lemur Cát Tường (1934) và tay raglan của nhà may Dung (Sài Gòn 1960) thành Quốc phục đương đại.',
    historicalContext: 'Được UNESCO và bạn bè quốc tế vinh danh là biểu tượng thị giác đặc trưng của văn hóa và tâm hồn người Việt hiện đại.',
    defaultColors: {
      robe: '#BE123C', // Hồng sen thắm
      collar: '#FAF9F5',
      trim: '#E11D48'
    },
    fiveElement: 'Hỏa',
    imageSilhouette: 'ao_dai_silhouette'
  },
  {
    id: 'ao_ba_ba',
    name: 'Áo Bà Ba Nam Bộ',
    family: 'ao_ba_ba',
    era: 'Thế kỷ 19 đến Đương đại',
    region: 'south',
    suitableOccasions: ['streetwear_cafe', 'folk_festival'],
    originalRank: 'Bình dân Nam Bộ & Người dân vùng sông nước',
    etiquetteRules: [
      'Dáng áo ôm nhẹ, xẻ tà hai bên hông tạo sự thoải mái.',
      'Cổ tròn hoặc xẻ V, cúc áo gài giữa tiện lợi.',
      'Phối cùng quần lụa suông đen hoặc trắng và khăn rằn.'
    ],
    patternSymbolism: [
      'Sắc hồng pastel, xanh lá mộc mạc tượng trưng cho nét dịu dàng Nam Bộ',
      'Khăn rằn sọc nét đẹp giản dị của người phương Nam'
    ],
    description: 'Trang phục mộc mạc, ấm áp của người dân Nam Bộ. Thiết kế đơn giản nhưng đỗi thân thương và gắn liền với miệt vườn sông nước.',
    historicalContext: 'Xuất hiện từ thế kỷ 19, áo Bà Ba trở thành trang phục gắn liền với đời sống lao động và sinh hoạt văn hóa Nam Bộ.',
    defaultColors: {
      robe: '#F472B6',
      collar: '#FBCFE8',
      trim: '#EC4899'
    },
    fiveElement: 'Mộc',
    imageSilhouette: 'ao_ba_ba_silhouette'
  },
  {
    id: 'ao_tho_cam',
    name: 'Áo Thổ Cẩm Dệt Tay',
    family: 'ao_tho_cam',
    era: 'Cổ truyền - Đương đại',
    region: 'north',
    suitableOccasions: ['folk_festival', 'streetwear_cafe'],
    originalRank: 'Đồng bào các dân tộc thiểu số Tây Bắc & Tây Nguyên',
    etiquetteRules: [
      'Họa tiết dệt tay thủ công kỷ hà âm dương đặc trưng.',
      'Thường phối với đai lưng, chân váy xếp nếp và trang sức bạc.',
      'Sử dụng màu nhuộm tự nhiên từ cây chàm, củ nâu, vỏ cây.'
    ],
    patternSymbolism: [
      'Mô típ mặt trời, cây cối, chim muông trên hoa văn kỷ hà',
      'Khăn đội đầu đính bông biểu tượng may mắn và ấm no'
    ],
    description: 'Y phục thổ cẩm độc đáo của các dân tộc Tây Bắc và Tây Nguyên. Từng đường kim mũi chỉ thêu dệt chứa đựng tri thức dân gian vĩ đại.',
    historicalContext: 'Nghệ thuật dệt thổ cẩm lưu giữ qua nhiều thế hệ đồng bào H’Mông, Dao, Thái, Ba Na, Ê Đê.',
    defaultColors: {
      robe: '#1E1B4B',
      collar: '#DC2626',
      trim: '#F59E0B'
    },
    fiveElement: 'Thổ',
    imageSilhouette: 'ao_tho_cam_silhouette'
  },
  {
    id: 'ao_cham',
    name: 'Áo Cổ Truyền Dân Tộc Chăm',
    family: 'ao_cham',
    era: 'Vương quốc Champa đến Đương đại',
    region: 'central',
    suitableOccasions: ['folk_festival', 'gala_formal'],
    originalRank: 'Phụ nữ & Quý tộc dân tộc Chăm',
    etiquetteRules: [
      'Áo chui đầu dáng dài thướt tha, thắt lưng Talei Kabak cuốn ngang eo.',
      'Đội khăn trùm Mblao mềm mại e ấp.',
      'Đeo khuyên tai Tháp Chàm và trang sức bạc.'
    ],
    patternSymbolism: [
      'Thắt lưng Talei Kabak với hoa văn mặt trời và thần thoại Champa',
      'Màu cam đất và đỏ gạch tượng trưng cho đất nắng Ninh Thuận'
    ],
    description: 'Tuyệt tác y phục dân tộc Chăm Ninh Thuận. Dáng áo chui đầu kín đáo nhưng tôn nét uyển chuyển của người phụ nữ.',
    historicalContext: 'Được bảo tồn qua hàng ngàn năm lịch sử gắn liền với các lễ hội Kate và di sản văn hóa Champa.',
    defaultColors: {
      robe: '#EA580C',
      collar: '#F97316',
      trim: '#D97706'
    },
    fiveElement: 'Hỏa',
    imageSilhouette: 'ao_cham_silhouette'
  }
];

export const WARDROBE_ITEMS = {
  inners: [
    { id: 'yem_dao', name: 'Yếm Đào Lụa Tơ Tằm', color: '#DC2626', desc: 'Sắc đỏ thắm cổ truyền, khoét cổ thuyền duyên dáng' },
    { id: 'yem_bach', name: 'Yếm Lụa Trắng Trơn', color: '#FAF9F5', desc: 'Thanh khiết, dễ phối hợp với áo khoác ngoài tối màu' },
    { id: 'yem_sen', name: 'Yếm Thêu Hoa Sen Hồng', color: '#F472B6', desc: 'Họa tiết cánh sen thêu thủ công tinh xảo' },
    { id: 'yem_do', name: 'Áo Yếm Đỏ Kinh Bắc Cyber', color: '#DC2626', desc: 'Áo yếm cổ yếm xẻ tà quyến rũ Y2K' },
    { id: 'ao_canh', name: 'Áo Cánh Cổ Tròn Xanh Nhạt', color: '#A7F3D0', desc: 'Áo lót kín đáo, thích hợp phong cách thư sinh thanh lịch' },
    { id: 'ao_ngu_than_gam', name: 'Áo Ngũ Thân Gấm Lót Trong', color: '#27272A', desc: 'Lót trong gấm hoa văn đĩnh đạc Hypebeast' }
  ],
  bottoms: [
    { id: 'quan_linh_den', name: 'Quần Lĩnh Đen Truyền Thống', color: '#0F172A', type: 'trousers', desc: 'Chất lĩnh bóng Bưởi mềm mại, phom ống rộng cổ điển' },
    { id: 'quan_lua_trang', name: 'Quần Lụa Trắng Hà Đông', color: '#F8FAFC', type: 'trousers', desc: 'Thướt tha, kinh điển trong trang phục học đường và cưới hỏi' },
    { id: 'quan_suong_y2k', name: 'Quần Suông Dải Màu Y2K', color: '#1E293B', type: 'trousers', desc: 'Quần đen sọc dải hồng neon năng động Gen Z' },
    { id: 'quan_tay_xep_ly_den', name: 'Quần Tây Xếp Ly Đen', color: '#0F172A', type: 'trousers', desc: 'Phom đứng xếp ly phong cách Tràng An Academia' },
    { id: 'vay_cargo_tui_hop', name: 'Váy Cargo Túi Hộp', color: '#4B5563', type: 'skirt', desc: 'Váy ngắn dù cá tính Cung Đình Techwear' },
    { id: 'quan_lua_suong_trang', name: 'Quần Lụa Suông Trắng', color: '#FFFFFF', type: 'trousers', desc: 'Mộc mạc, nhẹ nhàng phong cách Miệt Vườn Cottagecore' },
    { id: 'vay_xep_nep_cham', name: 'Chân Váy Xếp Nếp Chàm', color: '#1E293B', type: 'skirt', desc: 'Xếp nếp dệt chàm Tây Bắc Avant-Garde' },
    { id: 'vay_dap_ly_dark', name: 'Váy Dập Ly Tối Màu', color: '#18181B', type: 'skirt', desc: 'Váy xếp ly dài đen huyền bí Đại Việt Grunge' },
    { id: 'vay_tho_cam_quan', name: 'Váy Thổ Cẩm Quấn Tây Nguyên', color: '#7F1D1D', type: 'skirt', desc: 'Họa tiết thổ cẩm dệt tay rực rỡ Tây Nguyên' },
    { id: 'quan_lua_tim_nhat', name: 'Quần Lụa Tím Nhạt Xứ Huế', color: '#E9D5FF', type: 'trousers', desc: 'Nét thơ dịu dàng sông Hương Huế Thơ Mộng' },
    { id: 'quan_cargo_jogger', name: 'Quần Cargo Jogger Rêu', color: '#365314', type: 'trousers', desc: 'Phom túi hộp đường phố Phố Hiến Hypebeast' },
    { id: 'vay_maxi_indigo', name: 'Váy Maxi Indigo Xếp Tầng', color: '#1D4ED8', type: 'skirt', desc: 'Váy maxi xanh Indigo Ninh Thuận Sunsets' },
    { id: 'quan_jogger_cham', name: 'Quần Jogger Chàm Utility', color: '#1E293B', type: 'trousers', desc: 'Quần phượt chàm phom ôm Đông Bắc Utility' },
    { id: 'vay_xoe_nhieu_tang', name: 'Váy Xòe Nhiều Tầng Quan Họ', color: '#1E293B', type: 'skirt', desc: 'Chân váy xòe bồng bềnh phong cách Quan Họ Indie' },
    { id: 'quan_tay_suong_kem', name: 'Quần Tây Suông Màu Kem', color: '#FEF3C7', type: 'trousers', desc: 'Lịch lãm dandy phong cách Công Tử Retro' },
    { id: 'chan_vay_xa_cap', name: 'Chân Váy Xòe & Xà Cạp Dao Đỏ', color: '#1E293B', type: 'skirt', desc: 'Phối xà cạp cá tính Tây Bắc Punk-Rock' }
  ],
  tradAccessories: [
    { id: 'non_quai_thao_hologram', category: 'headwear', name: 'Nón Quai Thao Mini Hologram', color: '#E0E7FF', desc: 'Chất liệu tráng gương hologram bắt sáng Y2K' },
    { id: 'khan_xep_nhung_xanh', category: 'headwear', name: 'Khăn Xếp Nhung Xanh Tràng An', color: '#085F63', desc: 'Khăn cuộn nhung quý phái học đường' },
    { id: 'mu_bucket_techwear', category: 'headwear', name: 'Mũ Bucket Techwear Cung Đình', color: '#1E293B', desc: 'Mũ vành ngắn phong cách đường phố' },
    { id: 'non_la_ve_hoa', category: 'headwear', name: 'Nón Lá Vẽ Hoa Nhẹ Nhàng', color: '#FEF08A', desc: 'Nón lá truyền thống vẽ hoa sen hồng Cottagecore' },
    { id: 'khan_bong_do_hmong', category: 'headwear', name: 'Đầu Tóc Đính Bông Đỏ H’Mông', color: '#DC2626', desc: 'Khăn đội đầu thổ cẩm đính quả bông rực rỡ' },
    { id: 'non_la_den', category: 'headwear', name: 'Nón Lá Đen Huyền Bí', color: '#0F172A', desc: 'Nón lá nhuộm đen ấn tượng phong cách Grunge' },
    { id: 'bang_do_vintage', category: 'headwear', name: 'Băng Đô Tóc Vintage Sài Gòn', color: '#0284C7', desc: 'Băng đô vải chấm bi retro thập niên 60s' },
    { id: 'khan_buoc_dau_tay_nguyen', category: 'headwear', name: 'Khăn Buộc Đầu Tây Nguyên', color: '#991B1B', desc: 'Khăn thổ cẩm cuộn trán dã ngoại' },
    { id: 'non_bai_tho_hue', category: 'headwear', name: 'Nón Bài Thơ Xứ Huế', color: '#FEF08A', desc: 'Nón lá chằm cảnh chùa Thiên Mụ & bài thơ' },
    { id: 'khan_xep_dinh_huy_hieu', category: 'headwear', name: 'Khăn Xếp Đính Huy Hiệu Hypebeast', color: '#1E293B', desc: 'Khăn xếp đen phá cách đính badge Gen Z' },
    { id: 'khan_trum_mblao', category: 'headwear', name: 'Khăn Trùm Mblao Dân Tộc Chăm', color: '#1E3A8A', desc: 'Khăn vạt dài thắt tua rủ dệt tay' },
    { id: 'khan_van_cham', category: 'headwear', name: 'Khăn Vấn Chàm Đông Bắc', color: '#1E3A8A', desc: ' Khăn cuộn chàm mộc mạc vùng cao' },
    { id: 'non_quai_thao_mini', category: 'headwear', name: 'Nón Quai Thao Dệt Mini', color: '#78350F', desc: 'Nón quai thao đan thu nhỏ độc đáo' },
    { id: 'mu_phot_dandy', category: 'headwear', name: 'Mũ Phớt Dệt Cổ Điển Dandy', color: '#57534E', desc: 'Mũ beret dệt dạ phong cách lãng tử' },
    { id: 'khan_dao_do', category: 'headwear', name: 'Khăn Dao Đỏ Rực Rỡ', color: '#DC2626', desc: 'Khăn xếp đỏ rực đính đồng tiền bạc Punk Rock' },
    { id: 'khan_van_den', category: 'headwear', name: 'Khăn Vấn Nhung Đen 7 Vòng', color: '#0F172A', desc: 'Biểu trưng của sự đĩnh đạc, nho nhã' },
    { id: 'khan_van_hoang_kim', category: 'headwear', name: 'Khăn Vấn Vàng Hoàng Kim', color: '#D97706', desc: 'Sắc phục lễ hội và hoàng gia' },
    { id: 'kieng_bac_tui_gam', category: 'jewelry', name: 'Kiềng Bạc & Túi Gấm Y2K', color: '#94A3B8', desc: 'Kiềng cổ bạc sáng phối túi gấm nhỏ' },
    { id: 'tram_hoa_mai_bac', category: 'jewelry', name: 'Trâm Hoa Mai Bạc Tràng An', color: '#E2E8F0', desc: 'Trâm đính tóc hoa mai bằng bạc' },
    { id: 'quat_hoang_gia_kieng_xich', category: 'jewelry', name: 'Quạt Hoàng Gia & Kiềng Xích', color: '#D97706', desc: 'Quạt nan xòe vàng kim xích ngọc' },
    { id: 'kieng_bac_tay_bac', category: 'jewelry', name: 'Kiềng Bạc Chạm Khắc Tây Bắc', color: '#E2E8F0', desc: 'Kiềng cổ tròn bạc nguyên khối' },
    { id: 'ngoc_boi_co_eo', category: 'jewelry', name: 'Ngọc Bội Cổ Đeo Eo', color: '#059669', desc: 'Miếng ngọc bích chạm rồng đeo thắt lưng' },
    { id: 'vong_co_hat_bich', category: 'jewelry', name: 'Vòng Cổ Hạt Bích Cố Đô', color: '#059669', desc: 'Chuỗi ngọc bích màu xanh sẫm trang nhã' },
    { id: 'ngoc_boi_kinh_ram', category: 'jewelry', name: 'Ngọc Bội & Kính Râm Phố Hiến', color: '#059669', desc: 'Sự kết hợp giữa ngọc treo & kính mát đen' },
    { id: 'khuyen_tai_thap_cham', category: 'jewelry', name: 'Khuyên Tai Tháp Chàm', color: '#D97706', desc: 'Bông tai kim loại dệt tua rua Champa' },
    { id: 'kieng_xa_tich_bac', category: 'jewelry', name: 'Kiềng & Xà Tích Bạc Đông Bắc', color: '#E2E8F0', desc: 'Xà tích bạc treo bên hông truyền thống' },
    { id: 'trang_suc_bac_punk', category: 'jewelry', name: 'Trang Sức Bạc & Túi Đeo Punk', color: '#E2E8F0', desc: 'Vòng cổ bạc nhiều tầng kèm đai xích' },
    { id: 'guoc_moc_de_day', category: 'footwear', name: 'Guốc Mộc Đế Dày Y2K', color: '#D97706', desc: 'Guốc gỗ quai trong hack chiều cao' },
    { id: 'giay_loafer_banh_mi', category: 'footwear', name: 'Giày Loafer Bánh Mì', color: '#1E293B', desc: 'Giày da loafer đế xuồng năng động' },
    { id: 'sneaker_chunky_black', category: 'footwear', name: 'Sneaker Chunky Black Techwear', color: '#111827', desc: 'Giày thể thao hầm hố màu đen' },
    { id: 'guoc_moc_nhung', category: 'footwear', name: 'Guốc Mộc Quai Vải Nhung', color: '#78350F', desc: 'Guốc gỗ mộc mạc Nam Bộ' },
    { id: 'bot_da_theu_tho_cam', category: 'footwear', name: 'Bốt Da Thêu Thổ Cẩm', color: '#1E1B4B', desc: 'Bốt cổ ngắn đính hoa văn thổ cẩm' },
    { id: 'bot_chien_binh_den', category: 'footwear', name: 'Bốt Chiến Binh Đen', color: '#09090B', desc: 'Giày bốt cao cổ dây thắt bụi bặm' },
    { id: 'giay_got_thap_vintage', category: 'footwear', name: 'Giày Gót Thấp Vintage Sài Gòn', color: '#1C1917', desc: 'Giày mụi nhọn gót thấp retro' },
    { id: 'bot_da_ngoai_ham_ho', category: 'footwear', name: 'Bốt Dã Ngoại Hầm Hố Tây Nguyên', color: '#27272A', desc: 'Giày đi rừng phượt dã ngoại' },
    { id: 'giay_nhung_truyen_thong', category: 'footwear', name: 'Giày Nhung Truyền Thống Xứ Huế', color: '#581C87', desc: 'Giày thêu hoa văn cung đình mềm mại' },
    { id: 'sneaker_co_cao', category: 'footwear', name: 'Sneaker Cổ Cao Hypebeast', color: '#18181B', desc: 'Giày thể thao cổ cao canvas đen trắng' },
    { id: 'sandal_quai_ben', category: 'footwear', name: 'Sandal Quai Bện Dây Ninh Thuận', color: '#78350F', desc: 'Dép sandal da bện thủ công' },
    { id: 'bot_phuot_co_cao', category: 'footwear', name: 'Bốt Phượt Cổ Cao Đông Bắc', color: '#27272A', desc: 'Bốt da lộn cổ cao chống nước' },
    { id: 'bot_da_lon_co_ngan', category: 'footwear', name: 'Bốt Da Lộn Cổ Ngắn Quan Họ', color: '#78350F', desc: 'Bốt cổ chân da lộn màu nâu' },
    { id: 'giay_da_derby', category: 'footwear', name: 'Giày Da Derby Dandy', color: '#451A03', desc: 'Giày tây Derby hai màu nâu kem' },
    { id: 'bot_den_co_xich', category: 'footwear', name: 'Bốt Đen Cao Cổ Có Xích Punk', color: '#18181B', desc: 'Giày bốt da đen đính dây xích kim loại' }
  ],
  modernAccessories: [
    { id: 'tui_vai_hang_trong', category: 'bag', name: 'Túi Vải Hàng Trống', desc: 'Túi vải canvas in họa tiết dân gian Hàng Trống' },
    { id: 'tui_dan_soi', category: 'bag', name: 'Túi Đan Sợi Tự Nhiên Cottagecore', desc: 'Túi cói đan quai tròn xinh xắn' },
    { id: 'tui_tho_cam_theo_cheo', category: 'bag', name: 'Túi Thổ Cẩm Đeo Chéo', desc: 'Túi đeo chéo tua rua dệt tay H’Mông' },
    { id: 'gang_tay_ho_ngon', category: 'accessory', name: 'Găng Tay Hở Ngón Grunge', desc: 'Găng tay da ngắn hở ngón bí ẩn' },
    { id: 'kinh_mat_retro_lon', category: 'eyewear', name: 'Kính Mát Retro Lớn', desc: 'Kính gọng mắt mèo đen quyến rũ' },
    { id: 'tui_xach_da_nho', category: 'bag', name: 'Túi Xách Tay Da Nhỏ Vintage', desc: 'Túi da cầm tay cổ điển Sài Gòn' },
    { id: 'gui_tre_dan', category: 'bag', name: 'Gùi Tre Đan Nhỏ Tây Nguyên', desc: 'Gùi tre mini đeo lưng độc đáo' },
    { id: 'gio_tre_may', category: 'bag', name: 'Giỏ Tre Mây Cầm Tay Huế', desc: 'Giỏ mây tre đan tinh xảo' },
    { id: 'tui_may_ban_nguyet', category: 'bag', name: 'Túi Mây Bán Nguyệt Ninh Thuận', desc: 'Túi cói hình bán nguyệt dạo biển' },
    { id: 'tui_gam_theu_hoa', category: 'bag', name: 'Túi Gấm Thêu Hoa & Kiềng', desc: 'Túi gấm quai kim loại hoa sen' },
    { id: 'khan_ran_tui_da', category: 'bag', name: 'Khăn Rằn Nhỏ & Túi Da Dandy', desc: 'Túi da đeo chéo kèm khăn rằn lụa' },
    { id: 'chunky_sneakers', category: 'footwear', name: 'Chunky Sneakers Trắng Y2K', desc: 'Năng động, hack dáng, tạo tương phản thị giác độc đáo' },
    { id: 'chelsea_boots', category: 'footwear', name: 'Chelsea Boots Da Đen Cổ Cao', desc: 'Cá tính, mang hơi thở avant-garde thời thượng' },
    { id: 'kinh_ram_retro', category: 'eyewear', name: 'Kính Râm Oval Gọng Đồi Mồi', desc: 'Điểm nhấn hoài niệm giao thoa thập niên 90s' },
    { id: 'canvas_tote', category: 'bag', name: 'Túi Canvas Tote Thêu Thủy Ba', desc: 'Phong cách sinh viên trẻ trung, đựng vừa laptop & sách vở' },
    { id: 'baguette_bag', category: 'bag', name: 'Túi Kẹp Nách Da Tối Giản', desc: 'Sang chảnh, chuẩn xu hướng thời trang dạo phố' }
  ]
};

export const TRENDING_REMIXES: TrendingRemixItem[] = [
  {
    id: 'remix_1',
    title: 'Bộ 1: Kinh Bắc Cyber Y2K',
    author: 'Minh Hoàng (CLB Cổ Phong ĐHQG)',
    avatar: 'MH',
    description: 'Giao thoa nét duyên dáng Kinh Bắc với năng động, phá cách thế hệ mới. Áo tứ thân pastel kết hợp áo yếm đỏ, quần suông Y2K và nón quai thao hologram.',
    tags: ['Kinh Bắc Cyber', 'Y2K', 'Áo Tứ Thân', 'Nón Quai Thao'],
    garmentName: 'Áo Tứ Thân Cách Tân Pastel',
    modernItems: ['Quần suông Y2K', 'Nón Quai Thao Hologram', 'Guốc Mộc Đế Dày'],
    likes: 428,
    preset: {
      family: 'ao_tu_than',
      robeColor: '#FDE047',
      collarColor: '#DC2626',
      innerColor: '#DC2626',
      bottomColor: '#1E293B',
      tradHead: 'non_quai_thao_hologram',
      modFoot: 'guoc_moc_de_day',
      modEye: 'kieng_bac_tui_gam',
      modBag: 'kieng_bac_tui_gam'
    }
  },
  {
    id: 'remix_2',
    title: 'Bộ 2: Tràng An Academia',
    author: 'Khánh Linh (ĐH Mỹ Thuật)',
    avatar: 'KL',
    description: 'Nét nho nhã, tri thức của áo ngũ thân cổ điển kết hợp thời trang học đường. Áo ngũ thân tweed phối quần tây xếp ly đen và khăn xếp nhung xanh.',
    tags: ['Tràng An Academia', 'Ngũ Thân Tweed', 'Smart Casual', 'Học đường'],
    garmentName: 'Áo Ngũ Thân Tweed',
    modernItems: ['Quần Tây Xếp Ly Đen', 'Giày Loafer Bánh Mì', 'Túi Vải Hàng Trống'],
    likes: 518,
    preset: {
      family: 'ao_ngu_than_chen',
      robeColor: '#64748B',
      collarColor: '#334155',
      innerColor: '#FAF9F5',
      bottomColor: '#0F172A',
      tradHead: 'khan_xep_nhung_xanh',
      modFoot: 'giay_loafer_banh_mi',
      modEye: 'tram_hoa_mai_bac',
      modBag: 'tui_vai_hang_trong'
    }
  },
  {
    id: 'remix_3',
    title: 'Bộ 3: Cung Đình Techwear',
    author: 'Thùy Chi (Fashion Creator)',
    avatar: 'TC',
    description: 'Biến tấu áo Nhật Bình uy nghiêm thành trang phục đường phố hiện đại, mạnh mẽ. Áo Nhật Bình vải dù phối váy cargo túi hộp và mũ bucket techwear.',
    tags: ['Cung Đình Techwear', 'Áo Nhật Bình', 'Techwear', 'Streetwear'],
    garmentName: 'Áo Nhật Bình Vải Dù',
    modernItems: ['Váy Cargo Túi Hộp', 'Sneaker Chunky Black', 'Mũ Bucket Techwear'],
    likes: 689,
    preset: {
      family: 'ao_nhat_binh',
      robeColor: '#27272A',
      collarColor: '#52525B',
      innerColor: '#18181B',
      bottomColor: '#4B5563',
      tradHead: 'mu_bucket_techwear',
      modFoot: 'sneaker_chunky_black',
      modEye: 'kinh_ram_retro',
      modBag: 'quat_hoang_gia_kieng_xich'
    }
  },
  {
    id: 'remix_4',
    title: 'Bộ 4: Miệt Vườn Cottagecore',
    author: 'Ngọc Mai (Sài Gòn Indie)',
    avatar: 'NM',
    description: 'Mang vẻ giản dị ấm áp của Áo Bà Ba Nam Bộ lồng ghép nét trong trẻo, yêu thiên nhiên thơ mộng. Áo Bà Ba hồng pastel phối quần lụa suông và nón lá vẽ hoa.',
    tags: ['Miệt Vườn Cottagecore', 'Áo Bà Ba', 'Nam Bộ', 'Thơ mộng'],
    garmentName: 'Áo Bà Ba Hồng Pastel',
    modernItems: ['Quần Lụa Suông Trắng', 'Nón Lá Vẽ Hoa', 'Túi Đan Sợi Tự Nhiên'],
    likes: 375,
    preset: {
      family: 'ao_ba_ba',
      robeColor: '#F472B6',
      collarColor: '#FBCFE8',
      innerColor: '#FBCFE8',
      bottomColor: '#FFFFFF',
      tradHead: 'non_la_ve_hoa',
      modFoot: 'guoc_moc_nhung',
      modEye: 'khan_ran_pastel',
      modBag: 'tui_dan_soi'
    }
  },
  {
    id: 'remix_5',
    title: 'Bộ 5: Tây Bắc Avant-Garde',
    author: 'Sơn Tùng (H’Mông Fashion)',
    avatar: 'ST',
    description: 'Hơi thở núi rừng Tây Bắc từ thổ cẩm H’Mông kết hợp phom dáng thời trang tương lai đầy mạnh mẽ. Áo lưng thổ cẩm phối chân váy xếp nếp chàm và bốt thổ cẩm.',
    tags: ['Tây Bắc Avant-Garde', 'Thổ Cẩm H’Mông', 'High Fashion', 'Sapa'],
    garmentName: 'Áo Lưng Thổ Cẩm H’Mông',
    modernItems: ['Chân Váy Xếp Nếp Chàm', 'Bốt Da Thêu Thổ Cẩm', 'Túi Đeo Chéo Thổ Cẩm'],
    likes: 542,
    preset: {
      family: 'ao_tho_cam',
      robeColor: '#1E1B4B',
      collarColor: '#DC2626',
      innerColor: '#DC2626',
      bottomColor: '#1E293B',
      tradHead: 'khan_bong_do_hmong',
      modFoot: 'bot_da_theu_tho_cam',
      modEye: 'kieng_bac_tay_bac',
      modBag: 'tui_tho_cam_theo_cheo'
    }
  },
  {
    id: 'remix_6',
    title: 'Bộ 6: Đại Việt Grunge',
    author: 'Nhật Minh (Darkwear Viet)',
    avatar: 'NM',
    description: 'Sự trầm mặc của Áo Giao Lĩnh cổ kính kết hợp cả tính bụi bặm, phá cách đầy bí ẩn. Áo Giao Lĩnh vạt chéo màu trầm phối váy dập ly và bốt chiến binh.',
    tags: ['Đại Việt Grunge', 'Áo Giao Lĩnh', 'Darkwear', 'Grunge'],
    garmentName: 'Áo Giao Lĩnh Vạt Chéo Tối Màu',
    modernItems: ['Váy Dập Ly Tối Màu', 'Bốt Chiến Binh Đen', 'Nón Lá Đen Huyền Bí'],
    likes: 610,
    preset: {
      family: 'ao_giao_linh',
      robeColor: '#451A03',
      collarColor: '#1C1917',
      innerColor: '#18181B',
      bottomColor: '#18181B',
      tradHead: 'non_la_den',
      modFoot: 'bot_chien_binh_den',
      modEye: 'ngoc_boi_co_eo',
      modBag: 'gang_tay_ho_ngon'
    }
  },
  {
    id: 'remix_7',
    title: 'Bộ 7: Sài Gòn Retro',
    author: 'Thanh Hà (Vintage Collector)',
    avatar: 'TH',
    description: 'Lưu giữ nét kiều diễm của áo dài Raglan Sài Gòn xưa hòa cùng làn gió casual hoài cổ của giới trẻ. Áo dài Raglan chấm bi sắc sỡ phối quần lụa trắng và băng đô.',
    tags: ['Sài Gòn Retro', 'Áo Dài Raglan', 'Vintage 1960s', 'Hoài cổ'],
    garmentName: 'Áo Dài Raglan Sắc Sỡ Chấm Bi',
    modernItems: ['Băng Đô Tóc Vintage', 'Kính Mát Retro Lớn', 'Giày Gót Thấp Vintage'],
    likes: 489,
    preset: {
      family: 'ao_dai',
      robeColor: '#0284C7',
      collarColor: '#F59E0B',
      innerColor: '#FAF9F5',
      bottomColor: '#FFFFFF',
      tradHead: 'bang_do_vintage',
      modFoot: 'giay_got_thap_vintage',
      modEye: 'kinh_mat_retro_lon',
      modBag: 'tui_xach_da_nho'
    }
  },
  {
    id: 'remix_8',
    title: 'Bộ 8: Tây Nguyên Warrior',
    author: 'Y Bham (Gia Lai Heritage)',
    avatar: 'YB',
    description: 'Sự can trường, phóng khoáng của đại ngàn qua dải thổ cẩm Tây Nguyên kết hợp tinh thần dã ngoại cá tính. Áo gilê thổ cẩm phối váy thổ cẩm quấn và bốt dã ngoại.',
    tags: ['Tây Nguyên Warrior', 'Thổ Cẩm Tây Nguyên', 'Warrior', 'Dã ngoại'],
    garmentName: 'Áo Gilê Thổ Cẩm Tây Nguyên',
    modernItems: ['Váy Thổ Cẩm Quấn', 'Bốt Dã Ngoại Hầm Hố', 'Gùi Tre Đan Nhỏ'],
    likes: 520,
    preset: {
      family: 'ao_tho_cam',
      robeColor: '#18181B',
      collarColor: '#B91C1C',
      innerColor: '#18181B',
      bottomColor: '#7F1D1D',
      tradHead: 'khan_buoc_dau_tay_nguyen',
      modFoot: 'bot_da_ngoai_ham_ho',
      modEye: 'dai_lung_chien_binh',
      modBag: 'gui_tre_dan'
    }
  },
  {
    id: 'remix_9',
    title: 'Bộ 9: Huế Thơ Mộng',
    author: 'Hương Giang (Cố Đô Love)',
    avatar: 'HG',
    description: 'Khơi lại chất thơ kín đáo của tà áo tím cố đô Huế, phối hòa ngọt ngào đầy hoài niệm lãng mạn. Áo Dài tím Huế phối quần lụa tím nhạt, nón bài thơ và giỏ tre mây.',
    tags: ['Huế Thơ Mộng', 'Áo Dài Tím', 'Nón Bài Thơ', 'Cố Đô'],
    garmentName: 'Áo Dài Tím Huế Thơ Mộng',
    modernItems: ['Nón Bài Thơ Xứ Huế', 'Vòng Cổ Hạt Bích', 'Giỏ Tre Mây Cầm Tay'],
    likes: 712,
    preset: {
      family: 'ao_dai',
      robeColor: '#7E22CE',
      collarColor: '#A855F7',
      innerColor: '#E9D5FF',
      bottomColor: '#E9D5FF',
      tradHead: 'non_bai_tho_hue',
      modFoot: 'giay_nhung_truyen_thong',
      modEye: 'vong_co_hat_bich',
      modBag: 'gio_tre_may'
    }
  },
  {
    id: 'remix_10',
    title: 'Bộ 10: Phố Hiến Hypebeast',
    author: 'Đức Anh (Streetwear Club)',
    avatar: 'DA',
    description: 'Khắc họa hình ảnh nam giới Gen Z đĩnh đạc nhưng phóng khoáng, biến áo ngũ thân thành item đường phố cực ngầu. Áo Bomber khoác ngoài áo ngũ thân gấm phối quần jogger.',
    tags: ['Phố Hiến Hypebeast', 'Áo Ngũ Thân Gấm', 'Bomber Jacket', 'Hypebeast'],
    garmentName: 'Áo Ngũ Thân Gấm Khoác Bomber',
    modernItems: ['Quần Cargo Jogger Rêu', 'Sneaker Cổ Cao Hypebeast', 'Khăn Xếp Đính Huy Hiệu'],
    likes: 645,
    preset: {
      family: 'ao_ngu_than_chen',
      robeColor: '#18181B',
      collarColor: '#27272A',
      innerColor: '#27272A',
      bottomColor: '#365314',
      tradHead: 'khan_xep_dinh_huy_hieu',
      modFoot: 'sneaker_co_cao',
      modEye: 'ngoc_boi_kinh_ram',
      modBag: 'canvas_tote'
    }
  },
  {
    id: 'remix_11',
    title: 'Bộ 11: Ninh Thuận Sunsets',
    author: 'Pi Năng (Champa Culture)',
    avatar: 'PN',
    description: 'Tôn vinh nghệ thuật dệt thổ cẩm trứ danh và sự uyển chuyển của văn hóa Chăm qua ngôn ngữ tự do miền nhiệt đới. Áo Chăm cam phối váy maxi Indigo và khăn Mblao.',
    tags: ['Ninh Thuận Sunsets', 'Áo Chăm Cổ Truyền', 'Thổ Cẩm Chăm', 'Nhiệt đới'],
    garmentName: 'Áo Cổ Truyền Dân Tộc Chăm',
    modernItems: ['Váy Maxi Indigo Xếp Tầng', 'Sandal Quai Bện Dây', 'Khăn Trùm Mblao'],
    likes: 498,
    preset: {
      family: 'ao_cham',
      robeColor: '#EA580C',
      collarColor: '#F97316',
      innerColor: '#F97316',
      bottomColor: '#1D4ED8',
      tradHead: 'khan_trum_mblao',
      modFoot: 'sandal_quai_ben',
      modEye: 'khuyen_tai_thap_cham',
      modBag: 'tui_may_ban_nguyet'
    }
  },
  {
    id: 'remix_12',
    title: 'Bộ 12: Đông Bắc Utility',
    author: 'Lê Hoàng (Trekking Viet)',
    avatar: 'LH',
    description: 'Sức sống hoang dã của trang phục chàm Tây Bắc - Đông Bắc kết hợp tinh thần năng động, phượt thủ hiện đại. Áo vest túi hộp phối quần jogger chàm và bốt phượt.',
    tags: ['Đông Bắc Utility', 'Chàm Tây Bắc', 'Phượt Thủ', 'Utility'],
    garmentName: 'Áo Chàm Vest Túi Hộp Phượt',
    modernItems: ['Quần Jogger Chàm', 'Bốt Phượt Cổ Cao', 'Kiềng & Xà Tích Bạc'],
    likes: 563,
    preset: {
      family: 'ao_ngu_than_chen',
      robeColor: '#1E3A8A',
      collarColor: '#3F6212',
      innerColor: '#1E293B',
      bottomColor: '#1E293B',
      tradHead: 'khan_van_cham',
      modFoot: 'bot_phuot_co_cao',
      modEye: 'kieng_xa_tich_bac',
      modBag: 'canvas_tote'
    }
  },
  {
    id: 'remix_13',
    title: 'Bộ 13: Quan Họ Indie',
    author: 'Trần Vũ (Indie Artist)',
    avatar: 'TV',
    description: 'Biến tấu từ áo mớ ba mớ bảy nhiều lớp màu sắc vùng Kinh Bắc, mang đậm chất lãng mạn, phóng khoáng của nghệ sĩ tự do. Áo mớ ba mớ bảy phối váy xòe và bốt da lộn.',
    tags: ['Quan Họ Indie', 'Áo Mớ Ba Mớ Bảy', 'Kinh Bắc', 'Indie Artist'],
    garmentName: 'Áo Mớ Ba Mớ Bảy Cách Tân',
    modernItems: ['Váy Xòe Nhiều Tầng', 'Bốt Da Lộn Cổ Ngắn', 'Nón Quai Thao Dệt Mini'],
    likes: 588,
    preset: {
      family: 'ao_tu_than',
      robeColor: '#EC4899',
      collarColor: '#10B981',
      innerColor: '#DC2626',
      bottomColor: '#1E293B',
      tradHead: 'non_quai_thao_mini',
      modFoot: 'bot_da_lon_co_ngan',
      modEye: 'tui_gam_theu_hoa',
      modBag: 'tui_gam_theu_hoa'
    }
  },
  {
    id: 'remix_14',
    title: 'Bộ 14: Công Tử Retro',
    author: 'Gia Huy (Nam Bộ Dandy)',
    avatar: 'GH',
    description: 'Gợi nét lãng tử, hào hoa của công tử Nam Bộ xưa thông qua sự kết hợp lịch lãm, hiện đại của phong cách dandy. Áo gấm ngũ thân khoác Blazer phối quần tây kem và mũ phớt.',
    tags: ['Công Tử Retro', 'Nam Bộ Dandy', 'Áo Gấm Ngũ Thân', 'Blazer'],
    garmentName: 'Áo Gấm Ngũ Thân Khoác Blazer',
    modernItems: ['Quần Tây Suông Màu Kem', 'Giày Da Derby Dandy', 'Mũ Phớt Dệt Cổ Điển'],
    likes: 672,
    preset: {
      family: 'ao_ngu_than_chen',
      robeColor: '#854D0E',
      collarColor: '#27272A',
      innerColor: '#FEF3C7',
      bottomColor: '#FEF3C7',
      tradHead: 'mu_phot_dandy',
      modFoot: 'giay_da_derby',
      modEye: 'khan_ran_tui_da',
      modBag: 'khan_ran_tui_da'
    }
  },
  {
    id: 'remix_15',
    title: 'Bộ 15: Tây Bắc Punk-Rock',
    author: 'Văn Khoa (Rock Viet Club)',
    avatar: 'VK',
    description: 'Sự kết hợp nổi loạn giữa văn hóa Dao Đỏ (Tây Bắc) và phong cách Punk Rock mạnh mẽ, khẳng định cá tính tự do. Áo Dao Đỏ đính bông khoác Jacket da đính tán phối bốt xích.',
    tags: ['Tây Bắc Punk-Rock', 'Dao Đỏ', 'Punk Rock', 'High Fashion'],
    garmentName: 'Áo Dao Đỏ Khoác Jacket Da',
    modernItems: ['Chân Váy Xòe & Xà Cạp', 'Bốt Đen Cao Cổ Có Xích', 'Khăn Dao Đỏ Rực Rỡ'],
    likes: 730,
    preset: {
      family: 'ao_tho_cam',
      robeColor: '#18181B',
      collarColor: '#DC2626',
      innerColor: '#DC2626',
      bottomColor: '#1E293B',
      tradHead: 'khan_dao_do',
      modFoot: 'bot_den_co_xich',
      modEye: 'trang_suc_bac_punk',
      modBag: 'trang_suc_bac_punk'
    }
  }
];

export const LOOKBOOK_ENVIRONMENTS = [
  {
    id: 'hoi_an',
    name: 'Phố Cổ Hội An',
    subtitle: 'Đèn lồng hoa đăng & Tường vàng rêu phong',
    atmosphere: 'Hoài niệm, ấm áp, lãng mạn',
    bgGradient: 'from-amber-900/40 via-yellow-950/30 to-stone-900',
    colorTone: '#F59E0B'
  },
  {
    id: 'khue_van_cac',
    name: 'Văn Miếu - Khuê Văn Các',
    subtitle: 'Gác sao Khuê nghìn năm văn hiến Kinh kỳ',
    atmosphere: 'Trang nghiêm, học thức, thanh nhã',
    bgGradient: 'from-red-950/40 via-stone-900/50 to-stone-950',
    colorTone: '#DC2626'
  },
  {
    id: 'ngo_mon_hue',
    name: 'Cố Đô Huế - Ngọ Môn',
    subtitle: 'Đá hoa cung đình & Lầu Ngũ Phụng uy nghi',
    atmosphere: 'Hoàng gia, cổ kính, trầm mặc',
    bgGradient: 'from-purple-950/40 via-indigo-950/30 to-stone-950',
    colorTone: '#7C3AED'
  },
  {
    id: 'dinh_lang_bac_bo',
    name: 'Sân Đình Làng Bắc Bộ',
    subtitle: 'Mái đình cong vút, giếng nước gốc đa',
    atmosphere: 'Dân gian thuần hậu, mộc mạc, yên bình',
    bgGradient: 'from-emerald-950/40 via-stone-900/40 to-stone-950',
    colorTone: '#059669'
  },
  {
    id: 'indochine_cafe',
    name: 'Quán Cà Phê Indochine Sài Gòn',
    subtitle: 'Gạch bông men cổ điển & Ánh đèn đương đại',
    atmosphere: 'Gen Z thời thượng, giao thoa Đông - Tây',
    bgGradient: 'from-teal-950/40 via-stone-900/50 to-stone-950',
    colorTone: '#0D9488'
  }
];

export const CURATED_FABRICS: ExtractedAsset[] = [
  {
    id: 'fabric_van_phuc',
    name: 'Lụa Vạn Phúc Hà Đông (Hoa Cúc Chữ Vạn)',
    sourceType: 'curated',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><defs><linearGradient id="silk-gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2378350F"/><stop offset="50%" stop-color="%23B45309"/><stop offset="100%" stop-color="%2378350F"/></linearGradient><pattern id="van-phuc-cuc" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none" stroke="%23D97706" stroke-width="0.3" stroke-dasharray="1 1"/><path d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z" fill="%23F59E0B" opacity="0.85"/><circle cx="10" cy="10" r="2.5" fill="%23FEF08A"/><path d="M0 0 L4 0 L4 4 M20 0 L16 0 L16 4 M20 20 L16 20 L16 16 M0 20 L4 20 L4 16" stroke="%23FEF08A" stroke-width="0.5" fill="none" opacity="0.6"/></pattern></defs><rect width="100" height="100" fill="url(%23silk-gold)"/><rect width="100" height="100" fill="url(%23van-phuc-cuc)"/><rect width="100" height="100" fill="%23FEF08A" opacity="0.08"/></svg>',
    dominantColors: ['#B45309', '#F59E0B', '#FEF08A'],
    fiveElement: 'Thổ',
    detectedPattern: 'Hoa cúc vạn thọ & mạng chữ Vạn dệt chìm lụa tơ tằm',
    category: 'fabric',
    createdAt: '2026-03-01'
  },
  {
    id: 'fabric_gam_tien_vua',
    name: 'Gấm Cung Đình Huế (Thủy Ba Ngũ Sắc)',
    sourceType: 'curated',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><defs><linearGradient id="royal-bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230F172A"/><stop offset="100%" stop-color="%231E3A8A"/></linearGradient></defs><rect width="100" height="100" fill="url(%23royal-bg)"/><path d="M 0,100 L 10,75 L 20,100 L 30,70 L 40,100 L 50,65 L 60,100 L 70,70 L 80,100 L 90,75 L 100,100 Z" fill="%23D97706" opacity="0.9"/><path d="M 0,100 L 12,82 L 25,100 L 37,78 L 50,100 L 62,78 L 75,100 L 88,82 L 100,100 Z" fill="%230D9488" opacity="0.85"/><path d="M 0,100 L 15,88 L 30,100 L 45,85 L 60,100 L 75,85 L 90,100 L 100,92 L 100,100 Z" fill="%23DC2626" opacity="0.8"/><circle cx="25" cy="30" r="10" fill="none" stroke="%23F59E0B" stroke-width="1.2"/><path d="M25 20 C20 15 30 15 25 20 M25 40 C20 45 30 45 25 40" stroke="%23F59E0B" stroke-width="1.2" fill="none"/><circle cx="75" cy="35" r="12" fill="none" stroke="%2338BDF8" stroke-width="1.2"/><path d="M63 35 C68 25 82 25 87 35 C82 45 68 45 63 35 Z" fill="%2338BDF8" opacity="0.3"/></svg>',
    dominantColors: ['#1E3A8A', '#0D9488', '#D97706'],
    fiveElement: 'Thủy',
    detectedPattern: 'Tam sơn sóng nước Thủy Ba 3 lớp & Vân mây Ngũ sắc triều Nguyễn',
    category: 'fabric',
    createdAt: '2026-03-05'
  },
  {
    id: 'fabric_tho_cam',
    name: 'Thổ Cẩm H’Mông (Vẽ Sáp Ong Kỷ Hà)',
    sourceType: 'curated',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><defs><pattern id="hmong-ky-ha" width="25" height="25" patternUnits="userSpaceOnUse"><rect width="25" height="25" fill="%231E1B4B"/><polygon points="12.5,2 23,12.5 12.5(23) 2,12.5" fill="none" stroke="%23F59E0B" stroke-width="1"/><polygon points="12.5,6 19,12.5 12.5,19 6,12.5" fill="%23DC2626" opacity="0.7"/><path d="M12.5 0 L12.5 25 M0 12.5 L25 12.5" stroke="%23E2E8F0" stroke-width="0.6" stroke-dasharray="2 1"/><circle cx="12.5" cy="12.5" r="2" fill="%23FEF08A"/></pattern></defs><rect width="100" height="100" fill="%231E1B4B"/><rect width="100" height="100" fill="url(%23hmong-ky-ha)"/><rect x="0" y="0" width="100" height="6" fill="%23DC2626"/><rect x="0" y="94" width="100" height="6" fill="%23DC2626"/></svg>',
    dominantColors: ['#1E1B4B', '#DC2626', '#F59E0B'],
    fiveElement: 'Thổ',
    detectedPattern: 'Họa tiết kỷ hà hình thoi kép, tam giác & chữ thập dệt sáp ong chàm',
    category: 'motif',
    createdAt: '2026-03-10'
  }
];

export const CULTURAL_BADGES: CulturalBadge[] = [
  {
    id: 'badge_1',
    title: 'Tập Sự Cổ Phục',
    subtitle: 'Nhập môn di sản',
    description: 'Khám phá thư viện điển tích và hoàn thành bộ phối Việt phục đầu tiên.',
    category: 'knowledge',
    unlocked: true,
    unlockedAt: '2026-04-01',
    requiredPoints: 50,
    iconName: 'Sparkles'
  },
  {
    id: 'badge_2',
    title: 'Hộ Pháp Hữu Nhiệm',
    subtitle: 'Chuẩn mực vạt áo',
    description: 'Vượt qua bài kiểm tra vạt áo và luôn giữ đúng quy tắc cài khuy Hữu nhiệm.',
    category: 'accuracy',
    unlocked: true,
    unlockedAt: '2026-04-02',
    requiredPoints: 100,
    iconName: 'ShieldCheck'
  },
  {
    id: 'badge_3',
    title: 'Nghệ Nhân Ngũ Thân',
    subtitle: 'Chấn hưng y phục',
    description: 'Nắm vững 5 đạo ngũ thường trên áo tay chẽn và phối thành công 3 kiểu dáng.',
    category: 'creativity',
    unlocked: false,
    requiredPoints: 200,
    iconName: 'Award'
  },
  {
    id: 'badge_4',
    title: 'Bậc Thầy Remix Gen Z',
    subtitle: 'Giao thoa đương đại',
    description: 'Phối đồ đạt chỉ số Hài hòa Ngũ Hành trên 90% kết hợp phụ kiện đường phố.',
    category: 'remix',
    unlocked: false,
    requiredPoints: 350,
    iconName: 'Wand2'
  },
  {
    id: 'badge_5',
    title: 'Hậu Duệ Nhật Bình',
    subtitle: 'Tuyệt tác triều đình',
    description: 'Hiểu rõ nguồn gốc áo Nhật Bình và tạo Lookbook xuất sắc tại Cố đô Huế.',
    category: 'knowledge',
    unlocked: false,
    requiredPoints: 500,
    iconName: 'Crown'
  }
];

export const CULTURAL_QUIZ = [
  {
    id: 'q1',
    question: 'Theo quy chuẩn cổ truyền Đại Việt và thời Nguyễn, hướng cài vạt áo đúng là gì?',
    options: [
      { text: 'Hữu nhiệm: Vạt phải đè lên vạt trái (vạt cài sang nách trái)', correct: true },
      { text: 'Tả nhiệm: Vạt trái đè lên vạt phải (vạt cài sang nách phải)', correct: false },
      { text: 'Hai vạt cài thẳng giữa ngực giống áo vest', correct: false },
      { text: 'Tùy theo người thuận tay trái hay tay phải', correct: false }
    ],
    explanation: 'Chuẩn mực người Việt cổ là "Hữu nhiệm" (vạt phải đè lên vạt trái). Kiểu "Tả nhiệm" người xưa chỉ dùng cho người đã khuất hoặc người ngoại tộc phương Bắc thuở xưa.'
  },
  {
    id: 'q2',
    question: 'Năm chiếc cúc trên Áo Ngũ Thân đại diện cho đạo lý Nho gia nào?',
    options: [
      { text: 'Ngũ Hành: Kim - Mộc - Thủy - Hỏa - Thổ', correct: false },
      { text: 'Ngũ Thường: Nhân - Lễ - Nghĩa - Trí - Tín', correct: true },
      { text: 'Ngũ Phúc: Phú - Quý - Thọ - Khang - Ninh', correct: false },
      { text: 'Ngũ Quan trên gương mặt con người', correct: false }
    ],
    explanation: '5 cúc áo ngũ thân tượng trưng cho Đạo Ngũ Thường: Nhân, Lễ, Nghĩa, Trí, Tín - nhắc nhở người mặc luôn giữ gìn tư cách đạo đức làm người.'
  },
  {
    id: 'q3',
    question: 'Điểm khác biệt nhận diện rõ nhất giữa Áo Tấc và Áo Ngũ Thân Tay Chẽn là gì?',
    options: [
      { text: 'Áo Tấc ngắn hơn áo tay chẽn', correct: false },
      { text: 'Áo Tấc có tay áo thụng rộng 40-50cm, trong khi tay chẽn may ôm sát cổ tay', correct: true },
      { text: 'Áo Tấc không có cổ đứng', correct: false },
      { text: 'Áo Tấc chỉ dành riêng cho nam giới', correct: false }
    ],
    explanation: 'Áo Tấc là lễ phục có ống tay thụng rộng rãi trang nhã (rộng khoảng 40-50cm), khi đứng chắp tay lại rất uy nghiêm. Áo Tay Chẽn may gọn ở cổ tay để tiện sinh hoạt.'
  },
  {
    id: 'q4',
    question: 'Tại sao cổ áo "Áo Nhật Bình" lại có tên gọi là Nhật Bình?',
    options: [
      { text: 'Vì áo chỉ được mặc vào ban ngày khi có ánh mặt trời', correct: false },
      { text: 'Vì dải cổ áo to bản khi khép lại trước ngực tạo thành hình chữ nhật', correct: true },
      { text: 'Vì nguồn gốc áo xuất phát từ Nhật Bản', correct: false },
      { text: 'Vì trên áo thêu hình chiếc bình trà thời Nguyễn', correct: false }
    ],
    explanation: 'Áo có tên gọi Nhật Bình vì dải viền cổ áo to bản kéo dài xuống ngực, khi hai vạt khép lại đối xứng tạo thành một hình chữ nhật phẳng phiu ngay ngắn trước ngực.'
  }
];

export const INITIAL_MANNEQUIN: MannequinSettings = {
  bodyProportion: 'balanced',
  skinTone: '#F5D0B5', // Da sáng tự nhiên
  genderPresentation: 'female',
  heightScale: 1.0
};

export const DEFAULT_DYNAMIC_LAYERS: DynamicLayerItem[] = [
  {
    id: 'layer_inner',
    category: 'inner',
    name: 'Yếm Đào Lụa',
    type: 'yem_dao',
    visible: true,
    locked: false,
    color: '#DC2626',
    aiCollarMasking: true
  },
  {
    id: 'layer_bottom',
    category: 'bottom',
    name: 'Quần Lĩnh Đen',
    type: 'trousers',
    visible: true,
    locked: false,
    color: '#0F172A'
  },
  {
    id: 'layer_outer',
    category: 'outer',
    name: 'Áo Tấc (Ngũ Thân Tay Thụng)',
    family: 'ao_tac',
    visible: true,
    locked: false,
    color: '#1E3A8A',
    collarColor: '#FAF9F5',
    trimColor: '#D97706',
    patternType: 'thuy_ba',
    lapelDirection: 'right_over_left',
    aiCollarMasking: true
  },
  {
    id: 'layer_headwear',
    category: 'trad_accessory',
    name: 'Khăn Vấn Nhung Đen',
    type: 'khan_van_den',
    visible: true,
    locked: false,
    color: '#0F172A',
    transform: { x: 0, y: 0, scale: 1, rotation: 0 }
  },
  {
    id: 'layer_jewelry',
    category: 'trad_accessory',
    name: 'Chuỗi Hạt Ngọc Bích',
    type: 'chuoi_ngoc_bich',
    visible: true,
    locked: false,
    color: '#059669',
    transform: { x: 0, y: 0, scale: 1, rotation: 0 }
  },
  {
    id: 'layer_footwear',
    category: 'modern_accessory',
    name: 'Chunky Sneakers Trắng',
    type: 'chunky_sneakers',
    visible: true,
    locked: false,
    color: '#FFFFFF'
  },
  {
    id: 'layer_eyewear',
    category: 'modern_accessory',
    name: 'Kính Râm Oval',
    type: 'kinh_ram_retro',
    visible: true,
    locked: false,
    transform: { x: 0, y: 0, scale: 1, rotation: 0 }
  },
  {
    id: 'layer_bag',
    category: 'modern_accessory',
    name: 'Túi Canvas Tote',
    type: 'canvas_tote',
    visible: true,
    locked: false,
    transform: { x: 0, y: 0, scale: 1, rotation: 0 }
  }
];

export const INITIAL_LAYER_STATE: GarmentLayerState = {
  layer1_inner: {
    id: 'yem_dao',
    name: 'Yếm Đào Lụa',
    color: '#DC2626',
    visible: true
  },
  layer2_bottom: {
    id: 'quan_linh_den',
    name: 'Quần Lĩnh Đen',
    color: '#0F172A',
    type: 'trousers'
  },
  layer3_outer: {
    id: 'ao_tac',
    name: 'Áo Tấc (Ngũ Thân Tay Thụng)',
    family: 'ao_tac',
    robeColor: '#1E3A8A',
    collarColor: '#FAF9F5',
    trimColor: '#D97706',
    patternType: 'thuy_ba',
    lapelDirection: 'right_over_left' // Hữu nhiệm chuẩn
  },
  layer4_tradAccessory: {
    headwearId: 'khan_van_den',
    headwearName: 'Khăn Vấn Nhung Đen',
    headwearColor: '#0F172A',
    jewelryId: 'chuoi_ngoc_bich',
    jewelryName: 'Chuỗi Hạt Ngọc Bích'
  },
  layer5_modernAccessory: {
    footwearId: 'chunky_sneakers',
    footwearName: 'Chunky Sneakers Trắng',
    eyewearId: 'kinh_ram_retro',
    eyewearName: 'Kính Râm Oval',
    bagId: 'canvas_tote',
    bagName: 'Túi Canvas Tote'
  },
  dynamicLayers: DEFAULT_DYNAMIC_LAYERS,
  enableAiFusion: true
};
