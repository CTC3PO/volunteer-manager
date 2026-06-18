// ============================================================
// VOLUNTEER TYPE – định nghĩa đầy đủ hồ sơ TNV
// ============================================================

export type GioiTinh = "Nam" | "Nữ" | "Khác";
export type UngDung = "Zalo" | "Viber" | "Whatsapp";
export type TrangThaiTNV = "Đang xét duyệt" | "Đã duyệt" | "Từ chối";
export type NguonDuLieu = "csv" | "manual";
export type PhuongThucThanhToan = "QR Code" | "Tiền mặt" | "";
export type GioiDaTiepNhan = "5 Giới" | "14 Giới" | "Chưa tiếp nhận";

export interface DiaChi {
  soNhaTenDuong: string;
  thanhPho: string;
  quocGia: string;
  maZip: string;
}

export interface LienHeKhanCap {
  hoTen: string;
  quanHe: string;
  soDienThoai: string;
}

export interface Volunteer {
  id: string;
  retreatId: string;

  // Hồ sơ cá nhân
  avatarUrl?: string;
  hoTen: string;
  ngaySinh: string;
  tuoi: number;
  gioiTinh: GioiTinh;
  ngheNghiep: string;
  quocTich: string;
  ngonNgu: string[];

  // Hộ chiếu
  soHoChieu: string;
  thoiHanHoChieu: string;

  // Liên hệ
  email: string;
  soDienThoai: string;
  ungDungLienLac: UngDung[];

  // Địa chỉ
  diaChi: DiaChi;

  // Liên hệ khẩn cấp
  lienHeKhanCap: LienHeKhanCap;

  // Lịch trình
  ngayDen: string;
  ngayRoi: string;
  thongTinChuyenBayDen?: string;
  thongTinChuyenBayVe?: string;

  // Chi phí
  chiPhiPhuongTien: boolean;
  chiPhiAnUong: boolean;
  cungDuongThem?: number;
  phuongThucThanhToan: PhuongThucThanhToan;
  ngayThanhToan?: string;
  daThanhToan: boolean;

  // Sức khỏe
  xacNhanSucKhoe: boolean;
  thuocKeDon?: string;
  sucKhoeTamThan?: string;
  hanCheTheChat?: string;
  camKetYTe: boolean;
  baoHiemDuLich: boolean;

  // Tâm linh
  tangThan?: string;
  gioiDaTiepNhan: GioiDaTiepNhan[];
  mongMuonHocHoi?: string;

  // Phân công (Manager)
  giaDinhPhapDam?: string;   // family id
  nhiemVu: string[];
  phong?: string;

  // Meta
  trangThai: TrangThaiTNV;
  nguonDuLieu: NguonDuLieu;
  ngayTao: string;
  ngayCapNhat: string;
}
