import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Sparkles, 
  User, 
  Sun, 
  Moon, 
  Award
} from 'lucide-react';

export type ActiveTab = 'discovery' | 'studio' | 'lookbook' | 'profile';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  heritagePoints: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleTheme,
  heritagePoints
}) => {

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'discovery', label: 'Khám phá', icon: BookOpen },
    { id: 'studio', label: 'Studio', icon: Layers },
    { id: 'lookbook', label: 'Bộ sưu tập', icon: Sparkles }
  ];

  const allNavItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    ...navItems,
    { id: 'profile', label: 'Hồ sơ', icon: User }
  ];

  return (
    <>
      {/* HEADER: Hidden on mobile for Studio, Lookbook, and Profile; visible on desktop (md:) for screen navigation */}
      <header className={`sticky top-0 z-50 w-full border-b border-stone-200/80 dark:border-stone-800/80 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md transition-colors ${activeTab !== 'discovery' ? 'hidden md:block' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* ZONE 1: BRAND TITLE WORDMARK */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onTabChange('discovery')}
                className="flex items-center gap-2.5 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg p-1 -m-1 min-h-[44px]"
                aria-label="Trang chủ VieSkin"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-800 text-amber-300 flex items-center justify-center font-serif font-bold text-lg shadow-sm transition-transform group-hover:scale-105 shrink-0">
                  VS
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-none">
                    VieSkin
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 tracking-wider uppercase font-medium">
                    Trang phục Gen Z
                  </span>
                </div>
              </button>
            </div>

            {/* ZONE 2: PRIMARY NAVIGATION LINKS (DESKTOP) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Điều hướng chính">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`relative px-4 py-2 min-h-[44px] text-sm font-medium transition-all cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 flex items-center gap-2 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-rose-800 dark:text-rose-300 font-semibold bg-rose-50/70 dark:bg-rose-950/40 shadow-xs'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-rose-700 dark:text-rose-400' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-rose-700 dark:bg-rose-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ZONE 3: ACTIONS & METRICS */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Heritage & Profile Button */}
              <button
                type="button"
                onClick={() => onTabChange('profile')}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 text-stone-700 dark:text-stone-300 bg-stone-100/90 dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 hover:border-amber-400/80 hover:bg-amber-50/40 dark:hover:bg-amber-950/20"
                title="Hồ sơ cá nhân & Điểm di sản"
                aria-label={`Điểm di sản: ${heritagePoints}. Nhấp mở hồ sơ.`}
              >
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">{heritagePoints}</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium hidden sm:inline">đ</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={isDarkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 active:scale-95"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="w-5 h-5 text-stone-700 transition-transform hover:-rotate-12" />
                )}
              </button>
            </div>
          </div>
        </header>

      {/* ERGONOMIC MINIMAL ICON-ONLY MOBILE NAVIGATION */}
      <nav 
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0px))' }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800/80 px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around"
        aria-label="Điều hướng các chức năng"
      >
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              title={item.label}
              aria-label={item.label}
              className={`flex-1 min-h-[44px] py-1 px-2 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                isActive
                  ? 'text-rose-700 dark:text-rose-400 font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-rose-100 dark:bg-rose-950/70' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
            </button>
          );
        })}
      </nav>
    </>
  );
};
