# 📋 Tài liệu Mô tả Chức năng — Web Đặt Đồ Ăn Nhanh

> **Bối cảnh:** Đây là tài liệu mô tả chi tiết toàn bộ chức năng của hệ thống web đặt đồ ăn nhanh, dựa theo Activity Diagram và Use Case Specification đã thiết kế. Hệ thống có 4 loại tài khoản: **Khách hàng**, **Nhà hàng**, **Người giao hàng (Shipper)**, và **Quản trị viên**. Giao diện Khách hàng đã hoàn thiện, các module còn lại đang trong quá trình phát triển.

---

## Mục lục

1. [Tài khoản Nhà hàng](#1-tài-khoản-nhà-hàng)
   - 1.1 [Xác nhận đơn hàng](#11-xác-nhận-đơn-hàng)
   - 1.2 [Hủy đơn hàng](#12-hủy-đơn-hàng)
   - 1.3 [Theo dõi trạng thái đơn hàng](#13-theo-dõi-trạng-thái-đơn-hàng)
   - 1.4 [Quản lý thực đơn](#14-quản-lý-thực-đơn)
   - 1.5 [Thiết lập trạng thái nhận đơn](#15-thiết-lập-trạng-thái-nhận-đơn)
   - 1.6 [Xem báo cáo doanh thu](#16-xem-báo-cáo-doanh-thu)
   - 1.7 [Quản lý thông tin nhà hàng](#17-quản-lý-thông-tin-nhà-hàng)
   - 1.8 [Quản lý đánh giá](#18-quản-lý-đánh-giá-nhà-hàng)

2. [Tài khoản Khách hàng](#2-tài-khoản-khách-hàng)
   - 2.1 [Quản lý thông tin cá nhân](#21-quản-lý-thông-tin-cá-nhân)
   - 2.2 [Quản lý đánh giá](#22-quản-lý-đánh-giá-khách-hàng)
   - 2.3 [Xử lý sự cố](#23-xử-lý-sự-cố-khách-hàng)

3. [Tài khoản Người giao hàng (Shipper)](#3-tài-khoản-người-giao-hàng-shipper)
   - 3.1 [Nhận đơn hàng mới](#31-nhận-đơn-hàng-mới)
   - 3.2 [Từ chối đơn hàng](#32-từ-chối-đơn-hàng)
   - 3.3 [Cập nhật trạng thái đơn hàng](#33-cập-nhật-trạng-thái-đơn-hàng)
   - 3.4 [Thiết lập trạng thái nhận đơn](#34-thiết-lập-trạng-thái-nhận-đơn-shipper)
   - 3.5 [Xem lịch sử giao hàng](#35-xem-lịch-sử-giao-hàng)
   - 3.6 [Xem thu nhập tích lũy](#36-xem-thu-nhập-tích-lũy)
   - 3.7 [Quản lý thông tin cá nhân](#37-quản-lý-thông-tin-cá-nhân-shipper)
   - 3.8 [Quản lý đánh giá](#38-quản-lý-đánh-giá-shipper)

4. [Tài khoản Quản trị viên](#4-tài-khoản-quản-trị-viên)
   - 4.1 [Quản lý tài khoản người dùng](#41-quản-lý-tài-khoản-người-dùng)
   - 4.2 [Quản lý đánh giá toàn hệ thống](#42-quản-lý-đánh-giá-toàn-hệ-thống)
   - 4.3 [Thống kê báo cáo tổng hệ thống](#43-thống-kê-báo-cáo-tổng-hệ-thống)
   - 4.4 [Xử lý sự cố hệ thống](#44-xử-lý-sự-cố-hệ-thống)
   - 4.5 [Quản lý cấu hình hệ thống](#45-quản-lý-cấu-hình-hệ-thống)

---

## 1. Tài khoản Nhà hàng

---

### 1.1 Xác nhận đơn hàng

**Mã use case:** NH-01  
**Mục đích:** Nhà hàng tiếp nhận và đồng ý thực hiện một đơn hàng mới từ khách hàng.

**Điều kiện để thực hiện:**
- Nhà hàng đang ở trạng thái hoạt động (online).
- Hệ thống có đơn hàng mới ở trạng thái "Chờ xác nhận".

**Luồng thực hiện chính:**

1. Nhà hàng mở mục **"Đơn hàng mới"** trên dashboard.
2. Hệ thống hiển thị danh sách các đơn đang ở trạng thái "Chờ xác nhận".
3. Nhà hàng chọn một đơn hàng để xem chi tiết.
4. Hệ thống hiển thị thông tin đơn: danh sách món, số lượng, ghi chú của khách.
5. Nhà hàng kiểm tra nguyên liệu thực tế tại bếp.
   - Nếu **không đủ nguyên liệu** → chuyển sang luồng Hủy đơn (xem mục 1.2).
   - Nếu **đủ nguyên liệu** → tiếp tục bước 6.
6. Nhà hàng nhấn nút **"Xác nhận"**.
7. Hệ thống kiểm tra dữ liệu tồn kho và trạng thái hiện tại của đơn.
8. Hệ thống cập nhật trạng thái đơn thành **"Đã xác nhận / Đang chuẩn bị"**.
9. Hệ thống tự động: gửi thông báo đến Khách hàng, kích hoạt tìm tài xế, chuyển đơn sang tab "Đang thực hiện".

**Luồng thay thế — Khách hàng hủy trước khi nhà hàng xác nhận:**

- Hệ thống hiển thị cảnh báo "Đơn hàng đã bị khách hàng hủy".
- Trạng thái đơn chuyển thành "Đã hủy", xóa khỏi danh sách đơn mới, lưu vào "Lịch sử hủy".

---

### 1.2 Hủy đơn hàng

**Mã use case:** NH-02  
**Mục đích:** Nhà hàng từ chối hoặc hủy một đơn hàng do sự cố khách quan (hết nguyên liệu, quán quá tải, đóng cửa đột xuất...).

**Điều kiện để thực hiện:**
- Đơn hàng đang ở trạng thái "Chờ xác nhận" hoặc "Đang chế biến".

**Luồng thực hiện chính:**

1. Nhà hàng chọn đơn hàng cần hủy và nhấn nút **"Hủy đơn"**.
2. Hệ thống hiển thị pop-up danh sách lý do hủy tiêu chuẩn (Hết món, Quán đóng cửa, Quá tải...).
3. Nhà hàng chọn lý do phù hợp và nhấn **"Xác nhận hủy"**.
4. Hệ thống kiểm tra điều kiện cho phép hủy của đơn.
5. Hệ thống cập nhật trạng thái đơn thành **"Đã hủy bởi Nhà hàng"**.
6. Hệ thống gửi thông báo hủy kèm lý do đến Khách hàng, kích hoạt hoàn tiền (nếu có), di chuyển đơn vào "Lịch sử hủy".

**Luồng thay thế A — Gọi điện thỏa thuận với khách trước:**

1. Nhà hàng chọn **"Gọi cho khách hàng"** thay vì hủy ngay.
2. Hệ thống hiển thị số điện thoại khách hàng.
3. Sau khi thỏa thuận xong, nhà hàng đóng bảng lý do và nhấn **"Hủy thao tác"** → quay lại màn hình chi tiết đơn, chuyển sang luồng Xác nhận đơn.

**Luồng thay thế B — Tài xế đã lấy đơn:**

- Hệ thống từ chối cho phép hủy trực tiếp.
- Nhà hàng buộc phải nhấn **"Gọi Tổng đài hỗ trợ"** để xử lý qua bộ phận hỗ trợ.

---

### 1.3 Theo dõi trạng thái đơn hàng

**Mã use case:** NH-03  
**Mục đích:** Nhà hàng giám sát tiến trình các đơn đang thực hiện, cập nhật khi món đã sẵn sàng, và theo dõi shipper.

**Điều kiện để thực hiện:**
- Có ít nhất một đơn đang ở trạng thái "Đang chế biến".

**Luồng thực hiện chính:**

1. Nhà hàng chọn tab **"Đơn hàng đang thực hiện"** trên dashboard.
2. Hệ thống hiển thị danh sách các đơn đang ở trạng thái "Đang chuẩn bị" và "Chờ tài xế lấy món".
3. Sau khi chế biến xong, nhà hàng chọn đơn và nhấn **"Sẵn sàng giao"**.
4. Hệ thống cập nhật trạng thái đơn thành **"Chờ tài xế lấy món"**.
5. Hệ thống tìm và điều phối tài xế đến lấy hàng. Dashboard của nhà hàng hiển thị thông tin tài xế được giao (tên, biển số xe, thời gian dự kiến đến).
6. Tài xế đến nhận hàng và xác nhận trên ứng dụng → hệ thống nhận tín hiệu **"Đã lấy hàng"**.
7. Hệ thống cập nhật trạng thái đơn thành **"Đang giao"**, ẩn khỏi danh sách cần xử lý của nhà hàng.
8. Khi tài xế giao xong → hệ thống nhận tín hiệu **"Đã giao thành công"**.
9. Hệ thống cập nhật đơn thành **"Hoàn thành"**, ghi nhận doanh thu, lưu vào "Lịch sử đơn hàng".

**Luồng thay thế A — Tài xế hủy cuốc giữa chừng:**

- Hệ thống hiển thị thông báo tài xế hủy cuốc.
- Tự động chuyển đơn về trạng thái **"Đang tìm tài xế"**, kích hoạt lại thuật toán điều phối.
- Nhà hàng chờ hệ thống ghép tài xế mới.

**Luồng thay thế B — Tài xế báo giao hàng thất bại:**

- Hệ thống nhận tín hiệu "Giao hàng thất bại".
- Cập nhật trạng thái đơn thành **"Đã hủy"**.
- Gửi thông báo bồi hoàn cho Nhà hàng, lưu đơn vào "Lịch sử hủy".

> **Lưu ý triển khai:** Nếu tài xế đến lấy hàng quá hạn (timeout), hệ thống sẽ cảnh báo nhà hàng và tự động tìm tài xế thay thế — không cần nhà hàng thao tác thủ công.

---

### 1.4 Quản lý thực đơn

#### 1.4.1 Thêm món mới

1. Nhà hàng nhấn **"Thêm món mới"**.
2. Hệ thống hiển thị biểu mẫu thêm món.
3. Nhà hàng nhập đầy đủ thông tin: Tên món, Giá, Ảnh, Tùy chọn (size, topping...) và nhấn **"Lưu món"**.
4. Hệ thống kiểm tra tính hợp lệ của dữ liệu:
   - Nếu **lỗi / thiếu trường** (tên trùng, giá âm hoặc bằng 0...) → từ chối lưu, hiển thị thông báo lỗi cụ thể từng trường. Quay lại bước 3.
   - Nếu **hợp lệ** → lưu món vào cơ sở dữ liệu thực đơn, cập nhật hiển thị trên giao diện Khách hàng ngay lập tức.

#### 1.4.2 Chỉnh sửa món

1. Nhà hàng chọn món cần sửa trong thực đơn.
2. Hệ thống hiển thị thông tin hiện tại của món lên biểu mẫu.
3. Nhà hàng cập nhật thông tin mới và nhấn **"Lưu thay đổi"**.
4. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào.
5. Nếu hợp lệ → cập nhật CSDL và đồng bộ hiển thị mới lên ứng dụng phía Khách hàng.
6. Nếu món vừa đổi giá đang nằm trong giỏ hàng của một khách nào đó → hệ thống gửi cảnh báo cập nhật giá vào giỏ hàng của khách đó.

#### 1.4.3 Xóa hoặc Ẩn món

1. Nhà hàng chọn **"Ẩn"** hoặc **"Xóa"** tại món ăn muốn thao tác.
2. Hệ thống yêu cầu xác nhận thao tác.
3. Nhà hàng bấm **"Xác nhận"**.
4. Hệ thống cập nhật trạng thái / xóa món khỏi CSDL thực đơn.
5. Ẩn món khỏi giao diện hiển thị phía Khách hàng.
6. Kiểm tra: nếu món đang nằm trong **đơn hàng đang xử lý** → giữ nguyên thông tin món trong các đơn hiện tại, không ảnh hưởng đến đơn đã đặt.

---

### 1.5 Thiết lập trạng thái nhận đơn

#### 1.5.1 Bật trạng thái hoạt động

1. Nhà hàng gạt công tắc sang trạng thái **"Bật"** trên dashboard.
2. Hệ thống cập nhật trạng thái quán thành **"Đang hoạt động"**.
3. Quán xuất hiện trong kết quả tìm kiếm của Khách hàng và sẵn sàng nhận đơn.

#### 1.5.2 Tắt trạng thái hoạt động

1. Nhà hàng gạt công tắc sang trạng thái **"Tắt"**.
2. Nếu đang có đơn hàng chưa xử lý → hệ thống hiển thị câu hỏi xác nhận.
3. Nhà hàng nhấn **"Xác nhận"**.
4. Hệ thống cập nhật trạng thái thành **"Tạm ngừng nhận đơn"**.
5. Ẩn quán khỏi kết quả tìm kiếm mới của Khách hàng.
6. Các đơn hàng đang xử lý dở vẫn tiếp tục được giữ nguyên, không bị hủy.

---

### 1.6 Xem báo cáo doanh thu

1. Nhà hàng chọn khoảng thời gian cần xem: **Ngày / Tuần / Tháng / Tùy chỉnh**.
2. Hệ thống kiểm tra dữ liệu trong khoảng thời gian đó:
   - Nếu **không có dữ liệu** → hiển thị thông báo "Không có dữ liệu".
   - Nếu **có dữ liệu** → hiển thị biểu đồ doanh thu, số đơn, tỷ lệ hủy, top món ăn bán chạy nhất.
3. Nếu nhà hàng muốn xuất file → chọn **"Xuất báo cáo"** (định dạng Excel hoặc PDF).
4. Hệ thống tạo và tải file báo cáo tương ứng.

---

### 1.7 Quản lý thông tin nhà hàng

#### 1.7.1 Chỉnh sửa thông tin

1. Nhà hàng cập nhật các trường: địa chỉ, giờ hoạt động, ảnh, mô tả quán.
2. Nhấn **"Lưu thay đổi"**.
3. Hệ thống kiểm tra định dạng dữ liệu đầu vào.
4. Nếu có thay đổi **giấy phép kinh doanh / giấy tờ pháp lý**:
   - Chuyển trạng thái hồ sơ sang **"Chờ duyệt lại"** — một số chức năng nhận đơn bị tạm khóa cho đến khi Admin duyệt.
5. Nếu không có thay đổi giấy tờ pháp lý → cập nhật thông tin trực tiếp và hiển thị ngay cho Khách hàng.

#### 1.7.2 Xóa thông tin

1. Nhà hàng chọn trường thông tin muốn xóa và nhấn **"Xóa"**.
2. Hệ thống hiển thị cảnh báo xác nhận.
3. Nhà hàng nhấn **"Xác nhận xóa"**.
4. Hệ thống kiểm tra điều kiện:
   - Nếu trường đó là **bắt buộc** hoặc nhà hàng **đang có đơn chưa giao** → từ chối xóa, hiển thị lý do lỗi, hướng dẫn hoàn tất đơn trước hoặc chuyển sang "Chỉnh sửa".
   - Nếu hợp lệ → xóa trường thông tin khỏi hồ sơ quán, cập nhật hiển thị phía Khách hàng ngay lập tức.

---

### 1.8 Quản lý đánh giá (Nhà hàng)

#### 1.8.1 Xem đánh giá

1. Nhà hàng mở danh sách đánh giá, chọn bộ lọc (sao/thời gian).
2. Hệ thống kiểm tra:
   - Nếu **chưa có đánh giá nào** → hiển thị màn hình trống.
   - Nếu **có dữ liệu** → hiển thị danh sách đánh giá theo bộ lọc.
3. Nhà hàng chọn xem chi tiết một đánh giá cụ thể → hệ thống hiển thị nội dung, số sao, tên món, thời gian.

#### 1.8.2 Báo cáo đánh giá vi phạm

1. Nhà hàng nhấn **"Báo cáo"** tại đánh giá vi phạm.
2. Hệ thống hiển thị danh sách lý do báo cáo tiêu chuẩn.
3. Nhà hàng chọn lý do và nhấn **"Gửi báo cáo"**.
4. Hệ thống kiểm tra đánh giá đó đã được báo cáo trước chưa:
   - Nếu **đã báo cáo** → gộp lý do mới vào yêu cầu kiểm duyệt hiện có, thông báo hệ thống đã ghi nhận.
   - Nếu **chưa báo cáo** → tạo yêu cầu kiểm duyệt mới trong CSDL, gửi thông báo đến Quản trị viên.

---

## 2. Tài khoản Khách hàng

> Giao diện tài khoản Khách hàng đã hoàn thiện. Mục này mô tả các chức năng backend cần được tích hợp.

---

### 2.1 Quản lý thông tin cá nhân

#### 2.1.1 Chỉnh sửa thông tin

1. Khách hàng cập nhật các trường: họ tên, số điện thoại, email, địa chỉ, ảnh đại diện.
2. Nhấn **"Lưu thay đổi"**.
3. Hệ thống kiểm tra định dạng dữ liệu đầu vào.
4. Hệ thống kiểm tra trùng lặp: SĐT hoặc Email đã tồn tại trên hệ thống chưa?
   - Nếu **trùng lặp** → hiển thị thông báo lỗi, từ chối lưu.
   - Nếu **hợp lệ** → cập nhật thông tin mới vào hồ sơ tài khoản, áp dụng cho các đơn hàng tiếp theo.

#### 2.1.2 Xóa thông tin

1. Khách hàng chọn trường thông tin muốn xóa và nhấn **"Xóa"**.
2. Hệ thống hiển thị xác nhận thao tác xóa.
3. Khách hàng nhấn **"Xác nhận xóa"**.
4. Hệ thống kiểm tra điều kiện:
   - Nếu trường là **bắt buộc** (VD: địa chỉ giao hàng khi đang có đơn chưa giao) → từ chối xóa, hiển thị lý do, hướng dẫn chờ đơn hoàn tất hoặc chuyển sang chỉnh sửa.
   - Nếu hợp lệ → xóa trường thông tin đã chọn khỏi hồ sơ.

---

### 2.2 Quản lý đánh giá (Khách hàng)

#### 2.2.1 Viết đánh giá

1. Sau khi đơn hàng hoàn thành, khách hàng bấm chọn **"Đánh giá đơn hàng"**.
2. Hệ thống kiểm tra điều kiện hợp lệ:
   - Nếu đơn **chưa hoàn thành** hoặc **đã được đánh giá** → ẩn form hoặc chuyển sang trang "Chỉnh sửa".
   - Nếu hợp lệ → hiển thị biểu mẫu đánh giá.
3. Khách hàng nhập số sao và nội dung nhận xét, nhấn **"Gửi"**.
4. Hệ thống lưu dữ liệu, cập nhật điểm trung bình của nhà hàng/shipper và hiển thị đánh giá công khai.

#### 2.2.2 Chỉnh sửa đánh giá

1. Khách hàng nhấn **"Chỉnh sửa"** tại đánh giá đã viết.
2. Hệ thống kiểm tra đánh giá đó có đang bị **ẩn do vi phạm** không:
   - Nếu **đang bị ẩn** → thông báo lý do vi phạm, từ chối cho sửa.
   - Nếu bình thường → hiển thị nội dung đánh giá hiện tại lên form.
3. Khách hàng chỉnh sửa số sao / nội dung và nhấn **"Lưu"**.
4. Hệ thống cập nhật đánh giá và tính lại điểm trung bình.

#### 2.2.3 Xóa đánh giá

1. Khách hàng nhấn **"Xóa"** tại đánh giá đã có.
2. Hệ thống yêu cầu xác nhận.
3. Khách hàng chọn **"Xác nhận xóa"**.
4. Hệ thống xóa đánh giá và cập nhật lại điểm trung bình của nhà hàng/shipper.

---

### 2.3 Xử lý sự cố (Khách hàng)

1. Khách hàng gửi yêu cầu hỗ trợ kèm mô tả và minh chứng (ảnh/video nếu có).
2. Hệ thống tạo ticket hỗ trợ và gán mã theo dõi.
3. Quản trị viên nhận ticket, xem xét thông tin đơn hàng liên quan.
4. Nếu cần thêm bằng chứng → hệ thống thông báo yêu cầu khách bổ sung, đồng thời chuyển ticket sang trạng thái "Đang xử lý".
5. Khách hàng cung cấp thêm thông tin/ảnh.
6. Quản trị viên ra quyết định xử lý: Hủy đơn hỗ trợ / Hoàn tiền / Cảnh báo đối tượng liên quan.
7. Hệ thống cập nhật trạng thái liên quan (đơn hàng, ví...) và thông báo kết quả đến tất cả các bên, đóng ticket.

---

## 3. Tài khoản Người giao hàng (Shipper)

---

### 3.1 Nhận đơn hàng mới

1. Hệ thống phát hiện có đơn hàng phù hợp trong bán kính điều phối, hiển thị đề xuất lên màn hình Shipper.
2. Shipper nhấn **"Nhận đơn"** trên màn hình đề xuất.
3. Hệ thống kiểm tra đơn còn khả dụng không (chưa bị shipper khác nhận):
   - Nếu **đã bị nhận bởi shipper khác** → thông báo "Đơn không còn khả dụng", bỏ qua.
   - Nếu **còn khả dụng** → gán đơn cho shipper này, chuyển trạng thái đơn sang **"Đang chế biến"**, gửi thông báo đến cả Nhà hàng và Khách hàng.
4. Shipper chọn xem **chỉ dẫn lộ trình đến nhà hàng**.
5. Hệ thống hiển thị bản đồ định vị và đường đi tới điểm lấy món.

---

### 3.2 Từ chối đơn hàng

1. Shipper nhấn **"Từ chối"** (hoặc hết thời gian phản hồi).
2. Hệ thống ghi nhận từ chối, loại bỏ shipper này khỏi đơn hiện tại.
3. Hệ thống chạy thuật toán tìm shipper thay thế trong khu vực:
   - Nếu **còn shipper khác phù hợp** → tự động gửi đề xuất đơn đến shipper tiếp theo.
   - Nếu **không còn shipper** → gửi thông báo đến Nhà hàng về việc đơn bị kéo dài, chờ xử lý.

---

### 3.3 Cập nhật trạng thái đơn hàng

Đây là luồng chính của Shipper trong suốt một cuốc giao hàng:

**Bước 1 — Lấy hàng:**
1. Shipper đến nhà hàng, nhận món và xác nhận **"Đã lấy hàng"** trên ứng dụng.
2. Hệ thống chuyển trạng thái đơn sang **"Đang giao"**.
3. Hệ thống bắt đầu chia sẻ vị trí GPS realtime của Shipper cho Khách hàng.

**Bước 2 — Giao hàng:**
1. Shipper di chuyển đến địa chỉ giao hàng của Khách.
2. Hệ thống cập nhật vị trí Shipper theo thời gian thực.
3. Shipper liên hệ và gặp được Khách hàng tại điểm giao:
   - Nếu **giao thành công** → Shipper xác nhận **"Hoàn thành"** đơn hàng.
     - Hệ thống chuyển trạng thái sang "Hoàn thành", ghi nhận thu nhập tích lũy cho Shipper.
   - Nếu **không liên hệ được Khách** → Shipper chọn **"Báo cáo sự cố giao hàng"** → chuyển sang luồng Xử lý sự cố.

---

### 3.4 Thiết lập trạng thái nhận đơn (Shipper)

#### 3.4.1 Bật trạng thái nhận đơn

1. Shipper gạt công tắc sang **"Bật"**.
2. Hệ thống xác định vị trí GPS hiện tại của Shipper:
   - Nếu **không có tín hiệu GPS** → báo lỗi, yêu cầu kích hoạt định vị trên thiết bị.
   - Nếu **thành công** → đưa Shipper vào danh sách sẵn sàng nhận đơn, kích hoạt vòng điều phối GPS theo bán kính khu vực.

#### 3.4.2 Tắt trạng thái nhận đơn

1. Shipper gạt công tắc sang **"Tắt"**.
2. Hệ thống kiểm tra trạng thái đơn hàng của Shipper:
   - Loại Shipper khỏi vòng điều phối đơn mới.
   - Nếu **đang có đơn giao dở** → yêu cầu Shipper hoàn tất đơn đang giao trước khi tắt hoàn toàn.
   - Nếu **không có đơn nào** → tắt hoàn toàn, dừng nhận đơn mới.

---

### 3.5 Xem lịch sử giao hàng

1. Shipper mở **"Lịch sử giao hàng"**, chọn bộ lọc (thời gian / trạng thái).
2. Hệ thống kiểm tra:
   - Nếu **chưa từng giao đơn nào** → hiển thị màn hình trống.
   - Nếu **có dữ liệu** → truy vấn và hiển thị danh sách đơn hàng liên quan.
3. Shipper chọn xem chi tiết một đơn cụ thể → hệ thống hiển thị: địa điểm giao, thời gian, thu nhập từ đơn đó, đánh giá của Khách hàng.

---

### 3.6 Xem thu nhập tích lũy

1. Shipper chọn khoảng thời gian cần xem: **Ngày / Tuần / Tháng**.
2. Hệ thống kiểm tra dữ liệu:
   - Nếu **không có đơn hoàn thành** trong khoảng thời gian → thông báo "Không có dữ liệu".
   - Nếu **có dữ liệu** → hiển thị tổng thu nhập, chi tiết từng đơn và khoản thưởng (nếu có).

---

### 3.7 Quản lý thông tin cá nhân (Shipper)

#### 3.7.1 Chỉnh sửa thông tin

1. Shipper cập nhật thông tin: họ tên, số điện thoại, phương tiện, khu vực hoạt động.
2. Nhấn **"Lưu thay đổi"**.
3. Hệ thống kiểm tra định dạng dữ liệu đầu vào.
4. Nếu có thay đổi **Giấy phép lái xe / Đăng ký xe**:
   - Chuyển hồ sơ sang trạng thái **"Chờ duyệt lại"** — tạm khóa chức năng nhận đơn cho đến khi Admin duyệt.
5. Nếu không có thay đổi giấy tờ → cập nhật thông tin trực tiếp vào hồ sơ tài xế.

#### 3.7.2 Xóa thông tin

1. Shipper chọn trường muốn xóa và nhấn **"Xóa"**.
2. Hệ thống hiển thị xác nhận.
3. Shipper nhấn **"Xác nhận xóa"**.
4. Hệ thống kiểm tra điều kiện:
   - Nếu trường là **bắt buộc** (đang trong ca giao / khu vực điều phối bắt buộc) → từ chối xóa, hướng dẫn kết thúc ca trước hoặc chuyển sang chỉnh sửa.
   - Nếu hợp lệ → xóa trường thông tin, cập nhật dữ liệu điều phối hệ thống nếu liên quan.

---

### 3.8 Quản lý đánh giá (Shipper)

#### 3.8.1 Xem đánh giá

1. Shipper mở danh sách đánh giá, chọn bộ lọc (sao/thời gian).
2. Hệ thống hiển thị danh sách các đánh giá từ Khách hàng.
3. Shipper chọn xem chi tiết → hệ thống hiển thị: nội dung, số sao, tên đơn hàng, thời gian giao.

#### 3.8.2 Báo cáo đánh giá vi phạm

(Quy trình tương tự Nhà hàng — xem mục 1.8.2)

1. Shipper nhấn **"Báo cáo"** tại đánh giá vi phạm.
2. Chọn lý do và gửi báo cáo.
3. Hệ thống tạo/gộp yêu cầu kiểm duyệt và thông báo đến Quản trị viên.

---

## 4. Tài khoản Quản trị viên

---

### 4.1 Quản lý tài khoản người dùng

#### 4.1.1 Duyệt tài khoản mới (Nhà hàng / Shipper)

1. Admin mở hồ sơ đang chờ duyệt.
2. Hệ thống hiển thị đầy đủ thông tin và file đính kèm (giấy phép kinh doanh, giấy tờ xe...).
3. Admin kiểm tra hồ sơ:
   - Nếu **thiếu / không hợp lệ** → chọn "Từ chối" kèm lý do cụ thể → hệ thống cập nhật trạng thái tài khoản thành "Từ chối", gửi thông báo yêu cầu bổ sung minh chứng.
   - Nếu **đầy đủ và hợp lệ** → chọn "Phê duyệt" → hệ thống cập nhật trạng thái thành "Đã duyệt", gửi thông báo kích hoạt thành công đến người dùng.

#### 4.1.2 Xem tài khoản

1. Admin mở danh sách tài khoản, tìm kiếm theo SĐT / Email / Tên.
2. Hệ thống kiểm tra từ khóa tìm kiếm:
   - Nếu **không tìm thấy** → thông báo "Không tìm thấy kết quả".
   - Nếu **có kết quả** → hiển thị danh sách tài khoản phù hợp.
3. Admin chọn một tài khoản → hệ thống hiển thị: thông tin cá nhân, lịch sử đơn/giao dịch, danh sách đánh giá, lịch sử vi phạm (nếu có).

#### 4.1.3 Khóa tài khoản

1. Admin mở tài khoản vi phạm, nhập lý do khóa.
2. Hệ thống hiển thị lịch sử vi phạm liên quan (nếu có).
3. Admin xác nhận lệnh khóa.
4. Hệ thống kiểm tra tài khoản đang có đơn dở không:
   - Nếu **có đơn đang xử lý** → yêu cầu xử lý / hủy đơn liên quan trước (chuyển sang luồng "Xử lý sự cố"), sau đó khóa.
   - Nếu **không có đơn dở** → chuyển trạng thái tài khoản thành "Bị khóa" ngay lập tức, chấm dứt phiên đăng nhập hiện tại trên thiết bị của người dùng, gửi thông báo kèm lý do khóa và hướng dẫn khiếu nại.

#### 4.1.4 Mở khóa tài khoản

1. Admin mở tài khoản đang bị khóa, xem lý do khóa và lịch sử vi phạm liên quan.
2. Admin đánh giá vi phạm cũ đã được xử lý triệt để chưa:
   - Nếu **chưa giải quyết xong** → từ chối mở khóa, ghi chú lý do giữ khóa.
   - Nếu **đã giải quyết** → Admin xác nhận "Mở khóa" tài khoản, hệ thống chuyển trạng thái về "Hoạt động", gửi thông báo mở khóa thành công đến người dùng.

#### 4.1.5 Chỉnh sửa tài khoản

1. Admin mở chi tiết tài khoản cần chỉnh sửa.
2. Hệ thống hiển thị toàn bộ trường thông tin hiện tại.
3. Admin cập nhật các trường cần sửa và nhấn **"Lưu"**.
4. Hệ thống kiểm tra tính hợp lệ:
   - Nếu **không hợp lệ** → từ chối lưu, hiển thị lỗi cụ thể.
   - Nếu **hợp lệ** → cập nhật dữ liệu mới vào CSDL, ghi log hành động của Admin (ai sửa, sửa gì, lúc mấy giờ).

---

### 4.2 Quản lý đánh giá toàn hệ thống

#### 4.2.1 Xem đánh giá

1. Admin lọc đánh giá theo: Nhà hàng / Tài xế / Lượt báo cáo / Thời gian.
2. Hệ thống kiểm tra:
   - Nếu **không có kết quả** → hiển thị thông báo "Không tìm thấy kết quả".
   - Nếu **có kết quả** → hiển thị danh sách đánh giá phù hợp với bộ lọc.
3. Admin chọn xem chi tiết → hệ thống hiển thị: nội dung đánh giá, người viết, đối tượng bị đánh giá, số lượt báo cáo.

#### 4.2.2 Ẩn đánh giá vi phạm

1. Admin chọn **"Ẩn"** tại đánh giá vi phạm, nhập lý do vi phạm.
2. Hệ thống yêu cầu xác nhận.
3. Admin xác nhận **"Xác nhận ẩn"**.
4. Hệ thống chuyển trạng thái đánh giá thành **"Đã ẩn"**, loại bỏ khỏi hiển thị công khai.
5. Gửi thông báo cho người viết đánh giá kèm lý do vi phạm.

#### 4.2.3 Xóa đánh giá vi phạm

1. Admin chọn **"Xóa"** tại đánh giá vi phạm, nhập lý do.
2. Hệ thống kiểm tra đánh giá còn tồn tại không:
   - Nếu **đã xóa trước đó** → thông báo "Đánh giá không còn tồn tại".
   - Nếu **còn tồn tại** → yêu cầu xác nhận (cảnh báo: không thể hoàn tác).
3. Admin nhấn **"Xác nhận"**.
4. Hệ thống xóa vĩnh viễn đánh giá khỏi CSDL, tính toán lại điểm trung bình của Nhà hàng / Tài xế liên quan, gửi thông báo cho người viết kèm lý do vi phạm nghiêm trọng.

---

### 4.3 Thống kê báo cáo tổng hệ thống

#### 4.3.1 Báo cáo tổng doanh thu

1. Admin chọn khoảng thời gian: **Ngày / Tuần / Tháng / Tùy chỉnh**.
2. Hệ thống kiểm tra dữ liệu giao dịch:
   - Nếu **không có dữ liệu** → thông báo "Không có dữ liệu".
   - Nếu **có dữ liệu** → hiển thị biểu đồ tổng doanh thu, phí dịch vụ, chiết khấu.
3. Nếu cần xuất file → Admin chọn **"Xuất báo cáo"** (Excel/PDF) → hệ thống tạo và tải file.

#### 4.3.2 Thống kê tỷ lệ đơn hàng thành công và bị hủy

1. Admin chọn khoảng thời gian và bộ lọc (Nhà hàng / Khu vực).
2. Hệ thống kiểm tra dữ liệu:
   - Nếu **không có dữ liệu** → thông báo "Không có dữ liệu".
   - Nếu **có dữ liệu** → hiển thị tỷ lệ % hoàn thành/hủy, top nhà hàng hủy cao nhất.
3. Hệ thống tự động phát hiện nhà hàng/tài xế có tỷ lệ hủy bất thường:
   - Nếu phát hiện bất thường → Admin có thể **"Đánh dấu theo dõi"** đối tượng đó.
   - Hệ thống lưu đối tượng vào danh sách cần giám sát.

---

### 4.4 Xử lý sự cố hệ thống

(Chức năng xử lý ticket — xem thêm mục 2.3 từ phía Người dùng)

1. Admin nhận ticket hỗ trợ từ Người dùng.
2. Xem xét và xác minh thông tin đơn hàng liên quan:
   - Nếu **cần thêm thông tin** → chuyển ticket sang "Đang xử lý", gửi thông báo yêu cầu Người dùng bổ sung minh chứng (ảnh/video).
   - Nếu **đã đủ thông tin để quyết định** → ra quyết định xử lý: Hủy đơn hỗ trợ / Hoàn tiền / Cảnh báo đối tượng liên quan.
3. Hệ thống cập nhật trạng thái liên quan (đơn hàng, ví tiền...), thông báo kết quả đến tất cả các bên, đóng ticket.

---

### 4.5 Quản lý cấu hình hệ thống

1. Admin mở mục **"Cấu hình hệ thống"**.
2. Hệ thống hiển thị các tham số hiện hành: phí dịch vụ, đơn giá theo km, tỷ lệ chiết khấu...
3. Admin chỉnh sửa giá trị cần thay đổi và nhấn **"Lưu thay đổi"**.
4. Hệ thống kiểm tra giá trị nhập:
   - Nếu **vượt ngưỡng / giá trị âm** → từ chối lưu, hiển thị thông báo lỗi cụ thể.
   - Nếu **hợp lệ** → cập nhật tham số mới vào hệ thống, ghi log lịch sử thay đổi cấu hình (ai thay đổi, thay đổi gì, lúc mấy giờ).

---

## Phụ lục: Bảng trạng thái đơn hàng

| Trạng thái | Ý nghĩa |
|---|---|
| Chờ xác nhận | Khách đã đặt, nhà hàng chưa phản hồi |
| Đã xác nhận / Đang chuẩn bị | Nhà hàng đã đồng ý, đang chế biến |
| Đang tìm tài xế | Hệ thống đang điều phối shipper |
| Chờ tài xế lấy món | Món đã sẵn sàng, chờ shipper đến |
| Đang giao | Shipper đã lấy hàng, đang trên đường |
| Hoàn thành | Khách nhận hàng thành công |
| Đã hủy bởi Nhà hàng | Nhà hàng chủ động hủy |
| Đã hủy bởi Khách hàng | Khách chủ động hủy trước khi xác nhận |
| Đã hủy (giao thất bại) | Shipper không giao được, hệ thống xử lý |

---

*Tài liệu được tổng hợp từ Activity Diagram và Use Case Specification — Phiên bản 1.0*
