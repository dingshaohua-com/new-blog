import { BgColorsOutlined, CheckOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MoonOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Drawer, Dropdown, Layout, Menu, type MenuProps, Switch, Tooltip, theme } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import logoImg from '@/assets/imgs/logo.svg';
import { THEME_PRESETS } from '@/config/theme';
import { setFeatureToggle, useFeatureToggles } from '@/hooks/use-feature-toggles';
import { setThemePrimary, useThemePrimary } from '@/hooks/use-theme-primary';
import { toBreadcrumbMap, toMenuItems, toRoutableSet } from '@/routers/helper';
import { routes } from '@/routers/routes';

const { Header, Sider, Content } = Layout;

const menuItems = toMenuItems(routes);
const breadcrumbNameMap = toBreadcrumbMap(routes);
const routablePaths = toRoutableSet(routes);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia('(max-width: 768px)').matches));

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)');
    const syncIsMobile = () => setIsMobile(query.matches);

    syncIsMobile();
    query.addEventListener('change', syncIsMobile);
    return () => query.removeEventListener('change', syncIsMobile);
  }, []);

  return isMobile;
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const pathSnippets = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems =
    pathSnippets.length === 0
      ? [{ title: '首页', key: '/' }]
      : pathSnippets.map((_, index) => {
          const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
          return {
            title: breadcrumbNameMap[url] ?? url,
            ...(routablePaths.has(url) ? { href: `#${url}` } : {}),
            key: url,
          };
        });

  const toggles = useFeatureToggles();
  const primary = useThemePrimary();

  const toggleLabel = (text: string, checked: boolean) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        minWidth: 140,
      }}
    >
      <span>{text}</span>
      <Switch size="small" checked={checked} />
    </div>
  );

  const themeLabel = (
    <div className="w-32 py-1" onClick={(e) => e.stopPropagation()}>
      <div className="mb-2 text-xs font-medium text-slate-500">主题色</div>
      <div className="grid grid-cols-4 gap-2">
        {THEME_PRESETS.map((preset) => {
          const active = preset.color.toLowerCase() === primary.toLowerCase();
          return (
            <Tooltip key={preset.key} title={preset.label} mouseEnterDelay={0.2}>
              <span
                role="button"
                aria-label={preset.label}
                className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  setThemePrimary(preset.color);
                }}
                style={{
                  background: preset.color,
                  boxShadow: active ? `0 0 0 2px ${token.colorBgContainer}, 0 0 0 3px ${preset.color}` : 'none',
                }}
              >
                {active && <CheckOutlined style={{ color: '#fff', fontSize: 10 }} />}
              </span>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );

  const userMenuItems: MenuProps['items'] = [
    { key: 'theme', icon: <BgColorsOutlined />, label: themeLabel },
    { type: 'divider' },
    {
      key: 'darkMode',
      icon: <MoonOutlined />,
      label: toggleLabel('夜间模式', toggles.darkMode),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const onUserMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
    if (key === 'darkMode') {
      domEvent?.preventDefault?.();
      setFeatureToggle(key, !toggles[key]);
      return;
    }
    if (key === 'theme') {
      domEvent?.preventDefault?.();
      return;
    }
    if (key === 'logout') {
      setUserMenuOpen(false);
      navigate('/login');
    }
  };

  const selectedKeys = [location.pathname === '/' ? '/' : location.pathname];
  const openKeys =
    menuItems
      ?.filter((item): item is Extract<typeof item, { children: unknown }> => !!(item && 'children' in item))
      .filter((item) => (item.children as MenuProps['items'])?.some((child) => child && 'key' in child && selectedKeys.includes(child.key as string)))
      .map((item) => item.key as string) ?? [];

  const brand = (
    <div
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
        padding: collapsed && !isMobile ? 0 : '0 20px',
        gap: 8,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        color: token.colorText,
      }}
    >
      <img src={logoImg} alt="logo" style={{ width: 28, height: 28 }} className="rounded-md" />
      {(!collapsed || isMobile) && <span style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>哈哈平台</span>}
    </div>
  );

  const navigationMenu = <Menu theme={toggles.darkMode ? 'dark' : 'light'} mode="inline" selectedKeys={selectedKeys} defaultOpenKeys={openKeys} items={menuItems} onClick={onMenuClick} style={{ background: 'transparent', border: 'none', padding: '8px 0' }} />;

  return (
    <Layout
      style={{
        minHeight: '100vh',
        height: isMobile ? 'auto' : '100vh',
        overflow: isMobile ? 'auto' : 'hidden',
      }}
    >
      {!isMobile && (
        <Sider
          theme={toggles.darkMode ? 'dark' : 'light'}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={220}
          style={{
            background: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {brand}
          {navigationMenu}
        </Sider>
      )}

      <Drawer
        title={null}
        placement="left"
        width={280}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        styles={{
          body: { padding: 0, background: token.colorBgContainer },
          content: { background: token.colorBgContainer },
        }}
      >
        {brand}
        {navigationMenu}
      </Drawer>

      <Layout style={{ minWidth: 0 }}>
        <Header
          style={{
            height: 56,
            padding: isMobile ? '0 12px' : '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            color: token.colorText,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 10 : 16,
              minWidth: 0,
            }}
          >
            <span
              onClick={() => {
                if (isMobile) {
                  setMobileMenuOpen(true);
                  return;
                }
                setCollapsed(!collapsed);
              }}
              style={{
                cursor: 'pointer',
                fontSize: 16,
                display: 'flex',
                flexShrink: 0,
              }}
            >
              {isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            {!isMobile && <Breadcrumb items={breadcrumbItems} />}
          </div>

          <Dropdown menu={{ items: userMenuItems, onClick: onUserMenuClick }} placement="bottomRight" open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Avatar size="small" icon={<UserOutlined />} />
              {!isMobile && <span style={{ fontSize: 14 }}>Admin</span>}
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            background: token.colorBgLayout,
            padding: isMobile ? 12 : 16,
            overflow: isMobile ? 'visible' : 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
