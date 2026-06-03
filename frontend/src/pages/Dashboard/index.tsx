import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag, Space, Table, Spin } from 'antd';
import {
  ExperimentOutlined,
  RocketOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { dashboardApi } from '../../services/api';
import type { DashboardStats, TrendData, ModalityDistribution, SynthesisTask } from '../../types';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  completed: 'success',
  pending: 'default',
  running: 'processing',
  failed: 'error',
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [modalityDist, setModalityDist] = useState<ModalityDistribution[]>([]);
  const [qualityDist, setQualityDist] = useState<{ range: string; count: number }[]>([]);
  const [recentTasks, setRecentTasks] = useState<SynthesisTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t, m, q, r] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getSynthesisTrend(),
          dashboardApi.getModalityDistribution(),
          dashboardApi.getQualityDistribution(),
          dashboardApi.getRecentTasks(5),
        ]);
        setStats(s);
        setTrend(t);
        setModalityDist(m);
        setQualityDist(q);
        setRecentTasks(r);
      } catch {
        // Use fallback data
        setStats({
          total_synthesized: 156,
          completed_tasks: 142,
          active_models: 5,
          total_datasets: 4,
          avg_fid_score: 22.4,
        });
        setTrend(
          Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 12) + 3,
          }))
        );
        setModalityDist([
          { modality: 'CT', count: 58 },
          { modality: 'MRI', count: 45 },
          { modality: 'X-Ray', count: 53 },
        ]);
        setQualityDist([
          { range: '15-20', count: 28 },
          { range: '20-25', count: 45 },
          { range: '25-30', count: 38 },
          { range: '30-35', count: 25 },
          { range: '35+', count: 12 },
        ]);
        setRecentTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const trendOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category' as const,
      data: trend.map((t) => t.date.slice(5)),
      axisLabel: { fontSize: 11, color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { fontSize: 11, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        data: trend.map((t) => t.count),
        type: 'line' as const,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#0ea5e9', width: 2 },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(14,165,233,0.2)' },
              { offset: 1, color: 'rgba(14,165,233,0.02)' },
            ],
          },
        },
      },
    ],
  };

  const qualityOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category' as const,
      data: qualityDist.map((q) => q.range),
      axisLabel: { fontSize: 11, color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { fontSize: 11, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        data: qualityDist.map((q) => q.count),
        type: 'bar' as const,
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#0ea5e9' },
              { offset: 1, color: '#06b6d4' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const modalityOption = {
    tooltip: { trigger: 'item' as const },
    series: [
      {
        type: 'pie' as const,
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, fontSize: 12 },
        data: modalityDist.map((m) => ({
          name: m.modality,
          value: m.count,
        })),
        color: ['#0ea5e9', '#10b981', '#8b5cf6'],
      },
    ],
  };

  const recentColumns = [
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
      title: 'FID',
      dataIndex: 'fid_score',
      key: 'fid_score',
      width: 80,
      render: (v: number | null) => (v ? v.toFixed(1) : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag>,
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
      <Title level={4} style={{ marginBottom: 24, color: '#0f172a' }}>
        Dashboard
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: '20px 24px' } }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>Total Synthesized</Text>}
              value={stats?.total_synthesized || 0}
              prefix={<ExperimentOutlined style={{ color: '#0ea5e9' }} />}
              valueStyle={{ color: '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: '20px 24px' } }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>Active Models</Text>}
              value={stats?.active_models || 0}
              prefix={<RocketOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: '20px 24px' } }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>Datasets</Text>}
              value={stats?.total_datasets || 0}
              prefix={<DatabaseOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: '20px 24px' } }}>
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>Avg FID Score</Text>}
              value={stats?.avg_fid_score || 0}
              precision={1}
              prefix={<LineChartOutlined style={{ color: '#f59e0b' }} />}
              suffix={
                <ArrowUpOutlined style={{ color: '#10b981', fontSize: 14 }} />
              }
              valueStyle={{ color: '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            title={<Text strong>Synthesis Trend (Last 30 Days)</Text>}
            styles={{ body: { padding: '12px 16px' } }}
          >
            <ReactECharts option={trendOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<Text strong>Modality Distribution</Text>}
            styles={{ body: { padding: '12px 16px' } }}
          >
            <ReactECharts option={modalityOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <Card
            title={<Text strong>FID Score Distribution</Text>}
            styles={{ body: { padding: '12px 16px' } }}
          >
            <ReactECharts option={qualityOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            title={<Text strong>Recent Tasks</Text>}
            styles={{ body: { padding: '12px 16px' } }}
          >
            <Table
              dataSource={recentTasks}
              columns={recentColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
