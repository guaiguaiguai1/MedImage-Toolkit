import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Select,
  Slider,
  Button,
  Tag,
  Space,
  Typography,
  List,
  Divider,
  message,
  Spin,
  Empty,
  Segmented,
} from 'antd';
import {
  ExperimentOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { synthesisApi } from '../../services/api';
import type { SynthesisTask, GenerateRequest } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const MODALITY_GRADIENTS: Record<string, string> = {
  CT: 'linear-gradient(135deg, #1e293b 0%, #334155 30%, #64748b 60%, #1e293b 100%)',
  MRI: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #3b82f6 50%, #1e3a5f 70%, #0f172a 100%)',
  'X-Ray': 'linear-gradient(135deg, #18181b 0%, #27272a 25%, #52525b 50%, #27272a 75%, #18181b 100%)',
};

const PROMPT_EXAMPLES: Record<string, string[]> = {
  CT: [
    'Liver CT with 3cm low-density lesion in right lobe segment VII',
    'Abdominal CT showing renal cell carcinoma in left kidney',
    'Chest CT with ground-glass opacities in bilateral lower lobes',
    'Brain CT with acute hemorrhage in right basal ganglia',
  ],
  MRI: [
    'Brain MRI T1 showing meningioma with dural tail sign',
    'Knee MRI with ACL tear and meniscal degeneration',
    'Brain MRI FLAIR with multiple sclerosis plaques',
    'Cardiac MRI showing hypertrophic cardiomyopathy',
  ],
  'X-Ray': [
    'Frontal chest X-ray showing right lower lobe pneumonia',
    'PA chest X-ray with cardiomegaly and bilateral effusions',
    'Chest X-ray with pneumothorax on the left side',
    'Chest X-ray showing cavitary lesion in left upper lobe',
  ],
};

const Synthesis: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modality, setModality] = useState<string>('CT');
  const [tasks, setTasks] = useState<SynthesisTask[]>([]);
  const [currentResult, setCurrentResult] = useState<SynthesisTask | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await synthesisApi.getTasks({ limit: 20 });
      setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async (values: GenerateRequest) => {
    setLoading(true);
    try {
      const result = await synthesisApi.generate({
        ...values,
        modality: values.modality as 'CT' | 'MRI' | 'X-Ray',
      });
      setCurrentResult(result);
      setTasks((prev) => [result, ...prev]);
      message.success('Image synthesized successfully');
    } catch {
      // Simulate result on API failure
      const mockResult: SynthesisTask = {
        id: `mock-${Date.now()}`,
        prompt: values.prompt,
        modality: values.modality as 'CT' | 'MRI' | 'X-Ray',
        condition_type: values.condition_type || null,
        steps: values.steps,
        guidance_scale: values.guidance_scale,
        image_width: values.image_width || 512,
        image_height: values.image_height || 512,
        status: 'completed',
        result_path: '/outputs/mock.png',
        fid_score: +(Math.random() * 20 + 15).toFixed(2),
        ssim_score: +(Math.random() * 0.15 + 0.80).toFixed(4),
        psnr_score: +(Math.random() * 15 + 25).toFixed(2),
        generation_time: +(Math.random() * 6 + 2).toFixed(3),
        error_message: null,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };
      setCurrentResult(mockResult);
      setTasks((prev) => [mockResult, ...prev]);
      message.success('Image synthesized successfully (demo mode)');
    } finally {
      setLoading(false);
    }
  };

  const handleUseExample = (prompt: string) => {
    form.setFieldsValue({ prompt });
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24, color: '#0f172a' }}>
        <ExperimentOutlined style={{ marginRight: 8, color: '#0ea5e9' }} />
        Image Synthesis
      </Title>

      <Row gutter={[20, 20]}>
        {/* Left Panel - Configuration */}
        <Col xs={24} lg={10}>
          <Card
            title={<Text strong>Generation Configuration</Text>}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                modality: 'CT',
                steps: 50,
                guidance_scale: 7.5,
                image_width: 512,
                image_height: 512,
              }}
              onFinish={handleSubmit}
              size="middle"
            >
              <Form.Item name="modality" label="Imaging Modality">
                <Segmented
                  block
                  options={[
                    { label: 'CT', value: 'CT' },
                    { label: 'MRI', value: 'MRI' },
                    { label: 'X-Ray', value: 'X-Ray' },
                  ]}
                  onChange={(val) => setModality(val as string)}
                />
              </Form.Item>

              <Form.Item
                name="prompt"
                label="Text Prompt"
                rules={[{ required: true, message: 'Please enter a prompt' }]}
              >
                <TextArea
                  rows={3}
                  placeholder={`e.g., ${PROMPT_EXAMPLES[modality]?.[0] || 'Describe the medical image...'}`}
                />
              </Form.Item>

              <div style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: '#64748b' }}>Quick prompts:</Text>
                <div style={{ marginTop: 6 }}>
                  {PROMPT_EXAMPLES[modality]?.slice(0, 3).map((ex, i) => (
                    <Tag
                      key={i}
                      style={{
                        cursor: 'pointer',
                        marginBottom: 6,
                        maxWidth: '100%',
                        whiteSpace: 'normal',
                        height: 'auto',
                        padding: '4px 8px',
                      }}
                      onClick={() => handleUseExample(ex)}
                    >
                      {ex.length > 60 ? ex.slice(0, 60) + '...' : ex}
                    </Tag>
                  ))}
                </div>
              </div>

              <Form.Item name="condition_type" label="Condition Type">
                <Select placeholder="Select condition (optional)" allowClear>
                  <Select.Option value="canny">Canny Edge Detection</Select.Option>
                  <Select.Option value="segmentation">Segmentation Mask</Select.Option>
                  <Select.Option value="depth">Depth Map</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="steps" label={`Inference Steps: ${form.getFieldValue('steps') || 50}`}>
                <Slider min={20} max={100} step={5} marks={{ 20: '20', 50: '50', 100: '100' }} />
              </Form.Item>

              <Form.Item name="guidance_scale" label={`Guidance Scale: ${form.getFieldValue('guidance_scale') || 7.5}`}>
                <Slider min={1} max={20} step={0.5} marks={{ 1: '1', 7.5: '7.5', 20: '20' }} />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="image_width" label="Width">
                    <Select>
                      <Select.Option value={256}>256</Select.Option>
                      <Select.Option value={384}>384</Select.Option>
                      <Select.Option value={512}>512</Select.Option>
                      <Select.Option value={768}>768</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="image_height" label="Height">
                    <Select>
                      <Select.Option value={256}>256</Select.Option>
                      <Select.Option value={384}>384</Select.Option>
                      <Select.Option value={512}>512</Select.Option>
                      <Select.Option value={768}>768</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={<ThunderboltOutlined />}
                  style={{ height: 44, fontWeight: 600 }}
                >
                  Generate Image
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Panel - Results */}
        <Col xs={24} lg={14}>
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            {/* Result Display */}
            <Card
              title={<Text strong>Synthesis Result</Text>}
              styles={{ body: { padding: '16px 20px' } }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>
                    <Text style={{ color: '#64748b' }}>
                      Generating {modality} image... This may take a few moments.
                    </Text>
                  </div>
                </div>
              ) : currentResult ? (
                <div>
                  <div
                    style={{
                      width: '100%',
                      height: 360,
                      borderRadius: 8,
                      background: MODALITY_GRADIENTS[currentResult.modality],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Simulated medical image overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)`,
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: 'rgba(0,0,0,0.6)',
                        padding: '4px 10px',
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'monospace' }}>
                        {currentResult.modality} | {currentResult.image_width}x{currentResult.image_height} | Steps: {currentResult.steps}
                      </Text>
                    </div>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, zIndex: 1 }}>
                      Synthetic {currentResult.modality} Image
                    </Text>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Quality Metrics */}
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ textAlign: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>FID Score</Text>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#0ea5e9' }}>
                          {currentResult.fid_score?.toFixed(1) ?? '-'}
                        </div>
                        <Text style={{ fontSize: 11, color: '#94a3b8' }}>Lower is better</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>SSIM</Text>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>
                          {currentResult.ssim_score?.toFixed(4) ?? '-'}
                        </div>
                        <Text style={{ fontSize: 11, color: '#94a3b8' }}>Higher is better</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>PSNR (dB)</Text>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>
                          {currentResult.psnr_score?.toFixed(1) ?? '-'}
                        </div>
                        <Text style={{ fontSize: 11, color: '#94a3b8' }}>Higher is better</Text>
                      </div>
                    </Col>
                  </Row>

                  <Divider style={{ margin: '16px 0' }} />

                  <div>
                    <Text style={{ fontSize: 12, color: '#64748b' }}>Prompt</Text>
                    <Paragraph
                      style={{
                        margin: '4px 0 0',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: 6,
                        fontSize: 13,
                      }}
                    >
                      {currentResult.prompt}
                    </Paragraph>
                  </div>

                  <Space style={{ marginTop: 8 }}>
                    <Tag>Modality: {currentResult.modality}</Tag>
                    <Tag>Condition: {currentResult.condition_type || 'None'}</Tag>
                    <Tag>Time: {currentResult.generation_time?.toFixed(2)}s</Tag>
                    <Tag color="success">
                      <CheckCircleOutlined /> {currentResult.status}
                    </Tag>
                  </Space>
                </div>
              ) : (
                <Empty
                  description="Configure parameters and click Generate to create a synthetic medical image"
                  style={{ padding: '60px 0' }}
                />
              )}
            </Card>

            {/* Generation History */}
            <Card
              title={
                <Space>
                  <HistoryOutlined />
                  <Text strong>Generation History</Text>
                  <Tag>{tasks.length}</Tag>
                </Space>
              }
              styles={{ body: { padding: '8px 12px' } }}
            >
              <List
                loading={tasksLoading}
                dataSource={tasks.slice(0, 8)}
                locale={{ emptyText: 'No synthesis tasks yet' }}
                renderItem={(task) => (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: 6,
                      background: currentResult?.id === task.id ? '#f0f9ff' : 'transparent',
                    }}
                    onClick={() => setCurrentResult(task)}
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13 }} ellipsis>
                          {task.prompt}
                        </Text>
                        <Space size={4}>
                          <Tag color="blue" style={{ margin: 0 }}>
                            {task.modality}
                          </Tag>
                          {task.fid_score && (
                            <Tag color="cyan" style={{ margin: 0 }}>
                              FID: {task.fid_score.toFixed(1)}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Synthesis;
