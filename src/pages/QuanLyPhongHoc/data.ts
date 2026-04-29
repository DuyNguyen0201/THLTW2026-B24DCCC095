export type RoomType = 'LY_THUYET' | 'THUC_HANH' | 'HOI_TRUONG';

export interface Classroom {
  id: string;
  maPhong: string;
  tenPhong: string;
  soChoNgoi: number;
  loaiPhong: RoomType;
  nguoiPhuTrach: string;
}

export const ROOM_TYPE_OPTIONS: { label: string; value: RoomType }[] = [
  { label: 'Lý thuyết', value: 'LY_THUYET' },
  { label: 'Thực hành', value: 'THUC_HANH' },
  { label: 'Hội trường', value: 'HOI_TRUONG' },
];

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  LY_THUYET: 'Lý thuyết',
  THUC_HANH: 'Thực hành',
  HOI_TRUONG: 'Hội trường',
};

export const RESPONSIBLES = ['Nguyễn Văn A', 'Trần Thị B', 'Phạm Quốc C', 'Lê Minh D'];

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: '1',
    maPhong: 'A101',
    tenPhong: 'Phòng học A101',
    soChoNgoi: 45,
    loaiPhong: 'LY_THUYET',
    nguoiPhuTrach: 'Nguyễn Văn A',
  },
  {
    id: '2',
    maPhong: 'TH201',
    tenPhong: 'Phòng máy TH201',
    soChoNgoi: 28,
    loaiPhong: 'THUC_HANH',
    nguoiPhuTrach: 'Trần Thị B',
  },
  {
    id: '3',
    maPhong: 'HT01',
    tenPhong: 'Hội trường lớn',
    soChoNgoi: 180,
    loaiPhong: 'HOI_TRUONG',
    nguoiPhuTrach: 'Lê Minh D',
  },
];