import { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Typography, Drawer } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  AuditOutlined,
  RadarChartOutlined,
  ProjectOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuthStore();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Build menu items based on user role
  const menuItems: MenuProps['items'] = [
    {
      type: 'group',
      label: 'TÍNH NĂNG CƠ BẢN',
      children: [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: 'Tổng quan',
        },
        {
          key: '/systems',
          icon: <AppstoreOutlined />,
          label: 'Hệ thống',
        },
        // Organizations menu - admin only
        ...(isAdmin ? [{
          key: '/organizations',
          icon: <TeamOutlined />,
          label: 'Đơn vị',
        }] : []),
        // Users menu - admin only
        ...(isAdmin ? [{
          key: '/users',
          icon: <UserOutlined />,
          label: 'Người dùng',
        }] : []),
      ],
    },
    {
      type: 'group',
      label: 'TÍNH NĂNG NÂNG CAO',
      children: [
        {
          key: '/analytics',
          icon: <BarChartOutlined />,
          label: 'Phân tích thông minh',
        },
        {
          key: '/approvals',
          icon: <AuditOutlined />,
          label: 'Phê duyệt & Chữ ký',
        },
        {
          key: '/benchmarking',
          icon: <RadarChartOutlined />,
          label: 'So sánh chuẩn mực',
        },
        {
          key: '/lifecycle',
          icon: <ProjectOutlined />,
          label: 'Quản lý vòng đời',
        },
        {
          key: '/api-catalog',
          icon: <ApiOutlined />,
          label: 'Danh mục API',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    // Close mobile drawer after navigation
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Sidebar content component (reused in Sider and Drawer)
  const SidebarContent = ({ showLogo = true }: { showLogo?: boolean }) => (
    <>
      {showLogo && (
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '0 16px',
            gap: 12,
          }}
        >
          <img
            src="/logo-khcn.jpeg"
            alt="Bộ KH&CN"
            style={{
              width: isMobile || collapsed ? 32 : 40,
              height: 'auto',
              borderRadius: 4,
            }}
          />
          {!collapsed && !isMobile && (
            <Text strong style={{ color: 'white', fontSize: 14 }}>
              HỆ THỐNG BÁO CÁO
            </Text>
          )}
          {isMobile && (
            <Text strong style={{ color: 'white', fontSize: 14 }}>
              HỆ THỐNG BÁO CÁO
            </Text>
          )}
        </div>
      )}

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </>
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0,
          }}
        >
          <SidebarContent />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          styles={{ body: { padding: 0, background: '#001529' } }}
          width={250}
        >
          <SidebarContent />
        </Drawer>
      )}

      <AntLayout>
        <Header
          style={{
            padding: isMobile ? '0 16px' : '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile ? (
              // Mobile: Hamburger menu to open drawer
              <MenuUnfoldOutlined
                style={{ fontSize: 20, cursor: 'pointer' }}
                onClick={() => setMobileDrawerOpen(true)}
              />
            ) : (
              // Desktop: Collapse/Expand sidebar
              collapsed ? (
                <MenuUnfoldOutlined
                  style={{ fontSize: 18, cursor: 'pointer' }}
                  onClick={() => setCollapsed(false)}
                />
              ) : (
                <MenuFoldOutlined
                  style={{ fontSize: 18, cursor: 'pointer' }}
                  onClick={() => setCollapsed(true)}
                />
              )
            )}
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              {!isMobile && <Text>{user?.username || 'User'}</Text>}
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: isMobile ? '16px 8px' : '24px 16px', overflow: 'initial' }}>
          <div
            style={{
              padding: isMobile ? 16 : 24,
              background: '#fff',
              minHeight: 'calc(100vh - 112px)',
              borderRadius: 8,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default MainLayout;
