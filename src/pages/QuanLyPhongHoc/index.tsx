import React, { useState, useMemo } from 'react';
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { 
  Button, Popconfirm, message, Tooltip, Modal, Form, Input, Select, InputNumber, 
  Tag, Badge, Row, Col, Card, Space, Empty, Divider 
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, DownloadOutlined,
  HomeOutlined 
} from '@ant-design/icons';
import { PhongHoc, initialData, loaiPhongEnum, danhSachNguoiPhuTrach } from './data';

const QuanLyPhongHoc: React.FC = () => {
  const [dataSource, setDataSource] = useState<PhongHoc[]>(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<PhongHoc | undefined>(undefined);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<{
    maPhong?: string;
    tenPhong?: string;
    loaiPhong?: string;
    nguoiPhuTrach?: string;
  }>({});

  const handleOpenModal = (record?: PhongHoc) => {
    setCurrentRow(record);
    if (record) {//
      form.setFieldsValue(record);  
    } else {
      form.resetFields(); 
    }
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setDataSource(dataSource.filter((item) => item.id !== id));
    message.success('Đã xóa phòng học thành công');
  };

  const handleFinish = (values: any) => {
    const trimmedValues = {
      ...values,
      maPhong: values.maPhong?.trim() || '',
      tenPhong: values.tenPhong?.trim() || '',
    };

    if (currentRow) {
      setDataSource(dataSource.map((item) => (item.id === currentRow.id ? { ...item, ...trimmedValues } : item)));
      message.success('Cập nhật phòng học thành công!');
    } else {
      setDataSource([...dataSource, { ...trimmedValues, id: Date.now().toString() }]);
      message.success('Thêm mới phòng học thành công!');
    }
    setIsModalVisible(false);
  };

  const checkTrungLap = (_: any, value: string, field: 'maPhong' | 'tenPhong') => {
    if (!value) return Promise.resolve();
    const isExist = dataSource.some(
      (item) => item[field].toLowerCase() === value.toLowerCase() && item.id !== currentRow?.id
    );
    if (isExist) {
      return Promise.reject(new Error(${field === 'maPhong' ? 'Mã phòng' : 'Tên phòng'} đã tồn tại!));
    }
    return Promise.resolve();
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchParams({
      maPhong: values.maPhong || '',
      tenPhong: values.tenPhong || '',
      loaiPhong: values.loaiPhong || '',
      nguoiPhuTrach: values.nguoiPhuTrach || '',
    });
    message.success('Tìm kiếm thành công!');
  };

  const handleResetSearch = () => {
    searchForm.resetFields();
    setSearchParams({});
    message.info('Đã reset tiêu chí tìm kiếm');
  };

  const filteredData = useMemo(() => {
    return dataSource.filter(item => {
      if (searchParams.maPhong && !item.maPhong.toLowerCase().includes(searchParams.maPhong.toLowerCase())) {
        return false;
      }
      if (searchParams.tenPhong && !item.tenPhong.toLowerCase().includes(searchParams.tenPhong.toLowerCase())) {
        return false;
      }
      if (searchParams.loaiPhong && item.loaiPhong !== searchParams.loaiPhong) {
        return false;
      }
      if (searchParams.nguoiPhuTrach && item.nguoiPhuTrach !== searchParams.nguoiPhuTrach) {
        return false;
      }
      return true;
    });
  }, [dataSource, searchParams]);

  const statistics = useMemo(() => {
    const total = dataSource.length;
    const lyThuyet = dataSource.filter(item => item.loaiPhong === 'Lý thuyết').length;
    const thucHanh = dataSource.filter(item => item.loaiPhong === 'Thực hành').length;
    const hoiTruong = dataSource.filter(item => item.loaiPhong === 'Hội trường').length;
    const tongChoNgoi = dataSource.reduce((sum, item) => sum + item.soChoNgoi, 0);
    return { total, lyThuyet, thucHanh, hoiTruong, tongChoNgoi };
  }, [dataSource]);

  const renderLoaiPhongBadge = (loaiPhong: string) => {
    const badgeColors: { [key: string]: string } = {
      'Lý thuyết': 'blue',
      'Thực hành': 'orange',
      'Hội trường': 'red',
    };
    return <Badge color={badgeColors[loaiPhong]} text={loaiPhong} />;
  };

  const renderChoNgoi = (soChoNgoi: number) => {
    let status: 'success' | 'processing' | 'default' = 'default';
    let label = 'Lớn';
    if (soChoNgoi < 30) {
      status = 'success';
      label = 'Nhỏ';
    } else if (soChoNgoi >= 30 && soChoNgoi < 60) {
      status = 'processing';
      label = 'Vừa';
    }
    return <Tag icon={<HomeOutlined />} color={status}>{label} ({soChoNgoi})</Tag>;
  };

  const columns: ProColumns<PhongHoc>[] = [
    {
      title: 'Mã phòng',
      dataIndex: 'maPhong',
      width: 120,
      sorter: (a, b) => a.maPhong.localeCompare(b.maPhong),
    },
    {
      title: 'Tên phòng',
      dataIndex: 'tenPhong',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Loại phòng',
      dataIndex: 'loaiPhong',
      valueType: 'select',
      valueEnum: loaiPhongEnum,
      width: 150,
      render: (_, record) => renderLoaiPhongBadge(record.loaiPhong),
    },
    {
      title: 'Số chỗ ngồi',
      dataIndex: 'soChoNgoi',
      sorter: (a, b) => a.soChoNgoi - b.soChoNgoi,
      hideInSearch: true,
      width: 150,
      render: (_, record) => renderChoNgoi(record.soChoNgoi),
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'nguoiPhuTrach',
      valueType: 'select',
      valueEnum: danhSachNguoiPhuTrach,
      width: 200,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleOpenModal(record)}
        >
          Sửa
        </Button>,
        record.soChoNgoi < 30 ? (
          <Popconfirm
            key="delete"
            title="Bạn có chắc chắn muốn xóa phòng học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        ) : (
          <Tooltip key="delete-disabled" title="Chỉ được phép xóa phòng dưới 30 chỗ ngồi">
            <Button type="link" danger disabled icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Tooltip>
        ),
      ],
    },
  ];

  const loaiPhongOptions = Object.keys(loaiPhongEnum).map(key => ({ label: key, value: key }));
  const nguoiPhuTrachOptions = Object.keys(danhSachNguoiPhuTrach).map(key => ({ label: key, value: key }));

  const handleExportCsv = () => {
    if (dataSource.length === 0) {
      message.warning('Không có dữ liệu để xuất!');
      return;
    }

    const headers = ['Mã phòng', 'Tên phòng', 'Loại phòng', 'Số chỗ ngồi', 'Người phụ trách'];
    const csvContent = [
      headers.join(','),
      ...dataSource.map(item =>
        [item.maPhong, item.tenPhong, item.loaiPhong, item.soChoNgoi, item.nguoiPhuTrach]
          .map(field => "${field}")
          .join(',')
      )
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + csvContent));
    element.setAttribute('download', Danh_sach_phong_hoc_${new Date().toISOString().split('T')[0]}.csv);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    message.success('Xuất danh sách phòng học thành công!');
  };

  return (
    <PageContainer>
      {/* Phần thống kê */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <HomeOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{statistics.total}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Tổng phòng học</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{statistics.lyThuyet}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Phòng Lý thuyết</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>{statistics.thucHanh}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Phòng Thực hành</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>{statistics.hoiTruong}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Hội trường</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }}>
        <Form
          form={searchForm}
          layout="vertical"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                name="maPhong"
                label="Mã phòng"
              >
                <Input placeholder="Nhập mã phòng..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                name="tenPhong"
                label="Tên phòng"
              >
                <Input placeholder="Nhập tên phòng..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                name="loaiPhong"
                label="Loại phòng"
              >
                <Select 
                  placeholder="Chọn loại phòng..."
                  options={loaiPhongOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                name="nguoiPhuTrach"
                label="Người phụ trách"
              >
                <Select 
                  placeholder="Chọn người phụ trách..."
                  options={nguoiPhuTrachOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col>
              <Button type="primary" onClick={handleSearch}>
                Tìm kiếm
              </Button>
            </Col>
            <Col>
              <Button onClick={handleResetSearch}>
                Làm lại
              </Button>
            </Col>
            <Col>
              <span style={{ fontSize: 12, color: '#999' }}>
                Tìm thấy: <strong>{filteredData.length}</strong> kết quả
              </span>
            </Col>
          </Row>
        </Form>
      </Card>

      {filteredData.length === 0 ? (
        <Card>
          <Empty 
            description={Object.keys(searchParams).some(key => searchParams[key as keyof typeof searchParams]) ? "Không tìm thấy phòng học phù hợp" : "Không có dữ liệu phòng học"}
            style={{ marginTop: 48, marginBottom: 48 }}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Thêm phòng học mới
            </Button>
          </Empty>
        </Card>
      ) : (
        <ProTable<PhongHoc>
          headerTitle={`Danh sách phòng học (${filteredData.length})`}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          search={false}
          toolBarRender={() => [
            <Button
              key="button"
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => handleOpenModal()}
            >
              Thêm mới
            </Button>,
          ]}
        />
      )}

      <Modal
        title={
          <Space>
            <HomeOutlined />
            {currentRow ? 'Chỉnh sửa phòng học' : 'Thêm mới phòng học'}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
        okText="Lưu lại"
        cancelText="Hủy"
        width={600}
      >
        <Divider style={{ margin: '12px 0' }} />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            name="maPhong"
            label={
              <Tooltip title="Mã định danh phòng (chữ/số, tối đa 10 ký tự)">
                <span>Mã phòng <span style={{ color: 'red' }}>*</span></span>
              </Tooltip>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập mã phòng!' },
              { max: 10, message: 'Mã phòng không được vượt quá 10 ký tự!' },
              { pattern: /^[a-zA-Z0-9]+$/, message: 'Mã phòng chỉ được chứa chữ và số, không có khoảng trắng!' },
              { validator: (rule, value) => checkTrungLap(rule, value, 'maPhong') },
            ]}
          >
            <Input placeholder="VD: P101, LAB01, HT001" />
          </Form.Item>

          <Form.Item
            name="tenPhong"
            label={
              <Tooltip title="Tên gọi của phòng học">
                <span>Tên phòng <span style={{ color: 'red' }}>*</span></span>
              </Tooltip>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập tên phòng!' },
              { max: 50, message: 'Tên phòng không được vượt quá 50 ký tự!' },
              { validator: (rule, value) => checkTrungLap(rule, value, 'tenPhong') },
            ]}
          >
            <Input placeholder="VD: Phòng 101, Phòng Thực hành Máy tính A" />
          </Form.Item>

          <Form.Item
            name="loaiPhong"
            label={
              <Tooltip title="Phòng dùng để dạy lý thuyết, thực hành hoặc tổ chức sự kiện">
                <span>Loại phòng <span style={{ color: 'red' }}>*</span></span>
              </Tooltip>
            }
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
          >
            <Select 
              options={loaiPhongOptions} 
              placeholder="Chọn loại phòng..."
            />
          </Form.Item>

          <Form.Item
            name="soChoNgoi"
            label={
              <Tooltip title="Số lượng chỗ ngồi (10-200)">
                <span>Số chỗ ngồi <span style={{ color: 'red' }}>*</span></span>
              </Tooltip>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập số chỗ ngồi!' },
            ]}
          >
            <InputNumber 
              min={10} 
              max={200} 
              style={{ width: '100%' }} 
              placeholder="Nhập 10 - 200" 
            />
          </Form.Item>

          <Form.Item
            name="nguoiPhuTrach"
            label={
              <Tooltip title="Người quản lý/chịu trách nhiệm phòng">
                <span>Người phụ trách <span style={{ color: 'red' }}>*</span></span>
              </Tooltip>
            }
            rules={[{ required: true, message: 'Vui lòng chọn người phụ trách!' }]}
          >
            <Select 
              options={nguoiPhuTrachOptions} 
              placeholder="Chọn người phụ trách..." 
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default QuanLyPhongHoc;