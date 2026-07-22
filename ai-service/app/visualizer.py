import cv2
import numpy as np
import os

class LunarVisualizer:
    @staticmethod
    def draw_annotations(image_np, hazards, safe_zones, overall_score, risk_level):
        """
        Draws professional aerospace-style annotated overlays:
        - Red bounding boxes for hazards
        - Green bounding box with target crosshairs for safe landing zone
        - HUD stats overlay at top
        """
        annotated = image_np.copy()
        h, w = annotated.shape[:2]

        # 1. Draw Safe Landing Zone (Green)
        for zone in safe_zones:
            bbox = zone['bbox']
            x1, y1, x2, y2 = bbox['x1'], bbox['y1'], bbox['x2'], bbox['y2']

            # Semi-transparent green fill
            overlay = annotated.copy()
            cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 230, 115), -1)
            cv2.addWeighted(overlay, 0.25, annotated, 0.75, 0, annotated)

            # Solid green border
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 230, 115), 3)

            # Center crosshair
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            cv2.line(annotated, (cx - 15, cy), (cx + 15, cy), (0, 255, 128), 2)
            cv2.line(annotated, (cx, cy - 15), (cx, cy + 15), (0, 255, 128), 2)
            cv2.circle(annotated, (cx, cy), 18, (0, 255, 128), 2)

            # Label badge
            label_text = f"TARGET LANDING ZONE ({zone['score']}%)"
            cv2.putText(annotated, label_text, (x1 + 8, y1 + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 128), 2)

        # 2. Draw Hazard Boxes (Red/Orange)
        for hazard in hazards:
            bbox = hazard['bbox']
            x1, y1, x2, y2 = bbox['x1'], bbox['y1'], bbox['x2'], bbox['y2']

            color = (50, 50, 235) if hazard['label'] == 'crater' else (0, 140, 255)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

            label = f"{hazard['label'].upper()} {int(hazard['confidence']*100)}%"
            cv2.putText(annotated, label, (x1, max(15, y1 - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1, cv2.LINE_AA)

        # 3. HUD Stats Header Bar
        cv2.rectangle(annotated, (0, 0), (w, 40), (20, 24, 33), -1)
        hud_text = f"LUNAR LANDING ASSISTANT | SAFETY SCORE: {overall_score}% | RISK: {risk_level}"
        cv2.putText(annotated, hud_text, (15, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        return annotated

    @staticmethod
    def save_annotated_image(annotated_img, output_dir, filename):
        os.makedirs(output_dir, exist_ok=True)
        save_path = os.path.join(output_dir, filename)
        cv2.imwrite(save_path, annotated_img)
        return save_path
