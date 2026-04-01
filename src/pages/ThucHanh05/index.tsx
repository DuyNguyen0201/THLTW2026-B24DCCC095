import ColumnChart from '@/components/Chart/ColumnChart';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

type Status = 'Pending' | 'Approved' | 'Rejected';
type Gender = 'Nam' | 'Nữ' | 'Khác';

type Club = {
  id: string;
  avatar: string;
  name: string;
  establishedDate: string;
  descriptionHtml: string;
  president: string;
  active: boolean;
};

type Registration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  address: string;
  talent: string;
  clubId: string;
  reason: string;
  status: Status;
  rejectReason?: string;
};

type ActionHistory = {
  id: string;
  registrationId: string;
  fullName: string;
  action: 'Approved' | 'Rejected' | 'TransferClub';
  admin: string;
  note: string;
  createdAt: string;
};

const mkId = () => Math.random().toString(36).slice(2, 10);

const clubSeed: Club[] = [
  {
    id: 'c1',
    avatar: 'https://i.pravatar.cc/120?img=11',
    name: 'CLB Công nghệ',
    establishedDate: '2023-03-11',
    descriptionHtml: '<b>Nghiên cứu</b> và xây dựng sản phẩm công nghệ.',
    president: 'Nguyễn Văn A',
    active: true,
  },
  {
    id: 'c2',
    avatar: 'https://i.pravatar.cc/120?img=12',
    name: 'CLB Truyền thông',
    establishedDate: '2022-09-20',
    descriptionHtml: 'Sáng tạo nội dung và tổ chức sự kiện.',
    president: 'Trần Thị B',
    active: true,
  },
];

const registrationSeed: Registration[] = [
  {
    id: 'r1',
    fullName: 'Lê Minh Khang',
    email: 'khang@gmail.com',
    phone: '0901112222',
    gender: 'Nam',
    address: 'Quận 1, TP.HCM',
    talent: 'ReactJS',
    clubId: 'c1',
    reason: 'Muốn đóng góp dự án thực tế',
    status: 'Pending',
  },
  {
    id: 'r2',
    fullName: 'Nguyễn Hải Yến',
    email: 'yen@gmail.com',
    phone: '0903334444',
    gender: 'Nữ',
    address: 'Thủ Đức, TP.HCM',
    talent: 'Thiết kế poster',
    clubId: 'c2',
    reason: 'Yêu thích truyền thông số',
    status: 'Approved',
  },
];

const statusColor: Record<Status, string> = {
  Pending: 'gold',
  Approved: 'green',
  Rejected: 'red',
};

const ThucHanh05Page = () => {
  const [clubs, setClubs] = useState<Club[]>(clubSeed);
  const [registrations, setRegistrations] = useState<Registration[]>(registrationSeed);
  const [histories, setHistories] = useState<ActionHistory[]>([]);
  const [clubKeyword, setClubKeyword] = useState('');
  const [selectedRegIds, setSelectedRegIds] = useState<React.Key[]>([]);

  const [clubForm] = Form.useForm<Club>();
  const [registrationForm] = Form.useForm<Registration>();
  const [rejectForm] = Form.useForm<{ reason: string }>();
  const [transferForm] = Form.useForm<{ newClubId: string }>();

  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | undefined>();
  const [clubMembersModal, setClubMembersModal] = useState<Club | undefined>();

  const [regModalOpen, setRegModalOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<Registration | undefined>();
  const [viewingReg, setViewingReg] = useState<Registration | undefined>();

  const [rejectModal, setRejectModal] = useState<{ ids: string[]; title: string } | undefined>();
  const [historyModal, setHistoryModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);

  const clubMap = useMemo(() => new Map(clubs.map((club) => [club.id, club])), [clubs]);
  const filteredClubs = useMemo(
    () => clubs.filter((c) => c.name.toLowerCase().includes(clubKeyword.toLowerCase())),
    [clubs, clubKeyword],
  );
  const approvedMembers = useMemo(() => registrations.filter((r) => r.status === 'Approved'), [registrations]);

  const stats = useMemo(() => {
    const pending = registrations.filter((r) => r.status === 'Pending').length;
    const approved = registrations.filter((r) => r.status === 'Approved').length;
    const rejected = registrations.filter((r) => r.status === 'Rejected').length;
    return { totalClub: clubs.length, pending, approved, rejected };
  }, [clubs.length, registrations]);

  const chartData = useMemo(() => {
    const pendingSeries = clubs.map((club) => registrations.filter((r) => r.clubId === club.id && r.status === 'Pending').length);
    const approvedSeries = clubs.map((club) => registrations.filter((r) => r.clubId === club.id && r.status === 'Approved').length);
    const rejectedSeries = clubs.map((club) => registrations.filter((r) => r.clubId === club.id && r.status === 'Rejected').length);
    return { xAxis: clubs.map((c) => c.name), yAxis: [pendingSeries, approvedSeries, rejectedSeries] };
  }, [clubs, registrations]);

  const appendHistory = (payload: Omit<ActionHistory, 'id' | 'createdAt'>) => {
    setHistories((prev) => [{ ...payload, id: mkId(), createdAt: dayjs().format('HH:mm DD/MM/YYYY') }, ...prev]);
  };

  const submitClub = async () => {
    const values = await clubForm.validateFields();
    if (editingClub) {
      setClubs((prev) => prev.map((club) => (club.id === editingClub.id ? { ...editingClub, ...values } : club)));
      message.success('Đã cập nhật câu lạc bộ');
    } else {
      setClubs((prev) => [{ ...values, id: mkId() }, ...prev]);
      message.success('Đã thêm câu lạc bộ');
    }
    setClubModalOpen(false);
  };

  const submitRegistration = async () => {
    const values = await registrationForm.validateFields();
    if (editingReg) {
      setRegistrations((prev) => prev.map((reg) => (reg.id === editingReg.id ? { ...editingReg, ...values } : reg)));
      message.success('Đã cập nhật đơn đăng ký');
    } else {
      setRegistrations((prev) => [{ ...values, id: mkId(), status: 'Pending' }, ...prev]);
      message.success('Đã thêm đơn đăng ký');
    }
    setRegModalOpen(false);
  };

  const approveRegistrations = (ids: string[]) => {
    setRegistrations((prev) =>
      prev.map((reg) => {
        if (!ids.includes(reg.id)) return reg;
        appendHistory({ registrationId: reg.id, fullName: reg.fullName, action: 'Approved', admin: 'Admin', note: 'Duyệt đơn đăng ký' });
        return { ...reg, status: 'Approved', rejectReason: undefined };
      }),
    );
    setSelectedRegIds([]);
    message.success(`Đã duyệt ${ids.length} đơn`);
  };

  const rejectRegistrations = async () => {
    if (!rejectModal) return;
    const { reason } = await rejectForm.validateFields();
    setRegistrations((prev) =>
      prev.map((reg) => {
        if (!rejectModal.ids.includes(reg.id)) return reg;
        appendHistory({ registrationId: reg.id, fullName: reg.fullName, action: 'Rejected', admin: 'Admin', note: reason });
        return { ...reg, status: 'Rejected', rejectReason: reason };
      }),
    );
    setRejectModal(undefined);
    setSelectedRegIds([]);
    rejectForm.resetFields();
    message.success(`Đã từ chối ${rejectModal.ids.length} đơn`);
  };

  const transferMembers = async () => {
    const { newClubId } = await transferForm.validateFields();
    const ids = selectedRegIds as string[];
    setRegistrations((prev) =>
      prev.map((reg) => {
        if (!ids.includes(reg.id) || reg.status !== 'Approved') return reg;
        appendHistory({
          registrationId: reg.id,
          fullName: reg.fullName,
          action: 'TransferClub',
          admin: 'Admin',
          note: `Chuyển sang ${clubMap.get(newClubId)?.name || ''}`,
        });
        return { ...reg, clubId: newClubId };
      }),
    );
    setTransferModal(false);
    setSelectedRegIds([]);
    transferForm.resetFields();
    message.success(`Đã chuyển CLB cho ${ids.length} thành viên`);
  };

  const clubColumns: ColumnsType<Club> = [
    { title: 'Ảnh đại diện', dataIndex: 'avatar', width: 120, render: (avatar) => <Image width={52} height={52} src={avatar} style={{ objectFit: 'cover', borderRadius: 6 }} /> },
    { title: 'Tên câu lạc bộ', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Ngày thành lập', dataIndex: 'establishedDate', sorter: (a, b) => dayjs(a.establishedDate).valueOf() - dayjs(b.establishedDate).valueOf(), render: (v) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Mô tả (HTML)', dataIndex: 'descriptionHtml', render: (html) => <div dangerouslySetInnerHTML={{ __html: html }} /> },
    { title: 'Chủ nhiệm CLB', dataIndex: 'president' },
    { title: 'Hoạt động', dataIndex: 'active', render: (v) => (v ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>) },
    {
      title: 'Thao tác',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingClub(record); clubForm.setFieldsValue(record); setClubModalOpen(true); }}>Sửa</Button>
          <Button danger type="link" icon={<DeleteOutlined />} onClick={() => { setClubs((prev) => prev.filter((club) => club.id !== record.id)); message.success('Đã xóa CLB'); }}>Xóa</Button>
          <Button type="link" icon={<TeamOutlined />} onClick={() => setClubMembersModal(record)}>Thành viên</Button>
        </Space>
      ),
    },
  ];

  const registrationColumns: ColumnsType<Registration> = [
    { title: 'Họ tên', dataIndex: 'fullName', sorter: (a, b) => a.fullName.localeCompare(b.fullName) },
    { title: 'Email', dataIndex: 'email' },
    { title: 'SĐT', dataIndex: 'phone' },
    { title: 'Giới tính', dataIndex: 'gender' },
    { title: 'Địa chỉ', dataIndex: 'address' },
    { title: 'Sở trường', dataIndex: 'talent' },
    { title: 'CLB', dataIndex: 'clubId', render: (clubId) => clubMap.get(clubId)?.name || '-' },
    { title: 'Lý do đăng ký', dataIndex: 'reason' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: Status) => <Tag color={statusColor[status]}>{status}</Tag>,
      filters: [{ text: 'Pending', value: 'Pending' }, { text: 'Approved', value: 'Approved' }, { text: 'Rejected', value: 'Rejected' }],
      onFilter: (value, record) => record.status === value,
    },
    { title: 'Ghi chú', dataIndex: 'rejectReason' },
    {
      title: 'Thao tác',
      width: 260,
      render: (_, record) => (
        <Space size={0}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setViewingReg(record)}>Xem</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingReg(record); registrationForm.setFieldsValue(record); setRegModalOpen(true); }}>Sửa</Button>
          <Button danger type="link" icon={<DeleteOutlined />} onClick={() => setRegistrations((prev) => prev.filter((reg) => reg.id !== record.id))}>Xóa</Button>
          <Button type="link" icon={<CheckCircleOutlined />} onClick={() => approveRegistrations([record.id])}>Duyệt</Button>
          <Button danger type="link" icon={<CloseCircleOutlined />} onClick={() => setRejectModal({ ids: [record.id], title: `Từ chối đơn của ${record.fullName}` })}>Từ chối</Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card title="1) Danh sách câu lạc bộ">
        <Space style={{ marginBottom: 12 }}>
          <Input.Search placeholder="Tìm CLB" allowClear onSearch={setClubKeyword} style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingClub(undefined); clubForm.resetFields(); clubForm.setFieldValue('active', true); setClubModalOpen(true); }}>Thêm CLB</Button>
        </Space>
        <Table rowKey="id" columns={clubColumns} dataSource={filteredClubs} scroll={{ x: 1200 }} />
      </Card>

      <Card title="2) Quản lý đơn đăng ký thành viên">
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingReg(undefined); registrationForm.resetFields(); registrationForm.setFieldValue('status', 'Pending'); setRegModalOpen(true); }}>Thêm đơn</Button>
          <Button type="default" disabled={!selectedRegIds.length} onClick={() => approveRegistrations(selectedRegIds as string[])}>Duyệt {selectedRegIds.length} đơn đã chọn</Button>
          <Button danger disabled={!selectedRegIds.length} onClick={() => setRejectModal({ ids: selectedRegIds as string[], title: `Từ chối ${selectedRegIds.length} đơn đã chọn` })}>Không duyệt {selectedRegIds.length} đơn đã chọn</Button>
          <Button onClick={() => setHistoryModal(true)}>Xem lịch sử thao tác</Button>
        </Space>
        <Table rowKey="id" columns={registrationColumns} dataSource={registrations} rowSelection={{ selectedRowKeys: selectedRegIds, onChange: setSelectedRegIds }} scroll={{ x: 2200 }} />
      </Card>

      <Card title="3) Quản lý thành viên câu lạc bộ (Approved)">
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" disabled={!selectedRegIds.length} onClick={() => setTransferModal(true)}>Đổi CLB cho {selectedRegIds.length} thành viên đã chọn</Button>
        </Space>
        <Table
          rowKey="id"
          dataSource={approvedMembers}
          columns={registrationColumns.filter((c) => c.title !== 'Thao tác' && c.title !== 'Ghi chú')}
          rowSelection={{ selectedRowKeys: selectedRegIds, onChange: setSelectedRegIds }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Card title="4) Báo cáo và thống kê">
        <Row gutter={[16, 16]}>
          <Col span={6}><Statistic title="Số CLB" value={stats.totalClub} /></Col>
          <Col span={6}><Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Col>
          <Col span={6}><Statistic title="Approved" value={stats.approved} valueStyle={{ color: '#52c41a' }} /></Col>
          <Col span={6}><Statistic title="Rejected" value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} /></Col>
        </Row>
        <Divider />
        <ColumnChart title="Số đơn đăng ký theo từng CLB" xAxis={chartData.xAxis} yAxis={chartData.yAxis} yLabel={['Pending', 'Approved', 'Rejected']} colors={['#faad14', '#52c41a', '#ff4d4f']} formatY={(v) => `${v} đơn`} />
      </Card>

      <Modal visible={clubModalOpen} title={editingClub ? 'Chỉnh sửa CLB' : 'Thêm CLB'} onCancel={() => setClubModalOpen(false)} onOk={submitClub} destroyOnClose>
        <Form form={clubForm} layout="vertical">
          <Form.Item name="avatar" label="Ảnh đại diện" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="Tên CLB" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="establishedDate" label="Ngày thành lập" rules={[{ required: true }]}><Input type="date" /></Form.Item>
          <Form.Item name="descriptionHtml" label="Mô tả HTML" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="president" label="Chủ nhiệm" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="active" label="Hoạt động" valuePropName="checked"><Switch checkedChildren="Có" unCheckedChildren="Không" /></Form.Item>
        </Form>
      </Modal>

      <Modal visible={regModalOpen} title={editingReg ? 'Chỉnh sửa đơn đăng ký' : 'Thêm đơn đăng ký'} onCancel={() => setRegModalOpen(false)} onOk={submitRegistration} width={800}>
        <Form form={registrationForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}><Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="SĐT" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}><Select options={[{ value: 'Nam' }, { value: 'Nữ' }, { value: 'Khác' }]} /></Form.Item></Col>
            <Col span={24}><Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="talent" label="Sở trường" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="clubId" label="Câu lạc bộ" rules={[{ required: true }]}><Select options={clubs.map((c) => ({ value: c.id, label: c.name }))} /></Form.Item></Col>
            <Col span={24}><Form.Item name="reason" label="Lý do đăng ký" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal visible={!!viewingReg} title="Chi tiết đơn đăng ký" onCancel={() => setViewingReg(undefined)} footer={null}>
        {viewingReg && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Họ tên">{viewingReg.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewingReg.email}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{viewingReg.phone}</Descriptions.Item>
            <Descriptions.Item label="CLB">{clubMap.get(viewingReg.clubId)?.name}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={statusColor[viewingReg.status]}>{viewingReg.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Lý do">{viewingReg.reason}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal visible={!!rejectModal} title={rejectModal?.title} onCancel={() => setRejectModal(undefined)} onOk={rejectRegistrations}>
        <Form form={rejectForm} layout="vertical">
          <Form.Item name="reason" label="Lý do từ chối" rules={[{ required: true, message: 'Bắt buộc nhập lý do từ chối' }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal visible={historyModal} title="Lịch sử thao tác" footer={null} onCancel={() => setHistoryModal(false)} width={980}>
        <Table<ActionHistory>
          rowKey="id"
          dataSource={histories}
          columns={[
            { title: 'Thành viên', dataIndex: 'fullName' },
            { title: 'Hành động', dataIndex: 'action' },
            { title: 'Admin', dataIndex: 'admin' },
            { title: 'Ghi chú', dataIndex: 'note' },
            { title: 'Thời gian', dataIndex: 'createdAt' },
          ]}
        />
      </Modal>

      <Modal visible={transferModal} title="Chuyển câu lạc bộ cho thành viên" onCancel={() => setTransferModal(false)} onOk={transferMembers}>
        <Typography.Paragraph>Bạn đang đổi CLB cho <b>{selectedRegIds.length}</b> thành viên.</Typography.Paragraph>
        <Form form={transferForm} layout="vertical">
          <Form.Item name="newClubId" label="Chọn CLB muốn chuyển đến" rules={[{ required: true }]}><Select options={clubs.map((c) => ({ value: c.id, label: c.name }))} /></Form.Item>
        </Form>
      </Modal>

      <Modal visible={!!clubMembersModal} title={`Danh sách thành viên - ${clubMembersModal?.name || ''}`} onCancel={() => setClubMembersModal(undefined)} footer={null} width={900}>
        <Table
          rowKey="id"
          dataSource={approvedMembers.filter((m) => m.clubId === clubMembersModal?.id)}
          columns={[
            { title: 'Họ tên', dataIndex: 'fullName' },
            { title: 'Email', dataIndex: 'email' },
            { title: 'SĐT', dataIndex: 'phone' },
            { title: 'Giới tính', dataIndex: 'gender' },
            { title: 'Địa chỉ', dataIndex: 'address' },
            { title: 'Sở trường', dataIndex: 'talent' },
          ]}
        />
      </Modal>
    </Space>
  );
};

export default ThucHanh05Page;