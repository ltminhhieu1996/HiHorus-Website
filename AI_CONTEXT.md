<!-- AI DIRECTIVE: KHI BẮT ĐẦU PHIÊN LÀM VIỆC MỚI VỚI DỰ ÁN NÀY, BẠN BẮT BUỘC PHẢI ĐỌC TOÀN BỘ FILE NÀY ĐỂ NẮM CONTEXT TRƯỚC KHI LÀM VIỆC -->
# Hihorus AI Website - Context & Design System

## 1. Git Repository & Deployment
- **GitHub URL**: `https://github.com/ltminhhieu1996/HiHorus-Website.git`
- **Branch**: `main`
- **Deployment**: Website được thiết lập tự động deploy lên Cloudflare Pages mỗi khi code được đẩy lên nhánh `main`.
- **AI Instruction**: Khi user (người dùng) yêu cầu "đóng gói", "push", "cập nhật code lên github" cho dự án này, AI trợ lý phải tự động thực hiện chuỗi lệnh sau trong terminal mà không cần hỏi lại đường link:
  ```bash
  git add .
  git commit -m "Auto update via AI"
  git push
  ```
  **LƯU Ý QUAN TRỌNG:** KHÔNG được tự động push code sau mỗi lần chỉnh sửa file. CHỈ thực hiện thao tác push này khi người dùng đưa ra chỉ thị yêu cầu rõ ràng.

## 2. Design System & CSS Architecture
Website được thiết kế theo phong cách hiện đại, sử dụng **White & Navy Blue Theme** kết hợp với các hiệu ứng kính (Glassmorphism).

### Colors (Bảng màu)
- **Background**:
  - Primary (Nền chính): `#FFFFFF`
  - Secondary (Nền phụ/xám nhạt): `#F4F7FA`
  - Navy (Nền xanh đậm): `#051A40`
  - Navy Dark (Chân trang): `#020C21`
- **Text**:
  - Main (Chữ chính): `#1A1D24`
  - Muted (Chữ phụ): `#5F6A7A`
  - Inverse (Chữ trắng trên nền tối): `#FFFFFF`
- **Accents (Điểm nhấn)**:
  - Accent Navy: `#0F3A8D`
  - Accent Light: `#3D76F2`

### Typography (Cấu trúc chữ)
- **Font-family**: `Plus Jakarta Sans`, system-ui, sans-serif.
- **Headings (h1-h4)**: `font-weight: 700`, `line-height: 1.2`, `letter-spacing: -0.02em`.
- **Hero Title**: `font-size: 3rem`. Luôn giữ các cụm từ quan trọng như "Nhãn khoa" trên cùng một dòng, không để ngắt chữ giữa dòng.
- **Paragraphs**: `line-height: 1.6`, màu `Text Muted`. Subtitle thường được `text-align: justify`.

### UI Components (Thành phần giao diện)
- **Buttons (Nút bấm)**: Hình viên thuốc (`border-radius: 9999px`), có transition mượt mà.
  - `.btn-primary`: Nền Accent Navy, chữ trắng, có box-shadow màu xanh.
  - `.btn-secondary`: Nền trong suốt, chữ màu Main, viền mờ.
- **Cards (Thẻ)**: 
  - `.feature-card`, `.stat-card`: Nền trắng/xám, bo góc (`border-radius: 20px`), bóng đổ mềm (`box-shadow: 0 12px 40px rgba(15, 58, 141, 0.08)`). Có hiệu ứng hover `translateY(-8px)`.
- **Glassmorphism (Hiệu ứng kính)**:
  - Sử dụng cho `.navbar.scrolled` và `.floating-badge` với `backdrop-filter: blur(12px)` hoặc `16px`. Nền trắng trong suốt `rgba(255, 255, 255, 0.7)`.

### Layout & Spacing (Bố cục)
- **Container**: `max-width: 1280px`, margin tự động ra giữa, `padding: 0 60px` để tạo độ cân đối cho nội dung.
- **Grid Systems**: `.grid-3` (3 cột), `.grid-4` (4 cột), `.split-layout` (2 cột 1:1 với gap lớn).
- **Sections**: Padding chuẩn là `100px 0`.

### Animations (Hiệu ứng)
- Scroll Reveal Animations: Các class `.fade-in`, `.fade-in-up`, `.reveal-on-scroll` sẽ hiển thị mờ dần và trượt lên khi người dùng cuộn trang.
- Keyframes: Sử dụng `float1`, `float2` (anim bay lơ lửng) cho các phần tử đồ họa trừu tượng.

## 3. Content Guidelines (Định hướng nội dung)
- **Slogan chính**: "Công cụ AI về y tế - Chuyên biệt cho Nhãn khoa".
- **Thông điệp cốt lõi**: HiHorus AI tập trung vào phân tích hình ảnh nhãn khoa chuyên sâu (Fundus, OCT), hỗ trợ bác sĩ ra quyết định chính xác và nhanh chóng.
- **Tính năng chính**:
  1. Phân tích hình ảnh đáy mắt (Fundus).
  2. Phân tích cắt lớp võng mạc (OCT).
  3. Các công cụ hỗ trợ thăm khám và điều trị bệnh lý nhãn khoa.

## 4. General Communication Rules (Quy định giao tiếp)
- **Language**: Luôn luôn ưu tiên trả lời và giao tiếp bằng **Tiếng Việt** trước tiên trong mọi tình huống (kể cả khi tạo nội dung mẫu hoặc code comments).

*(AI Note: Hãy giữ nguyên các class name, variable CSS và quy tắc nội dung này để đảm bảo tính nhất quán của website).*

## 5. AI Models Structure (Cấu trúc các mô hình AI)
Thông tin chi tiết về các mô hình AI được phát triển bởi Hihorus:

### Thư mục DR (Diabetic Retinopathy - Bệnh võng mạc Đái tháo đường)
- **Model 1**: Phân độ bệnh (Grading).
- **Model 2**: Phát hiện tổn thương (Lesion Detection).
  - Các loại tổn thương bao gồm: Xuất huyết (Hemorrhage), Xuất tiết cứng/mềm (Hard/Soft Exudates), Vi phình mạch (Microaneurysms) và Gai thị (Optic Disc).

### Thư mục PM (Pathological Myopia - Cận thị bệnh lý)
- **Task 1**: Model phân độ bệnh (Grading).
- **Task 2**: 3 Model đánh dấu tổn thương (Lesion Marking):
  - Tân mạch võng mạc (CNV).
  - Điểm Fuch (Fuchs spot).
  - Vết rạn (Lacquer crack).
- **Task 3**: Model dự đoán độ tương đương cầu (Spherical Equivalent Prediction) của bệnh nhân.

## 6. Trang AI (AI Interface)
Trang AI (`ai.html`) được xây dựng chuyên sâu cho cả DR và PM:
- **Kiến trúc luồng dữ liệu (API)**:
  - Frontend (HTML/JS) được host trên Cloudflare Pages.
  - Backend (Python/Flask) chạy cục bộ (`localhost:5000`) để load model.
  - **Bảo mật Model**: File model AI nặng `.pth`, `.pt`, `.h5` bị chặn bởi `.gitignore` và tuyệt đối KHÔNG push lên GitHub.
- **Tính năng UI/UX chính**:
  - Trạng thái ban đầu: Vùng tải ảnh cân đối ở giữa (Không hiển thị khung đen trống).
  - Trạng thái kết quả: Layout 2 cột (Ảnh/Overlay bên trái 45%, Kết quả bên phải 55%).
  - **Grad-CAM**: Nút bật/tắt hiển thị bản đồ nhiệt (Vùng AI tập trung) cho cả 2 bệnh lý.
  - **Phân độ & Khuyến nghị**: Hiển thị chữ lớn với màu sắc cảnh báo theo mức độ nghiêm trọng (0: Xanh lá -> 4: Đỏ thẫm), kèm theo khuyến nghị lâm sàng chi tiết.
  - **DR Controls**: Bật/tắt bounding box theo từng loại tổn thương, kèm thanh lọc Confidence. (Đã chuẩn hóa nhãn: 0: Vi phình mạch, 1: Xuất huyết, 2: Xuất tiết cứng, 3: Xuất tiết mềm, 4: Gai thị).
  - **PM Controls**: Đánh dấu vùng tổn thương bằng segmentation mask (CNV, Fuchs spot, Lacquer crack) với thanh trượt độ đậm nhạt (Opacity).

## 7. Workspace Synchronization (Đồng bộ Không gian làm việc)
- **Công cụ lập trình**: Sử dụng **Antigravity** làm AI Coding Assistant chính cho toàn bộ quá trình phát triển (vừa là công cụ code, vừa là người thực thi).
- **Chiến lược đồng bộ hóa (PC & Laptop)**:
  1.  **Code (Frontend & Backend)**: Đồng bộ thông qua **GitHub** (`git push` trên máy này và `git pull` trên máy kia). Antigravity chịu trách nhiệm commit và push code.
  2.  **Models AI (Files nặng)**: KHÔNG qua GitHub. Phải sao chép tay (copy/paste) một lần qua USB/Drive/LAN để đảm bảo cấu trúc thư mục `Models/` trên cả PC và Laptop là y hệt nhau.
  3.  **Mô hình hoạt động**:
      -   **PC (i3 + GTX 1060 3GB)**: Đóng vai trò là Server AI chính (cày ải tính toán CUDA). Chạy lệnh `python server.py`.
      -   **Laptop**: Đóng vai trò thiết kế giao diện, phát triển code Frontend và thao tác với Antigravity. Để test, trang web (`ai.html`) trên Laptop sẽ gọi API về địa chỉ IP mạng LAN của PC (ví dụ: `const API = "http://192.168.x.x:5000";`).
