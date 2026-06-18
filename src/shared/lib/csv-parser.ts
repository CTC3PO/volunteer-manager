import Papa from "papaparse";
import { Volunteer, UngDung, GioiDaTiepNhan, GioiTinh } from "@/shared/types/volunteer";

function parseUngDung(val: string): UngDung[] {
  if (!val) return [];
  const result: UngDung[] = [];
  if (val.includes("Zalo")) result.push("Zalo");
  if (val.includes("Viber")) result.push("Viber");
  if (val.includes("Whatsapp") || val.includes("WhatsApp")) result.push("Whatsapp");
  return result;
}

function parseGioi(val: string): GioiDaTiepNhan[] {
  if (!val) return ["Chưa tiếp nhận"];
  const result: GioiDaTiepNhan[] = [];
  if (val.includes("5 Giới")) result.push("5 Giới");
  if (val.includes("14 Giới")) result.push("14 Giới");
  return result.length > 0 ? result : ["Chưa tiếp nhận"];
}

function parseGioiTinh(val: string): GioiTinh {
  const v = val?.toLowerCase() || "";
  if (v.includes("nam")) return "Nam";
  if (v.includes("nữ") || v.includes("nu")) return "Nữ";
  return "Khác";
}

function parseBoolean(val: string): boolean {
  return val?.toLowerCase().includes("đồng ý") || val?.toLowerCase().includes("hoan hỷ") || false;
}

function parseNgonNgu(val: string): string[] {
  if (!val) return [];
  return val.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
}

// Google Sheets column header → Volunteer field mapping
// These headers match the actual Google Form question text (from form.docx)
function mapRow(row: Record<string, string>): Partial<Volunteer> {
  const id = `tnv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  // Helper: try multiple possible column name variations
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const val = row[k]?.trim();
      if (val) return val;
    }
    return "";
  };

  return {
    id,
    hoTen: get("Họ và tên", "Họ tên", "Tên", "Bạn hãy cho Tu viện biết họ và tên của bạn (giống như trên hộ chiếu )"),
    ngaySinh: get("Ngày sinh", "Ngày, tháng, năm sinh", "Bạn hãy cho Tu viện biết ngày, tháng, năm sinh của bạn (MM/DD/YYYY)"),
    tuoi: parseInt(get("Tuổi", "Bạn hãy cho Tu viện biết tuổi của bạn") || "0") || 0,
    gioiTinh: parseGioiTinh(get("Giới tính", "Bạn hãy cho Tu viện biết giới tính của bạn")),
    ngheNghiep: get("Nghề nghiệp", "Bạn hãy cho Tu viện biết nghề nghiệp của bạn"),
    quocTich: get("Quốc tịch", "Bạn hãy cho Tu viện biết quốc tịch của bạn"),
    ngonNgu: parseNgonNgu(get("Ngôn ngữ", "Ngôn ngữ phụ")),

    soHoChieu: get("Số hộ chiếu", "Bạn hãy cho Tu viện biết số hộ chiếu của bạn để Tu viện đăng ký tạm trú theo yêu cầu của chính quyền địa phương"),
    thoiHanHoChieu: get("Thời hạn hộ chiếu", "Bạn hãy cho Tu viện biết thời hạn hộ chiếu của bạn (mm/dd/yyyy)"),

    email: get("Email", "email", "Bạn hãy cho Tu viện biết email của bạn"),
    soDienThoai: get("Số điện thoại", "Bạn hãy cho Tu viện biết số điện thoại bạn sử dụng (bao gồm mã quốc gia) để Tu viện liên lạc đón bạn tại sân bay Thái Lan"),
    ungDungLienLac: parseUngDung(get("Ứng dụng di động", "Ứng dụng liên lạc", "Bạn hãy cho Tu viện biết bạn đang sử dụng ứng dụng di động nào để Tu viện liên lạc đón bạn tại sân bay Thái Lan (Zalo/ Viber/ Whatsapp )")),

    diaChi: {
      soNhaTenDuong: get("Số nhà tên đường phường xã", "Số nhà, tên đường, phường/ xã...", "Địa chỉ"),
      thanhPho: get("Tỉnh/ Thành phố", "Thành phố"),
      quocGia: get("Quốc gia") || "Việt Nam",
      maZip: get("Postal code", "Zip code", "Postal code/ Zip code"),
    },

    lienHeKhanCap: {
      hoTen: get("Họ tên người liên hệ khẩn cấp", "Bạn hãy cho Tu viện biết họ tên người liên hệ khẩn cấp"),
      quanHe: get("Mối quan hệ", "Quan hệ", "Bạn hãy cho Tu viện biết người liên hệ khẩn cấp có mối quan hệ như thế nào với bạn"),
      soDienThoai: get("Điện thoại khẩn cấp", "Bạn hãy cho Tu viện biết số điện thoại liên lạc khẩn cấp (di động bao gồm mã quốc gia)"),
    },

    ngayDen: get("Ngày đến Tu viện", "Ngày đến"),
    ngayRoi: get("Ngày rời Tu viện", "Ngày rời"),
    thongTinChuyenBayDen: get("Thông tin chuyến bay đến", "Chuyến bay đến") || undefined,
    thongTinChuyenBayVe: get("Thông tin chuyến bay về", "Chuyến bay về") || undefined,

    chiPhiPhuongTien: parseBoolean(get("Bạn hoan hỷ đóng góp chi phí phương tiện di chuyển 2 chiều sân bay BKK - Tu viện - BKK 1400 Baht (1.200.000 VND)", "Chi phí phương tiện")),
    chiPhiAnUong: parseBoolean(get("Bạn hoan hỷ đóng góp chi phí thực phẩm điện nước 2400 Baht (2.000.000 VND)", "Chi phí thực phẩm", "Chi phí ăn uống")),
    cungDuongThem: parseFloat(get("Bạn hãy nhập số tiền mà bạn mong muốn cúng dường thêm nếu có", "Cúng dường thêm") || "0") || undefined,

    phuongThucThanhToan: "" as const,
    daThanhToan: false,

    xacNhanSucKhoe: true,
    camKetYTe: true,
    baoHiemDuLich: true,
    thuocKeDon: get("Thuốc kê đơn") || undefined,
    sucKhoeTamThan: get("Sức khỏe tâm thần") || undefined,
    hanCheTheChat: get("Hạn chế thể chất") || undefined,

    tangThan: get("Tăng thân", "Bạn có đang tham dự một tăng thân thực tập theo pháp môn Làng Mai nào không? Nếu có, bạn ghi rõ để được ưu tiên khi xét duyệt") || undefined,
    gioiDaTiepNhan: parseGioi(get("Giới đã tiếp nhận", "Bạn đã tiếp nhận Giới nào sau đây")),
    mongMuonHocHoi: get("Mong muốn học hỏi", "Bạn ước mong sẽ trải nghiệm hoặc học được điều gì trong chương trình này") || undefined,

    nhiemVu: [],
    trangThai: "Đang xét duyệt" as const,
    nguonDuLieu: "csv" as const,
    ngayTao: now,
    ngayCapNhat: now,
  };
}

export function parseCSV(file: File): Promise<Partial<Volunteer>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        const volunteers = rows.map(mapRow);
        resolve(volunteers);
      },
      error: reject,
    });
  });
}
