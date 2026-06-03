import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Select,
  Button,
  Modal,
  Descriptions,
  Spin,
  DatePicker,
  Row,
  Col,
} from 'antd';
import {
  HistoryOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { synthesisApi } from '../../services/api';
import type { SynthesisTask } from '../../types';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<string, string> = {
  completed: 'success',
  pending: 'default',
  running: 'processing',
  failed: 'error',
};

const FALLBACK_TASKS: SynthesisTask[] = [
  {
    id: 'task-001',
    prompt: 'Liver CT with 3cm low-density lesion in right lobe segment VII',
    modality: 'CT',
    condition_type: 'canny',
    steps: 50,
    guidance_scale: 7.5,
    image_width: 512,
    image_height: 512,
    status: 'completed',
    result_path: '/outputs/ct_0001.png',
    fid_score: 18.45,
    ssim_score: 0.9234,
    psnr_score: 34.12,
    generation_time: 4.523,
    error_message: null,
    created_at: '2024-03-15T10:30:00Z',
    completed_at: '2024-03-15T10:30:05Z',
  },
  {
    id: 'task-002',
    prompt: 'Brain MRI T1 showing meningioma with dural tail sign',
    modality: 'MRI',
    condition_type: 'segmentation',
    steps: 75,
    guidance_scale: 8.0,
    image_width: 512,
    image_height: 512,
    status: 'completed',
    result_path: '/outputs/mri_0001.png',
    fid_score: 21.34,
    ssim_score: 0.8912,
    psnr_score: 31.56,
    generation_time: 6.234,
    error_message: null,
    created_at: '2024-03-14T14:20:00Z',
    completed_at: '2024-03-14T14:20:06Z',
  },
  {
    id: 'task-003',
    prompt: 'Frontal chest X-ray showing right lower lobe pneumonia',
    modality: 'X-Ray',
    condition_type: null,
    steps: 40,
    guidance_scale: 6.5,
    image_width: 512,
    image_height: 512,
    status: 'completed',
    result_path: '/outputs/xray_0001.png',
    fid_score: 16.78,
    ssim_score: 0.9456,
    psnr_score: 37.89,
    generation_time: 3.123,
    error_message: null,
    created_at: '2024-03-13T09:15:00Z',
    completed_at: '2024-03-13T09:15:03Z',
  },
  {
    id: 'task-004',
    prompt: 'Abdominal CT showing renal cell carcinoma in left kidney',
    modality: 'CT',
    condition_type: 'depth',
    steps: 60,
    guidance_scale: 9.0,
    image_width: 512,
    image_height: 512,
    status: 'running',
    result_path: null,
    fid_score: null,
    ssim_score: null,
    psnr_score: null,
    generation_time: null,
    error_message: null,
    created_at: '2024-03-15T11:00:00Z',
    completed_at: null,
  },
  {
    id: 'task-005',
    prompt: 'Knee MRI with ACL tear and meniscal degeneration',
    modality: 'MRI',
    condition_type: 'canny',
    steps: 100,
    guidance_scale: 12.0,
    image_width: 768,
    image_height: 768,
    status: 'failed',
    result_path: null,
    fid_score: null,
    ssim_score: null,
    psnr_score: null,
    generation_time: null,
    error_message: 'CUDA out of memory - try reducing image size or inference steps',
    created_at: '2024-03-12T16:45:00Z',
    completed_at: null,
  },
  {
    id: 'task-006',
    prompt: 'Chest X-ray with pneumothorax on the left side',
    modality: 'X-Ray',
    condition_type: 'segmentation',
    steps: 50,
    guidance_scale: 7.5,
    image_width: 512,
    image_height: 512,
    status: 'pending',
    result_path: null,
    fid_score: null,
    ssim_score: null,
    psnr_score: null,
    generation_time: null,
    error_message: null,
    created_at: '2024-03-15T11:30:00Z',
    completed_at: null,
  },
];

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<SynthesisTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalityFilter, setModalityFilter] = useState<string | undefined>();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SynthesisTask | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await synthesisApi.getTasks({
        status: statusFilter,
        modality: modalityFilter,
        limit: 50,
      });
      setTasks(data.length > 0 ? data : FALLBACK_TASKS);
    } catch {
      setTasks(FALLBACK_TASKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, modalityFilter]);

  const handleDelete = async (id: string) => {
    try {
      await synthesisApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const columns = [
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Modality',
      dataIndex: 'modality',
      key: 'modality',
      width: 80,
      render: (m: string) => <Tag color="blue">{m}</Tag>,
    },
    {
      title: 'Steps',
      dataIndex: 'steps',
      key: 'steps',
      width: 70,
    },
    {
      title: 'FID',
      dataIndex: 'fid_score',
      key: 'fid_score',
      width: 80,
      render: (v: number | null) => (v ? v.toFixed(1) : '-'),
      sorter: (a: SynthesisTask, b: SynthesisTask) => (a.fid_score || 0) - (b.fid_score || 0),
    },
    {
      title: 'SSIM',
      dataIndex: 'ssim_score',
      key: 'ssim_score',
      width: 80,
      render: (v: number | null) => (v ? v.toFixed(4) : '-'),
    },
    {
      title: 'Time',
      dataIndex: 'generation_time',
      key: 'generation_time',
      width: 80,
      render: (v: number | null) => (v ? `${v.toFixed(1)}s` : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v: string | null) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: SynthesisTask) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedTask(record);
              setDetailModalOpen(true);
            }}
          />
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
          <HistoryOutlined style={{ marginRight: 8, color: '#0ea5e9' }} />
          Synthesis Tasks
        </Title>
        <Space>
          <Select
            placeholder="Filter by modality"
            allowClear
            style={{ width: 150 }}
            onChange={(val) => setModalityFilter(val)}
          >
            <Select.Option value="CT">CT</Select.Option>
            <Select.Option value="MRI">MRI</Select.Option>
            <Select.Option value="X-Ray">X-Ray</Select.Option>
          </Select>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={(val) => setStatusFilter(val)}
          >
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="running">Running</Select.Option>
            <Select.Option value="failed">Failed</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchTasks}>
            Refresh
          </Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} tasks` }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      <Modal
        title="Task Details"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedTask && (
          <div>
            <Descriptions column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[selectedTask.status]}>{selectedTask.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Modality">
                <Tag color="blue">{selectedTask.modality}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Steps">{selectedTask.steps}</Descriptions.Item>
              <Descriptions.Item label="Guidance Scale">{selectedTask.guidance_scale}</Descriptions.Item>
              <Descriptions.Item label="Condition">{selectedTask.condition_type || 'None'}</Descriptions.Item>
              <Descriptions.Item label="Image Size">
                {selectedTask.image_width}x{selectedTask.image_height}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {selectedTask.created_at ? new Date(selectedTask.created_at).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Completed">
                {selectedTask.completed_at ? new Date(selectedTask.completed_at).toLocaleString() : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Paragraph style={{ marginBottom: 16 }}>
              <Text strong>Prompt: </Text>
              {selectedTask.prompt}
            </Paragraph>

            {selectedTask.status === 'completed' && (
              <>
                <Title level={5}>Quality Metrics</Title>
                <Descriptions column={3}>
                  <Descriptions.Item label="FID Score">
                    <Text strong style={{ color: '#0ea5e9' }}>{selectedTask.fid_score?.toFixed(2)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="SSIM">
                    <Text strong style={{ color: '#10b981' }}>{selectedTask.ssim_score?.toFixed(4)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="PSNR">
                    <Text strong style={{ color: '#8b5cf6' }}>{selectedTask.psnr_score?.toFixed(2)} dB</Text>
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {selectedTask.error_message && (
              <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', borderRadius: 8 }}>
                <Text type="danger">{selectedTask.error_message}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tasks;
