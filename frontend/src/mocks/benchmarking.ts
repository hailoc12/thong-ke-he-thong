/**
 * Mock data: Benchmarking & Best Practices
 * For Feature 3
 */

export interface BenchmarkMetric {
  category: string;
  metric: string;
  boKHCN: number; // Bộ KH&CN current value
  average: number; // Industry average
  topPerformer: number; // Best in class
  unit: string;
  status: 'above' | 'at' | 'below';
}

export interface BestPractice {
  id: number;
  category: 'governance' | 'architecture' | 'security' | 'operations' | 'innovation';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  implementationTime: string;
  tags: string[];
  resources: Array<{ title: string; url: string; type: 'article' | 'video' | 'book' | 'tool' }>;
}

export interface CaseStudy {
  id: number;
  organization: string;
  organizationType: 'ministry' | 'department' | 'enterprise' | 'international';
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
  timeline: string;
  budget: string;
  keyTakeaways: string[];
  contactPerson?: string;
}

export const mockBenchmarkMetrics: BenchmarkMetric[] = [
  // IT Governance
  { category: 'Quản trị CNTT', metric: 'Systems với SLA định nghĩa', boKHCN: 68, average: 75, topPerformer: 95, unit: '%', status: 'below' },
  { category: 'Quản trị CNTT', metric: 'Hệ thống có disaster recovery plan', boKHCN: 45, average: 60, topPerformer: 90, unit: '%', status: 'below' },
  { category: 'Quản trị CNTT', metric: 'Tuân thủ CNTT tiêu chuẩn quốc gia', boKHCN: 82, average: 70, topPerformer: 98, unit: '%', status: 'above' },

  // Architecture
  { category: 'Kiến trúc', metric: 'Hệ thống sử dụng microservices', boKHCN: 22, average: 35, topPerformer: 65, unit: '%', status: 'below' },
  { category: 'Kiến trúc', metric: 'API-first architecture', boKHCN: 40, average: 50, topPerformer: 80, unit: '%', status: 'below' },
  { category: 'Kiến trúc', metric: 'Cloud-native applications', boKHCN: 30, average: 45, topPerformer: 75, unit: '%', status: 'below' },

  // Security
  { category: 'Bảo mật', metric: 'Hệ thống có penetration testing định kỳ', boKHCN: 55, average: 65, topPerformer: 100, unit: '%', status: 'below' },
  { category: 'Bảo mật', metric: 'Multi-factor authentication coverage', boKHCN: 78, average: 70, topPerformer: 100, unit: '%', status: 'above' },
  { category: 'Bảo mật', metric: 'Vulnerability patching < 30 days', boKHCN: 70, average: 75, topPerformer: 95, unit: '%', status: 'below' },
  { category: 'Bảo mật', metric: 'Security training compliance', boKHCN: 88, average: 80, topPerformer: 100, unit: '%', status: 'above' },

  // Operations
  { category: 'Vận hành', metric: 'System uptime', boKHCN: 99.2, average: 99.5, topPerformer: 99.95, unit: '%', status: 'below' },
  { category: 'Vận hành', metric: 'Mean Time To Recovery (MTTR)', boKHCN: 3.5, average: 2.5, topPerformer: 0.5, unit: 'hours', status: 'below' },
  { category: 'Vận hành', metric: 'Automated monitoring coverage', boKHCN: 65, average: 80, topPerformer: 100, unit: '%', status: 'below' },
  { category: 'Vận hành', metric: 'Incident response time', boKHCN: 45, average: 30, topPerformer: 10, unit: 'minutes', status: 'below' },

  // Innovation
  { category: 'Đổi mới', metric: 'Budget allocated to R&D/Innovation', boKHCN: 8, average: 12, topPerformer: 25, unit: '%', status: 'below' },
  { category: 'Đổi mới', metric: 'Hệ thống sử dụng AI/ML', boKHCN: 15, average: 25, topPerformer: 50, unit: '%', status: 'below' },
  { category: 'Đổi mới', metric: 'Innovation projects per year', boKHCN: 6, average: 10, topPerformer: 20, unit: 'projects', status: 'below' },

  // Cost Efficiency
  { category: 'Hiệu quả chi phí', metric: 'IT cost as % of total budget', boKHCN: 4.2, average: 5.5, topPerformer: 3.8, unit: '%', status: 'above' },
  { category: 'Hiệu quả chi phí', metric: 'Cloud cost optimization', boKHCN: 25, average: 35, topPerformer: 60, unit: '%', status: 'below' },
  { category: 'Hiệu quả chi phí', metric: 'License optimization', boKHCN: 40, average: 50, topPerformer: 80, unit: '%', status: 'below' },
];

export const mockBestPractices: BestPractice[] = [
  {
    id: 1,
    category: 'governance',
    title: 'Thiết lập IT Governance Framework theo COBIT 2019',
    description: 'Triển khai framework quản trị CNTT toàn diện giúp align IT với business goals, quản lý rủi ro và tối ưu hóa tài nguyên.',
    difficulty: 'hard',
    impact: 'high',
    implementationTime: '6-12 tháng',
    tags: ['COBIT', 'Governance', 'Framework', 'Strategy'],
    resources: [
      { title: 'COBIT 2019 Framework', url: 'https://www.isaca.org/resources/cobit', type: 'article' },
      { title: 'IT Governance Implementation Guide', url: '#', type: 'book' }
    ]
  },
  {
    id: 2,
    category: 'architecture',
    title: 'Áp dụng API Gateway Pattern cho Microservices',
    description: 'Sử dụng API Gateway làm single entry point, handle authentication, rate limiting, routing và monitoring cho microservices architecture.',
    difficulty: 'medium',
    impact: 'high',
    implementationTime: '2-4 tháng',
    tags: ['Microservices', 'API Gateway', 'Architecture', 'Security'],
    resources: [
      { title: 'API Gateway Pattern - Martin Fowler', url: 'https://martinfowler.com/articles/gateway.html', type: 'article' },
      { title: 'Kong Gateway Tutorial', url: '#', type: 'video' },
      { title: 'Building Microservices', url: '#', type: 'book' }
    ]
  },
  {
    id: 3,
    category: 'security',
    title: 'Triển khai Zero Trust Security Model',
    description: 'Mô hình bảo mật "never trust, always verify" - xác thực mọi request, phân quyền chi tiết, encrypt data end-to-end.',
    difficulty: 'hard',
    impact: 'high',
    implementationTime: '8-12 tháng',
    tags: ['Zero Trust', 'Security', 'Identity', 'Encryption'],
    resources: [
      { title: 'NIST Zero Trust Architecture', url: 'https://www.nist.gov/publications/zero-trust-architecture', type: 'article' },
      { title: 'Zero Trust Implementation Guide', url: '#', type: 'video' }
    ]
  },
  {
    id: 4,
    category: 'operations',
    title: 'Automated CI/CD Pipeline với GitOps',
    description: 'Tự động hóa build, test, deploy bằng GitLab CI/CD hoặc GitHub Actions. Sử dụng Git làm single source of truth cho infrastructure.',
    difficulty: 'medium',
    impact: 'high',
    implementationTime: '3-6 tháng',
    tags: ['CI/CD', 'GitOps', 'Automation', 'DevOps'],
    resources: [
      { title: 'GitLab CI/CD Documentation', url: 'https://docs.gitlab.com/ee/ci/', type: 'article' },
      { title: 'GitOps Fundamentals', url: '#', type: 'video' },
      { title: 'Argo CD Tool', url: 'https://argoproj.github.io/cd/', type: 'tool' }
    ]
  },
  {
    id: 5,
    category: 'operations',
    title: 'Centralized Logging với ELK Stack',
    description: 'Thu thập logs từ tất cả hệ thống về Elasticsearch, visualize bằng Kibana, tạo alerts tự động cho anomalies.',
    difficulty: 'medium',
    impact: 'medium',
    implementationTime: '2-3 tháng',
    tags: ['Logging', 'ELK', 'Monitoring', 'Elasticsearch'],
    resources: [
      { title: 'Elastic Stack Documentation', url: 'https://www.elastic.co/guide/index.html', type: 'article' },
      { title: 'ELK Stack Tutorial', url: '#', type: 'video' }
    ]
  },
  {
    id: 6,
    category: 'innovation',
    title: 'AI-Powered Chatbot cho Citizen Services',
    description: 'Deploy AI chatbot để tự động trả lời câu hỏi thường gặp, hướng dẫn thủ tục hành chính, giảm tải cho support team.',
    difficulty: 'medium',
    impact: 'high',
    implementationTime: '4-6 tháng',
    tags: ['AI', 'Chatbot', 'NLP', 'Customer Service'],
    resources: [
      { title: 'Rasa Open Source Chatbot', url: 'https://rasa.com/', type: 'tool' },
      { title: 'Building AI Chatbots', url: '#', type: 'video' }
    ]
  },
  {
    id: 7,
    category: 'architecture',
    title: 'Event-Driven Architecture với Message Queue',
    description: 'Sử dụng RabbitMQ/Kafka để decouple services, xử lý async tasks, scale independently, improve resilience.',
    difficulty: 'medium',
    impact: 'medium',
    implementationTime: '3-5 tháng',
    tags: ['Event-Driven', 'Message Queue', 'RabbitMQ', 'Kafka'],
    resources: [
      { title: 'Event-Driven Architecture Pattern', url: '#', type: 'article' },
      { title: 'Apache Kafka Documentation', url: 'https://kafka.apache.org/documentation/', type: 'article' }
    ]
  },
  {
    id: 8,
    category: 'security',
    title: 'Automated Security Scanning trong CI/CD',
    description: 'Tích hợp SAST, DAST, dependency scanning vào pipeline để phát hiện vulnerabilities sớm.',
    difficulty: 'easy',
    impact: 'high',
    implementationTime: '1-2 tháng',
    tags: ['Security', 'SAST', 'DAST', 'DevSecOps'],
    resources: [
      { title: 'OWASP Dependency Check', url: 'https://owasp.org/www-project-dependency-check/', type: 'tool' },
      { title: 'SonarQube Security', url: 'https://www.sonarsource.com/products/sonarqube/', type: 'tool' }
    ]
  },
  {
    id: 9,
    category: 'governance',
    title: 'IT Service Catalog với Self-Service Portal',
    description: 'Xây dựng catalog các dịch vụ IT chuẩn, cho phép users tự request, approve workflow tự động.',
    difficulty: 'medium',
    impact: 'medium',
    implementationTime: '3-4 tháng',
    tags: ['Service Catalog', 'ITSM', 'Self-Service', 'Portal'],
    resources: [
      { title: 'ServiceNow Service Catalog', url: '#', type: 'article' },
      { title: 'ITIL Service Catalog Guide', url: '#', type: 'book' }
    ]
  },
  {
    id: 10,
    category: 'operations',
    title: 'Infrastructure as Code với Terraform',
    description: 'Quản lý infrastructure bằng code, versioning, automated provisioning, consistent environments.',
    difficulty: 'medium',
    impact: 'high',
    implementationTime: '3-6 tháng',
    tags: ['IaC', 'Terraform', 'Automation', 'Cloud'],
    resources: [
      { title: 'Terraform Documentation', url: 'https://www.terraform.io/docs', type: 'article' },
      { title: 'Terraform Best Practices', url: '#', type: 'video' }
    ]
  }
];

export const mockCaseStudies: CaseStudy[] = [
  {
    id: 1,
    organization: 'Bộ Công Thương',
    organizationType: 'ministry',
    title: 'Chuyển đổi số toàn diện với Cloud-First Strategy',
    summary: 'Bộ Công Thương migrate 80% hệ thống lên cloud trong 18 tháng, giảm 40% chi phí vận hành, tăng uptime lên 99.9%.',
    challenge: 'Hệ thống legacy cũ kỹ, on-premise infrastructure đắt đỏ, khó scale, downtime thường xuyên ảnh hưởng doanh nghiệp.',
    solution: 'Triển khai cloud-first strategy với AWS, migrate từng giai đoạn, training team, modernize applications với microservices.',
    results: [
      'Giảm 40% chi phí infrastructure (từ 25 tỷ xuống 15 tỷ VNĐ/năm)',
      'Tăng system uptime từ 97.5% lên 99.9%',
      'Giảm 60% thời gian deploy new features (từ 2 tuần xuống 3 ngày)',
      'Scale tự động đáp ứng peak traffic (Tết, Black Friday)',
      'Disaster recovery time giảm từ 48h xuống 2h'
    ],
    technologies: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'GitLab CI/CD'],
    timeline: '18 tháng (Q1/2023 - Q2/2024)',
    budget: '32 tỷ VNĐ (initial investment)',
    keyTakeaways: [
      'Start small: Pilot với 2-3 hệ thống non-critical trước',
      'Training là key: Đầu tư 15% budget cho upskilling team',
      'Security first: Implement Zero Trust từ đầu',
      'Change management: Communication rõ ràng với stakeholders',
      'ROI đạt được sau 24 tháng'
    ],
    contactPerson: 'Nguyễn Văn A - CIO Bộ Công Thương (email: nva@moit.gov.vn)'
  },
  {
    id: 2,
    organization: 'Bộ Y Tế',
    organizationType: 'ministry',
    title: 'Nền tảng AI Hỗ trợ Chẩn đoán Y khoa',
    summary: 'Triển khai AI platform phân tích X-quang/CT scan, hỗ trợ bác sĩ chẩn đoán nhanh hơn 70%, giảm medical errors 35%.',
    challenge: 'Thiếu hụt bác sĩ chuyên khoa, áp lực cao trong mùa dịch, chẩn đoán chậm, sai sót cao do overload.',
    solution: 'Xây dựng AI model (Computer Vision) phân tích medical images, tích hợp vào HIS (Hospital Information System), training bác sĩ sử dụng.',
    results: [
      'Giảm 70% thời gian chẩn đoán (từ 45 phút xuống 13 phút)',
      'Giảm 35% sai sót y khoa (false negatives)',
      'Tăng 3x throughput - số bệnh nhân được khám/ngày',
      'Tăng satisfaction score từ 6.5/10 lên 8.9/10',
      'Model accuracy 94.2% (comparable to senior radiologists)'
    ],
    technologies: ['Python', 'TensorFlow', 'FastAPI', 'React', 'PostgreSQL', 'DICOM'],
    timeline: '14 tháng (Q3/2023 - Q4/2024)',
    budget: '18 tỷ VNĐ',
    keyTakeaways: [
      'Data quality là critical: Cần 50K+ labeled images cho training',
      'Bác sĩ phải trust AI: Explain model predictions (XAI)',
      'Regulatory compliance: Tuân thủ Luật An toàn thông tin y tế',
      'Continuous learning: Model cần retrain mỗi quý',
      'Human-in-the-loop: AI hỗ trợ, không thay thế bác sĩ'
    ],
    contactPerson: 'TS. Trần Thị B - Vụ CNTT Bộ Y Tế'
  },
  {
    id: 3,
    organization: 'Ngân hàng Nhà nước (SBV)',
    organizationType: 'department',
    title: 'Blockchain-based Digital Identity cho Ngân hàng',
    summary: 'Triển khai nền tảng eKYC dựa trên blockchain, giảm 80% thời gian mở tài khoản, tăng bảo mật, giảm fraud 90%.',
    challenge: 'Process KYC thủ công, chậm, duplicate data across banks, high fraud rate, poor customer experience.',
    solution: 'Xây dựng blockchain consortium (Hyperledger Fabric) cho 15 ngân hàng, digital identity wallet, biometric verification, smart contracts.',
    results: [
      'Giảm 80% thời gian KYC (từ 3 ngày xuống 30 phút)',
      'Giảm 90% fraud cases (từ 1200 xuống 120 cases/tháng)',
      'Tiết kiệm 250 tỷ VNĐ/năm cho ngành banking',
      'Tăng 5M+ tài khoản mới trong năm đầu',
      '98% customer satisfaction với eKYC'
    ],
    technologies: ['Hyperledger Fabric', 'Node.js', 'React Native', 'Face Recognition AI', 'MongoDB'],
    timeline: '22 tháng (Q1/2022 - Q4/2023)',
    budget: '65 tỷ VNĐ (consortium investment)',
    keyTakeaways: [
      'Consortium model: Cần alignment giữa các ngân hàng competitor',
      'Privacy by design: Zero-knowledge proofs cho sensitive data',
      'Scalability challenge: Handle 100K+ transactions/day',
      'Regulatory sandbox: Phối hợp chặt chẽ với SBV',
      'User adoption: Mobile-first, simple UX critical'
    ]
  },
  {
    id: 4,
    organization: 'Thành phố Hồ Chí Minh',
    organizationType: 'department',
    title: 'Smart City Platform - IoT & Big Data Analytics',
    summary: 'Triển khai nền tảng smart city với 50K+ IoT sensors, real-time analytics, giảm 30% traffic congestion, tiết kiệm 20% energy.',
    challenge: 'Traffic congestion심각, ô nhiễm không khí cao, quản lý năng lượng kém hiệu quả, thiếu data-driven decisions.',
    solution: 'Deploy IoT sensors (traffic, air quality, energy), centralized data lake, real-time analytics, AI-powered traffic management, citizen mobile app.',
    results: [
      'Giảm 30% traffic congestion (average commute time giảm 25 phút)',
      'Giảm 18% air pollution (PM2.5 levels)',
      'Tiết kiệm 20% năng lượng công cộng (đèn đường, tòa nhà)',
      'Tăng 15% citizen satisfaction với public services',
      'ROI đạt 180% sau 3 năm'
    ],
    technologies: ['AWS IoT', 'Apache Kafka', 'Spark', 'MongoDB', 'React', 'Python', 'TensorFlow'],
    timeline: '36 tháng (2021-2024)',
    budget: '450 tỷ VNĐ',
    keyTakeaways: [
      'Scale challenge: 50K sensors → 2TB data/day',
      'Real-time processing: Stream processing với Kafka + Spark',
      'Citizen engagement: Mobile app với 2M+ downloads',
      'Public-private partnership: Phối hợp với Viettel, VNPT',
      'Long-term maintenance: Ngân sách vận hành 80 tỷ/năm'
    ]
  },
  {
    id: 5,
    organization: 'Estonia e-Government',
    organizationType: 'international',
    title: 'X-Road: Nền tảng Chính phủ Điện tử Toàn quốc',
    summary: 'Estonia xây dựng X-Road platform kết nối 99% public services, 100% dân số có digital ID, 98% tax declarations online.',
    challenge: 'Paper-based government, bureaucracy chậm chạp, corruption, citizen frustration với public services.',
    solution: 'Xây dựng X-Road - secure data exchange layer, digital ID cho mọi công dân, online services (e-Tax, e-Health, e-School, e-Voting).',
    results: [
      '99% public services available online 24/7',
      '98% tax declarations submitted online trong < 5 phút',
      'Tiết kiệm 2% GDP/năm (€800M) từ digitalization',
      '100% prescriptions digital (e-Prescriptions)',
      '46% citizens voted online trong national elections'
    ],
    technologies: ['X-Road', 'Smart ID', 'Digital Signatures', 'Blockchain (KSI)', 'Open Source'],
    timeline: '20+ năm (2001 - present)',
    budget: 'Cumulative €1.2B',
    keyTakeaways: [
      'Political will: Top-down commitment từ government',
      'Digital ID is foundation: Mọi services đều dựa trên digital identity',
      'Security by design: Blockchain-based integrity, zero data breaches',
      'Interoperability: X-Road standard cho data exchange',
      'International model: 20+ countries đã adopt X-Road'
    ]
  }
];

// Utility functions
export const getBenchmarksByCategory = (category: string) => {
  return mockBenchmarkMetrics.filter(m => m.category === category);
};

export const getBestPracticesByCategory = (category: BestPractice['category']) => {
  return mockBestPractices.filter(bp => bp.category === category);
};

export const getCaseStudiesByType = (type: CaseStudy['organizationType']) => {
  return mockCaseStudies.filter(cs => cs.organizationType === type);
};
