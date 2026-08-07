import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Suspense, useMemo } from 'react';
import { Outlet } from 'react-router';
import { buildThemeConfig } from '@/config/theme';
import { useFeatureToggles } from '@/hooks/use-feature-toggles';
import { useThemePrimary } from '@/hooks/use-theme-primary';

const fallback = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

export default function Root(): React.JSX.Element {
  const { darkMode } = useFeatureToggles();
  const primary = useThemePrimary();
  const themeConfig = useMemo(() => buildThemeConfig(primary, darkMode), [darkMode, primary]);

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <div className={`app-with-sakura min-h-screen bg-background text-foreground ${darkMode ? 'dark' : ''}`} style={{ position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Suspense fallback={fallback}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </ConfigProvider>
  );
}
