import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Empty,
  Spin,
  Descriptions,
  Image,
} from 'antd';
import {
  DatabaseOutlined,
  PlusOutlined,
  ScanOutlined,
  FileImageOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { datasetsApi } from '../../services/api';
import type { Dataset } from '../../types';

const { Title, Text, Paragraph } = Typography;

const MODALITY_ICONS: Record<string, React.ReactNode> = {
  CT: <ScanOutlined style={{ fontSize: 28, color: '#0ea5e9' }} />,
  MRI: <FileImageOutlined style={{ fontSize: 28, color: '#10b981' }} />,
  'X-Ray': <CloudServerOutlined style={{ fontSize: 28, color: '#8b5cf6' }} />,
};

const MODALITY_GRADIENTS: Record<string, string> = {
  CT: 'linear-gradient(135deg, #1e293b, #334155, #475569)',
  MRI: 'linear-gradient(135deg, #0f172a, #1e3a5f, #2563eb)',
  'X-Ray': 'linear-gradient(135deg, #18181b, #3f3f46, #71717a)',
};

const FALLBACK_DATASETS: Dataset[] = [
  {
    id: '1',
    name: 'LiTS - Liver Tumor Segmentation',
    modality: 'CT',
    image_count: 131200,
    description: 'Liver Tumor Segmentation Challenge dataset containing 131 CT scans with expert annotations for liver and tumor segmentation.',
    source: 'https://competitions.codalab.org/competitions/17094',
    file_size_mb: 28500,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'BraTS - Brain Tumor Segmentation',
    modality: 'MRI',
    image_count: 69280,
    description: 'Multimodal Brain Tumor Segmentation Challenge dataset with T1, T1ce, T2, and FLAIR MRI sequences.',
    source: 'https://www.med.upenn.edu/cbia/brats2023/',
    file_size_mb: 45200,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'ChestX-ray14',
    modality: 'X-Ray',
    image_count: 112120,
    description: 'NIH Clinical Center chest X-ray dataset with 112,120 frontal-view X-rays and labels for 14 thoracic pathologies.',
    source: 'https://nihcc.app.box.com/v/ChestXray-NIHCC',
    file_size_mb: 42000,
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '4',
    name: 'Custom Clinical Dataset',
    modality: 'CT',
    image_count: 8450,
    description: 'Custom curated dataset of CT scans with various pathologies for model fine-tuning.',
    source: 'Internal',
    file_size_mb: 5600,
    created_at: '2024-03-01T00:00:00Z',
  },
];

const Datasets: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await datasetsApi.list();
        setDatasets(data.length > 0 ? data : FALLBACK_DATASETS);
      } catch {
        setDatasets(FALLBACK_DATASETS);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  const handleCreate = async (values: Partial<Dataset>) => {
    try {
      const newDataset = await datasetsApi.create(values);
      setDatasets((prev) => [newDataset, ...prev]);
      setUploadModalOpen(false);
      form.resetFields();
      message.success('Dataset created successfully');
    } catch {
      message.info('Demo mode - dataset not persisted');
      setUploadModalOpen(false);
      form.resetFields();
    }
  };

  const handleViewDetail = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
          <DatabaseOutlined style={{ marginRight: 8, color: '#0ea5e9' }} />
          Datasets
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadModalOpen(true)}>
          Add Dataset
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {datasets.map((dataset) => (
          <Col xs={24} sm={12} lg={6} key={dataset.id}>
            <Card
              hoverable
              onClick={() => handleViewDetail(dataset)}
              styles={{ body: { padding: '20px 16px' } }}
              style={{ height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: 80,
                  borderRadius: 8,
                  background: MODALITY_GRADIENTS[dataset.modality],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                {MODALITY_ICONS[dataset.modality]}
              </div>
              <div style={{ marginBottom: 8 }}>
                <Tag color="blue">{dataset.modality}</Tag>
              </div>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>
                {dataset.name}
              </Text>
              <Paragraph
                style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}
                ellipsis={{ rows: 2 }}
              >
                {dataset.description}
              </Paragraph>
              <Space split={<span style={{ color: '#e2e8f0' }}>|</span>}>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                  {(dataset.image_count / 1000).toFixed(1)}K images
                </Text>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                  {(dataset.file_size_mb / 1000).toFixed(1)} GB
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Upload Modal */}
      <Modal
        title="Add New Dataset"
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Dataset Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Custom CT Dataset" />
          </Form.Item>
          <Form.Item name="modality" label="Modality" rules={[{ required: true }]}>
            <Select placeholder="Select modality">
              <Select.Option value="CT">CT</Select.Option>
              <Select.Option value="MRI">MRI</Select.Option>
              <Select.Option value="X-Ray">X-Ray</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="image_count" label="Image Count">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Number of images" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe the dataset..." />
          </Form.Item>
          <Form.Item name="source" label="Source">
            <Input placeholder="Dataset source URL or origin" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Dataset
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={selectedDataset?.name}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedDataset && (
          <div>
            <Descriptions column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Modality">
                <Tag color="blue">{selectedDataset.modality}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Image Count">
                {selectedDataset.image_count.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                {(selectedDataset.file_size_mb / 1000).toFixed(1)} GB
              </Descriptions.Item>
              <Descriptions.Item label="Source">
                {selectedDataset.source || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
            <Paragraph>{selectedDataset.description}</Paragraph>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>
              Sample Images
            </Text>
            <Row gutter={[8, 8]}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Col span={8} key={i}>
                  <div
                    style={{
                      width: '100%',
                      height: 120,
                      borderRadius: 6,
                      background: MODALITY_GRADIENTS[selectedDataset.modality],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.7 + Math.random() * 0.3,
                    }}
                  >
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                      Sample {i + 1}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Datasets;
