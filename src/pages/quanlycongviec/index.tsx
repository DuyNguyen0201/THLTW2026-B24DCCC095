import React, { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Card,
	Col,
	DatePicker,
	Form,
	Input,
	Modal,
	Row,
	Select,
	Space,
	Statistic,
	Table,
	Tabs,
	Tag,
	Typography,
	message,
} from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	EditOutlined,
	PlusOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import moment from 'moment';
import type { Moment } from 'moment';
import {
	kanbanColumns,
	mockTasks,
	priorityColors,
	statusColors,
	statusLabels,
	STORAGE_KEY,
	type TaskItem,
	type TaskPriority,
	type TaskStatus,
} from './data';

const { Option } = Select;
const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

interface TaskFormValues {
	title: string;
	description: string;
	deadline: Moment;
	priority: TaskPriority;
	status: TaskStatus;
	tags?: string[];
}

const priorityOptions: TaskPriority[] = ['Cao', 'Trung bình', 'Thấp'];
const statusOptions: TaskStatus[] = ['todo', 'doing', 'done'];

const getToday = () => moment().startOf('day');

const getTasksFromStorage = () => {
	const savedTasks = localStorage.getItem(STORAGE_KEY);

	if (!savedTasks) {
		return mockTasks;
	}

	try {
		return JSON.parse(savedTasks) as TaskItem[];
	} catch (error) {
		return mockTasks;
	}
};

const QuanLyCongViec = () => {
	const [tasks, setTasks] = useState<TaskItem[]>([]);
	const [visible, setVisible] = useState(false);
	const [editingTask, setEditingTask] = useState<TaskItem>();
	const [keyword, setKeyword] = useState('');
	const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
	const [form] = Form.useForm<TaskFormValues>();

	useEffect(() => {
		setTasks(getTasksFromStorage());
	}, []);

	useEffect(() => {
		if (tasks.length) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
		}
	}, [tasks]);

	const dashboardData = useMemo(() => {
		const today = getToday();
		const completedTasks = tasks.filter((task) => task.status === 'done').length;
		const overdueTasks = tasks.filter(
			(task) => task.status !== 'done' && moment(task.deadline).isBefore(today, 'day'),
		).length;

		return {
			totalTasks: tasks.length,
			completedTasks,
			overdueTasks,
		};
	}, [tasks]);

	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			const matchedKeyword = task.title.toLowerCase().includes(keyword.trim().toLowerCase());
			const matchedStatus = !statusFilter || task.status === statusFilter;

			return matchedKeyword && matchedStatus;
		});
	}, [keyword, statusFilter, tasks]);

	const openCreateModal = () => {
		setEditingTask(undefined);
		form.resetFields();
		form.setFieldsValue({ priority: 'Trung bình', status: 'todo', tags: [] });
		setVisible(true);
	};

	const openEditModal = (task: TaskItem) => {
		setEditingTask(task);
		form.setFieldsValue({
			...task,
			deadline: moment(task.deadline),
		});
		setVisible(true);
	};

	const closeModal = () => {
		setVisible(false);
		setEditingTask(undefined);
		form.resetFields();
	};

	const handleSubmit = (values: TaskFormValues) => {
		const nextTask: TaskItem = {
			id: editingTask?.id || `task-${Date.now()}`,
			title: values.title,
			description: values.description,
			deadline: values.deadline.format('YYYY-MM-DD'),
			priority: values.priority,
			status: values.status,
			tags: values.tags || [],
		};

		if (editingTask) {
			setTasks((currentTasks) => currentTasks.map((task) => (task.id === editingTask.id ? nextTask : task)));
			message.success('Cập nhật task thành công');
		} else {
			setTasks((currentTasks) => [nextTask, ...currentTasks]);
			message.success('Thêm task thành công');
		}

		closeModal();
	};

	const handleDragEnd = (result: DropResult) => {
		const { destination, draggableId } = result;

		if (!destination) {
			return;
		}

		setTasks((currentTasks) => {
			const draggedTask = currentTasks.find((task) => task.id === draggableId);

			if (!draggedTask) {
				return currentTasks;
			}

			const nextTasks = currentTasks.filter((task) => task.id !== draggableId);
			const destinationStatus = destination.droppableId as TaskStatus;
			const tasksBeforeDestination = nextTasks.filter((task) => task.status === destinationStatus);
			const insertBeforeTask = tasksBeforeDestination[destination.index];
			const updatedTask = { ...draggedTask, status: destinationStatus };

			if (!insertBeforeTask) {
				return [...nextTasks, updatedTask];
			}

			const insertIndex = nextTasks.findIndex((task) => task.id === insertBeforeTask.id);
			return [...nextTasks.slice(0, insertIndex), updatedTask, ...nextTasks.slice(insertIndex)];
		});
	};

	const columns: ColumnsType<TaskItem> = [
		{
			title: 'Tên task',
			dataIndex: 'title',
			key: 'title',
			render: (value: string, record) => (
				<div>
					<Text strong>{value}</Text>
					<Paragraph type='secondary' ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
						{record.description}
					</Paragraph>
				</div>
			),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			filters: statusOptions.map((status) => ({ text: statusLabels[status], value: status })),
			onFilter: (value, record) => record.status === value,
			render: (status: TaskStatus) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
		},
		{
			title: 'Deadline',
			dataIndex: 'deadline',
			key: 'deadline',
			sorter: (a, b) => moment(a.deadline).valueOf() - moment(b.deadline).valueOf(),
			render: (deadline: string, record) => {
				const overdue = record.status !== 'done' && moment(deadline).isBefore(getToday(), 'day');

				return <Text type={overdue ? 'danger' : undefined}>{moment(deadline).format('DD/MM/YYYY')}</Text>;
			},
		},
		{
			title: 'Ưu tiên',
			dataIndex: 'priority',
			key: 'priority',
			render: (priority: TaskPriority) => <Tag color={priorityColors[priority]}>{priority}</Tag>,
		},
		{
			title: 'Tag',
			dataIndex: 'tags',
			key: 'tags',
			render: (tags: string[]) => tags.map((tag) => <Tag key={tag}>{tag}</Tag>),
		},
		{
			title: 'Thao tác',
			key: 'action',
			render: (_, record) => (
				<Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
					Sửa
				</Button>
			),
		},
	];

	const renderTaskCard = (task: TaskItem) => {
		const overdue = task.status !== 'done' && moment(task.deadline).isBefore(getToday(), 'day');

		return (
			<Card
				size='small'
				style={{ marginBottom: 12, borderRadius: 10 }}
				title={<Text strong>{task.title}</Text>}
				extra={
					<Button type='link' size='small' icon={<EditOutlined />} onClick={() => openEditModal(task)}>
						Sửa
					</Button>
				}
			>
				<Paragraph ellipsis={{ rows: 2 }}>{task.description}</Paragraph>
				<Space direction='vertical' size={4} style={{ width: '100%' }}>
					<Text type={overdue ? 'danger' : 'secondary'}>Deadline: {moment(task.deadline).format('DD/MM/YYYY')}</Text>
					<div>
						<Tag color={priorityColors[task.priority]}>{task.priority}</Tag>
						{task.tags.map((tag) => (
							<Tag key={tag}>{tag}</Tag>
						))}
					</div>
				</Space>
			</Card>
		);
	};

	return (
		<div style={{ padding: 24 }}>
			<Card>
				<Row justify='space-between' align='middle' gutter={[16, 16]}>
					<Col>
						<Title level={2} style={{ marginBottom: 0 }}>
							Quản lý công việc cá nhân
						</Title>
						<Text type='secondary'>Theo dõi task bằng Dashboard, Kanban Board và danh sách chi tiết.</Text>
					</Col>
					<Col>
						<Button type='primary' icon={<PlusOutlined />} onClick={openCreateModal}>
							Thêm task
						</Button>
					</Col>
				</Row>
			</Card>

			<Tabs defaultActiveKey='dashboard' style={{ marginTop: 16 }}>
				<Tabs.TabPane tab='Dashboard' key='dashboard'>
					<Row gutter={[16, 16]}>
						<Col xs={24} md={8}>
							<Card>
								<Statistic title='Tổng số task' value={dashboardData.totalTasks} prefix={<UnorderedListOutlined />} />
							</Card>
						</Col>
						<Col xs={24} md={8}>
							<Card>
								<Statistic title='Task hoàn thành' value={dashboardData.completedTasks} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#3f8600' }} />
							</Card>
						</Col>
						<Col xs={24} md={8}>
							<Card>
								<Statistic title='Task quá hạn' value={dashboardData.overdueTasks} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#cf1322' }} />
							</Card>
						</Col>
					</Row>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Kanban Board' key='kanban'>
					<DragDropContext onDragEnd={handleDragEnd}>
						<Row gutter={[16, 16]}>
							{kanbanColumns.map((column) => {
								const columnTasks = tasks.filter((task) => task.status === column.key);

								return (
									<Col xs={24} lg={8} key={column.key}>
										<Card title={`${column.title} (${columnTasks.length})`} extra={<Text type='secondary'>{column.description}</Text>}>
											<Droppable droppableId={column.key}>
												{(provided, snapshot) => (
													<div
														ref={provided.innerRef}
														{...provided.droppableProps}
														style={{
															minHeight: 360,
															padding: 8,
															background: snapshot.isDraggingOver ? '#e6f7ff' : '#fafafa',
															borderRadius: 8,
														}}
													>
														{columnTasks.map((task, index) => (
															<Draggable draggableId={task.id} index={index} key={task.id}>
																{(dragProvided) => (
																	<div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
																		{renderTaskCard(task)}
																	</div>
																)}
															</Draggable>
														))}
														{provided.placeholder}
													</div>
												)}
											</Droppable>
										</Card>
									</Col>
								);
							})}
						</Row>
					</DragDropContext>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Danh sách task' key='table'>
					<Card>
						<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
							<Col xs={24} md={12}>
								<Input.Search placeholder='Tìm kiếm theo tên task' allowClear onSearch={setKeyword} onChange={(event) => setKeyword(event.target.value)} />
							</Col>
							<Col xs={24} md={6}>
								<Select allowClear placeholder='Lọc theo trạng thái' style={{ width: '100%' }} value={statusFilter} onChange={setStatusFilter}>
									{statusOptions.map((status) => (
										<Option value={status} key={status}>
											{statusLabels[status]}
										</Option>
									))}
								</Select>
							</Col>
						</Row>
						<Table rowKey='id' columns={columns} dataSource={filteredTasks} pagination={{ pageSize: 6 }} />
					</Card>
				</Tabs.TabPane>
			</Tabs>

			<Modal title={editingTask ? 'Chỉnh sửa task' : 'Thêm task mới'} visible={visible} footer={null} destroyOnClose onCancel={closeModal}>
				<Form layout='vertical' form={form} onFinish={handleSubmit}>
					<Form.Item label='Tên task' name='title' rules={[{ required: true, message: 'Vui lòng nhập tên task' }]}>
						<Input placeholder='Nhập tên task' />
					</Form.Item>
					<Form.Item label='Mô tả' name='description' rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
						<TextArea rows={4} placeholder='Nhập mô tả công việc' />
					</Form.Item>
					<Form.Item label='Deadline' name='deadline' rules={[{ required: true, message: 'Vui lòng chọn deadline' }]}>
						<DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
					</Form.Item>
					<Form.Item label='Mức độ ưu tiên' name='priority' rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}>
						<Select>
							{priorityOptions.map((priority) => (
								<Option value={priority} key={priority}>
									{priority}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label='Trạng thái' name='status' rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
						<Select>
							{statusOptions.map((status) => (
								<Option value={status} key={status}>
									{statusLabels[status]}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label='Tag' name='tags'>
						<Select mode='tags' placeholder='Nhập tag rồi nhấn Enter' />
					</Form.Item>
					<Space style={{ width: '100%', justifyContent: 'flex-end' }}>
						<Button onClick={closeModal}>Hủy</Button>
						<Button type='primary' htmlType='submit'>
							{editingTask ? 'Cập nhật' : 'Thêm mới'}
						</Button>
					</Space>
				</Form>
			</Modal>
		</div>
	);
};

export default QuanLyCongViec;
