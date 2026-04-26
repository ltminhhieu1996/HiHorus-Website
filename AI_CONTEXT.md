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
- **Paragraphs**: `line-height: 1.6`, màu `Text Muted`.

### UI Components (Thành phần giao diện)
- **Buttons (Nút bấm)**: Hình viên thuốc (`border-radius: 9999px`), có transition mượt mà.
  - `.btn-primary`: Nền Accent Navy, chữ trắng, có box-shadow màu xanh.
  - `.btn-secondary`: Nền trong suốt, chữ màu Main, viền mờ.
- **Cards (Thẻ)**: 
  - `.feature-card`, `.stat-card`: Nền trắng/xám, bo góc (`border-radius: 20px`), bóng đổ mềm (`box-shadow: 0 12px 40px rgba(15, 58, 141, 0.08)`). Có hiệu ứng hover `translateY(-8px)`.
- **Glassmorphism (Hiệu ứng kính)**:
  - Sử dụng cho `.navbar.scrolled` và `.floating-badge` với `backdrop-filter: blur(12px)` hoặc `16px`. Nền trắng trong suốt `rgba(255, 255, 255, 0.7)`.

### Layout & Spacing (Bố cục)
- **Container**: `max-width: 1280px`, margin tự động ra giữa.
- **Grid Systems**: `.grid-3` (3 cột), `.grid-4` (4 cột), `.split-layout` (2 cột 1:1 với gap lớn).
- **Sections**: Padding chuẩn là `100px 0`.

### Animations (Hiệu ứng)
- Scroll Reveal Animations: Các class `.fade-in`, `.fade-in-up`, `.reveal-on-scroll` sẽ hiển thị mờ dần và trượt lên khi người dùng cuộn trang.
- Keyframes: Sử dụng `float1`, `float2` (anim bay lơ lửng) cho các phần tử đồ họa trừu tượng.
## 3. General Communication Rules (Quy định giao tiếp)
- **Language**: Luôn luôn ưu tiên trả lời và giao tiếp bằng **Tiếng Việt** trước tiên trong mọi tình huống (kể cả khi tạo nội dung mẫu hoặc code comments).

*(AI Note: Hãy giữ nguyên các class name, variable CSS và quy tắc giao tiếp này khi được yêu cầu làm việc với dự án này).*
