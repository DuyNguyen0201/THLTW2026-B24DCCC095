import {
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    List,
    Modal,
    Progress,
    Rate,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag,
    Typography,
  } from 'antd';
  import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
  import React, { useMemo, useState } from 'react';
  import styles from './style.less';
  
  type DestinationType = 'beach' | 'mountain' | 'city';
  
  type BudgetBreakdown = {
    food: number;
    transport: number;
    accommodation: number;
  };
  
  type Destination = {
    id: string;
    name: string;
    type: DestinationType;
    location: string;
    image: string;
    rating: number;
    visitHours: number;
    budget: BudgetBreakdown;
  };
  
  type DayPlan = {
    key: string;
    title: string;
    destinationIds: string[];
  };
  
  type SortType = 'ratingDesc' | 'ratingAsc' | 'costAsc' | 'costDesc';
  
  const typeLabel: Record<DestinationType, string> = {
    beach: 'Biển',
    mountain: 'Núi',
    city: 'Thành phố',
  };
  
  const initialDestinations: Destination[] = [
    {
      id: 'dn',
      name: 'Đà Nẵng',
      type: 'beach',
      location: 'Miền Trung',
      image:
        'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1000&q=60',
      rating: 4.7,
      visitHours: 7,
      budget: { food: 350000, transport: 550000, accommodation: 900000 },
    },
    {
      id: 'dl',
      name: 'Đà Lạt',
      type: 'mountain',
      location: 'Tây Nguyên',
      image:
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=60',
      rating: 4.6,
      visitHours: 8,
      budget: { food: 320000, transport: 480000, accommodation: 850000 },
    },
    {
      id: 'hcm',
      name: 'TP.HCM',
      type: 'city',
      location: 'Miền Nam',
      image:
        'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1000&q=60',
      rating: 4.4,
      visitHours: 6,
      budget: { food: 500000, transport: 400000, accommodation: 1200000 },
    },
    {
      id: 'pq',
      name: 'Phú Quốc',
      type: 'beach',
      location: 'Kiên Giang',
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=60',
      rating: 4.8,
      visitHours: 9,
      budget: { food: 450000, transport: 900000, accommodation: 1500000 },
    },
    {
      id: 'hn',
      name: 'Hà Nội',
      type: 'city',
      location: 'Miền Bắc',
      image:
        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=60',
      rating: 4.5,
      visitHours: 7,
      budget: { food: 420000, transport: 420000, accommodation: 1100000 },
    },
  ];
  
  const travelMinutes: Record<string, Record<string, number>> = {
    dn: { dl: 80, hcm: 95, pq: 120, hn: 100 },
    dl: { dn: 80, hcm: 60, pq: 130, hn: 110 },
    hcm: { dn: 95, dl: 60, pq: 70, hn: 130 },
    pq: { dn: 120, dl: 130, hcm: 70, hn: 145 },
    hn: { dn: 100, dl: 110, hcm: 130, pq: 145 },
  };
  
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
  
  const TravelPlannerPage: React.FC = () => {
    const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
    const [typeFilter, setTypeFilter] = useState<DestinationType | 'all'>('all');
    const [maxCost, setMaxCost] = useState<number>(3000000);
    const [ratingFilter, setRatingFilter] = useState<number>(0);
    const [sortType, setSortType] = useState<SortType>('ratingDesc');
  
    const [dayPlans, setDayPlans] = useState<DayPlan[]>([
      { key: 'day1', title: 'Ngày 1', destinationIds: ['dn'] },
      { key: 'day2', title: 'Ngày 2', destinationIds: ['dl'] },
      { key: 'day3', title: 'Ngày 3', destinationIds: [] },
    ]);
    const [activeDay, setActiveDay] = useState<string>('day1');
    const [selectedDestinationId, setSelectedDestinationId] = useState<string>();
  
    const [budgetLimit, setBudgetLimit] = useState<number>(7000000);
  
    const [adminOpen, setAdminOpen] = useState<boolean>(false);
    const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
    const [form] = Form.useForm();
  
    const destinationMap = useMemo(() => {
      const map: Record<string, Destination> = {};
      destinations.forEach((item) => {
        map[item.id] = item;
      });
      return map;
    }, [destinations]);
  
    const filteredDestinations = useMemo(() => {
      return destinations
        .filter((item) => typeFilter === 'all' || item.type === typeFilter)
        .filter((item) => item.rating >= ratingFilter)
        .filter((item) => item.budget.food + item.budget.transport + item.budget.accommodation <= maxCost)
        .sort((a, b) => {
          const totalA = a.budget.food + a.budget.transport + a.budget.accommodation;
          const totalB = b.budget.food + b.budget.transport + b.budget.accommodation;
  
          if (sortType === 'ratingDesc') return b.rating - a.rating;
          if (sortType === 'ratingAsc') return a.rating - b.rating;
          if (sortType === 'costAsc') return totalA - totalB;
          return totalB - totalA;
        });
    }, [destinations, maxCost, ratingFilter, sortType, typeFilter]);
  
    const itineraryDestinations = useMemo(
      () => dayPlans.map((day) => ({ ...day, destinations: day.destinationIds.map((id) => destinationMap[id]).filter(Boolean) })),
      [dayPlans, destinationMap],
    );
  
    const budgetSummary = useMemo(() => {
      const allSelected = itineraryDestinations.flatMap((day) => day.destinations);
  
      const totals = allSelected.reduce(
        (acc, item) => ({
          food: acc.food + item.budget.food,
          transport: acc.transport + item.budget.transport,
          accommodation: acc.accommodation + item.budget.accommodation,
        }),
        { food: 0, transport: 0, accommodation: 0 },
      );
  
      const total = totals.food + totals.transport + totals.accommodation;
  
      const travelTime = dayPlans.reduce((sum, day) => {
        let dayTravel = 0;
        for (let index = 0; index < day.destinationIds.length - 1; index += 1) {
          const from = day.destinationIds[index];
          const to = day.destinationIds[index + 1];
          dayTravel += travelMinutes[from]?.[to] || travelMinutes[to]?.[from] || 45;
        }
        return sum + dayTravel;
      }, 0);
  
      return { ...totals, total, travelTime };
    }, [dayPlans, itineraryDestinations]);
  
    const onAddDestinationToDay = () => {
      if (!selectedDestinationId) return;
  
      setDayPlans((prev) =>
        prev.map((day) =>
          day.key === activeDay && !day.destinationIds.includes(selectedDestinationId)
            ? { ...day, destinationIds: [...day.destinationIds, selectedDestinationId] }
            : day,
        ),
      );
    };
  
    const onRemoveFromDay = (dayKey: string, id: string) => {
      setDayPlans((prev) =>
        prev.map((day) =>
          day.key === dayKey ? { ...day, destinationIds: day.destinationIds.filter((item) => item !== id) } : day,
        ),
      );
    };
  
    const onMoveDestination = (dayKey: string, index: number, step: -1 | 1) => {
      setDayPlans((prev) =>
        prev.map((day) => {
          if (day.key !== dayKey) return day;
          const nextIndex = index + step;
          if (nextIndex < 0 || nextIndex >= day.destinationIds.length) return day;
          const cloned = [...day.destinationIds];
          [cloned[index], cloned[nextIndex]] = [cloned[nextIndex], cloned[index]];
          return { ...day, destinationIds: cloned };
        }),
      );
    };
  
    const openCreateModal = () => {
      setEditingDestination(null);
      form.resetFields();
      form.setFieldsValue({ type: 'city', rating: 4.5, visitHours: 6, food: 300000, transport: 400000, accommodation: 800000 });
      setAdminOpen(true);
    };
  
    const openEditModal = (item: Destination) => {
      setEditingDestination(item);
      form.setFieldsValue({ ...item, ...item.budget });
      setAdminOpen(true);
    };
  
    const onSubmitDestination = async () => {
      const values = await form.validateFields();
      const payload: Destination = {
        id: editingDestination?.id || `${values.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`,
        name: values.name,
        type: values.type,
        location: values.location,
        image: values.image,
        rating: values.rating,
        visitHours: values.visitHours,
        budget: {
          food: values.food,
          transport: values.transport,
          accommodation: values.accommodation,
        },
      };
  
      setDestinations((prev) => {
        if (editingDestination) {
          return prev.map((item) => (item.id === editingDestination.id ? payload : item));
        }
        return [...prev, payload];
      });
  
      setAdminOpen(false);
    };
  
    const onDeleteDestination = (id: string) => {
      setDestinations((prev) => prev.filter((item) => item.id !== id));
      setDayPlans((prev) => prev.map((day) => ({ ...day, destinationIds: day.destinationIds.filter((item) => item !== id) })));
    };
  
    const popularStats = useMemo(() => {
      const count: Record<string, number> = {};
      dayPlans.forEach((day) => {
        day.destinationIds.forEach((id) => {
          count[id] = (count[id] || 0) + 1;
        });
      });
  
      return Object.entries(count)
        .map(([id, total]) => ({ key: id, name: destinationMap[id]?.name || id, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    }, [dayPlans, destinationMap]);
  
    return (
      <div className={styles.wrapper}>
        <Typography.Title level={2}>Bài thực hành 06 - Ứng dụng lập kế hoạch du lịch</Typography.Title>
        <Typography.Paragraph>
          Ứng dụng đáp ứng đầy đủ yêu cầu: khám phá điểm đến, tạo lịch trình theo ngày, quản lý ngân sách và trang quản trị.
        </Typography.Paragraph>
  
        <Card title="1) Trang chủ - Khám phá điểm đến" className={styles.sectionCard}>
          <Space wrap className={styles.filterBar}>
            <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 180 }}>
              <Select.Option value="all">Tất cả loại hình</Select.Option>
              <Select.Option value="beach">Biển</Select.Option>
              <Select.Option value="mountain">Núi</Select.Option>
              <Select.Option value="city">Thành phố</Select.Option>
            </Select>
  
            <Select value={ratingFilter} onChange={setRatingFilter} style={{ width: 180 }}>
              <Select.Option value={0}>Mọi đánh giá</Select.Option>
              <Select.Option value={4}>Từ 4 sao</Select.Option>
              <Select.Option value={4.5}>Từ 4.5 sao</Select.Option>
            </Select>
  
            <Select value={sortType} onChange={setSortType} style={{ width: 220 }}>
              <Select.Option value="ratingDesc">Đánh giá cao → thấp</Select.Option>
              <Select.Option value="ratingAsc">Đánh giá thấp → cao</Select.Option>
              <Select.Option value="costAsc">Chi phí thấp → cao</Select.Option>
              <Select.Option value="costDesc">Chi phí cao → thấp</Select.Option>
            </Select>
  
            <InputNumber
              min={500000}
              step={100000}
              max={5000000}
              value={maxCost}
              formatter={(value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`}
              parser={(value) => Number(String(value || '').replace(/[^0-9]/g, ''))}
              onChange={(value) => setMaxCost(Number(value || 0))}
            />
          </Space>
  
          <Row gutter={[16, 16]}>
            {filteredDestinations.map((item) => {
              const total = item.budget.food + item.budget.transport + item.budget.accommodation;
              return (
                <Col xs={24} sm={12} lg={8} key={item.id}>
                  <Card hoverable cover={<img src={item.image} alt={item.name} className={styles.image} />}>
                    <Typography.Title level={5}>{item.name}</Typography.Title>
                    <Space size={6} wrap>
                      <Tag color="blue">{typeLabel[item.type]}</Tag>
                      <Tag>{item.location}</Tag>
                    </Space>
                    <div>
                      <Rate allowHalf disabled value={item.rating} />
                    </div>
                    <Typography.Text strong>Tổng chi phí dự kiến: {formatCurrency(total)}</Typography.Text>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
  
        <Card title="2) Tạo lịch trình du lịch" className={styles.sectionCard}>
          <Space wrap>
            <Select
              placeholder="Chọn điểm đến"
              style={{ width: 240 }}
              value={selectedDestinationId}
              onChange={setSelectedDestinationId}
              options={destinations.map((item) => ({ value: item.id, label: item.name }))}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={onAddDestinationToDay}>
              Thêm vào ngày đang chọn
            </Button>
          </Space>
  
          <Tabs activeKey={activeDay} onChange={setActiveDay} className={styles.dayTabs}>
            {itineraryDestinations.map((day) => (
              <Tabs.TabPane tab={day.title} key={day.key}>
                <List
                  dataSource={day.destinations}
                  locale={{ emptyText: 'Chưa có điểm đến trong ngày này' }}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Button key="up" size="small" onClick={() => onMoveDestination(day.key, index, -1)}>
                          ↑
                        </Button>,
                        <Button key="down" size="small" onClick={() => onMoveDestination(day.key, index, 1)}>
                          ↓
                        </Button>,
                        <Button danger key="delete" size="small" onClick={() => onRemoveFromDay(day.key, item.id)}>
                          Xóa
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={`${index + 1}. ${item.name}`}
                        description={`Thời gian tham quan: ${item.visitHours} giờ | Dự chi: ${formatCurrency(
                          item.budget.food + item.budget.transport + item.budget.accommodation,
                        )}`}
                      />
                    </List.Item>
                  )}
                />
              </Tabs.TabPane>
            ))}
          </Tabs>
  
          <Divider />
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Statistic title="Tổng thời gian di chuyển" value={budgetSummary.travelTime} suffix="phút" />
            </Col>
            <Col xs={24} md={12}>
              <Statistic title="Tổng chi phí lịch trình" value={formatCurrency(budgetSummary.total)} />
            </Col>
          </Row>
        </Card>
  
        <Card title="3) Quản lý ngân sách" className={styles.sectionCard}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              <Typography.Text>Ngân sách mục tiêu:</Typography.Text>
              <InputNumber
                min={1000000}
                step={500000}
                value={budgetLimit}
                formatter={(value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`}
                parser={(value) => Number(String(value || '').replace(/[^0-9]/g, ''))}
                onChange={(value) => setBudgetLimit(Number(value || 0))}
              />
            </Space>
  
            <Progress
              percent={Math.min(100, Number(((budgetSummary.total / budgetLimit) * 100).toFixed(1)))}
              status={budgetSummary.total > budgetLimit ? 'exception' : 'active'}
              format={(percent) => `${percent}%`}
            />
  
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic title="Ăn uống" value={formatCurrency(budgetSummary.food)} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic title="Di chuyển" value={formatCurrency(budgetSummary.transport)} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic title="Lưu trú" value={formatCurrency(budgetSummary.accommodation)} />
                </Card>
              </Col>
            </Row>
  
            {budgetSummary.total > budgetLimit ? (
              <Alert
                type="error"
                message={`Bạn đã vượt ngân sách ${formatCurrency(budgetSummary.total - budgetLimit)}. Hãy điều chỉnh lịch trình.`}
                showIcon
              />
            ) : (
              <Alert
                type="success"
                message={`Ngân sách còn lại ${formatCurrency(budgetLimit - budgetSummary.total)}.`}
                showIcon
              />
            )}
          </Space>
        </Card>
  
        <Card
          title="4) Trang quản trị (Admin)"
          className={styles.sectionCard}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Thêm điểm đến
            </Button>
          }
        >
          <Table<Destination>
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={destinations}
            columns={[
              { title: 'Điểm đến', dataIndex: 'name' },
              { title: 'Loại hình', dataIndex: 'type', render: (val: DestinationType) => typeLabel[val] },
              { title: 'Địa điểm', dataIndex: 'location' },
              { title: 'Rating', dataIndex: 'rating' },
              {
                title: 'Tổng chi phí',
                render: (_, record) => formatCurrency(record.budget.food + record.budget.transport + record.budget.accommodation),
              },
              {
                title: 'Thao tác',
                width: 140,
                render: (_, record) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDeleteDestination(record.id)} />
                  </Space>
                ),
              },
            ]}
          />
  
          <Divider />
  
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic title="Số lịch trình tạo trong tháng" value={28} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic title="Tổng doanh thu dự kiến" value={formatCurrency(budgetSummary.total * 0.15)} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic title="Số hạng mục thống kê" value={3} />
              </Card>
            </Col>
          </Row>
  
          <List
            header={<strong>Điểm đến phổ biến</strong>}
            dataSource={popularStats}
            locale={{ emptyText: 'Chưa có dữ liệu' }}
            renderItem={(item, index) => (
              <List.Item>
                <Typography.Text>
                  #{index + 1} {item.name}
                </Typography.Text>
                <Tag color="purple">{item.total} lượt</Tag>
              </List.Item>
            )}
          />
        </Card>
  
        <Modal
          title={editingDestination ? 'Chỉnh sửa điểm đến' : 'Thêm điểm đến'}
          visible={adminOpen}
          onCancel={() => setAdminOpen(false)}
          onOk={onSubmitDestination}
        >
          <Form layout="vertical" form={form}>
            <Form.Item name="name" label="Tên điểm đến" rules={[{ required: true, message: 'Không được bỏ trống' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="type" label="Loại hình" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="beach">Biển</Select.Option>
                <Select.Option value="mountain">Núi</Select.Option>
                <Select.Option value="city">Thành phố</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="location" label="Địa điểm" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="image" label="URL hình ảnh" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="rating" label="Rating" rules={[{ required: true }]}>
                  <InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="visitHours" label="Thời gian tham quan (giờ)" rules={[{ required: true }]}>
                  <InputNumber min={1} max={24} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item name="food" label="Ăn uống" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="transport" label="Di chuyển" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="accommodation" label="Lưu trú" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  };
  
  export default TravelPlannerPage;
  
  