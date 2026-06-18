import { FamilyConfig } from "../config/retreat-config";

export interface Retreat {
  id: string;
  ten: string;           // Tên khóa tu
  diaDiem: string;       // Địa điểm
  ngayBatDau: string;    // YYYY-MM-DD
  ngayKetThuc: string;   // YYYY-MM-DD
  moTa?: string;         // Mô tả ngắn
  ngayTao: string;
  ngayCapNhat: string;
  families: FamilyConfig[];
  tasks: string[];
  posterUrl?: string;
}
