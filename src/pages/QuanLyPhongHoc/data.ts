export interface PhongHoc {
    id: string;
    maPhong: string;
    tenPhong: string;
    soChoNgoi: number;
    loaiPhong: string;
    nguoiPhuTrach: string;
  }
  
  export const danhSachNguoiPhuTrach = {
    'Nguyễn Văn A': { text: 'Nguyễn Văn A' },
    'Trần Thị B': { text: 'Trần Thị B' },
    'Lê Văn C': { text: 'Lê Văn C' },
    'Phạm Văn D': { text: 'Phạm Văn D' },
  };
  
  export const loaiPhongEnum = {
    'Lý thuyết': { text: 'Lý thuyết', status: 'Default' },
    'Thực hành': { text: 'Thực hành', status: 'Processing' },
    'Hội trường': { text: 'Hội trường', status: 'Warning' },
  };
  
  export const initialData: PhongHoc[] = [
    {
      id: '1',
      maPhong: 'P101',
      tenPhong: 'Phòng học 101',
      soChoNgoi: 45,
      loaiPhong: 'Lý thuyết',
      nguoiPhuTrach: 'Nguyễn Văn A',
    },
    {
      id: '2',
      maPhong: 'LAB01',
      tenPhong: 'Phòng Thực Hành Máy Tính',
      soChoNgoi: 25,
      loaiPhong: 'Thực hành',
      nguoiPhuTrach: 'Trần Thị B',
    },
    {
      id: '3',
      maPhong: 'HT01',
      tenPhong: 'Hội trường trung tâm',
      soChoNgoi: 200,
      loaiPhong: 'Hội trường',
      nguoiPhuTrach: 'Lê Văn C',
    },
    {
      id: '4',
      maPhong: 'P102',
      tenPhong: 'Phòng học 102',
      soChoNgoi: 50,
      loaiPhong: 'Lý thuyết',
      nguoiPhuTrach: 'Phạm Văn D',
    },
    {
      id: '5',
      maPhong: 'LAB02',
      tenPhong: 'Phòng Thực Hành Điện tử',
      soChoNgoi: 30,
      loaiPhong: 'Thực hành',
      nguoiPhuTrach: 'Nguyễn Văn A',
    },
    {
      id: '6',
      maPhong: 'P201',
      tenPhong: 'Phòng học 201',
      soChoNgoi: 60,
      loaiPhong: 'Lý thuyết',
      nguoiPhuTrach: 'Trần Thị B',
    },
    {
      id: '7',
      maPhong: 'LAB03',
      tenPhong: 'Phòng Thực Hành Hóa Học',
      soChoNgoi: 20,
      loaiPhong: 'Thực hành',
      nguoiPhuTrach: 'Lê Văn C',
    },
    {
      id: '8',
      maPhong: 'HT02',
      tenPhong: 'Hội trường phía Bắc',
      soChoNgoi: 150,
      loaiPhong: 'Hội trường',
      nguoiPhuTrach: 'Phạm Văn D',
    },
  ];