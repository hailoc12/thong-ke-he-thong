import React, { useState } from 'react';
import { Card, Tag, Typography, Space, Badge, Modal, Timeline, Button } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mockApprovalRequests } from '../../mocks';
import type { ApprovalRequest } from '../../mocks';

const { Text, Title } = Typography;

// Helper functions for translations
const getUrgencyLabel = (urgency: string) => {
  switch (urgency) {
    case 'critical': return 'KHẨN CẤP';
    case 'high': return 'CAO';
    case 'medium': return 'TRUNG BÌNH';
    case 'low': return 'THẤP';
    default: return urgency.toUpperCase();
  }
};

const getRequestTypeLabel = (type: string) => {
  switch (type) {
    case 'new_system': return 'Hệ thống mới';
    case 'upgrade': return 'Nâng cấp';
    case 'contract_renewal': return 'Gia hạn hợp đồng';
    case 'budget_increase': return 'Tăng ngân sách';
    default: return type.replace('_', ' ');
  }
};

// Sortable Card Component
interface SortableApprovalCardProps {
  request: ApprovalRequest;
  onClick: () => void;
}

const SortableApprovalCard: React.FC<SortableApprovalCardProps> = ({ request, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab'
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'new_system': return <FileTextOutlined />;
      case 'upgrade': return <SyncOutlined />;
      case 'contract_renewal': return <CheckCircleOutlined />;
      case 'budget_increase': return <DollarOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        size="small"
        hoverable
        onClick={onClick}
        style={{
          marginBottom: 12,
          borderLeft: `4px solid ${getUrgencyColor(request.urgency)}`
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <Text strong style={{ fontSize: 13, flex: 1 }}>
              {request.systemName}
            </Text>
            <Tag color={getUrgencyColor(request.urgency)} style={{ fontSize: 10 }}>
              {getUrgencyLabel(request.urgency)}
            </Tag>
          </div>

          {/* System Code */}
          <Text type="secondary" style={{ fontSize: 11 }}>
            {request.systemCode}
          </Text>

          {/* Request Type */}
          <Tag icon={getRequestTypeIcon(request.requestType)} color="processing" style={{ fontSize: 11 }}>
            {getRequestTypeLabel(request.requestType)}
          </Tag>

          {/* Requester */}
          <Space size={4}>
            <UserOutlined style={{ fontSize: 11 }} />
            <Text style={{ fontSize: 11 }}>{request.requester}</Text>
          </Space>

          {/* Cost */}
          {request.estimatedCost && (
            <Space size={4}>
              <DollarOutlined style={{ fontSize: 11 }} />
              <Text style={{ fontSize: 11 }}>
                {(request.estimatedCost / 1_000_000_000).toFixed(1)}B VNĐ
              </Text>
            </Space>
          )}

          {/* Days Pending */}
          {request.daysPending > 0 && (
            <Space size={4}>
              <ClockCircleOutlined style={{ fontSize: 11, color: request.daysPending > 5 ? '#ff4d4f' : '#faad14' }} />
              <Text style={{ fontSize: 11, color: request.daysPending > 5 ? '#ff4d4f' : '#faad14' }}>
                {request.daysPending} ngày chờ
              </Text>
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
};

// Kanban Column Component
interface KanbanColumnProps {
  title: string;
  count: number;
  items: ApprovalRequest[];
  color: string;
  onCardClick: (request: ApprovalRequest) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, count, items, color, onCardClick }) => {
  return (
    <div
      style={{
        background: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        minWidth: 300,
        flex: 1
      }}
    >
      {/* Column Header */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Badge count={count} style={{ backgroundColor: color }} />
          <Text strong style={{ fontSize: 14 }}>
            {title}
          </Text>
        </Space>
      </div>

      {/* Sortable Cards */}
      <SortableContext items={items.map(r => r.id)} strategy={verticalListSortingStrategy}>
        <div style={{ minHeight: 400 }}>
          {items.map((request) => (
            <SortableApprovalCard
              key={request.id}
              request={request}
              onClick={() => onCardClick(request)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

/**
 * Approval Kanban Board - Drag & drop approval workflow
 */
const ApprovalKanban: React.FC = () => {
  const [requests, setRequests] = useState(mockApprovalRequests);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Group requests by status
  const groupedRequests = {
    pending_technical: requests.filter(r => r.status === 'pending_technical'),
    pending_business: requests.filter(r => r.status === 'pending_business'),
    pending_cio: requests.filter(r => r.status === 'pending_cio'),
    approved: requests.filter(r => r.status === 'approved'),
    rejected: requests.filter(r => r.status === 'rejected')
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRequests((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCardClick = (request: ApprovalRequest) => {
    setSelectedRequest(request);
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'rejected': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'reviewing': return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      default: return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
          <KanbanColumn
            title="Xét duyệt kỹ thuật"
            count={groupedRequests.pending_technical.length}
            items={groupedRequests.pending_technical}
            color="#1890ff"
            onCardClick={handleCardClick}
          />
          <KanbanColumn
            title="Xét duyệt nghiệp vụ"
            count={groupedRequests.pending_business.length}
            items={groupedRequests.pending_business}
            color="#faad14"
            onCardClick={handleCardClick}
          />
          <KanbanColumn
            title="Phê duyệt CIO"
            count={groupedRequests.pending_cio.length}
            items={groupedRequests.pending_cio}
            color="#722ed1"
            onCardClick={handleCardClick}
          />
          <KanbanColumn
            title="Đã phê duyệt"
            count={groupedRequests.approved.length}
            items={groupedRequests.approved}
            color="#52c41a"
            onCardClick={handleCardClick}
          />
          <KanbanColumn
            title="Từ chối"
            count={groupedRequests.rejected.length}
            items={groupedRequests.rejected}
            color="#ff4d4f"
            onCardClick={handleCardClick}
          />
        </div>
      </DndContext>

      {/* Detail Modal */}
      <Modal
        title={selectedRequest?.systemName}
        open={!!selectedRequest}
        onCancel={() => setSelectedRequest(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedRequest(null)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedRequest && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Basic Info */}
            <div>
              <Space wrap>
                <Tag color="processing">{selectedRequest.systemCode}</Tag>
                <Tag color={selectedRequest.urgency === 'critical' || selectedRequest.urgency === 'high' ? 'red' : 'blue'}>
                  {getUrgencyLabel(selectedRequest.urgency)}
                </Tag>
                <Tag>{getRequestTypeLabel(selectedRequest.requestType)}</Tag>
              </Space>
            </div>

            {/* Details */}
            <div>
              <Text type="secondary">Người yêu cầu: </Text>
              <Text>{selectedRequest.requester} ({selectedRequest.requesterOrg})</Text>
            </div>

            {selectedRequest.estimatedCost && (
              <div>
                <Text type="secondary">Chi phí dự kiến: </Text>
                <Text strong>{(selectedRequest.estimatedCost / 1_000_000_000).toFixed(1)}B VNĐ</Text>
              </div>
            )}

            <div>
              <Text type="secondary">Ngày nộp: </Text>
              <Text>{selectedRequest.submittedDate}</Text>
              {selectedRequest.daysPending > 0 && (
                <Text style={{ marginLeft: 16, color: '#faad14' }}>
                  ({selectedRequest.daysPending} ngày chờ)
                </Text>
              )}
            </div>

            {/* Approval Timeline */}
            <div style={{ marginTop: 16 }}>
              <Title level={5}>Quy trình phê duyệt</Title>
              <Timeline>
                {selectedRequest.stages.map((stage, index) => (
                  <Timeline.Item
                    key={index}
                    dot={getStageIcon(stage.status)}
                  >
                    <div>
                      <Text strong>{stage.role}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>{stage.user}</Text>
                      <br />
                      {stage.date && (
                        <>
                          <Text style={{ fontSize: 12 }}>{stage.date}</Text>
                          <br />
                        </>
                      )}
                      {stage.comment && (
                        <Text style={{ fontSize: 12, fontStyle: 'italic' }}>
                          "{stage.comment}"
                        </Text>
                      )}
                      {stage.status === 'reviewing' && (
                        <Tag color="processing" style={{ fontSize: 11, marginTop: 4 }}>
                          Đang thực hiện
                        </Tag>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default ApprovalKanban;
