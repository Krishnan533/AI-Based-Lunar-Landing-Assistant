import cv2
import numpy as np
import os

def generate_lunar_surface_image(width=800, height=600, output_path="sample_lunar_surface.jpg"):
    """
    Generates a realistic synthetic lunar surface image complete with crater rims,
    scattered boulders, and regolith noise for AI pipeline validation.
    """
    # 1. Base lunar regolith grey gradient texture
    surface = np.random.normal(128, 15, (height, width)).astype(np.uint8)
    surface = cv2.GaussianBlur(surface, (5, 5), 0)

    # 2. Add Craters (dark circular depressions with bright lit rims)
    craters = [
        (200, 180, 60),
        (550, 420, 85),
        (650, 150, 45),
        (150, 450, 35),
        (380, 300, 25),
    ]

    for cx, cy, radius in craters:
        # Dark inner floor
        cv2.circle(surface, (cx, cy), radius, (55), -1)
        # Bright sunlit rim
        cv2.ellipse(surface, (cx, cy), (radius, radius), 0, 180, 360, (210), 4)

    # 3. Add Boulders (small bright high-contrast specks with shadows)
    boulders = [
        (320, 220, 8),
        (335, 230, 6),
        (450, 120, 12),
        (580, 280, 10),
        (220, 380, 7),
    ]

    for bx, by, size in boulders:
        cv2.circle(surface, (bx, by), size, (230), -1)
        # Shadow
        cv2.circle(surface, (bx + size//2, by + size//2), size, (30), -1)

    # Convert to 3-channel RGB
    color_surface = cv2.cvtColor(surface, cv2.COLOR_GRAY2BGR)

    dir_name = os.path.dirname(output_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    cv2.imwrite(output_path, color_surface)
    print(f"[Sample Generator] Created sample lunar image: {output_path}")

if __name__ == "__main__":
    generate_lunar_surface_image()
