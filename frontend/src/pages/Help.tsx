import { Typography, Row, Col, Card, Button, Divider, Space, Alert } from 'antd';
import {
  LoginOutlined,
  // UserAddOutlined, // Registration disabled
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  BookOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text, Link } = Typography;

const Help = () => {
  const navigate = useNavigate();

  const quickLinks = [
    // { title: 'Đăng ký tài khoản', path: '/register', icon: <UserAddOutlined /> }, // Registration disabled
    { title: 'Đăng nhập', path: '/login', icon: <LoginOutlined /> },
    { title: 'Dashboard', path: '/dashboard', icon: <DashboardOutlined /> },
    { title: 'Quản lý hệ thống', path: '/dashboard/systems', icon: <AppstoreOutlined /> },
    { title: 'Quản lý người dùng', path: '/dashboard/users', icon: <TeamOutlined /> },
    { title: 'Hướng dẫn sử dụng', path: '/help', icon: <BookOutlined /> },
  ];

  const sections = [
    {
      title: 'Bắt đầu',
      icon: <EnvironmentOutlined />,
      content: [
        // Registration disabled - contact admin for account
        // {
        //   subtitle: 'Đăng ký tài khoản',
        //   description: 'Tạo tài khoản để bắt đầu sử dụng hệ thống',
        //   steps: [
        //     'Truy cập trang đăng ký',
        //     'Nhập thông tin: tên đăng nhập, email, mật khẩu',
        //     'Chọn vai trò: Người dùng đơn vị hoặc Quản trị viên',
        //     'Chọn đơn vị (nếu là người dùng đơn vị)',
        //     'Click "Đăng ký"',
        //   ],
        // },
        {
          subtitle: 'Đăng nhập',
          description: 'Sử dụng thông tin đã đăng ký để truy cập hệ thống',
          steps: [
            'Truy cập trang đăng nhập',
            'Nhập tên đăng nhập và mật khẩu',
            'Click "Đăng nhập"',
            'Sẽ được chuyển đến Dashboard',
          ],
        },
      ],
    },
    {
      title: 'Tính năng chính',
      icon: <DashboardOutlined />,
      content: [
        {
          subtitle: 'Dashboard - Tổng quan',
          description: 'Xem thống kê tổng quan về hệ thống CNTT',
          features: [
            'Tổng số hệ thống',
            'Số hệ thống đang hoạt động',
            'Hệ thống quan trọng cần chú ý',
            'Biểu đồ xu hướng',
            'Hoạt động gần đây',
          ],
        },
        {
          subtitle: 'Quản lý Hệ thống',
          description: 'Thêm, sửa, xem chi tiết hệ thống',
          features: [
            'Danh sách tất cả hệ thống',
            'Thêm hệ thống mới với form chi tiết',
            'Chỉnh sửa thông tin hệ thống',
            'Xem chi tiết từng hệ thống',
            'Tìm kiếm, lọc theo trạng thái/độ quan trọng',
          ],
        },
        {
          subtitle: 'Quản lý Người dùng',
          description: 'Quản lý tài khoản người dùng (Admin)',
          features: [
            'Xem danh sách người dùng',
            'Tạo người dùng mới',
            'Kích hoạt/Vô hiệu hóa người dùng',
            'Xóa người dùng (có cảnh báo)',
          ],
        },
      ],
    },
  ];

  const faqs = [
    {
      question: 'Làm thế nào để đăng ký tài khoản?',
      answer: 'Hiện tại hệ thống không hỗ trợ tự đăng ký. Vui lòng liên hệ quản trị viên (admin) để được cấp tài khoản.',
    },
    {
      question: 'Quên mật khẩu thì làm sao?',
      answer: 'Hiện tại hệ thống chưa có chức năng phục hồi mật khẩu. Vui lòng liên hệ admin để reset mật khẩu.',
    },
    {
      question: 'Làm thế nào để thêm hệ thống mới?',
      answer: 'Sau khi đăng nhập, vào menu "Hệ thống" → Click nút "+ Thêm hệ thống" → Điền form và Click "Lưu".',
    },
    {
      question: 'Các trạng thái của hệ thống có ý nghĩa gì?',
      answer: 'Đang vận hành: hệ thống đang hoạt động bình thường. Ngưng hoạt động: hệ thống đã dừng. Bảo trì: đang trong quá trình bảo trì. Bản nháp: chưa hoàn thành.',
    },
    {
      question: 'Ai có thể xem hệ thống của đơn vị khác?',
      answer: 'Chỉ Admin mới có thể xem tất cả hệ thống. Người dùng đơn vị chỉ xem được hệ thống của đơn vị mình.',
    },
    {
      question: 'Làm sao không thấy menu Quản lý Người dùng/Đơn vị?',
      answer: 'Chỉ Admin mới thấy các menu này. Nếu bạn là người dùng đơn vị, bạn sẽ không có quyền truy cập.',
    },
    {
      question: 'Liên hệ hỗ trợ ở đâu?',
      answer: 'Vui lòng gửi email về support@mindmaid.ai hoặc liên hệ qua Bộ Khoa học và Công nghệ.',
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ fontSize: 36, marginBottom: 16 }}>
          <BookOutlined style={{ marginRight: 12, color: '#1890ff' }} />
          Hướng dẫn sử dụng
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          Tài liệu hướng dẫn chi tiết về cách sử dụng Nền tảng thống kê hệ thống CNTT
        </Paragraph>
      </div>

      {/* Quick Links */}
      <Card
        style={{
          marginBottom: 32,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
        title="Liên kết nhanh"
      >
        <Row gutter={[16, 16]}>
          {quickLinks.map((link, index) => (
            <Col xs={12} sm={8} md={4} key={index}>
              <Button
                size="large"
                block
                icon={link.icon}
                onClick={() => navigate(link.path)}
                style={{
                  height: 48,
                  textAlign: 'left',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{link.title}</span>
                <ArrowRightOutlined style={{ color: '#1890ff' }} />
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Getting Started */}
      <Card
        style={{
          marginBottom: 32,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Title level={3} style={{ marginBottom: 24 }}>
          <EnvironmentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          Bắt đầu nhanh
        </Title>
        <Row gutter={[32, 32]}>
          {/* Registration disabled - contact admin for account */}
          {/* <Col xs={24} md={12}>
            <Card
              type="inner"
              title="Đăng ký tài khoản"
              style={{ borderRadius: 8 }}
              extra={
                <Button type="primary" onClick={() => navigate('/register')}>
                  Đăng ký ngay
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {[
                  'Truy cập trang đăng ký',
                  'Điền thông tin bắt buộc',
                  'Chọn vai trò và đơn vị',
                  'Click "Đăng ký"',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8, marginTop: 4 }} />
                    <Text>{step}</Text>
                  </div>
                ))}
              </Space>
            </Card>
          </Col> */}
          <Col xs={24} md={12}>
            <Card
              type="inner"
              title="Đăng nhập"
              style={{ borderRadius: 8 }}
              extra={
                <Button type="primary" onClick={() => navigate('/login')}>
                  Đăng nhập ngay
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {[
                  'Truy cập trang đăng nhập',
                  'Nhập tên đăng nhập & mật khẩu',
                  'Click "Đăng nhập"',
                  'Được chuyển đến Dashboard',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8, marginTop: 4 }} />
                    <Text>{step}</Text>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Main Features */}
      <Card
        style={{
          marginBottom: 32,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Title level={3} style={{ marginBottom: 24 }}>
          <DashboardOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Tính năng chính
        </Title>
        <Row gutter={[24, 24]}>
          {sections.map((section, sectionIndex) => (
            <Col xs={24} lg={12} key={sectionIndex}>
              <Card
                type="inner"
                title={section.title}
                style={{ marginBottom: sectionIndex < sections.length - 1 ? 0 : undefined }}
              >
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} style={{ marginBottom: 24 }}>
                    <Title level={5} style={{ fontSize: 16, marginBottom: 8 }}>
                      {item.subtitle}
                    </Title>
                    <Paragraph style={{ color: '#666', marginBottom: 8 }}>
                      {item.description}
                    </Paragraph>
                    <ul style={{ paddingLeft: 20 }}>
                      {'steps' in item && item.steps.map((step: string, i: number) => (
                        <li key={i} style={{ marginBottom: 4, color: '#1890ff' }}>
                          {step}
                        </li>
                      ))}
                      {'features' in item && item.features.map((feature: string, i: number) => (
                        <li key={i} style={{ marginBottom: 4, color: '#1890ff' }}>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* FAQ */}
      <Card
        style={{
          marginBottom: 32,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Title level={3} style={{ marginBottom: 24 }}>
          Câu hỏi thường gặp
        </Title>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {faqs.map((faq, index) => (
            <Card
              key={index}
              type="inner"
              style={{ borderRadius: 8 }}
              headStyle={{ backgroundColor: '#f5f5f5' }}
            >
              <Text strong style={{ fontSize: 16, color: '#1890ff', marginBottom: 8 }}>
                Q: {faq.question}
              </Text>
              <Divider style={{ margin: '8px 0' }} />
              <Text style={{ fontSize: 14, color: '#666' }}>
                A: {faq.answer}
              </Text>
            </Card>
          ))}
        </Space>
      </Card>

      {/* Support Info */}
      <Alert
        message="Cần hỗ trợ?"
        description={
          <div>
            <Paragraph style={{ marginBottom: 8 }}>
              Nếu bạn gặp vấn đề khi sử dụng hệ thống, hãy liên hệ với chúng tôi:
            </Paragraph>
            <Space direction="vertical" size={8}>
              <div>
                <PhoneOutlined style={{ marginRight: 8 }} />
                Hotline: Chưa có thông tin
              </div>
              <div>
                <MailOutlined style={{ marginRight: 8 }} />
                Email: <Link href="mailto:support@mindmaid.ai">support@mindmaid.ai</Link>
              </div>
              <div>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                Website: <Link href="https://mindmaid.ai" target="_blank" rel="noopener noreferrer">
                  mindmaid.ai
                </Link>
              </div>
            </Space>
          </div>
        }
        type="info"
        showIcon
        style={{ borderRadius: 8, borderLeft: '4px solid #1890ff' }}
      />
    </div>
  );
};

export default Help;
