import * as XLSX from "xlsx";
import { Volunteer } from "@/shared/types/volunteer";
import { retreatConfig } from "@/shared/config/retreat-config";

function getFamilyLabel(id?: string): string {
  if (!id) return "";
  return retreatConfig.families.find((f) => f.id === id)?.label || id;
}

export function exportToExcel(volunteers: Volunteer[], filename = "danh-sach-tnv.xlsx") {
  const rows = volunteers.map((v) => ({
    "Họ và tên": v.hoTen,
    "Ngày sinh": v.ngaySinh,
    "Tuổi": v.tuoi,
    "Giới tính": v.gioiTinh,
    "Quốc tịch": v.quocTich,
    "Nghề nghiệp": v.ngheNghiep,
    "Email": v.email,
    "Số điện thoại": v.soDienThoai,
    "Ứng dụng liên lạc": v.ungDungLienLac.join(", "),
    "Số hộ chiếu": v.soHoChieu,
    "Thời hạn hộ chiếu": v.thoiHanHoChieu,
    "Ngày đến": v.ngayDen,
    "Ngày rời": v.ngayRoi,
    "Chuyến bay đến": v.thongTinChuyenBayDen || "",
    "Chuyến bay về": v.thongTinChuyenBayVe || "",
    "Địa chỉ": `${v.diaChi.soNhaTenDuong}, ${v.diaChi.thanhPho}, ${v.diaChi.quocGia}`,
    "Người liên hệ khẩn cấp": v.lienHeKhanCap.hoTen,
    "Quan hệ": v.lienHeKhanCap.quanHe,
    "SĐT khẩn cấp": v.lienHeKhanCap.soDienThoai,
    "Phương thức thanh toán": v.phuongThucThanhToan,
    "Ngày thanh toán": v.ngayThanhToan || "",
    "Đã thanh toán": v.daThanhToan ? "Có" : "Chưa",
    "Cúng dường thêm (Baht)": v.cungDuongThem || "",
    "Gia đình Pháp đàm": getFamilyLabel(v.giaDinhPhapDam),
    "Nhiệm vụ": v.nhiemVu.join(", "),
    "Phòng": v.phong || "",
    "Trạng thái": v.trangThai,
    "Giới đã tiếp nhận": v.gioiDaTiepNhan.join(", "),
    "Tăng thân": v.tangThan || "",
    "Nguồn dữ liệu": v.nguonDuLieu === "csv" ? "CSV" : "Nhập tay",
    "Ngày tạo": new Date(v.ngayTao).toLocaleDateString("vi-VN"),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Danh sách TNV");

  // Auto column widths
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, filename);
}
