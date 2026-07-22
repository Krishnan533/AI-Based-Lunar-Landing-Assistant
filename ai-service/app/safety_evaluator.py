import numpy as np
import cv2

class LandingSafetyEvaluator:
    def __init__(self):
        self.grid_size = 50  # 50x50 pixel cell resolution

    def evaluate_landing_safety(self, image_np, hazards):
        """
        Evaluates terrain safety score (0-100%) and identifies optimal landing zones
        based on hazard density, Laplacian surface roughness variance, and center clearance.
        """
        height, width = image_np.shape[:2]

        # 1. Compute Laplacian Surface Roughness Map
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY) if len(image_np.shape) == 3 else image_np
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        roughness_variance = np.var(laplacian)

        # 2. Build Hazard Exclusion Mask
        hazard_mask = np.zeros((height, width), dtype=np.float32)
        for h in hazards:
            bbox = h['bbox']
            x1, y1 = max(0, bbox['x1']), max(0, bbox['y1'])
            x2, y2 = min(width, bbox['x2']), min(height, bbox['y2'])
            
            # Add safety buffer around hazards
            buffer = int(min(x2 - x1, y2 - y1) * 0.25)
            bx1, by1 = max(0, x1 - buffer), max(0, y1 - buffer)
            bx2, by2 = min(width, x2 + buffer), min(height, y2 + buffer)
            
            hazard_mask[by1:by2, bx1:bx2] = 1.0

        # 3. Find Largest Clear Rectangular Region for Safe Landing Zone
        grid_w, grid_h = int(width * 0.35), int(height * 0.35)
        best_score = -1
        best_zone = {"x1": int(width * 0.3), "y1": int(width * 0.3), "x2": int(width * 0.65), "y2": int(width * 0.65)}

        step_x = max(10, width // 20)
        step_y = max(10, height // 20)

        for y in range(0, height - grid_h, step_y):
            for x in range(0, width - grid_w, step_x):
                sub_mask = hazard_mask[y:y+grid_h, x:x+grid_w]
                hazard_overlap = np.mean(sub_mask)
                
                # Distance penalty from image center (prefer centered landing)
                center_dist = np.sqrt(((x + grid_w/2) - width/2)**2 + ((y + grid_h/2) - height/2)**2)
                norm_center_dist = center_dist / np.sqrt(width**2 + height**2)

                # Local roughness penalty
                sub_lap = laplacian[y:y+grid_h, x:x+grid_w]
                local_roughness = np.var(sub_lap) / (roughness_variance + 1e-5)

                candidate_score = 100.0 - (hazard_overlap * 70.0) - (norm_center_dist * 15.0) - (min(local_roughness, 2.0) * 7.5)
                candidate_score = float(np.clip(candidate_score, 10.0, 98.5))

                if candidate_score > best_score:
                    best_score = candidate_score
                    best_zone = {
                        "x1": x,
                        "y1": y,
                        "x2": x + grid_w,
                        "y2": y + grid_h
                    }

        # 4. Overall Terrain Safety Score Calculation
        total_hazard_area = sum([h['area'] for h in hazards])
        total_image_area = width * height
        hazard_ratio = total_hazard_area / float(total_image_area + 1e-5)

        overall_score = round(float(np.clip(100.0 - (hazard_ratio * 150.0) - (len(hazards) * 3.5), 15.0, 96.0)), 1)

        # Determine Risk Level classification
        if overall_score >= 80.0:
            risk_level = "OPTIMAL_LANDING"
            suitability = "Optimal"
        elif overall_score >= 65.0:
            risk_level = "LOW_RISK"
            suitability = "Acceptable"
        elif overall_score >= 45.0:
            risk_level = "MODERATE_RISK"
            suitability = "Suboptimal"
        else:
            risk_level = "CRITICAL_HAZARD"
            suitability = "Unsafe"

        safe_zones = [
            {
                "bbox": best_zone,
                "score": round(best_score, 1),
                "suitability": suitability
            }
        ]

        return overall_score, risk_level, safe_zones
