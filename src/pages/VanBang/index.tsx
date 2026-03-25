import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

type DataType = 'string' | 'number' | 'date';

interface RegisterBook {
  id: string;
  year: number;
}

interface GraduationDecision {
  id: string;
  decisionNo: string;
  issueDate: string;
  summary: string;
  registerId: string;
  lookupCount: number;
}

interface FieldConfig {
  id: string;
  key: string;
  label: string;
  type: DataType;
}

interface DiplomaInfo {
  id: string;
  registerId: string;
  decisionId: string;
  entryNumber: number;
  serialNumber: string;
  studentCode: string;
  fullName: string;
  birthDate: string;
  extraValues: Record<string, string | number>;
}

const uuid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;


interface DiplomaFormValues {
  decisionId: string;
  serialNumber: string;
  studentCode: string;
  fullName: string;
  birthDate: moment.Moment;
  extraValues?: Record<string, string | number | moment.Moment | undefined>;
}

interface SearchFormValues {
  serialNumber?: string;
  entryNumber?: number;
  studentCode?: string;
  fullName?: string;
  birthDate?: moment.Moment;
}
const typeOptions = [
  { label: 'Chuỗi (String)', value: 'string' },
  { label: 'Số (Number)', value: 'number' },
  { label: 'Ngày (Date)', value: 'date' },
];

const countProvidedCriteria = (values: Record<string, unknown>) =>
  Object.values(values).filter((value) => value !== undefined && value !== null && String(value).trim() !== '').length;

const VanBangPage: React.FC = () => {
  const [registers, setRegisters] = useState<RegisterBook[]>([{ id: uuid(), year: 2026 }]);
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([
    { id: uuid(), key: 'diemTrungBinh', label: 'Điểm trung bình', type: 'number' },
    { id: uuid(), key: 'noiSinh', label: 'Nơi sinh', type: 'string' },
  ]);
  const [diplomas, setDiplomas] = useState<DiplomaInfo[]>([]);
  const [searchResult, setSearchResult] = useState<DiplomaInfo[]>([]);
  const [selectedDiploma, setSelectedDiploma] = useState<DiplomaInfo | null>(null);

  const [registerForm] = Form.useForm();
  const [decisionForm] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [diplomaForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  const registerMap = useMemo(() => Object.fromEntries(registers.map((r) => [r.id, r])), [registers]);
  const decisionMap = useMemo(() => Object.fromEntries(decisions.map((d) => [d.id, d])), [decisions]);

  const getNextEntryNumber = (registerId: string) => diplomas.filter((d) => d.registerId === registerId).length + 1;

  const addRegister = (values: { year: number }) => {
    if (registers.some((r) => r.year === values.year)) {
      message.error('Mỗi năm chỉ có một sổ văn bằng.');
      return;
    }
    setRegisters((prev) => [...prev, { id: uuid(), year: values.year }]);
    registerForm.resetFields();
    message.success('Đã mở sổ văn bằng mới.');
  };

  const addDecision = (values: { decisionNo: string; issueDate: moment.Moment; summary: string; registerId: string }) => {
    setDecisions((prev) => [
      ...prev,
      {
        id: uuid(),
        decisionNo: values.decisionNo,
        issueDate: values.issueDate.format('YYYY-MM-DD'),
        summary: values.summary,
        registerId: values.registerId,
        lookupCount: 0,
      },
    ]);
    decisionForm.resetFields();
    message.success('Đã thêm quyết định tốt nghiệp.');
  };

  const addFieldConfig = (values: { key: string; label: string; type: DataType }) => {
    if (fieldConfigs.some((item) => item.key === values.key)) {
      message.error('Mã trường đã tồn tại.');
      return;
    }
    setFieldConfigs((prev) => [...prev, { id: uuid(), ...values }]);
    fieldForm.resetFields();
    message.success('Đã thêm trường cấu hình.');
  };

  const removeField = (id: string) => setFieldConfigs((prev) => prev.filter((item) => item.id !== id));

  const addDiploma = (values: DiplomaFormValues) => {
    const decision = decisions.find((d) => d.id === values.decisionId);
    if (!decision) {
      message.error('Quyết định không hợp lệ.');
      return;
    }

    const extraValues: Record<string, string | number> = {};
    fieldConfigs.forEach((field) => {
      const rawValue = values.extraValues?.[field.key];
      if (rawValue === undefined || rawValue === null || rawValue === '') return;
      if (field.type === 'date' && moment.isMoment(rawValue)) {
        extraValues[field.key] = rawValue.format('YYYY-MM-DD');
      } else {
        extraValues[field.key] = moment.isMoment(rawValue) ? rawValue.format('YYYY-MM-DD') : rawValue;
      }
    });

    setDiplomas((prev) => [
      ...prev,
      {
        id: uuid(),
        registerId: decision.registerId,
        decisionId: decision.id,
        entryNumber: getNextEntryNumber(decision.registerId),
        serialNumber: values.serialNumber,
        studentCode: values.studentCode,
        fullName: values.fullName,
        birthDate: values.birthDate.format('YYYY-MM-DD'),
        extraValues,
      },
    ]);
    diplomaForm.resetFields();
    message.success('Đã thêm thông tin văn bằng.');
  };

  const searchDiploma = (values: SearchFormValues) => {
    const payload = {
      serialNumber: values.serialNumber,
      entryNumber: values.entryNumber,
      studentCode: values.studentCode,
      fullName: values.fullName,
      birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : undefined,
    };

    if (countProvidedCriteria(payload) < 2) {
      message.error('Vui lòng nhập tối thiểu 2 tham số tra cứu.');
      return;
    }

    const normalized = {
      serialNumber: payload.serialNumber?.toLowerCase(),
      studentCode: payload.studentCode?.toLowerCase(),
      fullName: payload.fullName?.toLowerCase(),
    };

    const results = diplomas.filter((item) => {
      if (payload.entryNumber && item.entryNumber !== payload.entryNumber) return false;
      if (payload.birthDate && item.birthDate !== payload.birthDate) return false;
      if (normalized.serialNumber && !item.serialNumber.toLowerCase().includes(normalized.serialNumber)) return false;
      if (normalized.studentCode && !item.studentCode.toLowerCase().includes(normalized.studentCode)) return false;
      if (normalized.fullName && !item.fullName.toLowerCase().includes(normalized.fullName)) return false;
      return true;
    });

    setSearchResult(results);
    message.info(`Tìm thấy ${results.length} kết quả.`);
  };

  const openDetail = (diploma: DiplomaInfo) => {
    setSelectedDiploma(diploma);
    setDecisions((prev) =>
      prev.map((decision) =>
        decision.id === diploma.decisionId ? { ...decision, lookupCount: decision.lookupCount + 1 } : decision,
      ),
    );
  };

  const decisionColumns: ColumnsType<GraduationDecision> = [
    { title: 'Số QĐ', dataIndex: 'decisionNo' },
    { title: 'Ngày ban hành', dataIndex: 'issueDate' },
    { title: 'Trích yếu', dataIndex: 'summary' },
    {
      title: 'Sổ văn bằng',
      render: (_, record) => `Năm ${registerMap[record.registerId]?.year ?? '-'}`,
    },
    { title: 'Lượt tra cứu', dataIndex: 'lookupCount' },
  ];

  const fieldColumns: ColumnsType<FieldConfig> = [
    { title: 'Tên trường', dataIndex: 'label' },
    { title: 'Mã trường', dataIndex: 'key' },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'type',
      render: (value: DataType) => <Tag>{value}</Tag>,
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Button danger type="link" onClick={() => removeField(record.id)}>
          Xóa
        </Button>
      ),
    },
  ];

  const diplomaColumns: ColumnsType<DiplomaInfo> = [
    { title: 'Số vào sổ', dataIndex: 'entryNumber' },
    { title: 'Số hiệu', dataIndex: 'serialNumber' },
    { title: 'MSV', dataIndex: 'studentCode' },
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Ngày sinh', dataIndex: 'birthDate' },
    {
      title: 'Quyết định',
      render: (_, record) => decisionMap[record.decisionId]?.decisionNo,
    },
  ];

  return (
    <Card title="Quản lý sổ văn bằng tốt nghiệp" bordered={false}>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Sổ văn bằng" key="1">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form form={registerForm} layout="inline" onFinish={addRegister}>
              <Form.Item name="year" label="Năm" rules={[{ required: true, message: 'Nhập năm mở sổ' }]}>
                <InputNumber min={2000} max={2100} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Mở sổ mới
                </Button>
              </Form.Item>
            </Form>
            <Table
              rowKey="id"
              pagination={false}
              dataSource={registers}
              columns={[
                { title: 'Năm sổ', dataIndex: 'year' },
                {
                  title: 'Số vào sổ kế tiếp',
                  render: (_, record) => getNextEntryNumber(record.id),
                },
              ]}
            />
          </Space>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Quyết định tốt nghiệp" key="2">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form form={decisionForm} layout="vertical" onFinish={addDecision}>
              <Form.Item name="decisionNo" label="Số quyết định" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="issueDate" label="Ngày ban hành" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="summary" label="Trích yếu" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item name="registerId" label="Sổ văn bằng" rules={[{ required: true }]}>
                <Select options={registers.map((item) => ({ label: `Năm ${item.year}`, value: item.id }))} />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Thêm quyết định
              </Button>
            </Form>
            <Table rowKey="id" dataSource={decisions} columns={decisionColumns} />
          </Space>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Cấu hình biểu mẫu" key="3">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form form={fieldForm} layout="inline" onFinish={addFieldConfig}>
              <Form.Item name="label" label="Tên trường" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: Dân tộc" />
              </Form.Item>
              <Form.Item
                name="key"
                label="Mã trường"
                rules={[
                  { required: true },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Chỉ dùng chữ, số và dấu _' },
                ]}
              >
                <Input placeholder="danToc" />
              </Form.Item>
              <Form.Item name="type" label="Kiểu dữ liệu" rules={[{ required: true }]}>
                <Select style={{ width: 180 }} options={typeOptions} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm trường
                </Button>
              </Form.Item>
            </Form>
            <Table rowKey="id" dataSource={fieldConfigs} columns={fieldColumns} />
          </Space>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Thông tin văn bằng" key="4">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form form={diplomaForm} layout="vertical" onFinish={addDiploma}>
              <Form.Item name="decisionId" label="Quyết định tốt nghiệp" rules={[{ required: true }]}>
                <Select
                  options={decisions.map((item) => ({
                    label: `${item.decisionNo} - Sổ ${registerMap[item.registerId]?.year}`,
                    value: item.id,
                  }))}
                />
              </Form.Item>
              <Form.Item name="serialNumber" label="Số hiệu văn bằng" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="studentCode" label="Mã sinh viên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="birthDate" label="Ngày sinh" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              {fieldConfigs.map((field) => (
                <Form.Item key={field.id} name={['extraValues', field.key]} label={field.label}>
                  {field.type === 'number' ? (
                    <InputNumber style={{ width: '100%' }} />
                  ) : field.type === 'date' ? (
                    <DatePicker style={{ width: '100%' }} />
                  ) : (
                    <Input />
                  )}
                </Form.Item>
              ))}

              <Button type="primary" htmlType="submit" disabled={!decisions.length}>
                Lưu thông tin văn bằng
              </Button>
            </Form>
            <Table rowKey="id" dataSource={diplomas} columns={diplomaColumns} />
          </Space>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tra cứu" key="5">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form form={searchForm} layout="inline" onFinish={searchDiploma}>
              <Form.Item name="serialNumber" label="Số hiệu văn bằng">
                <Input />
              </Form.Item>
              <Form.Item name="entryNumber" label="Số vào sổ">
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item name="studentCode" label="MSV">
                <Input />
              </Form.Item>
              <Form.Item name="fullName" label="Họ tên">
                <Input />
              </Form.Item>
              <Form.Item name="birthDate" label="Ngày sinh">
                <DatePicker />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Tra cứu
                </Button>
              </Form.Item>
            </Form>
            <Table
              rowKey="id"
              dataSource={searchResult}
              columns={[
                ...diplomaColumns,
                {
                  title: 'Thao tác',
                  render: (_, record) => (
                    <Button type="link" onClick={() => openDetail(record)}>
                      Xem chi tiết
                    </Button>
                  ),
                },
              ]}
            />
          </Space>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        visible={!!selectedDiploma}
        title="Chi tiết văn bằng"
        onCancel={() => setSelectedDiploma(null)}
        footer={null}
        width={820}
      >
        {selectedDiploma && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Số vào sổ">{selectedDiploma.entryNumber}</Descriptions.Item>
              <Descriptions.Item label="Số hiệu">{selectedDiploma.serialNumber}</Descriptions.Item>
              <Descriptions.Item label="MSV">{selectedDiploma.studentCode}</Descriptions.Item>
              <Descriptions.Item label="Họ tên">{selectedDiploma.fullName}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">{selectedDiploma.birthDate}</Descriptions.Item>
              <Descriptions.Item label="Quyết định">
                {decisionMap[selectedDiploma.decisionId]?.decisionNo ?? '-'}
              </Descriptions.Item>
              {fieldConfigs.map((field) => (
                <Descriptions.Item key={field.id} label={field.label}>
                  {String(selectedDiploma.extraValues[field.key] ?? '-')}
                </Descriptions.Item>
              ))}
            </Descriptions>
            <Card>
              <Statistic
                title="Tổng lượt tra cứu của quyết định"
                value={decisionMap[selectedDiploma.decisionId]?.lookupCount ?? 0}
              />
            </Card>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

export default VanBangPage;