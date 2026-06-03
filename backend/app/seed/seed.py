"""Database seed data for initial setup."""

import random
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.models.dataset import Dataset
from app.models.model import PretrainedModel
from app.models.synthesis_task import SynthesisTask


def seed_users(db: Session) -> list[User]:
    """Create seed users."""
    users_data = [
        {
            "username": "admin",
            "email": "admin@medimage.org",
            "full_name": "Admin User",
            "role": "admin",
            "password": "admin123",
        },
        {
            "username": "researcher",
            "email": "researcher@medimage.org",
            "full_name": "Dr. Sarah Chen",
            "role": "user",
            "password": "research123",
        },
        {
            "username": "clinician",
            "email": "clinician@hospital.org",
            "full_name": "Dr. James Wilson",
            "role": "user",
            "password": "clinic123",
        },
    ]
    users = []
    for data in users_data:
        user = User(
            id=str(uuid.uuid4()),
            username=data["username"],
            email=data["email"],
            full_name=data["full_name"],
            role=data["role"],
            hashed_password=get_password_hash(data["password"]),
        )
        db.add(user)
        users.append(user)
    db.commit()
    return users


def seed_models(db: Session) -> list[PretrainedModel]:
    """Create seed pretrained models."""
    models_data = [
        {
            "name": "StableDiffusion-CT-v2",
            "modality": "CT",
            "version": "2.1.0",
            "description": "Fine-tuned Stable Diffusion model for CT image synthesis. Trained on 50,000+ CT scans covering thoracic, abdominal, and cranial regions. Supports lesion generation with anatomical accuracy.",
            "fid_score": 18.5,
            "download_size_mb": 4200,
            "status": "ready",
        },
        {
            "name": "StableDiffusion-MRI-T1-v1",
            "modality": "MRI",
            "version": "1.3.0",
            "description": "Specialized model for T1-weighted MRI synthesis. Optimized for brain MRI generation with accurate tissue contrast. Supports multiple slice orientations.",
            "fid_score": 21.3,
            "download_size_mb": 3800,
            "status": "ready",
        },
        {
            "name": "StableDiffusion-MRI-T2-v1",
            "modality": "MRI",
            "version": "1.2.0",
            "description": "T2-weighted MRI synthesis model. Excellent for generating FLAIR and T2 sequences with realistic pathology including edema and white matter lesions.",
            "fid_score": 23.7,
            "download_size_mb": 3900,
            "status": "ready",
        },
        {
            "name": "StableDiffusion-XRay-v3",
            "modality": "X-Ray",
            "version": "3.0.1",
            "description": "Chest X-Ray synthesis model trained on ChestX-ray14 and MIMIC-CXR datasets. Generates PA and AP views with realistic cardiac and pulmonary findings.",
            "fid_score": 16.8,
            "download_size_mb": 3500,
            "status": "ready",
        },
        {
            "name": "StableDiffusion-Pathology-v1",
            "modality": "CT",
            "version": "1.0.0-beta",
            "description": "Experimental model for pathology-focused CT synthesis. Currently in beta testing for generating scans with specific pathological conditions.",
            "fid_score": 28.4,
            "download_size_mb": 4500,
            "status": "training",
        },
    ]
    models = []
    for data in models_data:
        model = PretrainedModel(id=str(uuid.uuid4()), **data)
        db.add(model)
        models.append(model)
    db.commit()
    return models


def seed_datasets(db: Session) -> list[Dataset]:
    """Create seed datasets."""
    datasets_data = [
        {
            "name": "LiTS - Liver Tumor Segmentation",
            "modality": "CT",
            "image_count": 131200,
            "description": "Liver Tumor Segmentation Challenge dataset containing 131 CT scans with expert annotations for liver and tumor segmentation. Standard benchmark for hepatic lesion analysis.",
            "source": "https://competitions.codalab.org/competitions/17094",
            "file_size_mb": 28500,
        },
        {
            "name": "BraTS - Brain Tumor Segmentation",
            "modality": "MRI",
            "image_count": 69280,
            "description": "Multimodal Brain Tumor Segmentation Challenge dataset. Includes T1, T1ce, T2, and FLAIR MRI sequences with expert annotations for glioma segmentation.",
            "source": "https://www.med.upenn.edu/cbia/brats2023/",
            "file_size_mb": 45200,
        },
        {
            "name": "ChestX-ray14",
            "modality": "X-Ray",
            "image_count": 112120,
            "description": "NIH Clinical Center chest X-ray dataset with 112,120 frontal-view X-rays from 30,805 patients. Labels for 14 common thoracic pathologies mined from radiology reports.",
            "source": "https://nihcc.app.box.com/v/ChestXray-NIHCC",
            "file_size_mb": 42000,
        },
        {
            "name": "Custom Clinical Dataset",
            "modality": "CT",
            "image_count": 8450,
            "description": "Custom curated dataset of CT scans with various pathologies for model fine-tuning. Includes quality-controlled annotations from board-certified radiologists.",
            "source": "Internal",
            "file_size_mb": 5600,
        },
    ]
    datasets = []
    for data in datasets_data:
        dataset = Dataset(id=str(uuid.uuid4()), **data)
        db.add(dataset)
        datasets.append(dataset)
    db.commit()
    return datasets


def seed_tasks(db: Session) -> list[SynthesisTask]:
    """Create seed synthesis tasks."""
    prompts_by_modality = {
        "CT": [
            "Liver CT with 3cm low-density lesion in right lobe segment VII",
            "Abdominal CT showing renal cell carcinoma in left kidney with enhancement",
            "Chest CT with ground-glass opacities in bilateral lower lobes",
            "Brain CT with acute hemorrhage in right basal ganglia",
            "Thoracic CT with 2cm spiculated mass in right upper lobe",
            "Abdominal CT with pancreatic head mass and biliary dilation",
            "Lumbar spine CT showing L4-L5 disc herniation",
            "CT angiography of abdominal aorta with aneurysm",
        ],
        "MRI": [
            "Brain MRI T1 showing meningioma with dural tail sign",
            "Knee MRI with ACL tear and meniscal degeneration",
            "Brain MRI FLAIR with multiple sclerosis plaques periventricular",
            "Cardiac MRI showing hypertrophic cardiomyopathy",
            "Spinal MRI with intradural extramedullary tumor at T8",
            "Brain MRI T2 with high signal in temporal lobes suggesting encephalitis",
            "Shoulder MRI with rotator cuff full-thickness tear",
            "Liver MRI with hepatocellular carcinoma in segment VIII",
        ],
        "X-Ray": [
            "Frontal chest X-ray showing right lower lobe pneumonia",
            "PA chest X-ray with cardiomegaly and bilateral pleural effusions",
            "Chest X-ray with pneumothorax on the left side",
            "AP portable chest X-ray with endotracheal tube in situ",
            "Chest X-ray showing cavitary lesion in left upper lobe",
            "Frontal chest X-ray with diffuse interstitial pattern suggesting pulmonary fibrosis",
            "Chest X-ray with rib fractures on right side 4th-7th ribs",
            "PA chest X-ray showing sarcoidosis with bilateral hilar lymphadenopathy",
        ],
    }

    condition_types = ["canny", "segmentation", "depth", None]
    statuses = ["completed", "completed", "completed", "completed", "completed", "pending", "running", "failed"]

    tasks = []
    base_date = datetime.now(timezone.utc)

    for i in range(24):
        modality = random.choice(["CT", "MRI", "X-Ray"])
        prompt = random.choice(prompts_by_modality[modality])
        status = random.choice(statuses)
        created_date = base_date - timedelta(days=random.randint(0, 29), hours=random.randint(0, 23))

        task = SynthesisTask(
            id=str(uuid.uuid4()),
            prompt=prompt,
            modality=modality,
            condition_type=random.choice(condition_types),
            steps=random.choice([30, 40, 50, 60, 75, 100]),
            guidance_scale=round(random.uniform(5.0, 12.0), 1),
            image_width=512,
            image_height=512,
            status=status,
            result_path=f"/outputs/{modality.lower()}_{i:04d}.png" if status == "completed" else None,
            fid_score=round(random.uniform(15.0, 35.0), 2) if status == "completed" else None,
            ssim_score=round(random.uniform(0.80, 0.95), 4) if status == "completed" else None,
            psnr_score=round(random.uniform(25.0, 40.0), 2) if status == "completed" else None,
            generation_time=round(random.uniform(1.5, 8.0), 3) if status == "completed" else None,
            error_message="CUDA out of memory" if status == "failed" else None,
            created_at=created_date,
            completed_at=created_date + timedelta(seconds=random.randint(30, 300)) if status == "completed" else None,
        )
        db.add(task)
        tasks.append(task)
    db.commit()
    return tasks


def seed_database(db: Session) -> None:
    """Run all seed functions if database is empty."""
    existing_users = db.query(User).count()
    if existing_users > 0:
        return

    print("Seeding database...")
    seed_users(db)
    print("  - Users seeded")
    seed_models(db)
    print("  - Models seeded")
    seed_datasets(db)
    print("  - Datasets seeded")
    seed_tasks(db)
    print("  - Tasks seeded")
    print("Database seeding complete.")
