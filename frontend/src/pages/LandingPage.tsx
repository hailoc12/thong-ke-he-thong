import { Button, Typography, Row, Col, Card } from 'antd';
import {
  DatabaseOutlined,
  LineChartOutlined,
  SafetyOutlined,
  TeamOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DatabaseOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: 'Quản lý Hệ thống CNTT',
      description: 'Tập trung quản lý toàn bộ hệ thống công nghệ thông tin của đơn vị một cách có hệ thống và hiệu quả.',
    },
    {
      icon: <LineChartOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: 'Thống kê & Báo cáo',
      description: 'Cung cấp các báo cáo thống kê chi tiết, trực quan về tình hình triển khai và sử dụng hệ thống CNTT.',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
      title: 'An toàn & Bảo mật',
      description: 'Đảm bảo an toàn thông tin với các cơ chế phân quyền và bảo mật dữ liệu đa cấp.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 48, color: '#eb2f96' }} />,
      title: 'Quản lý Đa đơn vị',
      description: 'Hỗ trợ quản lý nhiều đơn vị, phòng ban với dữ liệu riêng biệt và phân quyền linh hoạt.',
    },
  ];

  const benefits = [
    'Tập trung hóa quản lý hệ thống CNTT',
    'Tiết kiệm thời gian và nguồn lực',
    'Báo cáo thống kê tự động',
    'Tuân thủ quy định về quản lý CNTT',
    'Dễ dàng theo dõi và đánh giá',
    'Hỗ trợ ra quyết định',
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '80px 24px',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <img
            src="/logo-khcn.jpeg"
            alt="Bộ Khoa học và Công nghệ"
            style={{
              width: 120,
              height: 'auto',
              borderRadius: 12,
              marginBottom: 32,
            }}
          />
          <Title level={1} style={{ color: 'white', fontSize: 48, marginBottom: 16 }}>
            Nền tảng thống kê CNTT
          </Title>
          <Paragraph style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', maxWidth: 800, margin: '0 auto 32px' }}>
            Giải pháp quản lý và thống kê hệ thống công nghệ thông tin toàn diện cho các đơn vị thuộc Bộ Khoa học và Công nghệ
          </Paragraph>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => navigate('/login')}
              style={{
                height: 48,
                fontSize: 18,
                padding: '0 32px',
                background: 'white',
                color: '#667eea',
                borderColor: 'white',
              }}
            >
              Đăng nhập ngay
            </Button>
            {/* Registration disabled - contact admin for account */}
            {/* <Button
              size="large"
              onClick={() => navigate('/register')}
              style={{
                height: 48,
                fontSize: 18,
                padding: '0 32px',
                background: 'transparent',
                color: 'white',
                borderColor: 'white',
              }}
            >
              Đăng ký tài khoản
            </Button> */}
            <Button
              size="large"
              icon={<BookOutlined />}
              onClick={() => navigate('/help')}
              style={{
                height: 48,
                fontSize: 18,
                padding: '0 32px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                borderColor: 'white',
              }}
            >
              Hướng dẫn
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ maxWidth: 1200, margin: '80px auto', padding: '0 24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          Tính năng nổi bật
        </Title>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: 12,
                }}
              >
                <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph style={{ color: '#666' }}>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Benefits Section */}
      <div style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
            Lợi ích khi sử dụng
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              <img
                src="/logo-khcn.jpeg"
                alt="Platform illustration"
                style={{
                  width: '100%',
                  maxWidth: 400,
                  height: 'auto',
                  borderRadius: 12,
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </Col>
            <Col xs={24} lg={12}>
              <div style={{ paddingTop: 24 }}>
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 16,
                      fontSize: 16,
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ color: '#52c41a', fontSize: 24, marginRight: 12 }}
                    />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
            Sẵn sàng bắt đầu?
          </Title>
          <Paragraph style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 32 }}>
            Đăng nhập ngay để trải nghiệm nền tảng quản lý hệ thống CNTT hiện đại và hiệu quả
          </Paragraph>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/login')}
              style={{
                height: 48,
                fontSize: 18,
                padding: '0 32px',
                background: 'white',
                color: '#667eea',
                borderColor: 'white',
              }}
            >
              Đăng nhập
            </Button>
            {/* Registration disabled - contact admin for account */}
            {/* <Button
              size="large"
              onClick={() => navigate('/register')}
              style={{
                height: 48,
                fontSize: 18,
                padding: '0 32px',
                background: 'transparent',
                color: 'white',
                borderColor: 'white',
              }}
            >
              Đăng ký
            </Button> */}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#001529', padding: '32px 24px', textAlign: 'center', color: 'white' }}>
        <Paragraph style={{ color: 'rgba(255,255,255,0.65)', margin: 0 }}>
          © 2026 Bộ Khoa học và Công nghệ - Nền tảng thống kê CNTT
        </Paragraph>
      </div>
    </div>
  );
};

export default LandingPage;
