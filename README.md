# MedImage Toolkit

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.9%2B-blue.svg)
![React](https://img.shields.io/badge/react-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3-3178c6.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.109-009688.svg)

医学图像合成工具包 - 基于扩散模型和ControlNet的开源解决方案。

这个工具包用于生成CT、MRI、X-Ray等医学图像，主要面向AI模型训练、临床教学和科研场景。前后端分离架构，支持批量生成和质量评估。

---

## 功能特性

### 图像合成
- 支持CT、MRI（T1/T2）、X-Ray多种模态
- ControlNet条件控制（边缘检测、分割掩码、深度图）
- 批量生成，可配置参数
- 内置FID、SSIM、PSNR质量评估

### Web平台
- 实时统计面板
- 可视化合成工作台
- 模型管理和对比
- 数据集浏览
- 任务历史记录
- 质量分析报表

### 开发体验
- FastAPI后端，自带OpenAPI文档
- Python库可独立使用
- Docker一键部署
- TypeScript前端，类型安全

---

## 快速开始

### 环境要求
- Python 3.9+
- Node.js 18+
- npm 或 yarn

### 方式一：仅Python库

```bash
pip install -e .

from medimage_toolkit import SynthesisPipeline

pipeline = SynthesisPipeline()
result = pipeline.generate(
    prompt="Liver CT with 3cm low-density lesion in right lobe",
    modality="CT",
    steps=50,
    guidance_scale=7.5
)
print(f"Generated {result.modality} image: {result.image.shape}")
```

### 方式二：完整平台（前后端）

```bash
# 后端
cd backend
pip install -r requirements.txt
python -m app.main
# API: http://localhost:8000
# 文档: http://localhost:8000/docs

# 前端（另开终端）
cd frontend
npm install
npm run dev
# 界面: http://localhost:5173
```

### 方式三：Docker Compose

```bash
docker-compose up --build
# 前端: http://localhost:3000
# 后端API: http://localhost:8000
```

### 默认登录
- 用户名: `admin`
- 密码: `admin123`

---

## 项目结构

```
MedImage-Toolkit/
├── medimage_toolkit/          # Python包
│   ├── core/
│   │   ├── pipeline.py        # 合成流水线
│   │   ├── condition.py       # 条件处理（边缘/分割/深度）
│   │   └── quality.py         # 质量指标（FID/SSIM/PSNR）
│   └── utils/
│       └── config.py          # 配置管理
├── backend/                   # FastAPI后端
│   ├── app/
│   │   ├── api/v1/            # API接口
│   │   ├── core/              # 配置、数据库、安全
│   │   ├── models/            # SQLAlchemy模型
│   │   └── seed/              # 种子数据
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                  # React + TypeScript前端
│   ├── src/
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API客户端
│   │   ├── stores/            # Zustand状态管理
│   │   └── types/             # TypeScript类型
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── setup.py
└── README.md
```

---

## API接口

### 认证
```bash
POST /api/v1/auth/login
```

### 图像合成
```bash
POST /api/v1/synthesis/generate     # 提交合成任务
GET  /api/v1/synthesis/tasks         # 任务列表
GET  /api/v1/synthesis/tasks/{id}    # 任务详情
```

### 模型管理
```bash
GET  /api/v1/models                  # 模型列表
GET  /api/v1/models/{id}             # 模型详情
```

### 数据集
```bash
GET  /api/v1/datasets                # 数据集列表
POST /api/v1/datasets                # 创建数据集
```

### 质量评估
```bash
POST /api/v1/quality/evaluate        # 评估质量指标
POST /api/v1/quality/compare         # 模型对比
GET  /api/v1/quality/trends          # 质量趋势
```

### 仪表盘
```bash
GET  /api/v1/dashboard/stats         # 统计概览
GET  /api/v1/dashboard/synthesis-trend
GET  /api/v1/dashboard/modality-distribution
```

完整API文档运行后端后访问 `/docs`。

---

## Python库用法

### 合成流水线

```python
from medimage_toolkit import SynthesisPipeline

pipeline = SynthesisPipeline(model_name="stable-diffusion-med-v1")

# 单张图像生成
result = pipeline.generate(
    prompt="Brain MRI T1 with meningioma",
    modality="MRI",
    steps=75,
    guidance_scale=8.0
)

# 批量生成
tasks = [
    {"prompt": "Liver CT", "modality": "CT"},
    {"prompt": "Chest X-Ray", "modality": "X-Ray", "steps": 30},
]
results = pipeline.batch_generate(tasks)
```

### 条件处理

```python
from medimage_toolkit import ConditionProcessor

processor = ConditionProcessor()

# 边缘检测 - 用于结构条件控制
edges = processor.process_canny(medical_image)

# 分割掩码 - 用于区域引导合成
seg_mask = processor.process_segmentation(medical_image)

# 深度图 - 用于3D感知生成
depth = processor.process_depth(medical_image)
```

### 质量评估

```python
from medimage_toolkit import QualityMetrics

metrics = QualityMetrics()

# 单项指标
fid = metrics.calculate_fid(real_images, generated_images)
ssim = metrics.calculate_ssim(image1, image2)
psnr = metrics.calculate_psnr(image1, image2)

# 综合评估
report = metrics.evaluate_comprehensive(real_images, generated_images)
print(f"Quality: {report.overall_quality}")
print(f"FID: {report.fid_score}, SSIM: {report.ssim_score}")
```

---

## 配置

```python
from medimage_toolkit.utils import ToolkitConfig

config = ToolkitConfig(
    default_modality="CT",
    default_steps=50,
    default_guidance_scale=7.5,
    device="cuda",
    num_workers=8,
)
config.save("config.json")
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18, TypeScript, Vite, Ant Design, ECharts |
| 后端 | Python, FastAPI, SQLAlchemy, SQLite |
| 状态管理 | Zustand |
| 样式 | Ant Design tokens, CSS-in-JS |
| 图表 | Apache ECharts |
| 认证 | JWT (python-jose) |
| 构建 | Vite, TypeScript compiler |

---

## 参与贡献

欢迎提交bug报告、功能建议或代码贡献。

### 开发环境搭建

```bash
git clone https://github.com/guaiguaiguai1/MedImage-Toolkit.git
cd MedImage-Toolkit

# 安装Python包（开发模式）
pip install -e .

# 后端
cd backend
pip install -r requirements.txt
python -m app.main

# 前端
cd frontend
npm install
npm run dev
```

### 代码规范
- Python: PEP 8，使用类型注解
- TypeScript: 严格模式，遵循ESLint规则
- 提交信息: 使用约定式提交格式

---

## 许可证

Apache License 2.0 - 详见 [LICENSE](LICENSE) 文件。

---

## 致谢

- 受医学影像研究社区启发
- 基于 [Stable Diffusion](https://github.com/CompVis/stable-diffusion) 架构
- 使用 [ControlNet](https://github.com/lllyasviel/ControlNet) 条件控制方法
- 医学影像数据集来自 [LiTS](https://competitions.codalab.org/competitions/17094)、[BraTS](https://www.med.upenn.edu/cbia/brats2023/)、[ChestX-ray14](https://nihcc.app.box.com/v/ChestXray-NIHCC)

---

## 引用

如果在研究中使用了MedImage Toolkit，请引用：

```bibtex
@software{medimage_toolkit2024,
  title={MedImage Toolkit: Medical Image Synthesis Toolkit},
  author={MedImage Contributors},
  year={2024},
  url={https://github.com/guaiguaiguai1/MedImage-Toolkit}
}
```
