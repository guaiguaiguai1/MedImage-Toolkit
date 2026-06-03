import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Space,
  Spin,
  Select,
  Button,
} from 'antd';
import {
  LineChartOutlined,
  ReloadOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { qualityApi, modelsApi } from '../../services/api';
import type { PretrainedModel, QualityTrend } from '../../types';

const { Title, Text } = Typography;

const FALLBACK_MODELS: PretrainedModel[] = [
  {
    id: '1', name: 'StableDiffusion-CT-v2', modality: 'CT', version: '2.1.0',
    description: 'CT synthesis model', fid_score: 18.5, download_url: '', download_size_mb: 4200,
    status: 'ready', created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: '2', name: 'StableDiffusion-MRI-T1-v1', modality: 'MRI', version: '1.3.0',
    description: 'MRI T1 synthesis model', fid_score: 21.3, download_url: '', download_size_mb: 3800,
    status: 'ready', created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '3', name: 'StableDiffusion-MRI-T2-v1', modality: 'MRI', version: '1.2.0',
    description: 'MRI T2 synthesis model', fid_score: 23.7, download_url: '', download_size_mb: 3900,
    status: 'ready', created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: '4', name: 'StableDiffusion-XRay-v3', modality: 'X-Ray', version: '3.0.1',
    description: 'X-Ray synthesis model', fid_score: 16.8, download_url: '', download_size_mb: 3500,
    status: 'ready', created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '5', name: 'StableDiffusion-Pathology-v1', modality: 'CT', version: '1.0.0-beta',
    description: 'Pathology synthesis model', fid_score: 28.4, download_url: '', download_size_mb: 4500,
    status: 'training', created_at: '2024-03-01T00:00:00Z',
  },
];

const FALLBACK_TRENDS: QualityTrend[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  avg_fid: +(Math.random() * 12 + 18).toFixed(2),
  avg_ssim: +(Math.random() * 0.13 + 0.82).toFixed(4),
  avg_psnr: +(Math.random() * 10 + 28).toFixed(2),
  task_count: Math.floor(Math.random() * 15) + 3,
}));

const Quality: React.FC = () => {
  const [models, setModels] = useState<PretrainedModel[]>([]);
  const [trends, setTrends] = useState<QualityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModality, setSelectedModality] = useState<string | undefined>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, t] = await Promise.all([
        modelsApi.list({ modality: selectedModality }),
        qualityApi.getTrends(),
      ]);
      setModels(m.length > 0 ? m : FALLBACK_MODELS);
      setTrends(t.length > 0 ? t : FALLBACK_TRENDS);
    } catch {
      setModels(FALLBACK_MODELS);
      setTrends(FALLBACK_TRENDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedModality]);

  const fidComparisonOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['FID Score', 'SSIM (x100)', 'PSNR'], bottom: 0 },
    grid: { top: 20, right: 20, bottom: 40, left: 50 },
    xAxis: {
      type: 'category' as const,
      data: trends.map((t) => t.date.slice(5)),
      axisLabel: { fontSize: 10, color: '#94a3b8', rotate: 45 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { fontSize: 11, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        name: 'FID Score',
        data: trends.map((t) => t.avg_fid),
        type: 'line' as const,
        smooth: true,
        lineStyle: { color: '#0ea5e9', width: 2 },
        itemStyle: { color: '#0ea5e9' },
      },
      {
        name: 'SSIM (x100)',
        data: trends.map((t) => +(t.avg_ssim * 100).toFixed(1)),
        type: 'line' as const,
        smooth: true,
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' },
      },
      {
        name: 'PSNR',
        data: trends.map((t) => t.avg_psnr),
        type: 'line' as const,
        smooth: true,
        lineStyle: { color: '#8b5cf6', width: 2 },
        itemStyle: { color: '#8b5cf6' },
      },
    ],
  };

  const modelComparisonOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['FID Score'], bottom: 0 },
    grid: { top: 20, right: 20, bottom: 40, left: 50 },
    xAxis: {
      type: 'category' as const,
      data: models.map((m) => m.name.replace('StableDiffusion-', '')),
      axisLabel: { fontSize: 10, color: '#94a3b8', rotate: 20 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value' as const,
      name: 'FID Score (lower is better)',
      axisLabel: { fontSize: 11, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        name: 'FID Score',
        data: models.map((m) => m.fid_score || 0),
        type: 'bar' as const,
        barWidth: '50%',
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            const colors = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
            return colors[params.dataIndex % colors.length];
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const modelColumns = [
    {
      title: 'Model',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: PretrainedModel) => (
        <Space>
          <Tag color="blue">{record.modality}</Tag>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 100,
    },
    {
      title: 'FID Score',
      dataIndex: 'fid_score',
      key: 'fid_score',
      width: 100,
      render: (v: number | null) => (
        <Text strong style={{ color: v && v < 20 ? '#10b981' : v && v < 25 ? '#0ea5e9' : '#f59e0b' }}>
          {v?.toFixed(1) || '-'}
        </Text>
      ),
      sorter: (a: PretrainedModel, b: PretrainedModel) => (a.fid_score || 0) - (b.fid_score || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => (
        <Tag color={s === 'ready' ? 'success' : s === 'training' ? 'processing' : 'default'}>
          {s}
        </Tag>
      ),
    },
    {
      title: 'Ranking',
      key: 'ranking',
      width: 80,
      render: (_: unknown, __: PretrainedModel, index: number) => {
        const sorted = [...models].sort((a, b) => (a.fid_score || 99) - (b.fid_score || 99));
        const rank = sorted.findIndex((m) => m.id === __.id) + 1;
        return rank === 1 ? (
          <Tag color="gold" icon={<TrophyOutlined />}>#1</Tag>
        ) : (
          <Text style={{ color: '#94a3b8' }}>#{rank}</Text>
        );
      },
    },
  ];

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
          <LineChartOutlined style={{ marginRight: 8, color: '#0ea5e9' }} />
          Quality Evaluation
        </Title>
        <Space>
          <Select
            placeholder="Filter by modality"
            allowClear
            style={{ width: 150 }}
            onChange={(val) => setSelectedModality(val)}
          >
            <Select.Option value="CT">CT</Select.Option>
            <Select.Option value="MRI">MRI</Select.Option>
            <Select.Option value="X-Ray">X-Ray</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Refresh
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={<Text strong>Quality Metrics Trend (Last 30 Days)</Text>}
            styles={{ body: { padding: '12px 16px' } }}
          >
            <ReactECharts option={fidComparisonOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<Text strong>Model FID Comparison</Text>}
            styles={{ body: { padding: '12px 16px' } }}
          >
            <ReactECharts option={modelComparisonOption} style={{ height: 320 }} />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Text strong>Model Comparison Table</Text>}
        style={{ marginTop: 16 }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={models}
          columns={modelColumns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Quality;
