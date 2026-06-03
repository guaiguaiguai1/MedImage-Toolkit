"""
Synthesis Pipeline Module

Provides the main SynthesisPipeline class for generating synthetic medical images
using simulated diffusion model processes.
"""

import uuid
import time
from typing import Optional
from dataclasses import dataclass, field

import numpy as np


SUPPORTED_MODALITIES = ["CT", "MRI", "X-Ray"]

MODALITY_COLORS = {
    "CT": {"base": 40, "range": 200, "noise": 15},
    "MRI": {"base": 60, "range": 180, "noise": 20},
    "X-Ray": {"base": 20, "range": 220, "noise": 10},
}


@dataclass
class SynthesisResult:
    """Result container for a synthesis operation."""

    task_id: str
    image: np.ndarray
    prompt: str
    modality: str
    steps: int
    guidance_scale: float
    generation_time: float
    metadata: dict = field(default_factory=dict)


class SynthesisPipeline:
    """
    Main synthesis pipeline for generating synthetic medical images.

    This class simulates a diffusion model pipeline for generating CT, MRI,
    and X-Ray images. In a production environment, this would interface with
    actual diffusion models (e.g., Stable Diffusion with ControlNet).

    Example:
        >>> pipeline = SynthesisPipeline()
        >>> result = pipeline.generate(
        ...     prompt="Liver CT with low-density lesion",
        ...     modality="CT",
        ...     steps=50
        ... )
        >>> print(result.image.shape)
        (512, 512, 3)
    """

    def __init__(self, model_name: str = "stable-diffusion-med-v1", device: str = "cpu"):
        self.model_name = model_name
        self.device = device
        self._is_loaded = False
        self._generation_count = 0

    def load_model(self) -> None:
        """Load the synthesis model into memory."""
        self._is_loaded = True

    def unload_model(self) -> None:
        """Unload the synthesis model from memory."""
        self._is_loaded = False

    def generate(
        self,
        prompt: str,
        condition_image: Optional[np.ndarray] = None,
        modality: str = "CT",
        steps: int = 50,
        guidance_scale: float = 7.5,
        width: int = 512,
        height: int = 512,
        seed: Optional[int] = None,
    ) -> SynthesisResult:
        """
        Generate a synthetic medical image.

        Args:
            prompt: Text description of the desired image.
            condition_image: Optional conditioning image (Canny/segmentation/depth).
            modality: Imaging modality ('CT', 'MRI', or 'X-Ray').
            steps: Number of diffusion inference steps (20-100).
            guidance_scale: Classifier-free guidance scale (1.0-20.0).
            width: Output image width.
            height: Output image height.
            seed: Random seed for reproducibility.

        Returns:
            SynthesisResult containing the generated image and metadata.

        Raises:
            ValueError: If modality is not supported or parameters are invalid.
        """
        if modality not in SUPPORTED_MODALITIES:
            raise ValueError(f"Unsupported modality: {modality}. Supported: {SUPPORTED_MODALITIES}")

        if steps < 20 or steps > 100:
            raise ValueError("Steps must be between 20 and 100.")

        if guidance_scale < 1.0 or guidance_scale > 20.0:
            raise ValueError("Guidance scale must be between 1.0 and 20.0.")

        start_time = time.time()

        if seed is not None:
            np.random.seed(seed)

        task_id = str(uuid.uuid4())

        params = MODALITY_COLORS[modality]
        base_val = params["base"]
        range_val = params["range"]
        noise_level = params["noise"]

        image = self._generate_base_image(width, height, base_val, range_val)

        if condition_image is not None:
            image = self._apply_condition(image, condition_image)

        noise = np.random.normal(0, noise_level, image.shape).astype(np.float64)
        image = np.clip(image + noise, 0, 255).astype(np.uint8)

        image = self._apply_modality_characteristics(image, modality)

        generation_time = time.time() - start_time + (steps * 0.01)

        self._generation_count += 1

        return SynthesisResult(
            task_id=task_id,
            image=image,
            prompt=prompt,
            modality=modality,
            steps=steps,
            guidance_scale=guidance_scale,
            generation_time=round(generation_time, 3),
            metadata={
                "model": self.model_name,
                "device": self.device,
                "width": width,
                "height": height,
                "seed": seed,
                "has_condition": condition_image is not None,
            },
        )

    def batch_generate(
        self,
        tasks: list[dict],
    ) -> list[SynthesisResult]:
        """
        Generate multiple synthetic images in batch.

        Args:
            tasks: List of task dictionaries, each containing generation parameters.
                   Required key: 'prompt'. Optional: 'modality', 'steps',
                   'guidance_scale', 'width', 'height', 'seed'.

        Returns:
            List of SynthesisResult objects.

        Example:
            >>> results = pipeline.batch_generate([
            ...     {"prompt": "Brain MRI T1", "modality": "MRI"},
            ...     {"prompt": "Chest X-Ray", "modality": "X-Ray", "steps": 30},
            ... ])
        """
        results = []
        for task in tasks:
            result = self.generate(
                prompt=task.get("prompt", "medical image"),
                condition_image=task.get("condition_image"),
                modality=task.get("modality", "CT"),
                steps=task.get("steps", 50),
                guidance_scale=task.get("guidance_scale", 7.5),
                width=task.get("width", 512),
                height=task.get("height", 512),
                seed=task.get("seed"),
            )
            results.append(result)
        return results

    def get_supported_modalities(self) -> list[str]:
        """Return list of supported imaging modalities."""
        return SUPPORTED_MODALITIES.copy()

    def get_model_info(self) -> dict:
        """Return information about the loaded model."""
        return {
            "model_name": self.model_name,
            "device": self.device,
            "is_loaded": self._is_loaded,
            "generation_count": self._generation_count,
            "supported_modalities": SUPPORTED_MODALITIES,
        }

    def _generate_base_image(
        self, width: int, height: int, base_val: int, range_val: int
    ) -> np.ndarray:
        """Generate a base image with spatial structure."""
        x = np.linspace(0, np.pi * 4, width)
        y = np.linspace(0, np.pi * 4, height)
        xx, yy = np.meshgrid(x, y)

        pattern = (
            np.sin(xx * 0.5) * np.cos(yy * 0.3) * 0.3
            + np.sin(xx * 0.2 + yy * 0.4) * 0.2
            + np.random.normal(0, 0.1, (height, width))
        )

        pattern = (pattern - pattern.min()) / (pattern.max() - pattern.min())
        image_val = (base_val + pattern * range_val).astype(np.float64)

        image = np.stack([image_val, image_val, image_val], axis=-1)
        return image

    def _apply_condition(
        self, image: np.ndarray, condition_image: np.ndarray
    ) -> np.ndarray:
        """Apply conditioning image influence."""
        if condition_image.shape[:2] != image.shape[:2]:
            from PIL import Image as PILImage

            pil_img = PILImage.fromarray(condition_image)
            pil_img = pil_img.resize((image.shape[1], image.shape[0]))
            condition_image = np.array(pil_img)

        if len(condition_image.shape) == 2:
            condition_image = np.stack([condition_image] * 3, axis=-1)

        alpha = 0.3
        condition_norm = condition_image.astype(np.float64) / 255.0
        image = image * (1 - alpha * condition_norm) + condition_norm * 128 * alpha
        return image

    def _apply_modality_characteristics(
        self, image: np.ndarray, modality: str
    ) -> np.ndarray:
        """Apply modality-specific visual characteristics."""
        if modality == "CT":
            center = (image.shape[0] // 2, image.shape[1] // 2)
            yy, xx = np.ogrid[: image.shape[0], : image.shape[1]]
            radius = min(image.shape[0], image.shape[1]) * 0.4
            dist = np.sqrt((xx - center[1]) ** 2 + (yy - center[0]) ** 2)
            mask = np.clip(1.0 - dist / radius, 0, 1)
            image = image * mask[:, :, np.newaxis]

        elif modality == "MRI":
            yy, xx = np.mgrid[: image.shape[0], : image.shape[1]]
            grad = np.sin(xx * 0.01) * 0.1 + 1.0
            image = image * grad[:, :, np.newaxis]

        elif modality == "X-Ray":
            image = image * 0.7 + image.mean() * 0.3

        return np.clip(image, 0, 255).astype(np.uint8)
