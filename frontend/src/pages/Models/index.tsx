import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Spin,
  Badge,
  Button,
  Descriptions,
  Modal,
  Progress,
  Divider,
  message,
} from 'antd';
import {
  RocketOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloudDownloadOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { modelsApi } from '../../services/api';
import type { PretrainedModel } from '../../types';

const { Title, Text, Paragraph } = Typography;

const statusConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
  ready: { color: 'success', icon: <CheckCircleOutlined />, text: 'Ready' },
  training: { color: 'processing', icon: <SyncOutlined spin />, text: 'Training' },
  downloading: { color: 'warning', icon: <CloudDownloadOutlined />, text: 'Downloading' },
  error: { color: 'error', icon: <CheckCircleOutlined />, text: 'Error' },
};

const FALLBACK_MODELS: PretrainedModel[] = [
  {
    id: '1',
    name: 'StableDiffusion-CT-v2',
    modality: 'CT',
    version: '2.1.0',
    description: 'Fine-tuned Stable Diffusion model for CT image synthesis. Trained on 50,000+ CT scans covering thoracic, abdominal, and cranial regions.',
    fid_score: 18.5,
    download_url: 'https://huggingface.co/medimage/sd-ct-v2',
    download_size_mb: 4200,
    status: 'ready',
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: '2',
    name: 'StableDiffusion-MRI-T1-v1',
    modality: 'MRI',
    version: '1.3.0',
    description: 'Specialized model for T1-weighted MRI synthesis. Optimized for brain MRI generation with accurate tissue contrast.',
    fid_score: 21.3,
    download_url: 'https://huggingface.co/medimage/sd-mri-t1-v1',
    download_size_mb: 3800,
    status: 'ready',
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'StableDiffusion-MRI-T2-v1',
    modality: 'MRI',
    version: '1.2.0',
    description: 'T2-weighted MRI synthesis model. Excellent for generating FLAIR and T2 sequences with realistic pathology.',
    fid_score: 23.7,
    download_url: 'https://huggingface.co/medimage/sd-mri-t2-v1',
    download_size_mb: 3900,
    status: 'ready',
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: '4',
    name: 'StableDiffusion-XRay-v3',
    modality: 'X-Ray',
    version: '3.0.1',
    description: 'Chest X-Ray synthesis model trained on ChestX-ray14 and MIMIC-CXR datasets. Generates PA and AP views.',
    fid_score: 16.8,
    download_url: 'https://huggingface.co/medimage/sd-xray-v3',
    download_size_mb: 3500,
    status: 'ready',
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '5',
    name: 'StableDiffusion-Pathology-v1',
    modality: 'CT',
    version: '1.0.0-beta',
    description: 'Experimental model for pathology-focused CT synthesis. Currently in beta testing.',
    fid_score: 28.4,
    download_url: 'https://huggingface.co/medimage/sd-pathology-v1',
    download_size_mb: 4500,
    status: 'training',
    created_at: '2024-03-01T00:00:00Z',
  },
];

const Models: React.FC = () => {
  const [models, setModels] = useState<PretrainedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<PretrainedModel | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await modelsApi.list();
        setModels(data.length > 0 ? data : FALLBACK_MODELS);
      } catch {
        setModels(FALLBACK_MODELS);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24, color: '#0f172a' }}>
        <RocketOutlined style={{ marginRight: 8, color: '#0ea5e9' }} />
        Pretrained Models
      </Title>

      <Row gutter={[16, 16]}>
        {models.map((model) => {
          const status = statusConfig[model.status] || statusConfig.ready;
          return (
            <Col xs={24} sm={12} lg={8} key={model.id}>
              <Card
                hoverable
                onClick={() => {
                  setSelectedModel(model);
                  setDetailModalOpen(true);
                }}
                style={{ height: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <Tag color="blue" style={{ marginBottom: 8 }}>{model.modality}</Tag>
                    <Text strong style={{ fontSize: 16, display: 'block' }}>{model.name}</Text>
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>v{model.version}</Text>
                  </div>
                  <Badge
                    status={status.color as 'success' | 'processing' | 'warning' | 'error'}
                    text={<Text style={{ fontSize: 12 }}>{status.text}</Text>}
                  />
                </div>

                <Paragraph style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }} ellipsis={{ rows: 2 }}>
                  {model.description}
                </Paragraph>

                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  {model.fid_score && (
                    <div>
                      <Text style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>FID Score</Text>
                      <Text strong style={{ color: '#0ea5e9' }}>{model.fid_score}</Text>
                    </div>
                  )}
                  <div>
                    <Text style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Size</Text>
                    <Text strong>{(model.download_size_mb / 1000).toFixed(1)} GB</Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Modality</Text>
                    <Text strong>{model.modality}</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal
        title={selectedModel?.name}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="select"
            type="primary"
            icon={<ExperimentOutlined />}
            onClick={() => {
              message.success(`${selectedModel?.name} selected for synthesis`);
              setDetailModalOpen(false);
            }}
          >
            Select Model
          </Button>,
        ]}
        width={600}
      >
        {selectedModel && (
          <div>
            <Descriptions column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Modality">
                <Tag color="blue">{selectedModel.modality}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Version">
                {selectedModel.version}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge
                  status={(statusConfig[selectedModel.status] || statusConfig.ready).color as 'success' | 'processing' | 'warning' | 'error'}
                  text={(statusConfig[selectedModel.status] || statusConfig.ready).text}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                {(selectedModel.download_size_mb / 1000).toFixed(1)} GB
              </Descriptions.Item>
            </Descriptions>

            <Paragraph>{selectedModel.description}</Paragraph>

            <Divider />

            <Title level={5}>Performance Metrics</Title>
            {selectedModel.fid_score && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>FID Score (lower is better)</Text>
                  <Text strong>{selectedModel.fid_score}</Text>
                </div>
                <Progress
                  percent={Math.max(0, 100 - selectedModel.fid_score * 2)}
                  strokeColor="#0ea5e9"
                  showInfo={false}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Models;
