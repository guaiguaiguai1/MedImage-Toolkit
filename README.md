# MedImage Toolkit

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.9%2B-blue.svg)
![React](https://img.shields.io/badge/react-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3-3178c6.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.109-009688.svg)

**An open-source toolkit for medical image synthesis using diffusion models and ControlNet.**

MedImage Toolkit provides a complete platform for generating synthetic CT, MRI, and X-Ray images for AI model training, clinical education, and research applications. Built with modern web technologies and a focus on usability, quality evaluation, and reproducibility.

![MedImage Toolkit](https://img.shields.io/badge/status-active-brightgreen.svg)

---

## Features

### Core Synthesis Engine
- **Multi-Modality Support**: Generate CT, MRI (T1/T2), and X-Ray images
- **ControlNet Integration**: Canny edge, segmentation mask, and depth map conditioning
- **Batch Processing**: Generate multiple images with configurable parameters
- **Quality Metrics**: Built-in FID, SSIM, and PSNR evaluation

### Web Platform
- **Interactive Dashboard**: Real-time statistics and synthesis trends
- **Synthesis Workspace**: Configure and generate images with live preview
- **Model Management**: Browse, compare, and select pretrained models
- **Dataset Explorer**: Browse and manage medical imaging datasets
- **Task History**: Track and review all synthesis operations
- **Quality Analysis**: Compare model performance across metrics

### Developer Experience
- **REST API**: Full-featured FastAPI backend with OpenAPI documentation
- **Python Library**: Use the synthesis engine directly in your scripts
- **Docker Support**: One-command deployment with Docker Compose
- **Type-Safe Frontend**: Built with TypeScript for reliability

---

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Option 1: Python Library Only

```bash
pip install -e .

# Use in Python
from medimage_toolkit import SynthesisPipeline, QualityMetrics

pipeline = SynthesisPipeline()
result = pipeline.generate(
    prompt="Liver CT with 3cm low-density lesion in right lobe",
    modality="CT",
    steps=50,
    guidance_scale=7.5
)
print(f"Generated {result.modality} image: {result.image.shape}")
print(f"Generation time: {result.generation_time}s")
```

### Option 2: Full Platform (Backend + Frontend)

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m app.main
# API runs at http://localhost:8000
# Docs at http://localhost:8000/docs

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# UI runs at http://localhost:5173
```

### Option 3: Docker Compose

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Default Login
- **Username**: `admin`
- **Password**: `admin123`

---

## Project Structure

```
MedImage-Toolkit/
├── medimage_toolkit/          # Python package
│   ├── core/
│   │   ├── pipeline.py        # Synthesis pipeline
│   │   ├── condition.py       # Condition processing (Canny, Seg, Depth)
│   │   └── quality.py         # Quality metrics (FID, SSIM, PSNR)
│   └── utils/
│       └── config.py          # Configuration management
├── backend/                   # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   ├── core/              # Config, database, security
│   │   ├── models/            # SQLAlchemy models
│   │   └── seed/              # Database seed data
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                  # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   ├── stores/            # Zustand state management
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── setup.py
└── README.md
```

---

## API Reference

### Authentication
```bash
POST /api/v1/auth/login
```

### Synthesis
```bash
POST /api/v1/synthesis/generate     # Submit synthesis task
GET  /api/v1/synthesis/tasks         # List tasks
GET  /api/v1/synthesis/tasks/{id}    # Get task details
```

### Models
```bash
GET  /api/v1/models                  # List pretrained models
GET  /api/v1/models/{id}             # Get model details
```

### Datasets
```bash
GET  /api/v1/datasets                # List datasets
POST /api/v1/datasets                # Create dataset
```

### Quality
```bash
POST /api/v1/quality/evaluate        # Evaluate quality metrics
POST /api/v1/quality/compare         # Compare models
GET  /api/v1/quality/trends          # Get quality trends
```

### Dashboard
```bash
GET  /api/v1/dashboard/stats         # Overview statistics
GET  /api/v1/dashboard/synthesis-trend
GET  /api/v1/dashboard/modality-distribution
```

Full interactive documentation available at `/docs` when running the backend.

---

## Python Library Usage

### Synthesis Pipeline

```python
from medimage_toolkit import SynthesisPipeline

pipeline = SynthesisPipeline(model_name="stable-diffusion-med-v1")

# Single image generation
result = pipeline.generate(
    prompt="Brain MRI T1 with meningioma",
    modality="MRI",
    steps=75,
    guidance_scale=8.0
)

# Batch generation
tasks = [
    {"prompt": "Liver CT", "modality": "CT"},
    {"prompt": "Chest X-Ray", "modality": "X-Ray", "steps": 30},
]
results = pipeline.batch_generate(tasks)
```

### Condition Processing

```python
from medimage_toolkit import ConditionProcessor
import numpy as np

processor = ConditionProcessor()

# Edge detection for structural conditioning
edges = processor.process_canny(medical_image)

# Segmentation mask for region-guided synthesis
seg_mask = processor.process_segmentation(medical_image)

# Depth map for 3D-aware generation
depth = processor.process_depth(medical_image)
```

### Quality Evaluation

```python
from medimage_toolkit import QualityMetrics

metrics = QualityMetrics()

# Individual metrics
fid = metrics.calculate_fid(real_images, generated_images)
ssim = metrics.calculate_ssim(image1, image2)
psnr = metrics.calculate_psnr(image1, image2)

# Comprehensive evaluation
report = metrics.evaluate_comprehensive(real_images, generated_images)
print(f"Quality: {report.overall_quality}")
print(f"FID: {report.fid_score}, SSIM: {report.ssim_score}")
```

---

## Configuration

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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Ant Design, ECharts |
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| State | Zustand |
| Styling | Ant Design tokens, CSS-in-JS |
| Charts | Apache ECharts |
| Auth | JWT (python-jose) |
| Build | Vite, TypeScript compiler |

---

## Contributing

Contributions are welcome! This is an open-source project and we welcome:

1. **Bug Reports**: Open an issue describing the bug
2. **Feature Requests**: Suggest new features or improvements
3. **Code Contributions**: Submit a pull request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/MedImage-Toolkit.git
cd MedImage-Toolkit

# Install Python package in development mode
pip install -e .

# Backend
cd backend
pip install -r requirements.txt
python -m app.main

# Frontend
cd frontend
npm install
npm run dev
```

### Code Style
- Python: Follow PEP 8, use type hints
- TypeScript: Strict mode enabled, follow ESLint rules
- Commits: Use conventional commit messages

---

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Inspired by the medical imaging research community
- Built with [Stable Diffusion](https://github.com/CompVis/stable-diffusion) architecture concepts
- Uses [ControlNet](https://github.com/lllyasviel/ControlNet) conditioning approaches
- Medical imaging datasets from [LiTS](https://competitions.codalab.org/competitions/17094), [BraTS](https://www.med.upenn.edu/cbia/brats2023/), and [ChestX-ray14](https://nihcc.app.box.com/v/ChestXray-NIHCC)

---

## Citation

If you use MedImage Toolkit in your research, please cite:

```bibtex
@software{medimage_toolkit2024,
  title={MedImage Toolkit: Medical Image Synthesis Toolkit},
  author={MedImage Contributors},
  year={2024},
  url={https://github.com/your-username/MedImage-Toolkit}
}
```

---

**Built for the medical imaging research community.**
