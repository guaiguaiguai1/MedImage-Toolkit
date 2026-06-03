"""
Configuration Management Module

Provides centralized configuration for the MedImage Toolkit.
"""

import json
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class ToolkitConfig:
    """
    Configuration for MedImage Toolkit.

    Manages model paths, default parameters, and system settings.

    Example:
        >>> config = ToolkitConfig()
        >>> config.default_modality
        'CT'
        >>> config = ToolkitConfig(default_modality="MRI", default_steps=75)
    """

    model_dir: str = "./models"
    output_dir: str = "./outputs"
    cache_dir: str = "./cache"
    default_modality: str = "CT"
    default_steps: int = 50
    default_guidance_scale: float = 7.5
    default_width: int = 512
    default_height: int = 512
    device: str = "cpu"
    num_workers: int = 4
    log_level: str = "INFO"
    supported_modalities: list[str] = field(
        default_factory=lambda: ["CT", "MRI", "X-Ray"]
    )

    def to_dict(self) -> dict:
        """Convert configuration to dictionary."""
        return {
            "model_dir": self.model_dir,
            "output_dir": self.output_dir,
            "cache_dir": self.cache_dir,
            "default_modality": self.default_modality,
            "default_steps": self.default_steps,
            "default_guidance_scale": self.default_guidance_scale,
            "default_width": self.default_width,
            "default_height": self.default_height,
            "device": self.device,
            "num_workers": self.num_workers,
            "log_level": self.log_level,
            "supported_modalities": self.supported_modalities,
        }

    @classmethod
    def from_file(cls, path: str | Path) -> "ToolkitConfig":
        """Load configuration from a JSON file."""
        with open(path, "r") as f:
            data = json.load(f)
        return cls(**{k: v for k, v in data.items() if hasattr(cls, k)})

    def save(self, path: str | Path) -> None:
        """Save configuration to a JSON file."""
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(self.to_dict(), f, indent=2)

    def ensure_dirs(self) -> None:
        """Create output and cache directories if they don't exist."""
        for dir_path in [self.model_dir, self.output_dir, self.cache_dir]:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
