"""
Condition Processor Module

Provides conditioning image processing for ControlNet-guided synthesis.
Supports Canny edge detection, segmentation masks, and depth map generation.
"""

import numpy as np


class ConditionProcessor:
    """
    Process conditioning images for guided medical image synthesis.

    This class provides simulated implementations of common conditioning
    methods used with ControlNet for controlling image generation.

    Example:
        >>> processor = ConditionProcessor()
        >>> edges = processor.process_canny(medical_image)
        >>> seg_mask = processor.process_segmentation(medical_image)
    """

    def __init__(self, threshold_low: int = 50, threshold_high: int = 150):
        """
        Initialize the condition processor.

        Args:
            threshold_low: Low threshold for edge detection.
            threshold_high: High threshold for edge detection.
        """
        self.threshold_low = threshold_low
        self.threshold_high = threshold_high

    def process_canny(self, image: np.ndarray) -> np.ndarray:
        """
        Apply simulated Canny edge detection to an image.

        Generates an edge map that highlights structural boundaries in
        medical images, useful for controlling the anatomical structure
        of synthesized images.

        Args:
            image: Input image as numpy array (H, W) or (H, W, C).

        Returns:
            Binary edge map as numpy array (H, W) with values 0 or 255.
        """
        if len(image.shape) == 3:
            gray = np.mean(image[:, :, :3], axis=2)
        else:
            gray = image.astype(np.float64)

        grad_x = np.diff(gray, axis=1, prepend=gray[:, :1])
        grad_y = np.diff(gray, axis=0, prepend=gray[:1, :])
        gradient_magnitude = np.sqrt(grad_x ** 2 + grad_y ** 2)

        edges = np.zeros_like(gradient_magnitude, dtype=np.uint8)
        edges[gradient_magnitude > self.threshold_low] = 128
        edges[gradient_magnitude > self.threshold_high] = 255

        edges = self._thin_edges(edges, gradient_magnitude)

        return edges

    def process_segmentation(self, image: np.ndarray) -> np.ndarray:
        """
        Generate a simulated segmentation mask.

        Creates a multi-class segmentation mask with regions corresponding
        to common anatomical structures. Uses intensity-based thresholding
        as a simplified simulation.

        Args:
            image: Input image as numpy array (H, W) or (H, W, C).

        Returns:
            Segmentation mask as numpy array (H, W) with class labels 0-4.
            Labels: 0=background, 1=skin, 2=fat, 3=organ, 4=bone/lesion.
        """
        if len(image.shape) == 3:
            gray = np.mean(image[:, :, :3], axis=2)
        else:
            gray = image.astype(np.float64)

        mask = np.zeros(gray.shape, dtype=np.uint8)

        mask[gray > 30] = 1
        mask[gray > 80] = 2
        mask[gray > 140] = 3
        mask[gray > 200] = 4

        center = (gray.shape[0] // 2, gray.shape[1] // 2)
        yy, xx = np.mgrid[: gray.shape[0], : gray.shape[1]]
        radius = min(gray.shape) * 0.35
        dist = np.sqrt((xx - center[1]) ** 2 + (yy - center[0]) ** 2)
        organ_region = dist < radius
        mask[organ_region & (mask >= 2)] = 3

        return mask

    def process_depth(self, image: np.ndarray) -> np.ndarray:
        """
        Generate a simulated depth map.

        Creates a depth map suggesting the 3D structure of anatomical
        structures in the image. Uses a combination of intensity analysis
        and spatial gradients.

        Args:
            image: Input image as numpy array (H, W) or (H, W, C).

        Returns:
            Depth map as numpy array (H, W) with values 0-255.
            Higher values represent closer structures.
        """
        if len(image.shape) == 3:
            gray = np.mean(image[:, :, :3], axis=2)
        else:
            gray = image.astype(np.float64)

        center = (gray.shape[0] // 2, gray.shape[1] // 2)
        yy, xx = np.mgrid[: gray.shape[0], : gray.shape[1]]
        max_dist = np.sqrt(center[0] ** 2 + center[1] ** 2)
        dist = np.sqrt((xx - center[1]) ** 2 + (yy - center[0]) ** 2)
        radial_gradient = 1.0 - (dist / max_dist)

        intensity_component = gray / 255.0

        depth = (radial_gradient * 0.6 + intensity_component * 0.4)
        depth = (depth - depth.min()) / (depth.max() - depth.min())
        depth = (depth * 255).astype(np.uint8)

        depth = self._smooth_depth(depth, iterations=2)

        return depth

    def _thin_edges(
        self, edges: np.ndarray, magnitude: np.ndarray
    ) -> np.ndarray:
        """Apply simple non-maximum suppression for edge thinning."""
        thinned = edges.copy()
        h, w = edges.shape

        for i in range(1, h - 1):
            for j in range(1, w - 1):
                if edges[i, j] == 255:
                    neighbors = [
                        magnitude[i - 1, j],
                        magnitude[i + 1, j],
                        magnitude[i, j - 1],
                        magnitude[i, j + 1],
                    ]
                    if magnitude[i, j] < max(neighbors):
                        thinned[i, j] = 128

        thinned[thinned == 128] = 0
        return thinned

    def _smooth_depth(self, depth: np.ndarray, iterations: int = 2) -> np.ndarray:
        """Apply simple box smoothing to depth map."""
        result = depth.astype(np.float64)
        kernel_size = 3
        pad = kernel_size // 2

        for _ in range(iterations):
            padded = np.pad(result, pad, mode="edge")
            smoothed = np.zeros_like(result)
            for ki in range(kernel_size):
                for kj in range(kernel_size):
                    smoothed += padded[ki : ki + result.shape[0], kj : kj + result.shape[1]]
            result = smoothed / (kernel_size * kernel_size)

        return np.clip(result, 0, 255).astype(np.uint8)
