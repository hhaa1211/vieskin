import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { CulturalDiscoveryScreen } from './components/screens/CulturalDiscoveryScreen';
import { MixMatchStudioScreen } from './components/screens/MixMatchStudioScreen';
import { LookbookArchiveScreen } from './components/screens/LookbookArchiveScreen';
import { ProfileCulturalHubScreen } from './components/screens/ProfileCulturalHubScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineBanner } from './components/common/OfflineBanner';
import { OnboardingGuide } from './components/common/OnboardingGuide';
import { 
  INITIAL_LAYER_STATE, 
  INITIAL_MANNEQUIN, 
  GARMENTS_LORE, 
  CURATED_FABRICS 
} from './data/culturalData';
import { 
  GarmentLayerState, 
  GarmentFamily, 
  SavedOutfit, 
  ExtractedAsset 
} from './types';
import { 
  loadDraftLocally, 
  saveDraftLocally, 
  loadOutfitsLocally, 
  saveOutfitsLocally, 
  loadPointsLocally, 
  savePointsLocally 
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('discovery');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vpr_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [heritagePoints, setHeritagePoints] = useState<number>(() => loadPointsLocally(150));

  const [currentLayers, setCurrentLayers] = useState<GarmentLayerState>(() => {
    const draft = loadDraftLocally();
    return draft ? draft.layers : INITIAL_LAYER_STATE;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('vpr_dark_mode', String(isDarkMode));
    } catch {
      // Ignore
    }
  }, [isDarkMode]);

  const [extractedAssets, setExtractedAssets] = useState<ExtractedAsset[]>(CURATED_FABRICS);

  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(() => {
    const initialDefaultOutfits: SavedOutfit[] = [
      {
        id: 'outfit_init_1',
        title: 'Bộ 1: Kinh Bắc Cyber Y2K',
        concept: 'Giao thoa nét duyên dáng Kinh Bắc với năng động, phá cách thế hệ mới. Áo tứ thân pastel kết hợp áo yếm đỏ và nón quai thao hologram.',
        createdAt: '08/10/2026',
        occasion: 'streetwear_cafe',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer1_inner: { id: 'yem_do', name: 'Áo Yếm Đỏ', color: '#DC2626', visible: true },
          layer2_bottom: { id: 'quan_suong_y2k', name: 'Quần Suông Y2K', color: '#1E293B', type: 'trousers' },
          layer3_outer: { id: 'ao_tu_than_pastel', name: 'Áo Tứ Thân Pastel', family: 'ao_tu_than', robeColor: '#FDE047', collarColor: '#DC2626', trimColor: '#EC4899', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'non_quai_thao_hologram', headwearName: 'Nón Quai Thao Hologram', headwearColor: '#E0E7FF' },
          layer5_modernAccessory: { footwearId: 'guoc_moc_de_day', footwearName: 'Guốc Mộc Đế Dày Y2K' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Hỏa', score: 96, explanation: 'Hỏa sinh Thổ - Đỏ son thắm kết hợp sắc vàng chanh Y2K rực rỡ.' },
        etiquetteScore: 100,
        likesCount: 142
      },
      {
        id: 'outfit_init_2',
        title: 'Bộ 2: Tràng An Academia',
        concept: 'Nét nho nhã, tri thức của áo ngũ thân cổ điển kết hợp thời trang học đường. Áo ngũ thân tweed phối quần tây xếp ly đen.',
        createdAt: '08/10/2026',
        occasion: 'yearbook_graduation',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'quan_tay_xep_ly_den', name: 'Quần Tây Xếp Ly Đen', color: '#0F172A', type: 'trousers' },
          layer3_outer: { id: 'ao_ngu_than_tweed', name: 'Áo Ngũ Thân Tweed', family: 'ao_ngu_than_chen', robeColor: '#64748B', collarColor: '#334155', trimColor: '#0F172A', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'khan_xep_nhung_xanh', headwearName: 'Khăn Xếp Nhung Xanh', headwearColor: '#085F63', jewelryId: 'tram_hoa_mai_bac', jewelryName: 'Trâm Hoa Mai Bạc' },
          layer5_modernAccessory: { footwearId: 'giay_loafer_banh_mi', footwearName: 'Giày Loafer Bánh Mì', bagId: 'tui_vai_hang_trong', bagName: 'Túi Vải Hàng Trống' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Kim', score: 98, explanation: 'Kim sinh Thủy - Màu xám tweed phối sắc nhung xanh thanh lịch.' },
        etiquetteScore: 100,
        likesCount: 198
      },
      {
        id: 'outfit_init_3',
        title: 'Bộ 3: Cung Đình Techwear',
        concept: 'Biến tấu áo Nhật Bình uy nghiêm thành trang phục đường phố hiện đại, mạnh mẽ. Áo Nhật Bình vải dù phối váy cargo túi hộp.',
        createdAt: '08/10/2026',
        occasion: 'gala_formal',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'vay_cargo_tui_hop', name: 'Váy Cargo Túi Hộp', color: '#4B5563', type: 'skirt' },
          layer3_outer: { id: 'ao_nhat_binh_vai_du', name: 'Áo Nhật Bình Vải Dù', family: 'ao_nhat_binh', robeColor: '#27272A', collarColor: '#52525B', trimColor: '#0D9488', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'mu_bucket_techwear', headwearName: 'Mũ Bucket Techwear', headwearColor: '#1E293B', jewelryId: 'quat_hoang_gia_kieng_xich', jewelryName: 'Quạt Hoàng Gia & Kiềng Xích' },
          layer5_modernAccessory: { footwearId: 'sneaker_chunky_black', footwearName: 'Sneaker Chunky Black' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Thủy', score: 92, explanation: 'Thủy sinh Mộc - Sắc đen huyền bí kết hợp dải ngũ sắc Cung đình.' },
        etiquetteScore: 95,
        likesCount: 230
      },
      {
        id: 'outfit_init_4',
        title: 'Bộ 4: Miệt Vườn Cottagecore',
        concept: 'Mang vẻ giản dị ấm áp của Áo Bà Ba Nam Bộ lồng ghép nét trong trẻo, yêu thiên nhiên thơ mộng.',
        createdAt: '08/10/2026',
        occasion: 'folk_festival',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'quan_lua_suong_trang', name: 'Quần Lụa Suông Trắng', color: '#FFFFFF', type: 'trousers' },
          layer3_outer: { id: 'ao_ba_ba_hong', name: 'Áo Bà Ba Hồng Pastel', family: 'ao_ba_ba', robeColor: '#F472B6', collarColor: '#FBCFE8', trimColor: '#EC4899', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'non_la_ve_hoa', headwearName: 'Nón Lá Vẽ Hoa', headwearColor: '#FEF08A' },
          layer5_modernAccessory: { footwearId: 'guoc_moc_nhung', footwearName: 'Guốc Mộc Quai Nhung', bagId: 'tui_dan_soi', bagName: 'Túi Đan Sợi Tự Nhiên' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Mộc', score: 95, explanation: 'Mộc sinh Hỏa - Áo hồng pastel rạng rỡ hòa quyện sắc nón lá mộc mạc.' },
        etiquetteScore: 100,
        likesCount: 185
      },
      {
        id: 'outfit_init_5',
        title: 'Bộ 5: Tây Bắc Avant-Garde',
        concept: 'Hơi thở núi rừng Tây Bắc từ thổ cẩm H’Mông kết hợp phom dáng thời trang tương lai đầy mạnh mẽ.',
        createdAt: '08/10/2026',
        occasion: 'streetwear_cafe',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'vay_xep_nep_cham', name: 'Chân Váy Xếp Nếp Chàm', color: '#1E293B', type: 'skirt' },
          layer3_outer: { id: 'ao_tho_cam_hmong', name: 'Áo Lưng Thổ Cẩm H’Mông', family: 'ao_tho_cam', robeColor: '#1E1B4B', collarColor: '#DC2626', trimColor: '#F59E0B', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'khan_bong_do_hmong', headwearName: 'Đầu Tóc Đính Bông H’Mông', headwearColor: '#DC2626', jewelryId: 'kieng_bac_tay_bac', jewelryName: 'Kiềng Bạc Tây Bắc' },
          layer5_modernAccessory: { footwearId: 'bot_da_theu_tho_cam', footwearName: 'Bốt Da Thêu Thổ Cẩm', bagId: 'tui_tho_cam_theo_cheo', bagName: 'Túi Thổ Cẩm Đeo Chéo' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Thổ', score: 94, explanation: 'Thổ sinh Kim - Sắc chàm núi rừng đính kiềng bạc nguyên khối.' },
        etiquetteScore: 98,
        likesCount: 260
      },
      {
        id: 'outfit_init_6',
        title: 'Bộ 6: Đại Việt Grunge',
        concept: 'Sự trầm mặc của Áo Giao Lĩnh cổ kính kết hợp cả tính bụi bặm, phá cách đầy bí ẩn.',
        createdAt: '08/10/2026',
        occasion: 'streetwear_cafe',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'vay_dap_ly_dark', name: 'Váy Dập Ly Tối Màu', color: '#18181B', type: 'skirt' },
          layer3_outer: { id: 'ao_giao_linh_dark', name: 'Áo Giao Lĩnh Vạt Chéo Tối Màu', family: 'ao_giao_linh', robeColor: '#451A03', collarColor: '#1C1917', trimColor: '#78350F', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'non_la_den', headwearName: 'Nón Lá Đen Huyền Bí', headwearColor: '#0F172A', jewelryId: 'ngoc_boi_co_eo', jewelryName: 'Ngọc Bội Cổ Đeo Eo' },
          layer5_modernAccessory: { footwearId: 'bot_chien_binh_den', footwearName: 'Bốt Chiến Binh Đen' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Thủy', score: 91, explanation: 'Thủy sinh Mộc - Tông màu nâu đen trầm mặc cổ phong.' },
        etiquetteScore: 96,
        likesCount: 215
      },
      {
        id: 'outfit_init_7',
        title: 'Bộ 7: Sài Gòn Retro',
        concept: 'Lưu giữ nét kiều diễm của áo dài Raglan Sài Gòn xưa hòa cùng làn gió casual hoài cổ của giới trẻ.',
        createdAt: '08/10/2026',
        occasion: 'lunar_new_year',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'quan_lua_trang_suong', name: 'Quần Lụa Trắng Suông', color: '#FFFFFF', type: 'trousers' },
          layer3_outer: { id: 'ao_dai_raglan_retro', name: 'Áo Dài Raglan Sắc Sỡ', family: 'ao_dai', robeColor: '#0284C7', collarColor: '#F59E0B', trimColor: '#E11D48', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'bang_do_vintage', headwearName: 'Băng Đô Tóc Vintage', headwearColor: '#0284C7' },
          layer5_modernAccessory: { footwearId: 'giay_got_thap_vintage', footwearName: 'Giày Gót Thấp Vintage', eyewearId: 'kinh_mat_retro_lon', eyewearName: 'Kính Mát Retro Lớn', bagId: 'tui_xach_da_nho', bagName: 'Túi Xách Tay Da Nhỏ' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Mộc', score: 97, explanation: 'Mộc sinh Hỏa - Sắc xanh biển rực rỡ thập niên 1960s.' },
        etiquetteScore: 100,
        likesCount: 290
      },
      {
        id: 'outfit_init_8',
        title: 'Bộ 8: Tây Nguyên Warrior',
        concept: 'Sự can trường, phóng khoáng của đại ngàn qua dải thổ cẩm Tây Nguyên kết hợp tinh thần dã ngoại cá tính.',
        createdAt: '08/10/2026',
        occasion: 'streetwear_cafe',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'vay_tho_cam_quan', name: 'Váy Thổ Cẩm Quấn', color: '#7F1D1D', type: 'skirt' },
          layer3_outer: { id: 'ao_gile_tho_cam', name: 'Áo Gilê Thổ Cẩm', family: 'ao_tho_cam', robeColor: '#18181B', collarColor: '#B91C1C', trimColor: '#D97706', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'khan_buoc_dau_tay_nguyen', headwearName: 'Khăn Buộc Đầu Tây Nguyên', headwearColor: '#991B1B' },
          layer5_modernAccessory: { footwearId: 'bot_da_ngoai_ham_ho', footwearName: 'Bốt Dã Ngoại Hầm Hố', bagId: 'gui_tre_dan', bagName: 'Gùi Tre Đan Nhỏ' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Hỏa', score: 93, explanation: 'Hỏa sinh Thổ - Sắc đỏ thổ cẩm Tây Nguyên hầm hố.' },
        etiquetteScore: 95,
        likesCount: 210
      },
      {
        id: 'outfit_init_9',
        title: 'Bộ 9: Huế Thơ Mộng',
        concept: 'Khơi lại chất thơ kín đáo của tà áo tím cố đô Huế, phối hòa ngọt ngào đầy hoài niệm lãng mạn.',
        createdAt: '08/10/2026',
        occasion: 'yearbook_graduation',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'quan_lua_tim_nhat', name: 'Quần Lụa Tím Nhạt', color: '#E9D5FF', type: 'trousers' },
          layer3_outer: { id: 'ao_dai_tim_hue', name: 'Áo Dài Tím Huế', family: 'ao_dai', robeColor: '#7E22CE', collarColor: '#A855F7', trimColor: '#581C87', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'non_bai_tho_hue', headwearName: 'Nón Bài Thơ Xứ Huế', headwearColor: '#FEF08A', jewelryId: 'vong_co_hat_bich', jewelryName: 'Vòng Cổ Hạt Bích' },
          layer5_modernAccessory: { footwearId: 'giay_nhung_truyen_thong', footwearName: 'Giày Nhung Truyền Thống', bagId: 'gio_tre_may', bagName: 'Giỏ Tre Mây Cầm Tay' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Thủy', score: 99, explanation: 'Thủy sinh Mộc - Tím hoàng gia Huế hòa quyện ngọc bích.' },
        etiquetteScore: 100,
        likesCount: 310
      },
      {
        id: 'outfit_init_10',
        title: 'Bộ 10: Phố Hiến Hypebeast',
        concept: 'Khắc họa hình ảnh nam giới Gen Z đĩnh đạc nhưng phóng khoáng, biến áo ngũ thân thành item đường phố cực ngầu.',
        createdAt: '08/10/2026',
        occasion: 'streetwear_cafe',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer1_inner: { id: 'ao_ngu_than_gam', name: 'Áo Ngũ Thân Gấm', color: '#27272A', visible: true },
          layer2_bottom: { id: 'quan_cargo_jogger', name: 'Quần Cargo Jogger', color: '#365314', type: 'trousers' },
          layer3_outer: { id: 'ao_bomber_den', name: 'Áo Bomber Đen Khoác Ngoài', family: 'ao_ngu_than_chen', robeColor: '#18181B', collarColor: '#27272A', trimColor: '#3F6212', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'khan_xep_dinh_huy_hieu', headwearName: 'Khăn Xếp Đính Huy Hiệu', headwearColor: '#1E293B', jewelryId: 'ngoc_boi_kinh_ram', jewelryName: 'Ngọc Bội & Kính Râm' },
          layer5_modernAccessory: { footwearId: 'sneaker_co_cao', footwearName: 'Sneaker Cổ Cao Hypebeast' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Kim', score: 92, explanation: 'Kim sinh Thủy - Tông màu rêu đen cá tính streetwear.' },
        etiquetteScore: 94,
        likesCount: 275
      },
      {
        id: 'outfit_init_11',
        title: 'Bộ 11: Ninh Thuận Sunsets',
        concept: 'Tôn vinh nghệ thuật dệt thổ cẩm trứ danh và sự uyển chuyển của văn hóa Chăm qua ngôn ngữ tự do miền nhiệt đới.',
        createdAt: '08/10/2026',
        occasion: 'folk_festival',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'vay_maxi_indigo', name: 'Váy Maxi Indigo Xếp Tầng', color: '#1D4ED8', type: 'skirt' },
          layer3_outer: { id: 'ao_cham_tho_cam', name: 'Áo Chăm Thổ Cẩm Cam', family: 'ao_cham', robeColor: '#EA580C', collarColor: '#F97316', trimColor: '#D97706', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'khan_trum_mblao', headwearName: 'Khăn Trùm Mblao Chăm', headwearColor: '#1E3A8A', jewelryId: 'khuyen_tai_thap_cham', jewelryName: 'Khuyên Tai Tháp Chàm' },
          layer5_modernAccessory: { footwearId: 'sandal_quai_ben', footwearName: 'Sandal Quai Bện Dây', bagId: 'tui_may_ban_nguyet', bagName: 'Túi Mây Bán Nguyệt' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Hỏa', score: 96, explanation: 'Hỏa sinh Thổ - Sắc cam đền tháp Chăm phối váy Indigo.' },
        etiquetteScore: 100,
        likesCount: 220
      },
      {
        id: 'outfit_init_12',
        title: 'Bộ 12: Đông Bắc Utility',
        concept: 'Sức sống hoang dã của trang phục chàm Tây Bắc - Đông Bắc kết hợp tinh thần năng động, phượt thủ hiện đại.',
        createdAt: '08/10/2026',
        occasion: 'streetwear_cafe',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'quan_jogger_cham', name: 'Quần Jogger Chàm', color: '#1E293B', type: 'trousers' },
          layer3_outer: { id: 'ao_vest_phuot', name: 'Áo Vest Túi Hộp Phượt', family: 'ao_ngu_than_chen', robeColor: '#1E3A8A', collarColor: '#3F6212', trimColor: '#1E293B', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'khan_van_cham', headwearName: 'Khăn Vấn Chàm', headwearColor: '#1E3A8A', jewelryId: 'kieng_xa_tich_bac', jewelryName: 'Kiềng & Xà Tích Bạc' },
          layer5_modernAccessory: { footwearId: 'bot_phuot_co_cao', footwearName: 'Bốt Phượt Cổ Cao' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Thủy', score: 94, explanation: 'Thủy sinh Mộc - Sắc chàm rừng núi phối trang bị utility.' },
        etiquetteScore: 97,
        likesCount: 245
      },
      {
        id: 'outfit_init_13',
        title: 'Bộ 13: Quan Họ Indie',
        concept: 'Biến tấu từ áo mớ ba mớ bảy nhiều lớp màu sắc vùng Kinh Bắc, mang đậm chất lãng mạn, phóng khoáng của nghệ sĩ tự do.',
        createdAt: '08/10/2026',
        occasion: 'folk_festival',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'vay_xoe_nhieu_tang', name: 'Váy Xòe Nhiều Tầng', color: '#1E293B', type: 'skirt' },
          layer3_outer: { id: 'ao_mo_ba_mo_bay', name: 'Áo Mớ Ba Mớ Bảy Cách Tân', family: 'ao_tu_than', robeColor: '#EC4899', collarColor: '#10B981', trimColor: '#F59E0B', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'non_quai_thao_mini', headwearName: 'Nón Quai Thao Dệt Mini', headwearColor: '#78350F' },
          layer5_modernAccessory: { footwearId: 'bot_da_lon_co_ngan', footwearName: 'Bốt Da Lộn Cổ Ngắn', bagId: 'tui_gam_theu_hoa', bagName: 'Túi Gấm Thêu Hoa' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Mộc', score: 95, explanation: 'Mộc sinh Hỏa - Nhiều dải màu mớ ba mớ bảy rực rỡ.' },
        etiquetteScore: 100,
        likesCount: 280
      },
      {
        id: 'outfit_init_14',
        title: 'Bộ 14: Công Tử Retro',
        concept: 'Gợi nét lãng tử, hào hoa của công tử Nam Bộ xưa thông qua sự kết hợp lịch lãm, hiện đại của phong cách dandy.',
        createdAt: '08/10/2026',
        occasion: 'gala_formal',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'quan_tay_suong_kem', name: 'Quần Tây Suông Màu Kem', color: '#FEF3C7', type: 'trousers' },
          layer3_outer: { id: 'ao_gamlazer_dandy', name: 'Áo Gấm Ngũ Thân Khoác Blazer', family: 'ao_ngu_than_chen', robeColor: '#854D0E', collarColor: '#27272A', trimColor: '#FEF3C7', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'mu_phot_dandy', headwearName: 'Mũ Phớt Dệt Cổ Điển', headwearColor: '#57534E' },
          layer5_modernAccessory: { footwearId: 'giay_da_derby', footwearName: 'Giày Da Derby Dandy', bagId: 'khan_ran_tui_da', bagName: 'Khăn Rằn & Túi Da' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Thổ', score: 98, explanation: 'Thổ sinh Kim - Tông nâu kem dandy công tử Nam Bộ.' },
        etiquetteScore: 100,
        likesCount: 305
      },
      {
        id: 'outfit_init_15',
        title: 'Bộ 15: Tây Bắc Punk-Rock',
        concept: 'Sự kết hợp nổi loạn giữa văn hóa Dao Đỏ (Tây Bắc) và phong cách Punk Rock mạnh mẽ, khẳng định cá tính tự do.',
        createdAt: '08/10/2026',
        occasion: 'streetwear_cafe',
        layers: {
          ...INITIAL_LAYER_STATE,
          layer2_bottom: { id: 'chan_vay_xa_cap', name: 'Chân Váy Xòe & Xà Cạp', color: '#1E293B', type: 'skirt' },
          layer3_outer: { id: 'ao_dao_do_jacket', name: 'Áo Dao Đỏ Khoác Jacket Da', family: 'ao_tho_cam', robeColor: '#18181B', collarColor: '#DC2626', trimColor: '#DC2626', patternType: 'plain', lapelDirection: 'right_over_left' },
          layer4_tradAccessory: { headwearId: 'khan_dao_do', headwearName: 'Khăn Dao Đỏ Rực Rỡ', headwearColor: '#DC2626', jewelryId: 'trang_suc_bac_punk', jewelryName: 'Trang Sức Bạc Punk' },
          layer5_modernAccessory: { footwearId: 'bot_den_co_xich', footwearName: 'Bốt Đen Cao Cổ Có Xích' }
        },
        mannequin: INITIAL_MANNEQUIN,
        fiveElementHarmony: { element: 'Hỏa', score: 93, explanation: 'Hỏa sinh Thổ - Đỏ son Dao Đỏ kết hợp đai xích da đính tán.' },
        etiquetteScore: 95,
        likesCount: 340
      }
    ];

    return loadOutfitsLocally(initialDefaultOutfits);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem('vpr_dark_mode', String(isDarkMode));
    } catch {
      // Storage unavailable
    }
  }, [isDarkMode]);

  useEffect(() => {
    savePointsLocally(heritagePoints);
  }, [heritagePoints]);

  useEffect(() => {
    saveOutfitsLocally(savedOutfits);
  }, [savedOutfits]);

  useEffect(() => {
    saveDraftLocally(currentLayers, INITIAL_MANNEQUIN);
  }, [currentLayers]);

  const handleSelectForRemix = useCallback((family: GarmentFamily, preset?: Partial<GarmentLayerState>) => {
    const lore = GARMENTS_LORE.find(g => g.family === family);
    if (!lore) return;

    setCurrentLayers(prev => ({
      ...prev,
      ...(preset || {}),
      layer3_outer: {
        ...prev.layer3_outer,
        family,
        name: lore.name,
        robeColor: lore.defaultColors.robe,
        collarColor: lore.defaultColors.collar,
        trimColor: lore.defaultColors.trim || '#D97706',
        lapelDirection: 'right_over_left',
        ...(preset?.layer3_outer || {})
      }
    }));

    setHeritagePoints(prev => prev + 10);
    setActiveTab('studio');
  }, []);

  const handleApplyExtractedAsset = useCallback((asset: ExtractedAsset) => {
    setExtractedAssets(prev => [asset, ...prev.filter(a => a.id !== asset.id)]);
    setCurrentLayers(prev => ({
      ...prev,
      layer3_outer: {
        ...prev.layer3_outer,
        robeColor: asset.dominantColors[0] || prev.layer3_outer.robeColor,
        trimColor: asset.dominantColors[1] || prev.layer3_outer.trimColor
      }
    }));
  }, []);

  const handleSaveExtractedAsset = useCallback((asset: ExtractedAsset) => {
    setExtractedAssets(prev => [asset, ...prev.filter(a => a.id !== asset.id)]);
    setHeritagePoints(prev => prev + 15);
  }, []);

  const handleSaveOutfit = useCallback((newOutfit: SavedOutfit) => {
    setSavedOutfits(prev => [newOutfit, ...prev]);
    setHeritagePoints(prev => prev + 30);
  }, []);

  const handleLoadOutfitToStudio = useCallback((outfit: SavedOutfit) => {
    setCurrentLayers(outfit.layers);
    setActiveTab('studio');
  }, []);

  const handleDeleteOutfit = useCallback((id: string) => {
    setSavedOutfits(prev => prev.filter(o => o.id !== id));
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-[100dvh] max-w-full overflow-x-hidden flex flex-col bg-[#FCFBF7] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 transition-colors">
        
        {/* Offline Status Feedback Banner */}
        <OfflineBanner />

        {/* Strict Top Bar Contract Navigation */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          heritagePoints={heritagePoints}
        />

        {/* 3-Step Intuitive Onboarding Banner (Only on Discovery screen) */}
        {activeTab === 'discovery' && <OnboardingGuide onNavigate={setActiveTab} />}

        {/* Main Screen Content Viewport */}
        <main className={`flex-1 max-w-full overflow-x-hidden ${activeTab === 'studio' ? 'pb-0 overflow-hidden' : 'pb-20 md:pb-0'}`}>
          {activeTab === 'discovery' && (
            <CulturalDiscoveryScreen
              onSelectForRemix={handleSelectForRemix}
              onApplyExtractedAsset={handleApplyExtractedAsset}
              onSaveExtractedAsset={handleSaveExtractedAsset}
            />
          )}

          {activeTab === 'studio' && (
            <MixMatchStudioScreen
              currentLayers={currentLayers}
              onLayersChange={setCurrentLayers}
              onSaveOutfit={handleSaveOutfit}
              onGoToLookbook={() => setActiveTab('lookbook')}
            />
          )}

          {activeTab === 'lookbook' && (
            <LookbookArchiveScreen
              savedOutfits={savedOutfits}
              onLoadOutfitToStudio={handleLoadOutfitToStudio}
              onDeleteOutfit={handleDeleteOutfit}
              extractedAssets={extractedAssets}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileCulturalHubScreen
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              heritagePoints={heritagePoints}
              onAddPoints={(pts) => setHeritagePoints(prev => prev + pts)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}
        </main>

        {/* Clean Editorial Footer (Hidden on studio screen for maximum workstation height) */}
        {activeTab !== 'studio' && (
          <footer className="border-t border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-stone-900 dark:text-stone-100">VieSkin</span>
                <span aria-hidden="true">·</span>
                <span>Trang phục truyền thống Gen Z</span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <span>Đẹp</span>
                <span aria-hidden="true">·</span>
                <span>Chuẩn</span>
                <span aria-hidden="true">·</span>
                <span>Chất</span>
              </div>
            </div>
          </footer>
        )}

      </div>
    </ErrorBoundary>
  );
}
