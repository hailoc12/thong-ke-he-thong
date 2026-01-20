/**
 * System Form Redesign - EDIT VERSION
 * Simplified Tabs-based form with 24 new fields
 * Date: 2026-01-19
 */
import { useState, useEffect } from 'react';
import {
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  InputNumber,
  Switch,
  message,
  Spin,
  Typography,
  Tag,
  Space,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SafetyOutlined,
  CloudServerOutlined,
  ToolOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import type { Organization } from '../types';
import { SelectWithOther } from '../components/form/SelectWithOther';
import { CheckboxGroupWithOther } from '../components/form/CheckboxGroupWithOther';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Predefined options for SelectWithOther components
 */
const systemGroupOptions = [
  { label: 'Nền tảng quốc gia', value: 'national_platform' },
  { label: 'Nền tảng dùng chung của Bộ', value: 'shared_platform' },
  { label: 'CSDL chuyên ngành', value: 'specialized_db' },
  { label: 'Ứng dụng nghiệp vụ', value: 'business_app' },
  { label: 'Cổng thông tin', value: 'portal' },
  { label: 'BI/Báo cáo', value: 'bi' },
  { label: 'ESB/Tích hợp', value: 'esb' },
  { label: 'Khác', value: 'other' },
];

const authenticationMethodOptions = [
  { label: 'Username/Password', value: 'username_password' },
  { label: 'SSO', value: 'sso' },
  { label: 'LDAP', value: 'ldap' },
  { label: 'OAuth', value: 'oauth' },
  { label: 'SAML', value: 'saml' },
  { label: 'Biometric', value: 'biometric' },
  { label: 'Khác', value: 'other' },
];

/**
 * Phase 2: Predefined options for high-priority CharField fields
 */
const programmingLanguageOptions = [
  { label: 'Python', value: 'Python' },
  { label: 'Java', value: 'Java' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'C#', value: 'C#' },
  { label: 'PHP', value: 'PHP' },
  { label: 'Ruby', value: 'Ruby' },
  { label: 'Go', value: 'Go' },
  { label: 'Kotlin', value: 'Kotlin' },
  { label: 'Swift', value: 'Swift' },
  { label: 'TypeScript', value: 'TypeScript' },
  { label: 'Rust', value: 'Rust' },
  { label: 'C++', value: 'C++' },
  { label: '.NET', value: '.NET' },
  { label: 'Khác', value: 'other' },
];

const frameworkOptions = [
  { label: 'Django', value: 'Django' },
  { label: 'Spring Boot', value: 'Spring Boot' },
  { label: 'React', value: 'React' },
  { label: 'Angular', value: 'Angular' },
  { label: 'Vue.js', value: 'Vue.js' },
  { label: 'Laravel', value: 'Laravel' },
  { label: 'Ruby on Rails', value: 'Ruby on Rails' },
  { label: 'Express.js', value: 'Express.js' },
  { label: 'Flask', value: 'Flask' },
  { label: 'FastAPI', value: 'FastAPI' },
  { label: 'ASP.NET', value: 'ASP.NET' },
  { label: 'Flutter', value: 'Flutter' },
  { label: 'Next.js', value: 'Next.js' },
  { label: 'Nuxt.js', value: 'Nuxt.js' },
  { label: 'Khác', value: 'other' },
];

const databaseNameOptions = [
  { label: 'PostgreSQL', value: 'PostgreSQL' },
  { label: 'MySQL', value: 'MySQL' },
  { label: 'SQL Server', value: 'SQL Server' },
  { label: 'Oracle Database', value: 'Oracle Database' },
  { label: 'MongoDB', value: 'MongoDB' },
  { label: 'Redis', value: 'Redis' },
  { label: 'MariaDB', value: 'MariaDB' },
  { label: 'Cassandra', value: 'Cassandra' },
  { label: 'Elasticsearch', value: 'Elasticsearch' },
  { label: 'SQLite', value: 'SQLite' },
  { label: 'DynamoDB', value: 'DynamoDB' },
  { label: 'Firebase', value: 'Firebase' },
  { label: 'Khác', value: 'other' },
];

const dataClassificationTypeOptions = [
  { label: 'Công khai', value: 'Công khai' },
  { label: 'Nội bộ', value: 'Nội bộ' },
  { label: 'Hạn chế', value: 'Hạn chế' },
  { label: 'Bí mật', value: 'Bí mật' },
  { label: 'Tối mật', value: 'Tối mật' },
  { label: 'Khác', value: 'other' },
];

const dataExchangeMethodOptions = [
  { label: 'API REST', value: 'API REST' },
  { label: 'API SOAP', value: 'API SOAP' },
  { label: 'File Transfer', value: 'File Transfer' },
  { label: 'Database Link', value: 'Database Link' },
  { label: 'Message Queue', value: 'Message Queue' },
  { label: 'ETL', value: 'ETL' },
  { label: 'Manual', value: 'Manual' },
  { label: 'Khác', value: 'other' },
];

/**
 * Predefined options for architecture and database fields
 */
const architectureTypeOptions = [
  { label: 'Monolithic', value: 'monolithic' },
  { label: 'Modular', value: 'modular' },
  { label: 'Microservices', value: 'microservices' },
  { label: 'SOA', value: 'soa' },
  { label: 'Serverless', value: 'serverless' },
  { label: 'SaaS', value: 'saas' },
  { label: 'Khác', value: 'other' },
];

const containerizationOptions = [
  { label: 'Docker', value: 'docker' },
  { label: 'Kubernetes', value: 'kubernetes' },
  { label: 'OpenShift', value: 'openshift' },
  { label: 'Không sử dụng', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const apiStyleOptions = [
  { label: 'REST API', value: 'rest' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'gRPC', value: 'grpc' },
  { label: 'SOAP', value: 'soap' },
  { label: 'Khác', value: 'other' },
];

const messagingQueueOptions = [
  { label: 'Apache Kafka', value: 'kafka' },
  { label: 'RabbitMQ', value: 'rabbitmq' },
  { label: 'ActiveMQ', value: 'activemq' },
  { label: 'Redis Pub/Sub', value: 'redis_pubsub' },
  { label: 'Không sử dụng', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const cacheSystemOptions = [
  { label: 'Redis', value: 'redis' },
  { label: 'Memcached', value: 'memcached' },
  { label: 'Không sử dụng', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const searchEngineOptions = [
  { label: 'Elasticsearch', value: 'elasticsearch' },
  { label: 'Apache Solr', value: 'solr' },
  { label: 'Không sử dụng', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const reportingBiToolOptions = [
  { label: 'Microsoft Power BI', value: 'powerbi' },
  { label: 'Tableau', value: 'tableau' },
  { label: 'Metabase', value: 'metabase' },
  { label: 'Apache Superset', value: 'superset' },
  { label: 'Tự phát triển', value: 'custom' },
  { label: 'Không có', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const sourceRepositoryOptions = [
  { label: 'GitLab', value: 'gitlab' },
  { label: 'GitHub', value: 'github' },
  { label: 'Bitbucket', value: 'bitbucket' },
  { label: 'Azure DevOps', value: 'azure_devops' },
  { label: 'On-premise Git', value: 'on_premise' },
  { label: 'Không quản lý', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const cicdToolOptions = [
  { label: 'Jenkins', value: 'jenkins' },
  { label: 'GitLab CI/CD', value: 'gitlab_ci' },
  { label: 'GitHub Actions', value: 'github_actions' },
  { label: 'Azure Pipelines', value: 'azure_pipelines' },
  { label: 'CircleCI', value: 'circle_ci' },
  { label: 'Travis CI', value: 'travis_ci' },
  { label: 'Khác', value: 'other' },
];

const fileStorageTypeOptions = [
  { label: 'File Server', value: 'file_server' },
  { label: 'Object Storage (S3, MinIO)', value: 'object_storage' },
  { label: 'NAS', value: 'nas' },
  { label: 'Database BLOB', value: 'database_blob' },
  { label: 'Không lưu file', value: 'none' },
  { label: 'Khác', value: 'other' },
];

/**
 * Phase 3: Predefined options for checkbox groups
 */
const dataSourcesOptions = [
  { label: 'User Input', value: 'user_input' },
  { label: 'External APIs', value: 'external_apis' },
  { label: 'Database Sync', value: 'database_sync' },
  { label: 'File Import', value: 'file_import' },
  { label: 'IoT Sensors', value: 'iot_sensors' },
  { label: 'Third-party Services', value: 'third_party_services' },
  { label: 'Legacy Systems', value: 'legacy_systems' },
  { label: 'Khác', value: 'other' },
];

const userTypesOptions = [
  { label: 'Lãnh đạo nội bộ', value: 'internal_leadership' },
  { label: 'Cán bộ nội bộ', value: 'internal_staff' },
  { label: 'Người thẩm định nội bộ', value: 'internal_reviewer' },
  { label: 'Doanh nghiệp', value: 'external_business' },
  { label: 'Người dân', value: 'external_citizen' },
  { label: 'Địa phương', value: 'external_local' },
  { label: 'Cơ quan khác', value: 'external_agency' },
  { label: 'Khác', value: 'other' },
];

const businessObjectivesOptions = [
  { label: 'Số hóa quy trình nghiệp vụ', value: 'digitize_processes' },
  { label: 'Cải thiện dịch vụ công', value: 'improve_public_services' },
  { label: 'Tăng cường minh bạch', value: 'increase_transparency' },
  { label: 'Giảm thời gian xử lý', value: 'reduce_processing_time' },
  { label: 'Tích hợp liên thông', value: 'integration' },
  { label: 'Báo cáo thống kê', value: 'reporting' },
  { label: 'Khác', value: 'other' },
];

/**
 * Additional option arrays
 */
const apiGatewayOptions = [
  { label: 'Kong', value: 'kong' },
  { label: 'AWS API Gateway', value: 'aws_api_gateway' },
  { label: 'Azure API Management', value: 'azure_api_management' },
  { label: 'Google Apigee', value: 'google_apigee' },
  { label: 'Nginx', value: 'nginx' },
  { label: 'Traefik', value: 'traefik' },
  { label: 'Không có', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const deploymentLocationOptions = [
  { label: 'Data Center', value: 'datacenter' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Hybrid', value: 'hybrid' },
];

const securityLevelOptions = [
  { label: 'Cấp 1', value: '1' },
  { label: 'Cấp 2', value: '2' },
  { label: 'Cấp 3', value: '3' },
  { label: 'Cấp 4', value: '4' },
  { label: 'Cấp 5', value: '5' },
];

const computeTypeOptions = [
  { label: 'Virtual Machine', value: 'vm' },
  { label: 'Container', value: 'container' },
  { label: 'Serverless', value: 'serverless' },
  { label: 'Bare Metal', value: 'bare_metal' },
];

const deploymentFrequencyOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'On Demand', value: 'on_demand' },
];

const apiVersioningStandardOptions = [
  { label: 'Semantic Versioning (v1.2.3)', value: 'semantic' },
  { label: 'Date-based (2024-01-20)', value: 'date_based' },
  { label: 'URL-based (/v1, /v2)', value: 'url_based' },
  { label: 'Header-based', value: 'header_based' },
  { label: 'Không có', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const integrationReadinessOptions = [
  { label: 'Dễ chuẩn hóa', value: 'easy_to_standardize' },
  { label: 'Có API tốt', value: 'good_api' },
  { label: 'Dữ liệu rõ nguồn gốc', value: 'clear_data_source' },
  { label: 'Có thể tách dịch vụ', value: 'can_split_service' },
];

const blockersOptions = [
  { label: 'Công nghệ quá cũ', value: 'outdated_tech' },
  { label: 'Không có tài liệu', value: 'no_documentation' },
  { label: 'Không có API', value: 'no_api' },
  { label: 'Dữ liệu không sạch', value: 'dirty_data' },
  { label: 'Phụ thuộc nhà thầu', value: 'vendor_dependency' },
];

const recommendationOptions = [
  { label: 'Giữ nguyên', value: 'keep' },
  { label: 'Nâng cấp', value: 'upgrade' },
  { label: 'Thay thế', value: 'replace' },
  { label: 'Hợp nhất', value: 'merge' },
];

/**
 * Quick Input - CharField conversion options
 */
const backendTechOptions = [
  { label: 'Node.js', value: 'nodejs' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C#/.NET', value: 'dotnet' },
  { label: 'Go', value: 'go' },
  { label: 'PHP', value: 'php' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Rust', value: 'rust' },
  { label: 'Scala', value: 'scala' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Khác', value: 'other' },
];

const frontendTechOptions = [
  { label: 'React', value: 'react' },
  { label: 'Vue.js', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Next.js', value: 'nextjs' },
  { label: 'Nuxt.js', value: 'nuxtjs' },
  { label: 'jQuery', value: 'jquery' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Ember.js', value: 'ember' },
  { label: 'Backbone.js', value: 'backbone' },
  { label: 'HTML/CSS/JS thuần', value: 'vanilla' },
  { label: 'Khác', value: 'other' },
];

const hostingPlatformOptions = [
  { label: 'Cloud (AWS, Azure, GCP)', value: 'cloud' },
  { label: 'On-premise', value: 'on_premise' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Khác', value: 'other' },
];

const supportLevelOptions = [
  { label: '24/7', value: '24_7' },
  { label: 'Business hours (8x5)', value: 'business_hours' },
  { label: 'Business days (8x5)', value: 'business_days' },
  { label: 'On-demand', value: 'on_demand' },
  { label: 'Best effort', value: 'best_effort' },
  { label: 'None', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const apiStandardOptions = [
  { label: 'OpenAPI 3.0', value: 'openapi_3' },
  { label: 'OpenAPI 2.0 (Swagger)', value: 'swagger' },
  { label: 'SOAP WSDL', value: 'soap_wsdl' },
  { label: 'GraphQL Schema', value: 'graphql_schema' },
  { label: 'gRPC', value: 'grpc' },
  { label: 'AsyncAPI', value: 'asyncapi' },
  { label: 'RAML', value: 'raml' },
  { label: 'Không có', value: 'none' },
  { label: 'Khác', value: 'other' },
];

/**
 * Phase 4 Part 2: Additional CharField conversion options
 */
const serverConfigurationOptions = [
  { label: 'Cloud VM (AWS EC2, Azure VM, GCP Compute)', value: 'cloud_vm' },
  { label: 'Physical Server', value: 'physical_server' },
  { label: 'Container (Docker, K8s)', value: 'container' },
  { label: 'Serverless (Lambda, Cloud Functions)', value: 'serverless' },
  { label: 'Managed Service (RDS, App Service)', value: 'managed' },
  { label: 'VPS', value: 'vps' },
  { label: 'Bare Metal', value: 'bare_metal' },
  { label: 'Khác', value: 'other' },
];

const storageCapacityOptions = [
  { label: '< 100GB', value: 'under_100gb' },
  { label: '100GB - 1TB', value: '100gb_1tb' },
  { label: '1TB - 10TB', value: '1tb_10tb' },
  { label: '10TB - 100TB', value: '10tb_100tb' },
  { label: '100TB - 1PB', value: '100tb_1pb' },
  { label: '> 1PB', value: 'over_1pb' },
  { label: 'Khác', value: 'other' },
];

const backupPlanOptions = [
  { label: 'Daily (hàng ngày)', value: 'daily' },
  { label: 'Weekly (hàng tuần)', value: 'weekly' },
  { label: 'Real-time/Continuous', value: 'realtime' },
  { label: 'Hourly (mỗi giờ)', value: 'hourly' },
  { label: 'Monthly (hàng tháng)', value: 'monthly' },
  { label: 'On-demand', value: 'on_demand' },
  { label: 'None (không có)', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const disasterRecoveryOptions = [
  { label: 'Hot Standby (tức thì)', value: 'hot_standby' },
  { label: 'Warm Standby (vài phút)', value: 'warm_standby' },
  { label: 'Cold Backup (vài giờ)', value: 'cold_backup' },
  { label: 'Cloud DR', value: 'cloud_dr' },
  { label: 'Geographic Redundancy', value: 'geo_redundancy' },
  { label: 'None (không có)', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const complianceStandardsOptions = [
  { label: 'ISO 27001', value: 'iso_27001' },
  { label: 'GDPR', value: 'gdpr' },
  { label: 'SOC 2', value: 'soc2' },
  { label: 'HIPAA', value: 'hipaa' },
  { label: 'PCI DSS', value: 'pci_dss' },
  { label: 'Luật An ninh mạng VN', value: 'vietnam_cybersecurity' },
  { label: 'Nghị định 85/2016', value: 'decree_85' },
  { label: 'Không có', value: 'none' },
  { label: 'Khác', value: 'other' },
];

const dataVolumeOptions = [
  { label: '< 1GB', value: 'under_1gb' },
  { label: '1GB - 100GB', value: '1gb_100gb' },
  { label: '100GB - 1TB', value: '100gb_1tb' },
  { label: '1TB - 10TB', value: '1tb_10tb' },
  { label: '10TB - 100TB', value: '10tb_100tb' },
  { label: '> 100TB', value: 'over_100tb' },
  { label: 'Khác', value: 'other' },
];

/**
 * Phase 4 Part 3: JSONField checkbox options
 */
const businessProcessesOptions = [
  { label: 'Quản lý hồ sơ', value: 'document_management' },
  { label: 'Phê duyệt', value: 'approval' },
  { label: 'Tra cứu', value: 'lookup' },
  { label: 'Báo cáo', value: 'reporting' },
  { label: 'Đăng ký', value: 'registration' },
  { label: 'Thanh toán', value: 'payment' },
  { label: 'Giám sát', value: 'monitoring' },
  { label: 'Thống kê', value: 'statistics' },
  { label: 'Khác', value: 'other' },
];

const integratedInternalSystemsOptions = [
  { label: 'Hệ thống quản lý văn bản', value: 'document_management_system' },
  { label: 'Hệ thống quản lý nhân sự', value: 'hr_system' },
  { label: 'Hệ thống tài chính', value: 'finance_system' },
  { label: 'Hệ thống báo cáo', value: 'reporting_system' },
  { label: 'Portal nội bộ', value: 'internal_portal' },
  { label: 'SSO/Identity', value: 'sso_identity' },
  { label: 'Email/Messaging', value: 'email_system' },
  { label: 'File Storage', value: 'file_storage' },
  { label: 'Khác', value: 'other' },
];

const integratedExternalSystemsOptions = [
  { label: 'VNeID', value: 'vneid' },
  { label: 'LGSP (Nền tảng tích hợp, chia sẻ)', value: 'lgsp' },
  { label: 'Cổng Dịch vụ công Quốc gia', value: 'national_public_service_portal' },
  { label: 'Hệ thống Đăng ký kinh doanh', value: 'business_registration' },
  { label: 'Hệ thống Thuế', value: 'tax_system' },
  { label: 'Hệ thống Hải quan', value: 'customs' },
  { label: 'BHXH (Bảo hiểm xã hội)', value: 'social_insurance' },
  { label: 'Cơ sở dữ liệu Quốc gia về dân cư', value: 'national_population_db' },
  { label: 'Đăng ký đất đai', value: 'land_registration' },
  { label: 'Khác', value: 'other' },
];

/**
 * Section 5: Integration Connection List Component
 * Complex dynamic form for managing integration connections
 */
interface IntegrationConnection {
  source_system: string;
  target_system: string;
  data_objects: string;
  integration_method: string[];
  frequency: string;
  error_handling?: string;
  has_api_docs: boolean;
  notes?: string;
}

const IntegrationConnectionList = ({ value = [], onChange }: any) => {
  const [connections, setConnections] = useState<IntegrationConnection[]>(value || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    setConnections(value || []);
  }, [value]);

  const integrationMethodOptions = [
    { label: 'API REST', value: 'api_rest' },
    { label: 'API SOAP', value: 'api_soap' },
    { label: 'API GraphQL', value: 'api_graphql' },
    { label: 'File Transfer', value: 'file_transfer' },
    { label: 'Database Link', value: 'database_link' },
    { label: 'Message Queue', value: 'message_queue' },
    { label: 'Thủ công', value: 'manual' },
    { label: 'Khác', value: 'other' },
  ];

  const frequencyOptions = [
    { label: 'Real-time', value: 'realtime' },
    { label: 'Near real-time (< 1 phút)', value: 'near_realtime' },
    { label: 'Batch - Mỗi giờ', value: 'batch_hourly' },
    { label: 'Batch - Hàng ngày', value: 'batch_daily' },
    { label: 'Batch - Hàng tuần', value: 'batch_weekly' },
    { label: 'Batch - Hàng tháng', value: 'batch_monthly' },
    { label: 'On-demand', value: 'on_demand' },
  ];

  const handleAdd = () => {
    setEditingIndex(connections.length);
    editForm.resetFields();
    editForm.setFieldsValue({ has_api_docs: false });
  };

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      const newConnections = [...connections];
      if (editingIndex !== null) {
        if (editingIndex < connections.length) {
          newConnections[editingIndex] = values;
        } else {
          newConnections.push(values);
        }
        setConnections(newConnections);
        onChange?.(newConnections);
        setEditingIndex(null);
        editForm.resetFields();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    editForm.setFieldsValue(connections[index]);
  };

  const handleDelete = (index: number) => {
    const newConnections = connections.filter((_, i) => i !== index);
    setConnections(newConnections);
    onChange?.(newConnections);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    editForm.resetFields();
  };

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 16 }}>
      {/* Connection List */}
      {connections.map((conn, index) => (
        <Card
          key={index}
          size="small"
          style={{ marginBottom: 12 }}
          title={`Kết nối ${index + 1}: ${conn.source_system} → ${conn.target_system}`}
          extra={
            editingIndex === index ? null : (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(index)}>
                  Sửa
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(index)}
                >
                  Xóa
                </Button>
              </Space>
            )
          }
        >
          {editingIndex === index ? (
            <Form form={editForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Hệ thống nguồn"
                    name="source_system"
                    rules={[{ required: true, message: 'Vui lòng nhập hệ thống nguồn' }]}
                  >
                    <Input placeholder="VD: Hệ thống A" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Hệ thống đích"
                    name="target_system"
                    rules={[{ required: true, message: 'Vui lòng nhập hệ thống đích' }]}
                  >
                    <Input placeholder="VD: Hệ thống B" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Đối tượng dữ liệu trao đổi"
                    name="data_objects"
                    rules={[{ required: true, message: 'Vui lòng nhập đối tượng dữ liệu' }]}
                  >
                    <TextArea
                      rows={2}
                      placeholder="VD: Thông tin nhân viên, phòng ban, chức vụ"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Phương thức tích hợp"
                    name="integration_method"
                    initialValue={[]}
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một phương thức' }]}
                    tooltip="Có thể chọn nhiều phương thức (API REST + Message Queue)"
                  >
                    <CheckboxGroupWithOther
                      options={integrationMethodOptions}
                      customInputPlaceholder="Nhập phương thức tích hợp khác..."
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tần suất"
                    name="frequency"
                    rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
                  >
                    <Select options={frequencyOptions} placeholder="Chọn tần suất" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Xử lý lỗi/Retry" name="error_handling">
                    <TextArea
                      rows={2}
                      placeholder="VD: Retry 3 lần, delay 5 phút, gửi email cảnh báo"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Có tài liệu API?" name="has_api_docs" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Ghi chú" name="notes">
                    <TextArea rows={2} placeholder="Ghi chú thêm" />
                  </Form.Item>
                </Col>
              </Row>
              <Space>
                <Button type="primary" onClick={handleSave}>
                  Lưu
                </Button>
                <Button onClick={handleCancel}>Hủy</Button>
              </Space>
            </Form>
          ) : (
            <div>
              <p>
                <strong>Dữ liệu:</strong> {conn.data_objects}
              </p>
              <p>
                <strong>Phương thức:</strong>{' '}
                {Array.isArray(conn.integration_method)
                  ? conn.integration_method
                      .map((m) => integrationMethodOptions.find((o) => o.value === m)?.label || m)
                      .join(', ')
                  : conn.integration_method}
              </p>
              <p>
                <strong>Tần suất:</strong>{' '}
                {frequencyOptions.find((o) => o.value === conn.frequency)?.label}
              </p>
              {conn.has_api_docs && (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Có tài liệu API
                </Tag>
              )}
            </div>
          )}
        </Card>
      ))}

      {/* Add New Button */}
      {editingIndex === null && (
        <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm kết nối tích hợp
        </Button>
      )}

      {/* Add Form (when adding new) */}
      {editingIndex === connections.length && (
        <Card size="small" style={{ marginTop: 12 }} title="Thêm kết nối mới">
          <Form form={editForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Hệ thống nguồn"
                  name="source_system"
                  rules={[{ required: true, message: 'Vui lòng nhập hệ thống nguồn' }]}
                >
                  <Input placeholder="VD: Hệ thống A" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Hệ thống đích"
                  name="target_system"
                  rules={[{ required: true, message: 'Vui lòng nhập hệ thống đích' }]}
                >
                  <Input placeholder="VD: Hệ thống B" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Đối tượng dữ liệu trao đổi"
                  name="data_objects"
                  rules={[{ required: true, message: 'Vui lòng nhập đối tượng dữ liệu' }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="VD: Thông tin nhân viên, phòng ban, chức vụ"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Phương thức tích hợp"
                  name="integration_method"
                  initialValue={[]}
                  rules={[{ required: true, message: 'Vui lòng chọn ít nhất một phương thức' }]}
                  tooltip="Có thể chọn nhiều phương thức (API REST + Message Queue)"
                >
                  <CheckboxGroupWithOther
                    options={integrationMethodOptions}
                    customInputPlaceholder="Nhập phương thức tích hợp khác..."
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tần suất"
                  name="frequency"
                  rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
                >
                  <Select options={frequencyOptions} placeholder="Chọn tần suất" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Xử lý lỗi/Retry" name="error_handling">
                  <TextArea
                    rows={2}
                    placeholder="VD: Retry 3 lần, delay 5 phút, gửi email cảnh báo"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Có tài liệu API?" name="has_api_docs" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Ghi chú" name="notes">
                  <TextArea rows={2} placeholder="Ghi chú thêm" />
                </Form.Item>
              </Col>
            </Row>
            <Space>
              <Button type="primary" onClick={handleSave}>
                Lưu
              </Button>
              <Button onClick={handleCancel}>Hủy</Button>
            </Space>
          </Form>
        </Card>
      )}
    </div>
  );
};

// Tab save state tracking interface
interface TabSaveState {
  [tabKey: string]: {
    isDirty: boolean;      // Has unsaved changes
    isSaved: boolean;      // Has been saved at least once
    lastSavedAt: Date | null;
  };
}

const SystemEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  // Tab navigation save flow state
  const [tabStates, setTabStates] = useState<TabSaveState>({
    '1': { isDirty: false, isSaved: false, lastSavedAt: null },
    '2': { isDirty: false, isSaved: false, lastSavedAt: null },
    '3': { isDirty: false, isSaved: false, lastSavedAt: null },
    '4': { isDirty: false, isSaved: false, lastSavedAt: null },
    '5': { isDirty: false, isSaved: false, lastSavedAt: null },
    '6': { isDirty: false, isSaved: false, lastSavedAt: null },
    '7': { isDirty: false, isSaved: false, lastSavedAt: null },
    '8': { isDirty: false, isSaved: false, lastSavedAt: null },
    '9': { isDirty: false, isSaved: false, lastSavedAt: null },
  });
  const [currentTab, setCurrentTab] = useState<string>('1');
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    fetchOrganizations();
    checkUserRole();
    fetchSystemData();
  }, [id]);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/organizations/');
      setOrganizations(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const checkUserRole = async () => {
    try {
      const response = await api.get('/auth/me/');
      setUserRole(response.data.role);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  // Track form field changes
  const handleFormChange = () => {
    setTabStates(prev => ({
      ...prev,
      [currentTab]: {
        ...prev[currentTab],
        isDirty: true,
      },
    }));
  };

  // Navigation guard - check if current tab has unsaved changes
  const handleTabChange = (newTabKey: string) => {
    const currentState = tabStates[currentTab];

    if (currentState.isDirty && !currentState.isSaved) {
      setPendingTab(newTabKey);
      setShowWarningModal(true);
    } else {
      setCurrentTab(newTabKey);
    }
  };

  // Save current tab (draft save)
  const handleSaveCurrentTab = async () => {
    try {
      const allValues = form.getFieldsValue();

      // BUG-001 FIX: Filter out null/undefined/empty values to prevent sending garbage data
      const cleanedValues = Object.entries(allValues).reduce((acc, [key, value]) => {
        // Skip null, undefined, or empty string values
        if (value === null || value === undefined || value === '') {
          return acc;
        }

        // For nested objects (like architecture_data, integration_data, etc.)
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Check if object has any non-empty keys
          const nonEmptyKeys = Object.entries(value).filter(
            ([_, v]) => v !== null && v !== undefined && v !== ''
          );

          // Only include if object has at least one non-empty field
          if (nonEmptyKeys.length > 0) {
            acc[key] = value;
          }
        }
        // For arrays, only include if not empty
        else if (Array.isArray(value)) {
          if (value.length > 0) {
            acc[key] = value;
          }
        }
        // For primitives, include as-is
        else {
          acc[key] = value;
        }

        return acc;
      }, {} as any);

      setLoading(true);

      // For edit mode, always PATCH existing system
      await api.patch(`/systems/${id}/`, cleanedValues);

      setTabStates(prev => ({
        ...prev,
        [currentTab]: {
          isDirty: false,
          isSaved: true,
          lastSavedAt: new Date(),
        },
      }));

      message.success('Đã lưu thông tin!');
    } catch (error: any) {
      console.error('Failed to save tab:', error);

      // BUG-001 FIX: Show specific validation errors instead of generic message
      if (error.response?.data) {
        const errorData = error.response.data;

        // Handle Django REST Framework validation errors (object with field names)
        if (typeof errorData === 'object' && !errorData.message) {
          const errorMessages: string[] = [];

          Object.entries(errorData).forEach(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : String(messages);
            errorMessages.push(`${field}: ${msg}`);
          });

          // Show all errors
          errorMessages.forEach(msg => message.error(msg, 5)); // 5 seconds duration
        }
        // Handle generic error message
        else {
          message.error(errorData.message || errorData.detail || 'Lỗi khi lưu thông tin');
        }
      } else {
        message.error('Lỗi khi lưu thông tin. Vui lòng kiểm tra kết nối mạng.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Save & Continue (save + move to next tab)
  const handleSaveAndContinue = async () => {
    await handleSaveCurrentTab();

    const nextTabKey = (parseInt(currentTab) + 1).toString();
    if (parseInt(nextTabKey) <= 9) {
      setCurrentTab(nextTabKey);
    }
  };

  // Final Save (submit form)
  const handleFinalSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      setLoading(true);

      // Final update - mark as not draft
      await api.patch(`/systems/${id}/`, { ...values, is_draft: false });
      message.success('Cập nhật hệ thống thành công!');

      navigate('/systems');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Vui lòng kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }
  };

  // Render buttons based on current tab
  const renderActionButtons = () => {
    const isLastTab = currentTab === '9';
    const isDirty = tabStates[currentTab].isDirty;

    return (
      <Space>
        <Button onClick={handleCancel}>Hủy</Button>

        <Button onClick={handleSaveCurrentTab} disabled={!isDirty}>
          Lưu
        </Button>

        {!isLastTab ? (
          <Button
            type="primary"
            onClick={handleSaveAndContinue}
            icon={<ArrowRightOutlined />}
          >
            Lưu & Tiếp tục
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={handleFinalSave}
            icon={<SaveOutlined />}
          >
            Lưu hệ thống
          </Button>
        )}
      </Space>
    );
  };

  const fetchSystemData = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/systems/${id}/`);
      const systemData = response.data;

      // Pre-fill form with existing data
      form.setFieldsValue({
        ...systemData,
        // Ensure arrays are properly initialized
        business_objectives: systemData.business_objectives || [],
        business_processes: systemData.business_processes || [],
        user_types: systemData.user_types || [],
        data_sources: systemData.data_sources || [],
        integrated_internal_systems: systemData.integrated_internal_systems || [],
        integrated_external_systems: systemData.integrated_external_systems || [],
        api_list: systemData.api_list || [],
        // Initialize integration_connections from nested response
        integration_connections_data: systemData.integration_connections || [],
      });
    } catch (error: any) {
      console.error('Failed to fetch system data:', error);
      message.error('Không thể tải thông tin hệ thống!');
      navigate('/systems');
    } finally {
      setFetching(false);
    }
  };

  const handleCancel = () => {
    navigate('/systems');
  };

  // Helper component for dynamic list input
  const DynamicListInput = ({ value = [], onChange, placeholder }: any) => {
    const [items, setItems] = useState<string[]>(value || []);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      setItems(value || []);
    }, [value]);

    const handleAdd = () => {
      if (inputValue.trim()) {
        const newItems = [...items, inputValue.trim()];
        setItems(newItems);
        onChange?.(newItems);
        setInputValue('');
      }
    };

    const handleRemove = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      onChange?.(newItems);
    };

    return (
      <div>
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleAdd}
            placeholder={placeholder}
          />
          <Button type="primary" onClick={handleAdd}>
            Thêm
          </Button>
        </Space.Compact>
        <div>
          {items.map((item, index) => (
            <Tag
              key={index}
              closable
              onClose={() => handleRemove(index)}
              style={{ marginBottom: 8 }}
            >
              {item}
            </Tag>
          ))}
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <InfoCircleOutlined /> Thông tin cơ bản
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            {/* Organization - admin only */}
            {userRole === 'admin' && (
              <Col span={12}>
                <Form.Item
                  label="Tổ chức"
                  name="org"
                  rules={[{ required: true, message: 'Vui lòng chọn tổ chức' }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn tổ chức"
                    options={organizations.map((org) => ({
                      label: org.name,
                      value: org.id,
                    }))}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
            )}

            <Col span={12}>
              <Form.Item label="Mã hệ thống" name="system_code">
                <Input disabled placeholder="Mã tự động" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tên hệ thống"
                name="system_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên hệ thống' }]}
              >
                <Input placeholder="Nhập tên hệ thống" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Tên tiếng Anh" name="system_name_en">
                <Input placeholder="Nhập tên tiếng Anh" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Mô tả"
                name="purpose"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <TextArea rows={4} placeholder="Mô tả chức năng và mục đích của hệ thống" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Select.Option value="operating">Đang vận hành</Select.Option>
                  <Select.Option value="planning">Đang lập kế hoạch</Select.Option>
                  <Select.Option value="development">Đang phát triển</Select.Option>
                  <Select.Option value="testing">Đang thử nghiệm</Select.Option>
                  <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
                  <Select.Option value="maintenance">Bảo trì</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Mức độ quan trọng"
                name="criticality_level"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ quan trọng' }]}
                tooltip="Đã bỏ 'Cực kỳ quan trọng' - chỉ còn 3 mức"
              >
                <Select>
                  <Select.Option value="high">Quan trọng</Select.Option>
                  <Select.Option value="medium">Trung bình</Select.Option>
                  <Select.Option value="low">Thấp</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Section 1: New Required Fields */}
            <Col span={12}>
              <Form.Item
                label="Phạm vi sử dụng"
                name="scope"
                rules={[{ required: true, message: 'Vui lòng chọn phạm vi sử dụng' }]}
                tooltip="Phạm vi sử dụng của hệ thống"
              >
                <Select>
                  <Select.Option value="internal_unit">Nội bộ đơn vị</Select.Option>
                  <Select.Option value="org_wide">Toàn bộ</Select.Option>
                  <Select.Option value="external">Bên ngoài</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Nhóm hệ thống"
                name="system_group"
                rules={[{ required: true, message: 'Vui lòng chọn nhóm hệ thống' }]}
                tooltip="Dropdown với tùy chọn 'Khác' cho phép nhập tùy chỉnh"
              >
                <SelectWithOther
                  options={systemGroupOptions}
                  placeholder="Chọn nhóm hệ thống"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <AppstoreOutlined /> Bối cảnh nghiệp vụ
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Mục tiêu nghiệp vụ"
                name="business_objectives"
                tooltip="Khuyến nghị tối đa 5 mục tiêu để tập trung"
              >
                <CheckboxGroupWithOther
                  options={businessObjectivesOptions}
                  customInputPlaceholder="Nhập mục tiêu nghiệp vụ khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Quy trình nghiệp vụ chính" name="business_processes">
                <CheckboxGroupWithOther
                  options={businessProcessesOptions}
                  customInputPlaceholder="Nhập quy trình nghiệp vụ khác..."
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Có đủ hồ sơ phân tích thiết kế?"
                name="has_design_documents"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Đối tượng sử dụng" name="user_types">
                <CheckboxGroupWithOther
                  options={userTypesOptions}
                  customInputPlaceholder="Nhập đối tượng sử dụng khác..."
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số lượng người dùng hàng năm" name="annual_users">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập số lượng người dùng"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            {/* Section 2: User Metrics */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                Thống kê người dùng
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tổng số tài khoản"
                name="total_accounts"
                tooltip="Tổng số tài khoản đã tạo trong hệ thống"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập tổng số tài khoản"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="MAU (Monthly Active Users)"
                name="users_mau"
                tooltip="Số người dùng hoạt động hàng tháng"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập MAU"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="DAU (Daily Active Users)"
                name="users_dau"
                tooltip="Số người dùng hoạt động hàng ngày"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập DAU"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Số đơn vị/địa phương sử dụng"
                name="num_organizations"
                tooltip="Số đơn vị/địa phương sử dụng hệ thống"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập số đơn vị"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <DatabaseOutlined /> Kiến trúc công nghệ
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Ngôn ngữ lập trình"
                name="programming_language"
                tooltip="Chọn ngôn ngữ lập trình chính của hệ thống"
              >
                <SelectWithOther
                  options={programmingLanguageOptions}
                  placeholder="Chọn ngôn ngữ lập trình"
                  customInputPlaceholder="Nhập ngôn ngữ lập trình khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Framework/Thư viện"
                name="framework"
                tooltip="Chọn framework chính của hệ thống"
              >
                <SelectWithOther
                  options={frameworkOptions}
                  placeholder="Chọn framework"
                  customInputPlaceholder="Nhập framework khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Cơ sở dữ liệu"
                name="database_name"
                tooltip="Chọn cơ sở dữ liệu chính của hệ thống"
              >
                <SelectWithOther
                  options={databaseNameOptions}
                  placeholder="Chọn cơ sở dữ liệu"
                  customInputPlaceholder="Nhập cơ sở dữ liệu khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Nền tảng triển khai"
                name="hosting_platform"
                tooltip="Chọn nền tảng triển khai của hệ thống"
              >
                <SelectWithOther
                  options={hostingPlatformOptions}
                  placeholder="Chọn nền tảng triển khai"
                  customInputPlaceholder="Nhập nền tảng khác..."
                />
              </Form.Item>
            </Col>

            {/* Quick Input - Backend & Frontend Tech (Multi-select) */}
            <Col span={24}>
              <Form.Item
                label="Backend Technology"
                name="backend_tech"
                initialValue={[]}
                tooltip="Có thể chọn nhiều công nghệ backend (Node.js + Python + Go)"
              >
                <CheckboxGroupWithOther
                  options={backendTechOptions}
                  customInputPlaceholder="Nhập công nghệ backend khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Frontend Technology"
                name="frontend_tech"
                initialValue={[]}
                tooltip="Có thể chọn nhiều công nghệ frontend (React + Vue + jQuery)"
              >
                <CheckboxGroupWithOther
                  options={frontendTechOptions}
                  customInputPlaceholder="Nhập công nghệ frontend khác..."
                />
              </Form.Item>
            </Col>

            {/* Architecture Fields */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginTop: 16, marginBottom: 16 }}>
                Kiến trúc ứng dụng
              </Text>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Loại kiến trúc"
                name="architecture_type"
                initialValue={[]}
                tooltip="Có thể chọn nhiều (Microservices + Serverless hybrid)"
              >
                <CheckboxGroupWithOther
                  options={architectureTypeOptions}
                  customInputPlaceholder="Nhập loại kiến trúc khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Container hóa"
                name="containerization"
                initialValue={[]}
                tooltip="Có thể chọn nhiều (Docker + Kubernetes + OpenShift)"
              >
                <CheckboxGroupWithOther
                  options={containerizationOptions}
                  customInputPlaceholder="Nhập công nghệ container khác..."
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Multi-tenant" name="is_multi_tenant" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Phân lớp (Layered)" name="has_layered_architecture" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Chi tiết phân lớp" name="layered_architecture_details">
                <TextArea rows={2} placeholder="VD: Presentation, Business Logic, Data Access, Integration" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="API Style"
                name="api_style"
                initialValue={[]}
                tooltip="Có thể chọn nhiều (REST + GraphQL + gRPC)"
              >
                <CheckboxGroupWithOther
                  options={apiStyleOptions}
                  customInputPlaceholder="Nhập API style khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Messaging/Queue"
                name="messaging_queue"
                initialValue={[]}
                tooltip="Có thể chọn nhiều (RabbitMQ + Kafka + Redis)"
              >
                <CheckboxGroupWithOther
                  options={messagingQueueOptions}
                  customInputPlaceholder="Nhập message queue khác..."
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Cache System" name="cache_system">
                <SelectWithOther
                  options={cacheSystemOptions}
                  placeholder="Chọn hệ thống cache"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Search Engine" name="search_engine">
                <SelectWithOther
                  options={searchEngineOptions}
                  placeholder="Chọn công cụ tìm kiếm"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Reporting/BI Tool" name="reporting_bi_tool">
                <SelectWithOther
                  options={reportingBiToolOptions}
                  placeholder="Chọn công cụ báo cáo/BI"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Source Repository" name="source_repository">
                <SelectWithOther
                  options={sourceRepositoryOptions}
                  placeholder="Chọn hệ thống quản lý mã nguồn"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="CI/CD Pipeline" name="has_cicd" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="CI/CD Tool" name="cicd_tool">
                <SelectWithOther
                  options={cicdToolOptions}
                  placeholder="Chọn công cụ CI/CD"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Automated Testing" name="has_automated_testing" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Testing Tools" name="automated_testing_tools">
                <Input placeholder="VD: Jest, Pytest, Selenium, JUnit" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <DatabaseOutlined /> Kiến trúc dữ liệu
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="Nguồn dữ liệu" name="data_sources" initialValue={[]}>
                <CheckboxGroupWithOther
                  options={dataSourcesOptions}
                  customInputPlaceholder="Nhập nguồn dữ liệu khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Phân loại dữ liệu"
                name="data_classification_type"
                initialValue={[]}
                tooltip="Có thể chọn nhiều loại (Bí mật + Mật)"
              >
                <CheckboxGroupWithOther
                  options={dataClassificationTypeOptions}
                  customInputPlaceholder="Nhập mức độ phân loại khác..."
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Khối lượng dữ liệu" name="data_volume">
                <SelectWithOther
                  options={dataVolumeOptions}
                  placeholder="Chọn khối lượng dữ liệu"
                />
              </Form.Item>
            </Col>

            {/* Section 4: Data Volume Metrics */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                Dung lượng dữ liệu
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Dung lượng CSDL hiện tại (GB)"
                name="storage_size_gb"
                tooltip="Dung lượng cơ sở dữ liệu hiện tại"
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="Nhập dung lượng GB"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Dung lượng file đính kèm (GB)"
                name="file_storage_size_gb"
                tooltip="Dung lượng file, tài liệu lưu trữ"
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="Nhập dung lượng GB"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tốc độ tăng trưởng dữ liệu (%)"
                name="growth_rate_percent"
                tooltip="Tốc độ tăng trưởng (%/năm hoặc GB/tháng)"
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="Nhập % tăng trưởng"
                  formatter={(value) => `${value}%`}
                  parser={(value) => parseFloat(value!.replace('%', '')) as any}
                />
              </Form.Item>
            </Col>

            {/* Additional Database Fields */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginTop: 16, marginBottom: 16 }}>
                Chi tiết dữ liệu
              </Text>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Loại lưu trữ file"
                name="file_storage_type"
                initialValue={[]}
                tooltip="Có thể chọn nhiều (Object Storage + Block Storage + File System)"
              >
                <CheckboxGroupWithOther
                  options={fileStorageTypeOptions}
                  customInputPlaceholder="Nhập loại lưu trữ file khác..."
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số bản ghi" name="record_count">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Tổng số bản ghi"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="CSDL phụ/khác" name="secondary_databases" initialValue={[]}>
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="Nhập tên CSDL phụ (Redis, MongoDB, ...)"
                  tokenSeparators={[',']}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Chính sách lưu trữ dữ liệu" name="data_retention_policy">
                <TextArea rows={3} placeholder="VD: Lưu 5 năm, sau đó archive; Xóa dữ liệu cá nhân sau 2 năm không hoạt động" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '5',
      label: (
        <span>
          <ApiOutlined /> Tích hợp hệ thống
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            {/* Section 5: API Inventory */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                Thống kê API 
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Số API cung cấp"
                name="api_provided_count"
                tooltip="Tổng số API mà hệ thống này cung cấp cho hệ thống khác"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Số API cung cấp"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Số API tiêu thụ"
                name="api_consumed_count"
                tooltip="Tổng số API mà hệ thống này gọi từ hệ thống khác"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Số API tiêu thụ"
                />
              </Form.Item>
            </Col>

            {/* Quick Input - API Standard */}
            <Col span={24}>
              <Form.Item
                label="Chuẩn API"
                name="api_standard"
                initialValue={[]}
                tooltip="Có thể chọn nhiều chuẩn (OpenAPI + AsyncAPI)"
              >
                <CheckboxGroupWithOther
                  options={apiStandardOptions}
                  customInputPlaceholder="Nhập chuẩn API khác..."
                />
              </Form.Item>
            </Col>

            {/* API Gateway & Management */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginTop: 16, marginBottom: 16 }}>
                API Gateway & Quản lý 
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item label="Có API Gateway?" name="has_api_gateway" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Tên API Gateway" name="api_gateway_name">
                <SelectWithOther
                  options={apiGatewayOptions}
                  placeholder="Chọn API Gateway"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Có API Versioning?" name="has_api_versioning" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Có Rate Limiting?" name="has_rate_limiting" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginTop: 16, marginBottom: 16 }}>
                API Documentation & Monitoring
              </Text>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Tài liệu API"
                name="api_documentation"
                tooltip="Link tới tài liệu API hoặc mô tả chi tiết"
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập link tới Swagger/OpenAPI docs hoặc mô tả API"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Chuẩn phiên bản API"
                name="api_versioning_standard"
                tooltip="Cách đánh version cho API"
              >
                <SelectWithOther
                  options={apiVersioningStandardOptions}
                  placeholder="Chọn chuẩn versioning"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Có giám sát tích hợp?"
                name="has_integration_monitoring"
                valuePropName="checked"
                tooltip="Monitoring cho integration endpoints và data flows"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Hệ thống nội bộ tích hợp" name="integrated_internal_systems">
                <CheckboxGroupWithOther
                  options={integratedInternalSystemsOptions}
                  customInputPlaceholder="Nhập tên hệ thống nội bộ khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Hệ thống bên ngoài tích hợp" name="integrated_external_systems">
                <CheckboxGroupWithOther
                  options={integratedExternalSystemsOptions}
                  customInputPlaceholder="Nhập tên hệ thống bên ngoài khác..."
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="API/Webservices" name="api_list">
                <DynamicListInput placeholder="Nhập API endpoint hoặc tên service" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Phương thức trao đổi dữ liệu"
                name="data_exchange_method"
                initialValue={[]}
                tooltip="Có thể chọn nhiều (API REST + File Transfer + Message Queue)"
              >
                <CheckboxGroupWithOther
                  options={dataExchangeMethodOptions}
                  customInputPlaceholder="Nhập phương thức trao đổi dữ liệu khác..."
                />
              </Form.Item>
            </Col>

            {/* Section 5: Integration Connections (Complex Dynamic Form) */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginTop: 24, marginBottom: 16 }}>
                Danh sách tích hợp chi tiết
              </Text>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Liệt kê chi tiết các kết nối tích hợp giữa hệ thống này với các hệ thống khác
              </Text>
            </Col>

            <Col span={24}>
              <Form.Item
                name="integration_connections_data"
              >
                <IntegrationConnectionList />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '6',
      label: (
        <span>
          <SafetyOutlined /> An toàn thông tin
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Phương thức xác thực"
                name="authentication_method"
                initialValue={[]}
                tooltip="Có thể chọn nhiều (LDAP + Local + SSO + OAuth2)"
              >
                <CheckboxGroupWithOther
                  options={authenticationMethodOptions}
                  customInputPlaceholder="Nhập phương thức xác thực khác..."
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Mã hóa dữ liệu" name="has_encryption" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Có log audit?" name="has_audit_log" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Tuân thủ tiêu chuẩn"
                name="compliance_standards_list"
                initialValue={[]}
                tooltip="Có thể chọn nhiều tiêu chuẩn (ISO 27001 + GDPR + Nghị định 85)"
              >
                <CheckboxGroupWithOther
                  options={complianceStandardsOptions}
                  customInputPlaceholder="Nhập tiêu chuẩn tuân thủ khác..."
                />
              </Form.Item>
            </Col>

            {/* Security Level */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginTop: 16, marginBottom: 16 }}>
                Mức độ an toàn 
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item label="Cấp độ an toàn" name="security_level">
                <Select
                  placeholder="Chọn cấp độ an toàn"
                  allowClear
                >
                  {securityLevelOptions.map(opt => (
                    <Select.Option key={opt.value} value={parseInt(opt.value)}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Có tài liệu ATTT?"
                name="has_security_documents"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>

          </Row>
        </Card>
      ),
    },
    {
      key: '7',
      label: (
        <span>
          <CloudServerOutlined /> Hạ tầng kỹ thuật
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Cấu hình máy chủ" name="server_configuration">
                <SelectWithOther
                  options={serverConfigurationOptions}
                  placeholder="Chọn cấu hình máy chủ"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Dung lượng lưu trữ" name="storage_capacity">
                <SelectWithOther
                  options={storageCapacityOptions}
                  placeholder="Chọn dung lượng lưu trữ"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Phương án sao lưu"
                name="backup_plan"
                initialValue={[]}
                tooltip="Có thể chọn nhiều phương án (Daily backup + Snapshot + Off-site backup)"
              >
                <CheckboxGroupWithOther
                  options={backupPlanOptions}
                  customInputPlaceholder="Nhập phương án sao lưu khác..."
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Kế hoạch khôi phục thảm họa" name="disaster_recovery_plan">
                <SelectWithOther
                  options={disasterRecoveryOptions}
                  placeholder="Chọn kế hoạch DR"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '8',
      label: (
        <span>
          <ToolOutlined /> Vận hành
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Người chịu trách nhiệm" name="business_owner">
                <Input placeholder="Tên người chịu trách nhiệm" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Người quản trị kỹ thuật" name="technical_owner">
                <Input placeholder="Tên người quản trị kỹ thuật" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số điện thoại liên hệ" name="responsible_phone">
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Email liên hệ" name="responsible_email">
                <Input type="email" placeholder="Email" />
              </Form.Item>
            </Col>

            {/* Quick Input - Support Level */}
            <Col span={12}>
              <Form.Item label="Mức độ hỗ trợ" name="support_level">
                <SelectWithOther
                  options={supportLevelOptions}
                  placeholder="Chọn mức độ hỗ trợ"
                />
              </Form.Item>
            </Col>

            {/* Deployment & Infrastructure */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginTop: 16, marginBottom: 16 }}>
                Triển khai & Hạ tầng 
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item label="Vị trí triển khai" name="deployment_location">
                <Select
                  options={deploymentLocationOptions}
                  placeholder="Chọn vị trí triển khai"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Cấu hình tính toán" name="compute_specifications">
                <TextArea
                  rows={3}
                  placeholder="VD: 8 vCPU, 16GB RAM, 500GB SSD, Load Balancer với 2 nodes"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginTop: 16, marginBottom: 16 }}>
                Loại hạ tầng & Tần suất triển khai
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Loại hạ tầng tính toán"
                name="compute_type"
                tooltip="Loại infrastructure được sử dụng"
              >
                <Select
                  options={computeTypeOptions}
                  placeholder="Chọn loại compute"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tần suất triển khai"
                name="deployment_frequency"
                tooltip="Tần suất deploy code lên production"
              >
                <Select
                  options={deploymentFrequencyOptions}
                  placeholder="Chọn tần suất deployment"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '9',
      label: (
        <span>
          <CheckCircleOutlined /> Đánh giá
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                Đánh giá mức nợ kỹ thuật
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Điểm phù hợp cho tích hợp"
                name="integration_readiness"
                tooltip="Các đặc điểm thuận lợi cho việc tích hợp liên thông"
              >
                <CheckboxGroupWithOther options={integrationReadinessOptions} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Điểm vướng mắc"
                name="blockers"
                tooltip="Các rào cản kỹ thuật cần xử lý"
              >
                <CheckboxGroupWithOther options={blockersOptions} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Đề xuất của đơn vị"
                name="recommendation"
                tooltip="Đề xuất hành động cho hệ thống này"
              >
                <Select
                  options={recommendationOptions}
                  placeholder="Chọn đề xuất"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  if (fetching) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Quay lại
            </Button>
            <Title level={2} style={{ marginTop: 16 }}>
              Chỉnh sửa hệ thống
            </Title>
            <Text type="secondary">
              Cập nhật thông tin hệ thống
            </Text>
          </div>

          <Form form={form} layout="vertical" scrollToFirstError onValuesChange={handleFormChange}>
            <Tabs
              activeKey={currentTab}
              onChange={handleTabChange}
              items={tabItems}
              tabBarStyle={{
                display: 'flex',
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            />

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              {renderActionButtons()}
            </div>
          </Form>
        </Card>
      </div>

      {/* Warning Modal */}
      <Modal
        open={showWarningModal}
        title="Cảnh báo"
        onCancel={() => {
          setShowWarningModal(false);
          setPendingTab(null);
        }}
        footer={[
          <Button
            key="stay"
            onClick={() => {
              setShowWarningModal(false);
              setPendingTab(null);
            }}
          >
            Ở lại tab hiện tại
          </Button>,
          <Button
            key="continue"
            onClick={() => {
              setShowWarningModal(false);
              setCurrentTab(pendingTab!);
              setPendingTab(null);
            }}
          >
            Tiếp tục (không lưu)
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={async () => {
              await handleSaveCurrentTab();
              setShowWarningModal(false);
              setCurrentTab(pendingTab!);
              setPendingTab(null);
            }}
          >
            Lưu & Tiếp tục
          </Button>,
        ]}
      >
        <p>Bạn cần hoàn thiện nhập thông tin ở tab hiện tại trước khi di chuyển sang hạng mục tiếp theo.</p>
        <p>Bạn có muốn lưu thông tin trước khi chuyển tab?</p>
      </Modal>
    </Spin>
  );
};

export default SystemEdit;
