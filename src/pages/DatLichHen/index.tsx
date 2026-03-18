import ColumnChart from '@/components/Chart/ColumnChart';
import DonutChart from '@/components/Chart/DonutChart';
import LineChart from '@/components/Chart/LineChart';
import {
  CalendarOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Progress,
  Rate,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import moment, { type Moment } from 'moment';
import { useMemo, useState } from 'react';
import './style.less';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = TimePicker;
const { TabPane } = Tabs;

const WORKING_DAYS = [
  { label: 'Chủ nhật', value: 0 },
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
];

const STATUS_OPTIONS = ['Chờ duyệt', 'Xác nhận', 'Hoàn thành', 'Hủy'] as const;
const STATUS_COLORS = {
  'Chờ duyệt': 'orange',
  'Xác nhận': 'blue',
  'Hoàn thành': 'green',
  'Hủy': 'red',
};

type AppointmentStatus = (typeof STATUS_OPTIONS)[number];

type WorkingSlot = {
  dayOfWeek: number;
  start: string;
  end: string;
};

type Employee = {
  id: string;
  name: string;
  role: string;
  limitPerDay: number;
  workingSlots: WorkingSlot[];
};

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

type Appointment = {
  id: string;
  customerName: string;
  phone: string;
  serviceId: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  note?: string;
};

type Review = {
  id: string;
  appointmentId: string;
  employeeId: string;
  serviceId: string;
  customerName: string;
  rating: number;
  comment: string;
  response?: string;
};

type EmployeeFormValues = {
  id?: string;
  name: string;
  role: string;
  limitPerDay: number;
  workingSlots: {
    dayOfWeek: number;
    timeRange: [Moment, Moment];
  }[];
};

type ServiceFormValues = {
  id?: string;
  name: string;
  price: number;
  duration: number;
};

type AppointmentFormValues = {
  customerName: string;
  phone: string;
  serviceId: string;
  employeeId: string;
  date: Moment;
  startTime: Moment;
  note?: string;
};

type ReviewFormValues = {
  appointmentId: string;
  rating: number;
  comment: string;
};

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const initialEmployees: Employee[] = [
  {
    id: 'nv-01',
    name: 'Nguyễn Minh Anh',
    role: 'Nhân viên cắt tóc',
    limitPerDay: 6,
    workingSlots: [
      { dayOfWeek: 1, start: '09:00', end: '17:00' },
      { dayOfWeek: 3, start: '09:00', end: '17:00' },
      { dayOfWeek: 5, start: '09:00', end: '17:00' },
    ],
  },
  {
    id: 'nv-02',
    name: 'Trần Quốc Bảo',
    role: 'Kỹ thuật viên spa',
    limitPerDay: 5,
    workingSlots: [
      { dayOfWeek: 2, start: '08:30', end: '16:30' },
      { dayOfWeek: 4, start: '08:30', end: '16:30' },
      { dayOfWeek: 6, start: '08:30', end: '14:00' },
    ],
  },
  {
    id: 'nv-03',
    name: 'Lê Hồng Phúc',
    role: 'Bác sĩ tư vấn',
    limitPerDay: 8,
    workingSlots: [
      { dayOfWeek: 1, start: '07:30', end: '11:30' },
      { dayOfWeek: 2, start: '13:00', end: '17:00' },
      { dayOfWeek: 5, start: '07:30', end: '11:30' },
    ],
  },
];

const initialServices: Service[] = [
  { id: 'dv-01', name: 'Cắt tóc nam', price: 120000, duration: 45 },
  { id: 'dv-02', name: 'Gội đầu dưỡng sinh', price: 200000, duration: 60 },
  { id: 'dv-03', name: 'Khám da liễu cơ bản', price: 350000, duration: 30 },
  { id: 'dv-04', name: 'Bảo dưỡng điều hòa', price: 500000, duration: 90 },
];

const initialAppointments: Appointment[] = [
  {
    id: 'lh-01',
    customerName: 'Phạm Thu Hà',
    phone: '0901000111',
    serviceId: 'dv-01',
    employeeId: 'nv-01',
    date: moment().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '09:45',
    status: 'Xác nhận',
    note: 'Khách đặt qua fanpage',
  },
  {
    id: 'lh-02',
    customerName: 'Đỗ Trung Kiên',
    phone: '0901222333',
    serviceId: 'dv-02',
    employeeId: 'nv-02',
    date: moment().add(1, 'day').format('YYYY-MM-DD'),
    startTime: '08:30',
    endTime: '09:30',
    status: 'Hoàn thành',
    note: 'Khách VIP',
  },
  {
    id: 'lh-03',
    customerName: 'Vũ Mai Lan',
    phone: '0912345678',
    serviceId: 'dv-03',
    employeeId: 'nv-03',
    date: moment().add(2, 'day').format('YYYY-MM-DD'),
    startTime: '13:00',
    endTime: '13:30',
    status: 'Chờ duyệt',
  },
];

const initialReviews: Review[] = [
  {
    id: 'dg-01',
    appointmentId: 'lh-02',
    employeeId: 'nv-02',
    serviceId: 'dv-02',
    customerName: 'Đỗ Trung Kiên',
    rating: 5,
    comment: 'Nhân viên tư vấn kỹ, thao tác nhẹ nhàng.',
    response: 'Cảm ơn anh Kiên, hẹn gặp lại ở lịch tiếp theo.',
  },
];

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')} đ`;
const dayLabel = (dayOfWeek: number) => WORKING_DAYS.find((item) => item.value === dayOfWeek)?.label || 'Không rõ';
const formatSlot = (slot: WorkingSlot) => `${dayLabel(slot.dayOfWeek)}: ${slot.start} - ${slot.end}`;

const DatLichHenPage = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const [employeeVisible, setEmployeeVisible] = useState(false);
  const [serviceVisible, setServiceVisible] = useState(false);
  const [appointmentVisible, setAppointmentVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [employeeForm] = Form.useForm<EmployeeFormValues>();
  const [serviceForm] = Form.useForm<ServiceFormValues>();
  const [appointmentForm] = Form.useForm<AppointmentFormValues>();
  const [reviewForm] = Form.useForm<ReviewFormValues>();

  const employeeMap = useMemo(() => {
    return employees.reduce<Record<string, Employee>>((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, [employees]);

  const serviceMap = useMemo(() => {
    return services.reduce<Record<string, Service>>((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, [services]);

  const averageRatingByEmployee = useMemo(() => {
    return employees.reduce<Record<string, number>>((acc, employee) => {
      const employeeReviews = reviews.filter((review) => review.employeeId === employee.id);
      const totalRating = employeeReviews.reduce((sum, review) => sum + review.rating, 0);
      acc[employee.id] = employeeReviews.length ? Number((totalRating / employeeReviews.length).toFixed(1)) : 0;
      return acc;
    }, {});
  }, [employees, reviews]);

  const completedAppointmentsWithoutReview = useMemo(() => {
    return appointments.filter((appointment) => {
      const hasReview = reviews.some((review) => review.appointmentId === appointment.id);
      return appointment.status === 'Hoàn thành' && !hasReview;
    });
  }, [appointments, reviews]);

  const totalRevenue = useMemo(() => {
    return appointments.reduce((sum, appointment) => {
      if (appointment.status !== 'Hoàn thành') return sum;
      return sum + (serviceMap[appointment.serviceId]?.price || 0);
    }, 0);
  }, [appointments, serviceMap]);

  const stats = useMemo(() => {
    const byDate: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    const revenueByService: Record<string, number> = {};
    const revenueByEmployee: Record<string, number> = {};

    appointments.forEach((appointment) => {
      if (appointment.status !== 'Hoàn thành') return;
      const service = serviceMap[appointment.serviceId];
      const employee = employeeMap[appointment.employeeId];
      const revenue = service?.price || 0;
      const dateKey = moment(appointment.date).format('DD/MM');
      const monthKey = moment(appointment.date).format('MM/YYYY');

      byDate[dateKey] = (byDate[dateKey] || 0) + 1;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
      revenueByService[service?.name || 'Khác'] = (revenueByService[service?.name || 'Khác'] || 0) + revenue;
      revenueByEmployee[employee?.name || 'Khác'] = (revenueByEmployee[employee?.name || 'Khác'] || 0) + revenue;
    });

    return {
      appointmentDateLabels: Object.keys(byDate),
      appointmentDateValues: Object.values(byDate),
      appointmentMonthLabels: Object.keys(byMonth),
      appointmentMonthValues: Object.values(byMonth),
      revenueServiceLabels: Object.keys(revenueByService),
      revenueServiceValues: Object.values(revenueByService),
      revenueEmployeeLabels: Object.keys(revenueByEmployee),
      revenueEmployeeValues: Object.values(revenueByEmployee),
    };
  }, [appointments, employeeMap, serviceMap]);

  const openEmployeeModal = (employee?: Employee) => {
    setEditingEmployee(employee || null);
    if (employee) {
      employeeForm.setFieldsValue({
        id: employee.id,
        name: employee.name,
        role: employee.role,
        limitPerDay: employee.limitPerDay,
        workingSlots: employee.workingSlots.map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          timeRange: [moment(slot.start, 'HH:mm'), moment(slot.end, 'HH:mm')],
        })),
      });
    } else {
      employeeForm.setFieldsValue({
        name: '',
        role: '',
        limitPerDay: 5,
        workingSlots: [{ dayOfWeek: 1, timeRange: [moment('09:00', 'HH:mm'), moment('17:00', 'HH:mm')] }],
      });
    }
    setEmployeeVisible(true);
  };

  const openServiceModal = (service?: Service) => {
    setEditingService(service || null);
    if (service) {
      serviceForm.setFieldsValue(service);
    } else {
      serviceForm.setFieldsValue({
        name: '',
        price: 100000,
        duration: 30,
      });
    }
    setServiceVisible(true);
  };

  const handleSaveEmployee = async () => {
    const values = await employeeForm.validateFields();
    const payload: Employee = {
      id: values.id || uid('nv'),
      name: values.name,
      role: values.role,
      limitPerDay: values.limitPerDay,
      workingSlots: values.workingSlots.map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        start: slot.timeRange[0].format('HH:mm'),
        end: slot.timeRange[1].format('HH:mm'),
      })),
    };

    if (editingEmployee) {
      setEmployees((prev) => prev.map((item) => (item.id === editingEmployee.id ? payload : item)));
      message.success('Đã cập nhật nhân viên.');
    } else {
      setEmployees((prev) => [...prev, payload]);
      message.success('Đã thêm nhân viên.');
    }

    setEmployeeVisible(false);
    setEditingEmployee(null);
    employeeForm.resetFields();
  };

  const handleSaveService = async () => {
    const values = await serviceForm.validateFields();
    const payload: Service = {
      id: values.id || uid('dv'),
      name: values.name,
      price: values.price,
      duration: values.duration,
    };

    if (editingService) {
      setServices((prev) => prev.map((item) => (item.id === editingService.id ? payload : item)));
      message.success('Đã cập nhật dịch vụ.');
    } else {
      setServices((prev) => [...prev, payload]);
      message.success('Đã thêm dịch vụ.');
    }

    setServiceVisible(false);
    setEditingService(null);
    serviceForm.resetFields();
  };

  const handleSaveAppointment = async () => {
    const values = await appointmentForm.validateFields();
    const employee = employeeMap[values.employeeId];
    const service = serviceMap[values.serviceId];

    if (!employee || !service) {
      message.error('Vui lòng chọn đúng nhân viên và dịch vụ.');
      return;
    }

    const bookingDate = values.date.format('YYYY-MM-DD');
    const startTime = values.startTime.format('HH:mm');
    const endMoment = values.startTime.clone().add(service.duration, 'minutes');
    const endTime = endMoment.format('HH:mm');
    const bookingDay = values.date.day();
    const workingSlot = employee.workingSlots.find((slot) => slot.dayOfWeek === bookingDay);

    if (!workingSlot) {
      message.error('Nhân viên không làm việc vào ngày bạn chọn.');
      return;
    }

    const slotStart = moment(workingSlot.start, 'HH:mm');
    const slotEnd = moment(workingSlot.end, 'HH:mm');
    if (values.startTime.isBefore(slotStart) || endMoment.isAfter(slotEnd)) {
      message.error('Lịch hẹn nằm ngoài giờ làm việc của nhân viên.');
      return;
    }

    const bookedCount = appointments.filter(
      (appointment) =>
        appointment.employeeId === employee.id && appointment.date === bookingDate && appointment.status !== 'Hủy',
    ).length;
    if (bookedCount >= employee.limitPerDay) {
      message.error('Nhân viên đã đạt số khách tối đa trong ngày.');
      return;
    }

    const hasConflict = appointments.some((appointment) => {
      if (
        appointment.employeeId !== employee.id ||
        appointment.date !== bookingDate ||
        appointment.status === 'Hủy'
      ) {
        return false;
      }

      const currentStart = moment(appointment.startTime, 'HH:mm');
      const currentEnd = moment(appointment.endTime, 'HH:mm');
      return values.startTime.isBefore(currentEnd) && endMoment.isAfter(currentStart);
    });

    if (hasConflict) {
      message.error('Khung giờ đã trùng với lịch hiện có.');
      return;
    }

    const payload: Appointment = {
      id: uid('lh'),
      customerName: values.customerName,
      phone: values.phone,
      serviceId: values.serviceId,
      employeeId: values.employeeId,
      date: bookingDate,
      startTime,
      endTime,
      status: 'Chờ duyệt',
      note: values.note,
    };

    setAppointments((prev) => [...prev, payload]);
    message.success('Đặt lịch thành công.');
    setAppointmentVisible(false);
    appointmentForm.resetFields();
  };

  const handleSaveReview = async () => {
    const values = await reviewForm.validateFields();
    const appointment = appointments.find((item) => item.id === values.appointmentId);

    if (!appointment) {
      message.error('Không tìm thấy lịch hẹn để đánh giá.');
      return;
    }

    const payload: Review = {
      id: uid('dg'),
      appointmentId: appointment.id,
      employeeId: appointment.employeeId,
      serviceId: appointment.serviceId,
      customerName: appointment.customerName,
      rating: values.rating,
      comment: values.comment,
    };

    setReviews((prev) => [...prev, payload]);
    message.success('Đã lưu đánh giá.');
    setReviewVisible(false);
    reviewForm.resetFields();
  };

  const handleUpdateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((item) => (item.id === appointmentId ? { ...item, status } : item)));
    message.success('Đã cập nhật trạng thái lịch hẹn.');
  };

  const handleUpdateReviewResponse = (reviewId: string, response: string) => {
    setReviews((prev) => prev.map((item) => (item.id === reviewId ? { ...item, response } : item)));
    message.success('Đã lưu phản hồi đánh giá.');
  };

  const removeEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((item) => item.id !== employeeId));
    message.success('Đã xóa nhân viên.');
  };

  const removeService = (serviceId: string) => {
    setServices((prev) => prev.filter((item) => item.id !== serviceId));
    message.success('Đã xóa dịch vụ.');
  };

  const employeeColumns: ColumnsType<Employee> = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Giới hạn/ngày',
      dataIndex: 'limitPerDay',
      key: 'limitPerDay',
      align: 'center',
    },
    {
      title: 'Lịch làm việc',
      key: 'workingSlots',
      render: (_, record) => (
        <Space direction='vertical' size={2}>
          {record.workingSlots.map((slot, index) => (
            <Text key={`${record.id}-${index}`}>{formatSlot(slot)}</Text>
          ))}
        </Space>
      ),
    },
    {
      title: 'Đánh giá TB',
      key: 'averageRating',
      render: (_, record) => <Rate allowHalf disabled value={averageRatingByEmployee[record.id]} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEmployeeModal(record)}>Sửa</Button>
          <Popconfirm title='Bạn có chắc muốn xóa nhân viên này?' onConfirm={() => removeEmployee(record.id)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const serviceColumns: ColumnsType<Service> = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      render: (value: number) => `${value} phút`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button onClick={() => openServiceModal(record)}>Sửa</Button>
          <Popconfirm title='Bạn có chắc muốn xóa dịch vụ này?' onConfirm={() => removeService(record.id)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const appointmentColumns: ColumnsType<Appointment> = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Dịch vụ',
      key: 'serviceId',
      render: (_, record) => serviceMap[record.serviceId]?.name || '-',
    },
    {
      title: 'Nhân viên',
      key: 'employeeId',
      render: (_, record) => employeeMap[record.employeeId]?.name || '-',
    },
    {
      title: 'Ngày giờ',
      key: 'dateTime',
      render: (_, record) => `${moment(record.date).format('DD/MM/YYYY')} ${record.startTime} - ${record.endTime}`,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => <Tag color={STATUS_COLORS[record.status]}>{record.status}</Tag>,
    },
    {
      title: 'Cập nhật trạng thái',
      key: 'statusUpdate',
      render: (_, record) => (
        <Select
          value={record.status}
          style={{ width: 140 }}
          onChange={(value: AppointmentStatus) => handleUpdateAppointmentStatus(record.id, value)}
        >
          {STATUS_OPTIONS.map((status) => (
            <Select.Option key={status} value={status}>
              {status}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  const reviewColumns: ColumnsType<Review> = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Nhân viên',
      key: 'employeeId',
      render: (_, record) => employeeMap[record.employeeId]?.name || '-',
    },
    {
      title: 'Dịch vụ',
      key: 'serviceId',
      render: (_, record) => serviceMap[record.serviceId]?.name || '-',
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      render: (_, record) => (
        <Space direction='vertical' size={2}>
          <Rate disabled value={record.rating} />
          <Text>{record.comment}</Text>
        </Space>
      ),
    },
    {
      title: 'Phản hồi nhân viên',
      key: 'response',
      render: (_, record) => (
        <TextArea
          defaultValue={record.response}
          rows={2}
          placeholder='Nhập phản hồi cho khách hàng'
          onBlur={(event) => handleUpdateReviewResponse(record.id, event.target.value)}
        />
      ),
    },
  ];

  return (
    <div className='appointment-page'>
      <Space direction='vertical' size={16} style={{ width: '100%' }}>
        <Card className='appointment-page__hero'>
          <Title level={3}>Thực hành 03 - Quản lý đặt lịch dịch vụ</Title>
          <Text>
            Trang này bám sát yêu cầu đề bài: quản lý nhân viên và dịch vụ, đặt lịch có kiểm tra trùng,
            cập nhật trạng thái, đánh giá sau hoàn thành và phần thống kê báo cáo.
          </Text>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic title='Tổng nhân viên' value={employees.length} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic title='Tổng dịch vụ' value={services.length} prefix={<FieldTimeOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic title='Tổng lịch hẹn' value={appointments.length} prefix={<CalendarOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card>
              <Statistic
                title='Doanh thu hoàn thành'
                value={totalRevenue}
                formatter={(value) => formatCurrency(Number(value || 0))}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card bodyStyle={{ paddingTop: 8 }}>
          <Tabs defaultActiveKey='1'>
            <TabPane tab='1. Nhân viên & dịch vụ' key='1'>
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={14}>
                  <Card
                    title='Danh sách nhân viên'
                    extra={
                      <Button type='primary' onClick={() => openEmployeeModal()}>
                        Thêm nhân viên
                      </Button>
                    }
                  >
                    <Table
                      rowKey='id'
                      columns={employeeColumns}
                      dataSource={employees}
                      pagination={false}
                      scroll={{ x: 960 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} xl={10}>
                  <Card
                    title='Danh sách dịch vụ'
                    extra={
                      <Button type='primary' onClick={() => openServiceModal()}>
                        Thêm dịch vụ
                      </Button>
                    }
                  >
                    <Table rowKey='id' columns={serviceColumns} dataSource={services} pagination={false} />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab='2. Quản lý lịch hẹn' key='2'>
              <Card
                title='Danh sách lịch hẹn'
                extra={
                  <Button type='primary' onClick={() => setAppointmentVisible(true)}>
                    Đặt lịch mới
                  </Button>
                }
              >
                <Table
                  rowKey='id'
                  columns={appointmentColumns}
                  dataSource={appointments}
                  pagination={{ pageSize: 6 }}
                  scroll={{ x: 1180 }}
                />
              </Card>
            </TabPane>

            <TabPane tab='3. Đánh giá dịch vụ & nhân viên' key='3'>
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={8}>
                  <Card
                    title='Tổng quan đánh giá'
                    extra={
                      <Button
                        type='primary'
                        disabled={!completedAppointmentsWithoutReview.length}
                        onClick={() => setReviewVisible(true)}
                      >
                        Thêm đánh giá
                      </Button>
                    }
                  >
                    <Space direction='vertical' style={{ width: '100%' }}>
                      {employees.map((employee) => {
                        const ratingValue = averageRatingByEmployee[employee.id];
                        return (
                          <div key={employee.id} className='appointment-page__rating-item'>
                            <div className='appointment-page__rating-header'>
                              <Text strong>{employee.name}</Text>
                              <Space>
                                <StarOutlined style={{ color: '#faad14' }} />
                                <Text>{ratingValue}/5</Text>
                              </Space>
                            </div>
                            <Progress percent={ratingValue * 20} showInfo={false} strokeColor='#faad14' />
                          </div>
                        );
                      })}
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} xl={16}>
                  <Card title='Danh sách đánh giá'>
                    <Table rowKey='id' columns={reviewColumns} dataSource={reviews} pagination={false} />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab='4. Thống kê & báo cáo' key='4'>
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={8}>
                  <Card title='Chỉ số nhanh'>
                    <Descriptions column={1} bordered size='small'>
                      <Descriptions.Item label='Lịch chờ duyệt'>
                        {appointments.filter((item) => item.status === 'Chờ duyệt').length}
                      </Descriptions.Item>
                      <Descriptions.Item label='Lịch xác nhận'>
                        {appointments.filter((item) => item.status === 'Xác nhận').length}
                      </Descriptions.Item>
                      <Descriptions.Item label='Lịch hoàn thành'>
                        {appointments.filter((item) => item.status === 'Hoàn thành').length}
                      </Descriptions.Item>
                      <Descriptions.Item label='Tổng đánh giá'>{reviews.length}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                  <Card title='Doanh thu theo dịch vụ' className='appointment-page__chart-card'>
                    <DonutChart
                      xAxis={stats.revenueServiceLabels.length ? stats.revenueServiceLabels : ['Chưa có dữ liệu']}
                      yAxis={[stats.revenueServiceValues.length ? stats.revenueServiceValues : [1]]}
                      yLabel={['Doanh thu']}
                      showTotal
                      colors={['#1890ff', '#52c41a', '#fa8c16', '#722ed1']}
                      formatY={formatCurrency}
                    />
                  </Card>
                </Col>
                <Col xs={24} xl={16}>
                  <Card title='Số lượng lịch hẹn theo ngày'>
                    <LineChart
                      xAxis={stats.appointmentDateLabels.length ? stats.appointmentDateLabels : ['Chưa có dữ liệu']}
                      yAxis={[stats.appointmentDateValues.length ? stats.appointmentDateValues : [0]]}
                      yLabel={['Lịch hoàn thành']}
                      colors={['#13c2c2']}
                      formatY={(value) => `${value} lịch`}
                    />
                  </Card>
                  <Card title='Doanh thu theo nhân viên' className='appointment-page__chart-card'>
                    <ColumnChart
                      xAxis={stats.revenueEmployeeLabels.length ? stats.revenueEmployeeLabels : ['Chưa có dữ liệu']}
                      yAxis={[stats.revenueEmployeeValues.length ? stats.revenueEmployeeValues : [0]]}
                      yLabel={['Doanh thu']}
                      colors={['#722ed1']}
                      formatY={formatCurrency}
                    />
                  </Card>
                  <Card title='Số lịch hẹn theo tháng' className='appointment-page__chart-card'>
                    <ColumnChart
                      xAxis={stats.appointmentMonthLabels.length ? stats.appointmentMonthLabels : ['Chưa có dữ liệu']}
                      yAxis={[stats.appointmentMonthValues.length ? stats.appointmentMonthValues : [0]]}
                      yLabel={['Lịch hẹn']}
                      colors={['#eb2f96']}
                      formatY={(value) => `${value} lịch`}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>
      </Space>

      <Modal
        visible={employeeVisible}
        title={editingEmployee ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
        width={720}
        onCancel={() => {
          setEmployeeVisible(false);
          setEditingEmployee(null);
        }}
        onOk={handleSaveEmployee}
      >
        <Form form={employeeForm} layout='vertical'>
          <Form.Item name='id' hidden>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name='name'
                label='Tên nhân viên'
                rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}
              >
                <Input placeholder='Ví dụ: Nguyễn Văn A' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='role' label='Vai trò' rules={[{ required: true, message: 'Vui lòng nhập vai trò' }]}>
                <Input placeholder='Ví dụ: Kỹ thuật viên spa' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='limitPerDay'
                label='Số khách tối đa/ngày'
                rules={[{ required: true, message: 'Vui lòng nhập số khách tối đa/ngày' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.List name='workingSlots'>
            {(fields, { add, remove }) => (
              <div>
                {fields.map((field) => (
                  <Row gutter={12} key={field.key} align='middle'>
                    <Col span={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'dayOfWeek']}
                        fieldKey={[field.fieldKey!, 'dayOfWeek']}
                        label='Ngày làm việc'
                        rules={[{ required: true, message: 'Chọn ngày làm việc' }]}
                      >
                        <Select>
                          {WORKING_DAYS.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'timeRange']}
                        fieldKey={[field.fieldKey!, 'timeRange']}
                        label='Khung giờ'
                        rules={[{ required: true, message: 'Chọn khung giờ làm việc' }]}
                      >
                        <RangePicker format='HH:mm' minuteStep={30} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button danger style={{ marginTop: 29 }} onClick={() => remove(field.name)}>
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  onClick={() =>
                    add({
                      dayOfWeek: 1,
                      timeRange: [moment('09:00', 'HH:mm'), moment('17:00', 'HH:mm')],
                    })
                  }
                >
                  Thêm ca làm việc
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        visible={serviceVisible}
        title={editingService ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ'}
        onCancel={() => {
          setServiceVisible(false);
          setEditingService(null);
        }}
        onOk={handleSaveService}
      >
        <Form form={serviceForm} layout='vertical'>
          <Form.Item name='id' hidden>
            <Input />
          </Form.Item>
          <Form.Item name='name' label='Tên dịch vụ' rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}>
            <Input placeholder='Ví dụ: Cắt tóc, spa, khám bệnh...' />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='price' label='Giá dịch vụ' rules={[{ required: true, message: 'Vui lòng nhập giá dịch vụ' }]}>
                <InputNumber min={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='duration'
                label='Thời gian thực hiện (phút)'
                rules={[{ required: true, message: 'Vui lòng nhập thời gian thực hiện' }]}
              >
                <InputNumber min={15} step={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        visible={appointmentVisible}
        title='Đặt lịch hẹn mới'
        onCancel={() => setAppointmentVisible(false)}
        onOk={handleSaveAppointment}
      >
        <Form form={appointmentForm} layout='vertical'>
          <Form.Item
            name='customerName'
            label='Tên khách hàng'
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='phone'
            label='Số điện thoại'
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name='serviceId' label='Dịch vụ' rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}>
            <Select placeholder='Chọn dịch vụ'>
              {services.map((service) => (
                <Select.Option key={service.id} value={service.id}>
                  {service.name} - {formatCurrency(service.price)} - {service.duration} phút
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name='employeeId' label='Nhân viên phục vụ' rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}>
            <Select placeholder='Chọn nhân viên'>
              {employees.map((employee) => (
                <Select.Option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.role}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='date' label='Ngày hẹn' rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn' }]}>
                <DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='startTime' label='Giờ bắt đầu' rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu' }]}>
                <TimePicker style={{ width: '100%' }} format='HH:mm' minuteStep={15} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name='note' label='Ghi chú'>
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal visible={reviewVisible} title='Thêm đánh giá dịch vụ' onCancel={() => setReviewVisible(false)} onOk={handleSaveReview}>
        <Form form={reviewForm} layout='vertical'>
          <Form.Item
            name='appointmentId'
            label='Lịch hẹn đã hoàn thành'
            rules={[{ required: true, message: 'Vui lòng chọn lịch hẹn' }]}
          >
            <Select placeholder='Chọn lịch hẹn để đánh giá'>
              {completedAppointmentsWithoutReview.map((appointment) => (
                <Select.Option key={appointment.id} value={appointment.id}>
                  {appointment.customerName} - {serviceMap[appointment.serviceId]?.name || '-'} -{' '}
                  {employeeMap[appointment.employeeId]?.name || '-'}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name='rating' label='Số sao' rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name='comment' label='Nhận xét' rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}>
            <TextArea rows={4} placeholder='Khách hàng đánh giá chất lượng dịch vụ và nhân viên...' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DatLichHenPage;