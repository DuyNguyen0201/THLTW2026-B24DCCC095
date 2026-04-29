import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import { useMemo, useState } from 'react';
import {
  INITIAL_CLASSROOMS,
  RESPONSIBLES,
  ROOM_TYPE_LABEL,
  ROOM_TYPE_OPTIONS,
  type Classroom,
  type RoomType,
} from './data';

type FormValues = Omit<Classroom, 'id'>;

const PhongHocPage = () => {
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchMaPhong, setSearchMaPhong] = useState('');
  const [searchTenPhong, setSearchTenPhong] = useState('');
  const [filterLoaiPhong, setFilterLoaiPhong] = useState<RoomType | undefined>();
  const [filterNguoiPhuTrach, setFilterNguoiPhuTrach] = useState<string | undefined>();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const byMa = item.maPhong.toLowerCase().includes(searchMaPhong.trim().toLowerCase());
      const byTen = item.tenPhong.toLowerCase().includes(searchTenPhong.trim().toLowerCase());
      const byLoai = !filterLoaiPhong || item.loaiPhong === filterLoaiPhong;
      const byNguoi = !filterNguoiPhuTrach || item.nguoiPhuTrach === filterNguoiPhuTrach;
      return byMa && byTen && byLoai && byNguoi;
    });
  }, [data, filterLoaiPhong, filterNguoiPhuTrach, searchMaPhong, searchTenPhong]);

  const openAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setVisible(true);
  };

  const openEditModal = (record: Classroom) => {
    setEditingId(record.id);
    form.setFieldsValue({
      maPhong: record.maPhong,
      tenPhong: record.tenPhong,
      soChoNgoi: record.soChoNgoi,
      loaiPhong: record.loaiPhong,
      nguoiPhuTrach: record.nguoiPhuTrach,
    });
    setVisible(true);
  };

  const handleDelete = (record: Classroom) => {
    if (record.soChoNgoi >= 30) {
      message.warning('Chỉ cho phép xóa phòng dưới 30 chỗ ngồi');
      return;
    }
    setData((prev) => prev.filter((item) => item.id !== record.id));
    message.success('Xóa phòng học thành công');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    const normalizedMa = values.maPhong.trim().toLowerCase();
    const normalizedTen = values.tenPhong.trim().toLowerCase();

    const duplicatedMa = data.some(
      (item) => item.id !== editingId && item.maPhong.trim().toLowerCase() === normalizedMa,
    );
    if (duplicatedMa) {
      form.setFields([{ name: 'maPhong', errors: ['Mã phòng đã tồn tại'] }]);
      return;
    }

    const duplicatedTen = data.some(
      (item) => item.id !== editingId && item.tenPhong.trim().toLowerCase() === normalizedTen,
    );
    if (duplicatedTen) {
      form.setFields([{ name: 'tenPhong', errors: ['Tên phòng đã tồn tại'] }]);
      return;
    }

    if (editingId) {
      setData((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...values, maPhong: values.maPhong.trim(), tenPhong: values.tenPhong.trim() } : item)),
      );
      message.success('Cập nhật phòng học thành công');
    } else {
      setData((prev) => [
        ...prev,
        {
          ...values,
          id: Date.now().toString(),
          maPhong: values.maPhong.trim(),
          tenPhong: values.tenPhong.trim(),
        },
      ]);
      message.success('Thêm mới phòng học thành công');
    }

    setVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  return (
    <Card
      title="Quản lý phòng học"
      extra={
        <Button icon={<PlusOutlined />} onClick={openAddModal} type="primary">
          Thêm phòng học
        </Button>
      }
    >
      <Space style={{ width: '100%', marginBottom: 16 }} wrap>
        <Input
          allowClear
          onChange={(e) => setSearchMaPhong(e.target.value)}
          placeholder="Tìm theo mã phòng"
          style={{ width: 220 }}
          value={searchMaPhong}
        />
        <Input
          allowClear
          onChange={(e) => setSearchTenPhong(e.target.value)}
          placeholder="Tìm theo tên phòng"
          style={{ width: 220 }}
          value={searchTenPhong}
        />
        <Select
          allowClear
          onChange={(value) => setFilterLoaiPhong(value)}
          options={ROOM_TYPE_OPTIONS}
          placeholder="Lọc loại phòng"
          style={{ width: 180 }}
          value={filterLoaiPhong}
        />
        <Select
          allowClear
          onChange={(value) => setFilterNguoiPhuTrach(value)}
          options={RESPONSIBLES.map((item) => ({ label: item, value: item }))}
          placeholder="Lọc người phụ trách"
          style={{ width: 220 }}
          value={filterNguoiPhuTrach}
        />
      </Space>

      <Table<Classroom>
        columns={[
          { title: 'Mã phòng', dataIndex: 'maPhong' },
          { title: 'Tên phòng', dataIndex: 'tenPhong' },
          {
            title: 'Số chỗ ngồi',
            dataIndex: 'soChoNgoi',
            sorter: (a, b) => a.soChoNgoi - b.soChoNgoi,
            defaultSortOrder: 'ascend',
            align: 'center',
          },
          {
            title: 'Loại phòng',
            dataIndex: 'loaiPhong',
            render: (value: RoomType) => <Tag color="blue">{ROOM_TYPE_LABEL[value]}</Tag>,
          },
          { title: 'Người phụ trách', dataIndex: 'nguoiPhuTrach' },
          {
            title: 'Thao tác',
            align: 'center',
            render: (_, record) => {
              const canDelete = record.soChoNgoi < 30;
              return (
                <Space>
                  <Tooltip title="Chỉnh sửa">
                    <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} type="link" />
                  </Tooltip>

                  {canDelete ? (
                    <Popconfirm
                      onConfirm={() => handleDelete(record)}
                      title="Bạn có chắc chắn muốn xóa phòng học này?"
                    >
                      <Button danger icon={<DeleteOutlined />} type="link" />
                    </Popconfirm>
                  ) : (
                    <Tooltip title="Chỉ cho phép xóa phòng dưới 30 chỗ ngồi">
                      <Button danger disabled icon={<DeleteOutlined />} type="link" />
                    </Tooltip>
                  )}
                </Space>
              );
            },
          },
        ]}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
        rowKey="id"
      />

      <Modal
        destroyOnClose
        onCancel={() => {
          setVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        visible={visible}
        okText={editingId ? 'Lưu lại' : 'Thêm mới'}
        title={editingId ? 'Chỉnh sửa phòng học' : 'Thêm phòng học'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã phòng"
            name="maPhong"
            rules={[
              { required: true, message: 'Vui lòng nhập mã phòng' },
              { whitespace: true, message: 'Mã phòng không được để trống' },
              { max: 10, message: 'Mã phòng tối đa 10 ký tự' },
            ]}
          >
            <Input maxLength={10} placeholder="Nhập mã phòng" />
          </Form.Item>

          <Form.Item
            label="Tên phòng"
            name="tenPhong"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phòng' },
              { whitespace: true, message: 'Tên phòng không được để trống' },
              { max: 50, message: 'Tên phòng tối đa 50 ký tự' },
            ]}
          >
            <Input maxLength={50} placeholder="Nhập tên phòng" />
          </Form.Item>

          <Form.Item
            label="Người phụ trách"
            name="nguoiPhuTrach"
            rules={[{ required: true, message: 'Vui lòng chọn người phụ trách' }]}
          >
            <Select options={RESPONSIBLES.map((item) => ({ label: item, value: item }))} placeholder="Chọn người phụ trách" />
          </Form.Item>

          <Form.Item
            label="Số chỗ ngồi"
            name="soChoNgoi"
            rules={[
              { required: true, message: 'Vui lòng nhập số chỗ ngồi' },
              { type: 'number', min: 10, max: 200, message: 'Số chỗ ngồi từ 10 đến 200' },
            ]}
          >
            <InputNumber min={10} max={200} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Loại phòng"
            name="loaiPhong"
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
          >
            <Select options={ROOM_TYPE_OPTIONS} placeholder="Chọn loại phòng" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PhongHocPage;