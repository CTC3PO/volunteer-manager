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

function normalizeString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễđìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/g, "")
    .trim();
}

function cleanDate(val: string): string {
  if (!val) return "";
  // Check for YYYY-MM-DD first (possibly with other text after it)
  const ymdMatch = val.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // Check for DD/MM/YYYY next
  const dmyMatch = val.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  return val;
}

// Google Sheets column header → Volunteer field mapping
// Uses fuzzy normalized matching to support different Google Sheets question variations
function mapRow(row: Record<string, string>): Partial<Volunteer> {
  const id = `tnv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const keys = Object.keys(row);
  const normalizedKeys = keys.map(k => ({ original: k, normalized: normalizeString(k) }));

  // Helper: matches column headers by exact string first, then by normalized substring
  const get = (...keywords: string[]) => {
    // 1. Try exact match (case insensitive and trimmed)
    for (const kw of keywords) {
      const target = kw.toLowerCase().trim();
      for (const k of keys) {
        if (k.toLowerCase().trim() === target && row[k]) {
          return row[k].trim();
        }
      }
    }

    // 2. Try normalized containing match
    for (const kw of keywords) {
      const targetNormalized = normalizeString(kw);
      if (!targetNormalized) continue;
      for (const nk of normalizedKeys) {
        if (nk.normalized.includes(targetNormalized) && row[nk.original]) {
          return row[nk.original].trim();
        }
      }
    }

    return "";
  };

  // Dedicated helper for phone number to avoid matching emergency phone
  const getPhone = () => {
    for (const nk of normalizedKeys) {
      const val = nk.normalized;
      if (val.includes("sốđiệnthoại") && !val.includes("khẩncấp") && row[nk.original]) {
        return row[nk.original].trim();
      }
    }
    return get("Số điện thoại", "Số điện thoại bạn sử dụng");
  };

  const getEmergencyPhone = () => {
    for (const nk of normalizedKeys) {
      const val = nk.normalized;
      if (val.includes("sốđiệnthoại") && val.includes("khẩncấp") && row[nk.original]) {
        return row[nk.original].trim();
      }
      if (val.includes("điệnthoạikhẩncấp") && row[nk.original]) {
        return row[nk.original].trim();
      }
    }
    return get("Điện thoại khẩn cấp", "sđt khẩn cấp");
  };

  return {
    id,
    hoTen: get("Họ và tên", "Họ tên", "Tên", "Bạn hãy cho Tu viện biết họ và tên của bạn"),
    ngaySinh: get("Ngày sinh", "Ngày, tháng, năm sinh", "Bạn hãy cho Tu viện biết ngày, tháng, năm sinh của bạn"),
    tuoi: parseInt(get("Tuổi", "Bạn hãy cho Tu viện biết tuổi của bạn") || "0") || 0,
    gioiTinh: parseGioiTinh(get("Giới tính", "Bạn hãy cho Tu viện biết giới tính của bạn")),
    ngheNghiep: get("Nghề nghiệp", "Bạn hãy cho Tu viện biết nghề nghiệp của bạn"),
    quocTich: get("Quốc tịch", "Bạn hãy cho Tu viện biết quốc tịch của bạn"),
    ngonNgu: parseNgonNgu(get("Ngôn ngữ", "Ngôn ngữ sử dụng chính")),

    soHoChieu: get("Số hộ chiếu", "passport number", "Bạn hãy cho Tu viện biết số hộ chiếu của bạn"),
    thoiHanHoChieu: get("Thời hạn hộ chiếu", "Thời hạn", "Bạn hãy cho Tu viện biết thời hạn hộ chiếu của bạn"),

    email: get("Email", "email", "Email Address", "Bạn hãy cho Tu viện biết email của bạn"),
    soDienThoai: getPhone(),
    ungDungLienLac: parseUngDung(get("Ứng dụng di động", "Ứng dụng liên lạc", "Bạn đang sử dụng ứng dụng di động nào")),

    diaChi: {
      soNhaTenDuong: get("Số nhà tên đường", "Số nhà, tên đường, phường/ xã...", "Địa chỉ"),
      thanhPho: get("Tỉnh/ Thành phố", "Thành phố"),
      quocGia: get("Quốc gia") || "Việt Nam",
      maZip: get("Postal code", "Zip code", "Postal code/ Zip code"),
    },

    lienHeKhanCap: {
      hoTen: get("Họ tên người liên hệ khẩn cấp", "Họ tên người liên hệ", "Bạn hãy cho Tu viện biết họ tên người liên hệ khẩn cấp"),
      quanHe: get("Mối quan hệ", "Quan hệ", "Bạn hãy cho Tu viện biết người liên hệ khẩn cấp có mối quan hệ như thế nào với bạn"),
      soDienThoai: getEmergencyPhone(),
    },

    ngayDen: cleanDate(get("Ngày đến Tu viện", "Ngày đến")),
    ngayRoi: cleanDate(get("Ngày rời Tu viện", "Ngày rời")),
    thongTinChuyenBayDen: get("Thông tin chuyến bay đến", "Chuyến bay đến") || undefined,
    thongTinChuyenBayVe: get("Thông tin chuyến bay về", "Chuyến bay về") || undefined,

    chiPhiPhuongTien: parseBoolean(get("chi phí phương tiện", "di chuyển 2 chiều", "1400 Baht")),
    chiPhiAnUong: parseBoolean(get("chi phí thực phẩm", "thực phẩm, điện, nước", "2400 Baht")),
    cungDuongThem: parseFloat(get("cúng dường thêm", "cúng dường") || "0") || undefined,

    phuongThucThanhToan: "" as const,
    daThanhToan: false,

    xacNhanSucKhoe: true,
    camKetYTe: true,
    baoHiemDuLich: true,
    thuocKeDon: get("thuốc kê đơn", "sử dụng bất kỳ loại thuốc kê đơn") || undefined,
    sucKhoeTamThan: get("sức khoẻ tâm thần", "vấn đề sức khoẻ tâm thần") || undefined,
    hanCheTheChat: get("hạn chế về thể chất", "hạn chế thể chất") || undefined,

    tangThan: get("tăng thân thực tập", "đang tham dự một tăng thân", "tăng thân") || undefined,
    gioiDaTiepNhan: parseGioi(get("giới đã tiếp nhận", "Giới đã tiếp nhận", "Bạn đã tiếp nhận Giới nào")),
    mongMuonHocHoi: get("mong muốn học hỏi", "ước mong sẽ trải nghiệm", "trải nghiệm hoặc học được") || undefined,

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
        const volunteers: Partial<Volunteer>[] = [];
        for (const row of rows) {
          const mapped = mapRow(row);
          const name = mapped.hoTen?.trim() || "";
          
          const isInvalidName =
            name === "" ||
            name.includes("@") ||
            name.includes("Tên TNV") ||
            name.includes("Bạn hãy") ||
            name.includes("Tôi đồng ý") ||
            name.includes("Thời gian") ||
            name.includes("Thời điểm") ||
            name.length > 50;

          if (!isInvalidName) {
            volunteers.push(mapped);
          }
        }
        resolve(volunteers);
      },
      error: reject,
    });
  });
}
