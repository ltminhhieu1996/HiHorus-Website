"""
HiHorus AI - Flask API Server
Phục vụ các model AI cho chẩn đoán hình ảnh đáy mắt.

Models:
- DR (Diabetic Retinopathy):
  - Classification: MobileNetV2 (Keras .h5) phân độ bệnh võng mạc ĐTĐ
  - Detection: YOLOv8 (.pt) phát hiện tổn thương (xuất huyết, xuất tiết cứng/mềm, vi phình mạch, gai thị)
- PM (Pathological Myopia):
  - Task1: Classification (.pth) phân độ bệnh cận thị bệnh lý
  - Task2: Segmentation (.pth x3) đánh dấu tổn thương CNV, Fuch spot, Lacquer crack
  - Task3: SE Prediction (.pth) dự đoán độ tương đương cầu
"""

import os
import io
import base64
import traceback
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2

app = Flask(__name__)
CORS(app)

# ============================================================
# Model paths
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "Models")

DR_CLASSIFICATION_PATH = os.path.join(MODELS_DIR, "DR", "diabetic_retinopathy_classification", "mobilenetv2_best.h5")
DR_DETECTION_PATH = os.path.join(MODELS_DIR, "DR", "yolo_object_detection", "yolov8m.pt")
PM_CLASSIFICATION_PATH = os.path.join(MODELS_DIR, "PM", "Task1 - Classification", "best_model.pth")
PM_CNV_PATH = os.path.join(MODELS_DIR, "PM", "Task2 - Segment", "CNV_best_epoch077_dice0.5670.pth")
PM_FS_PATH = os.path.join(MODELS_DIR, "PM", "Task2 - Segment", "FS_best_epoch113_dice0.7335.pth")
PM_LC_PATH = os.path.join(MODELS_DIR, "PM", "Task2 - Segment", "LC_best_epoch010_dice0.0091.pth")
PM_SE_PATH = os.path.join(MODELS_DIR, "PM", "Task3 - SE predict", "best_multimodal_se.pth")

# ============================================================
# Lazy-loaded model caches
# ============================================================
_models = {}

# DR Label mappings
DR_GRADE_LABELS = {
    0: "Không có bệnh (No DR)",
    1: "Nhẹ (Mild NPDR)",
    2: "Trung bình (Moderate NPDR)",
    3: "Nặng (Severe NPDR)",
    4: "Tăng sinh (Proliferative DR)"
}

DR_GRADE_RECOMMENDATIONS = {
    0: "Không phát hiện dấu hiệu bệnh võng mạc đái tháo đường. Khuyến nghị tái khám định kỳ mỗi 12 tháng.",
    1: "Bệnh võng mạc ĐTĐ giai đoạn nhẹ. Khuyến nghị kiểm soát đường huyết chặt chẽ và tái khám mỗi 9-12 tháng.",
    2: "Bệnh võng mạc ĐTĐ giai đoạn trung bình. Khuyến nghị tái khám mỗi 6 tháng và theo dõi chặt chẽ các biến chứng.",
    3: "Bệnh võng mạc ĐTĐ giai đoạn nặng. Cần chuyển bác sĩ chuyên khoa mắt ngay. Có nguy cơ cao tiến triển sang giai đoạn tăng sinh.",
    4: "Bệnh võng mạc ĐTĐ tăng sinh — giai đoạn nghiêm trọng nhất. Cần điều trị laser hoặc tiêm nội nhãn khẩn cấp. Chuyển viện chuyên khoa ngay lập tức."
}

DR_LESION_LABELS = {
    0: "Vi phình mạch",
    1: "Xuất huyết",
    2: "Xuất tiết cứng",
    3: "Xuất tiết mềm",
    4: "Gai thị"
}

# PM Label mappings
PM_GRADE_LABELS = {
    0: "Không có bệnh (Normal)",
    1: "Teo quanh gai (Peripapillary Atrophy)",
    2: "Thoái hóa hắc mạc lan tỏa (Diffuse Chorioretinal Atrophy)",
    3: "Thoái hóa hắc mạc dạng mảng (Patchy Chorioretinal Atrophy)",
    4: "Thoái hóa hắc mạc hoàng điểm (Macular Atrophy)"
}

PM_GRADE_RECOMMENDATIONS = {
    0: "Không phát hiện dấu hiệu cận thị bệnh lý. Khuyến nghị tái khám mỗi 12 tháng nếu có cận thị cao.",
    1: "Teo quanh gai thị — giai đoạn sớm. Khuyến nghị theo dõi định kỳ mỗi 6-12 tháng, đo nhãn áp và OCT.",
    2: "Thoái hóa hắc mạc lan tỏa. Khuyến nghị tái khám mỗi 6 tháng. Cần theo dõi tiến triển và đánh giá thị lực.",
    3: "Thoái hóa hắc mạc dạng mảng — giai đoạn tiến triển. Khuyến nghị khám chuyên khoa mắt, đánh giá OCT và FA mỗi 3-6 tháng.",
    4: "Thoái hóa hắc mạc hoàng điểm — giai đoạn nghiêm trọng. Cần điều trị chuyên khoa. Theo dõi sát tân mạch dưới võng mạc và cân nhắc tiêm Anti-VEGF."
}


def load_dr_classification():
    """Load DR classification model (Keras MobileNetV2)."""
    if "dr_cls" not in _models:
        import tensorflow as tf
        print("[INFO] Loading DR Classification model...")
        _models["dr_cls"] = tf.keras.models.load_model(DR_CLASSIFICATION_PATH)
        print("[INFO] DR Classification model loaded.")
    return _models["dr_cls"]


def load_dr_detection():
    """Load DR detection model (YOLOv8)."""
    if "dr_det" not in _models:
        from ultralytics import YOLO
        print("[INFO] Loading DR Detection model...")
        _models["dr_det"] = YOLO(DR_DETECTION_PATH, task="detect")
        print("[INFO] DR Detection model loaded.")
    return _models["dr_det"]


def load_pm_classification():
    """Load PM classification model (PyTorch)."""
    if "pm_cls" not in _models:
        import torch
        import torchvision.models as models
        print("[INFO] Loading PM Classification model...")
        model = models.resnet50(weights=None)
        model.fc = torch.nn.Linear(model.fc.in_features, 5)
        state_dict = torch.load(PM_CLASSIFICATION_PATH, map_location="cpu", weights_only=False)
        # Handle potential key prefix differences
        if isinstance(state_dict, dict) and "model_state_dict" in state_dict:
            state_dict = state_dict["model_state_dict"]
        elif isinstance(state_dict, dict) and "state_dict" in state_dict:
            state_dict = state_dict["state_dict"]
        try:
            model.load_state_dict(state_dict, strict=False)
        except Exception:
            pass
        model.eval()
        _models["pm_cls"] = model
        print("[INFO] PM Classification model loaded.")
    return _models["pm_cls"]


def load_pm_segmentation(lesion_type):
    """Load PM segmentation model (UNet with EfficientNet-B3 encoder)."""
    key = f"pm_seg_{lesion_type}"
    if key not in _models:
        import torch
        import segmentation_models_pytorch as smp

        path_map = {"cnv": PM_CNV_PATH, "fs": PM_FS_PATH, "lc": PM_LC_PATH}
        path = path_map[lesion_type]
        print(f"[INFO] Loading PM Segmentation model ({lesion_type.upper()})...")

        model = smp.Unet(
            encoder_name="efficientnet-b3",
            encoder_weights=None,
            in_channels=3,
            classes=1,
        )
        checkpoint = torch.load(path, map_location="cpu", weights_only=False)
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()
        _models[key] = model
        print(f"[INFO] PM Segmentation model ({lesion_type.upper()}) loaded.")
    return _models[key]


def preprocess_image_keras(img, target_size=(224, 224)):
    """Preprocess image for Keras MobileNetV2."""
    img = img.convert("RGB").resize(target_size)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def preprocess_image_torch(img, target_size=(224, 224)):
    """Preprocess image for PyTorch model."""
    import torch
    img = img.convert("RGB").resize(target_size)
    arr = np.array(img, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    arr = (arr - mean) / std
    arr = arr.transpose(2, 0, 1)  # HWC -> CHW
    return torch.tensor(arr, dtype=torch.float32).unsqueeze(0)


def preprocess_image_segment(img, target_size=(512, 512)):
    """Preprocess image for segmentation model (512x512, ImageNet normalized)."""
    import torch
    img = img.convert("RGB").resize(target_size)
    arr = np.array(img, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    arr = (arr - mean) / std
    arr = arr.transpose(2, 0, 1)  # HWC -> CHW
    return torch.tensor(arr, dtype=torch.float32).unsqueeze(0)


def mask_to_base64(mask_np):
    """Convert a binary mask (H, W) to a base64-encoded PNG with alpha channel."""
    h, w = mask_np.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[mask_np > 0] = [255, 255, 255, 255]
    mask_img = Image.fromarray(rgba, "RGBA")
    buffer = io.BytesIO()
    mask_img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def image_to_base64(img):
    """Convert PIL image to base64 string."""
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def numpy_to_base64(arr_bgr):
    """Convert a numpy BGR image to base64 PNG."""
    arr_rgb = cv2.cvtColor(arr_bgr, cv2.COLOR_BGR2RGB)
    img = Image.fromarray(arr_rgb)
    return image_to_base64(img)


# ============================================================
# Grad-CAM implementations
# ============================================================

def generate_gradcam_keras(model, img_pil, class_idx, target_size=(224, 224)):
    """
    Generate Grad-CAM heatmap for a Keras model (MobileNetV2).
    Returns a base64-encoded heatmap overlay image.
    """
    import tensorflow as tf

    # Preprocess
    img_resized = img_pil.convert("RGB").resize(target_size)
    inp = np.array(img_resized, dtype=np.float32) / 255.0
    inp = np.expand_dims(inp, axis=0)

    # Find the last convolutional layer
    last_conv_layer = None
    for layer in reversed(model.layers):
        if len(layer.output_shape) == 4:  # Conv layer has 4D output
            last_conv_layer = layer
            break

    if last_conv_layer is None:
        return None

    # Create gradient model
    grad_model = tf.keras.models.Model(
        inputs=model.input,
        outputs=[last_conv_layer.output, model.output]
    )

    # Compute gradients
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(inp)
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    if grads is None:
        return None

    # Pool gradients
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]

    # Weight the feature maps
    heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1).numpy()
    heatmap = np.maximum(heatmap, 0)
    if heatmap.max() > 0:
        heatmap /= heatmap.max()

    # Resize to original image and create overlay
    heatmap_resized = cv2.resize(heatmap, (img_pil.width, img_pil.height))
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)

    original = np.array(img_pil.convert("RGB"))
    original_bgr = cv2.cvtColor(original, cv2.COLOR_RGB2BGR)
    overlay = cv2.addWeighted(original_bgr, 0.6, heatmap_colored, 0.4, 0)

    return numpy_to_base64(overlay)


def generate_gradcam_pytorch(model, img_pil, class_idx, target_size=(224, 224)):
    """
    Generate Grad-CAM heatmap for a PyTorch model (ResNet50).
    Returns a base64-encoded heatmap overlay image.
    """
    import torch

    # Store activations and gradients
    activations = []
    gradients = []

    def forward_hook(module, input, output):
        activations.append(output.detach())

    def backward_hook(module, grad_in, grad_out):
        gradients.append(grad_out[0].detach())

    # Hook the last conv layer (layer4 for ResNet50)
    target_layer = model.layer4[-1]
    fh = target_layer.register_forward_hook(forward_hook)
    bh = target_layer.register_full_backward_hook(backward_hook)

    # Preprocess
    inp = preprocess_image_torch(img_pil, target_size)
    inp.requires_grad_(True)

    # Forward
    output = model(inp)
    model.zero_grad()

    # Backward on target class
    target_score = output[0, class_idx]
    target_score.backward()

    # Remove hooks
    fh.remove()
    bh.remove()

    if not activations or not gradients:
        return None

    # Compute Grad-CAM
    act = activations[0].squeeze()  # (C, H, W)
    grad = gradients[0].squeeze()   # (C, H, W)

    weights = grad.mean(dim=(1, 2))  # (C,)
    cam = torch.zeros(act.shape[1:], dtype=torch.float32)  # (H, W)
    for i, w in enumerate(weights):
        cam += w * act[i]

    cam = torch.relu(cam).numpy()
    if cam.max() > 0:
        cam /= cam.max()

    # Resize to original image and create overlay
    heatmap_resized = cv2.resize(cam, (img_pil.width, img_pil.height))
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)

    original = np.array(img_pil.convert("RGB"))
    original_bgr = cv2.cvtColor(original, cv2.COLOR_RGB2BGR)
    overlay = cv2.addWeighted(original_bgr, 0.6, heatmap_colored, 0.4, 0)

    return numpy_to_base64(overlay)


# ============================================================
# API Routes
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models_available": {
        "dr_classification": os.path.exists(DR_CLASSIFICATION_PATH),
        "dr_detection": os.path.exists(DR_DETECTION_PATH),
        "pm_classification": os.path.exists(PM_CLASSIFICATION_PATH),
        "pm_segmentation_cnv": os.path.exists(PM_CNV_PATH),
        "pm_segmentation_fs": os.path.exists(PM_FS_PATH),
        "pm_segmentation_lc": os.path.exists(PM_LC_PATH),
        "pm_se_prediction": os.path.exists(PM_SE_PATH),
    }})


@app.route("/api/predict/dr", methods=["POST"])
def predict_dr():
    """
    Chẩn đoán bệnh Võng mạc Đái tháo đường (DR).
    - Bước 1: Phân độ bệnh (MobileNetV2)
    - Bước 2: Phát hiện tổn thương (YOLOv8)
    - Bước 3: Grad-CAM
    Trả về: grading, lesion detections, grad-cam, khuyến nghị.
    """
    try:
        if "image" not in request.files:
            return jsonify({"error": "Không tìm thấy ảnh. Vui lòng tải ảnh lên."}), 400

        file = request.files["image"]
        img = Image.open(file.stream).convert("RGB")

        # --- Classification ---
        cls_model = load_dr_classification()
        inp = preprocess_image_keras(img)
        preds = cls_model.predict(inp, verbose=0)[0]
        grade_idx = int(np.argmax(preds))
        grade_conf = float(preds[grade_idx]) * 100
        grade_label = DR_GRADE_LABELS.get(grade_idx, f"Grade {grade_idx}")
        recommendation = DR_GRADE_RECOMMENDATIONS.get(grade_idx, "")

        # --- Grad-CAM ---
        gradcam_b64 = None
        try:
            gradcam_b64 = generate_gradcam_keras(cls_model, img, grade_idx)
        except Exception as e:
            print(f"[WARN] Grad-CAM DR failed: {e}")

        # --- Detection ---
        det_model = load_dr_detection()
        results = det_model.predict(source=np.array(img), conf=0.1, verbose=False)

        # Group detections by class
        lesion_groups = {}
        if results and len(results) > 0:
            boxes = results[0].boxes
            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0]) * 100
                    coords = box.xyxy[0].tolist()
                    if cls_id not in lesion_groups:
                        lesion_groups[cls_id] = {
                            "class_id": cls_id,
                            "label": DR_LESION_LABELS.get(cls_id, f"Class {cls_id}"),
                            "boxes": []
                        }
                    lesion_groups[cls_id]["boxes"].append({
                        "bbox": [round(c, 1) for c in coords],
                        "confidence": round(conf, 1)
                    })

        # Add total count per group
        for g in lesion_groups.values():
            g["total"] = len(g["boxes"])

        return jsonify({
            "success": True,
            "type": "dr",
            "image_width": img.width,
            "image_height": img.height,
            "grading": {
                "grade": grade_idx,
                "label": grade_label,
                "confidence": round(grade_conf, 1),
                "recommendation": recommendation
            },
            "gradcam": gradcam_b64,
            "lesion_groups": list(lesion_groups.values()),
            "original_image": image_to_base64(img)
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/predict/pm", methods=["POST"])
def predict_pm():
    """
    Chẩn đoán bệnh Cận thị bệnh lý (PM).
    - Bước 1: Phân độ bệnh (ResNet50)
    - Bước 2: Phân vùng tổn thương (UNet x3: CNV, Fuchs spot, Lacquer crack)
    - Bước 3: Grad-CAM
    Trả về: grading, segmentation masks (base64), grad-cam, khuyến nghị, ảnh gốc.
    """
    try:
        import torch

        if "image" not in request.files:
            return jsonify({"error": "Không tìm thấy ảnh. Vui lòng tải ảnh lên."}), 400

        file = request.files["image"]
        img = Image.open(file.stream).convert("RGB")

        # --- Classification ---
        cls_model = load_pm_classification()
        inp = preprocess_image_torch(img)

        with torch.no_grad():
            output = cls_model(inp)
            probs = torch.softmax(output, dim=1)[0]
            grade_idx = int(torch.argmax(probs))
            grade_conf = float(probs[grade_idx]) * 100

        grade_label = PM_GRADE_LABELS.get(grade_idx, f"Grade {grade_idx}")
        recommendation = PM_GRADE_RECOMMENDATIONS.get(grade_idx, "")

        # --- Grad-CAM ---
        gradcam_b64 = None
        try:
            gradcam_b64 = generate_gradcam_pytorch(cls_model, img, grade_idx)
        except Exception as e:
            print(f"[WARN] Grad-CAM PM failed: {e}")

        # --- Segmentation ---
        seg_input = preprocess_image_segment(img)
        lesion_configs = [
            {"key": "cnv", "label": "CNV (Tân mạch võng mạc)", "path": PM_CNV_PATH},
            {"key": "fs",  "label": "Fuchs spot (Điểm Fuchs)", "path": PM_FS_PATH},
            {"key": "lc",  "label": "Lacquer crack (Vết rạn)",  "path": PM_LC_PATH},
        ]

        segmentation_results = []
        for cfg in lesion_configs:
            if not os.path.exists(cfg["path"]):
                segmentation_results.append({
                    "key": cfg["key"],
                    "label": cfg["label"],
                    "available": False,
                    "mask": None,
                    "pixel_count": 0,
                })
                continue

            seg_model = load_pm_segmentation(cfg["key"])
            with torch.no_grad():
                pred = seg_model(seg_input)
                pred_mask = (torch.sigmoid(pred) > 0.5).squeeze().cpu().numpy().astype(np.uint8)

            pixel_count = int(pred_mask.sum())

            # Resize mask back to original image size
            mask_img = Image.fromarray(pred_mask * 255, mode="L")
            mask_img = mask_img.resize((img.width, img.height), Image.NEAREST)
            mask_np = np.array(mask_img) > 127

            segmentation_results.append({
                "key": cfg["key"],
                "label": cfg["label"],
                "available": True,
                "mask": mask_to_base64(mask_np.astype(np.uint8)),
                "pixel_count": int(mask_np.sum()),
            })

        return jsonify({
            "success": True,
            "type": "pm",
            "image_width": img.width,
            "image_height": img.height,
            "grading": {
                "grade": grade_idx,
                "label": grade_label,
                "confidence": round(grade_conf, 1),
                "recommendation": recommendation
            },
            "gradcam": gradcam_b64,
            "segmentation_results": segmentation_results,
            "original_image": image_to_base64(img)
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 60)
    print("  HiHorus AI - Diagnostic API Server")
    print("  http://localhost:5000")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False)
