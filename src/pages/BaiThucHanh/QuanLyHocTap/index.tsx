import {
	Button,
	Card,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Progress,
	Select,
	Space,
	Table,
	Tag,
	Typography,
} from 'antd';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

interface Subject {
	id: string;
	name: string;
}

interface StudySession {
	id: string;
	subjectId: string;
	subjectName: string;
	studyTime: string;
	duration: number;
	content: string;
	note?: string;
}

interface MonthlyGoal {
	subjectId: string;
	targetHours: number;
}

const STORAGE_KEYS = {
	subjects: 'study_subjects',
	sessions: 'study_sessions',
	goals: 'study_goals',
};

const defaultSubjects = ['Toán', 'Văn', 'Anh', 'Khoa học', 'Công nghệ'];

const genId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const parseStorage = <T,>(key: string, fallback: T): T => {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
};

const QuanLyHocTapPage: React.FC = () => {
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [sessions, setSessions] = useState<StudySession[]>([]);
	const [goals, setGoals] = useState<MonthlyGoal[]>([]);

	const [subjectForm] = Form.useForm();
	const [sessionForm] = Form.useForm();
	const [goalForm] = Form.useForm();

	const [subjectModal, setSubjectModal] = useState<boolean>(false);
	const [sessionModal, setSessionModal] = useState<boolean>(false);
	const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
	const [editingSession, setEditingSession] = useState<StudySession | null>(null);

	useEffect(() => {
		const initialSubjects = parseStorage<Subject[]>(
			STORAGE_KEYS.subjects,
			defaultSubjects.map((name) => ({ id: genId(), name })),
		);
		setSubjects(initialSubjects);
		setSessions(parseStorage<StudySession[]>(STORAGE_KEYS.sessions, []));
		setGoals(parseStorage<MonthlyGoal[]>(STORAGE_KEYS.goals, []));
	}, []);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(subjects));
	}, [subjects]);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
	}, [sessions]);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
	}, [goals]);

	const monthlyHoursBySubject = useMemo(() => {
		const map = new Map<string, number>();
		const now = moment();
		sessions.forEach((session) => {
			const time = moment(session.studyTime);
			if (time.month() === now.month() && time.year() === now.year()) {
				map.set(session.subjectId, (map.get(session.subjectId) || 0) + session.duration);
			}
		});
		return map;
	}, [sessions]);

	const totalGoal = goals.reduce((sum, goal) => sum + goal.targetHours, 0);
	const totalDone = Array.from(monthlyHoursBySubject.values()).reduce((sum, value) => sum + value, 0);

	const openSubjectModal = (subject?: Subject) => {
		setEditingSubject(subject || null);
		subjectForm.setFieldsValue({ name: subject?.name });
		setSubjectModal(true);
	};

	const openSessionModal = (session?: StudySession) => {
		setEditingSession(session || null);
		sessionForm.setFieldsValue(
			session
				? {
					...session,
					studyTime: moment(session.studyTime),
				}
				: { duration: 1 },
		);
		setSessionModal(true);
	};

	const onSaveSubject = async () => {
		const values = await subjectForm.validateFields();
		if (editingSubject) {
			setSubjects((prev) => prev.map((item) => (item.id === editingSubject.id ? { ...item, name: values.name } : item)));
			setSessions((prev) =>
				prev.map((item) =>
					item.subjectId === editingSubject.id ? { ...item, subjectName: values.name } : item,
				),
			);
		} else {
			setSubjects((prev) => [...prev, { id: genId(), name: values.name }]);
		}
		setSubjectModal(false);
		subjectForm.resetFields();
	};

	const onSaveSession = async () => {
		const values = await sessionForm.validateFields();
		const subject = subjects.find((item) => item.id === values.subjectId);
		if (!subject) return;

		const payload: StudySession = {
			id: editingSession?.id || genId(),
			subjectId: values.subjectId,
			subjectName: subject.name,
			studyTime: values.studyTime.toISOString(),
			duration: values.duration,
			content: values.content,
			note: values.note,
		};

		if (editingSession) {
			setSessions((prev) => prev.map((item) => (item.id === editingSession.id ? payload : item)));
		} else {
			setSessions((prev) => [...prev, payload]);
		}

		setSessionModal(false);
		sessionForm.resetFields();
	};

	const onSaveGoal = async () => {
		const values = await goalForm.validateFields();
		setGoals((prev) => {
			const idx = prev.findIndex((item) => item.subjectId === values.subjectId);
			if (idx >= 0) {
				const next = [...prev];
				next[idx] = values;
				return next;
			}
			return [...prev, values];
		});
		goalForm.resetFields();
	};

	return (
		<Space direction='vertical' size='large' style={{ width: '100%' }}>
			<Card
				title='Bài 2 - Quản lý môn học'
				extra={<Button onClick={() => openSubjectModal()} type='primary'>Thêm môn học</Button>}
			>
				<Table<Subject>
					rowKey='id'
					dataSource={subjects}
					pagination={false}
					columns={[
						{ title: 'Tên môn', dataIndex: 'name' },
						{
							title: 'Thao tác',
							render: (_, record) => (
								<Space>
									<Button size='small' onClick={() => openSubjectModal(record)}>
										Sửa
									</Button>
									<Popconfirm
										title='Xóa môn học này?'
										onConfirm={() => {
											setSubjects((prev) => prev.filter((item) => item.id !== record.id));
											setSessions((prev) => prev.filter((item) => item.subjectId !== record.id));
											setGoals((prev) => prev.filter((item) => item.subjectId !== record.id));
										}}
									>
										<Button size='small' danger>
											Xóa
										</Button>
									</Popconfirm>
								</Space>
							),
						},
					]}
				/>
			</Card>

			<Card
				title='Quản lý lịch học'
				extra={<Button onClick={() => openSessionModal()} type='primary'>Thêm lịch học</Button>}
			>
				<Table<StudySession>
					rowKey='id'
					dataSource={sessions}
					columns={[
						{ title: 'Môn học', dataIndex: 'subjectName' },
						{
							title: 'Ngày giờ',
							render: (_, record) => moment(record.studyTime).format('DD/MM/YYYY HH:mm'),
						},
						{ title: 'Thời lượng (giờ)', dataIndex: 'duration' },
						{ title: 'Nội dung', dataIndex: 'content' },
						{ title: 'Ghi chú', dataIndex: 'note' },
						{
							title: 'Thao tác',
							render: (_, record) => (
								<Space>
									<Button size='small' onClick={() => openSessionModal(record)}>
										Sửa
									</Button>
									<Popconfirm
										title='Xóa lịch học này?'
										onConfirm={() => {
											setSessions((prev) => prev.filter((item) => item.id !== record.id));
										}}
									>
										<Button size='small' danger>
											Xóa
										</Button>
									</Popconfirm>
								</Space>
							),
						},
					]}
				/>
			</Card>

			<Card title='Mục tiêu học tập hàng tháng'>
				<Form form={goalForm} layout='inline' onFinish={onSaveGoal}>
					<Form.Item name='subjectId' rules={[{ required: true, message: 'Chọn môn học' }]}>
						<Select placeholder='Chọn môn học' style={{ minWidth: 180 }}>
							{subjects.map((subject) => (
								<Select.Option key={subject.id} value={subject.id}>
									{subject.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='targetHours' rules={[{ required: true, message: 'Nhập số giờ mục tiêu' }]}>
						<InputNumber min={1} placeholder='Giờ mục tiêu' />
					</Form.Item>
					<Form.Item>
						<Button type='primary' htmlType='submit'>
							Lưu mục tiêu
						</Button>
					</Form.Item>
				</Form>

				<Space direction='vertical' style={{ width: '100%', marginTop: 16 }}>
					{goals.map((goal) => {
						const subject = subjects.find((item) => item.id === goal.subjectId);
						const doneHours = monthlyHoursBySubject.get(goal.subjectId) || 0;
						const percent = Math.min(100, Math.round((doneHours / goal.targetHours) * 100));
						const done = doneHours >= goal.targetHours;
						return (
							<Card key={goal.subjectId} size='small'>
								<Space direction='vertical' style={{ width: '100%' }}>
									<Typography.Text strong>{subject?.name || 'Môn học đã xóa'}</Typography.Text>
									<Progress percent={percent} status={done ? 'success' : 'active'} />
									<Tag color={done ? 'green' : 'orange'}>
										{done
											? `Đã hoàn thành mục tiêu (${doneHours}/${goal.targetHours} giờ)`
											: `Chưa đạt mục tiêu (${doneHours}/${goal.targetHours} giờ)`}
									</Tag>
								</Space>
							</Card>
						);
					})}
					{goals.length === 0 && <Typography.Text type='secondary'>Chưa có mục tiêu nào.</Typography.Text>}
				</Space>

				<Card size='small' style={{ marginTop: 16 }}>
					<Typography.Text>
						Tổng quan tháng này: {totalDone} / {totalGoal} giờ{' '}
						{totalGoal > 0 && totalDone >= totalGoal ? '(Đạt mục tiêu tổng)' : '(Chưa đạt mục tiêu tổng)'}
					</Typography.Text>
				</Card>
			</Card>

			<Modal
				title={editingSubject ? 'Sửa môn học' : 'Thêm môn học'}
				visible={subjectModal}
				onCancel={() => setSubjectModal(false)}
				onOk={onSaveSubject}
			>
				<Form form={subjectForm} layout='vertical'>
					<Form.Item label='Tên môn học' name='name' rules={[{ required: true, message: 'Nhập tên môn học' }]}>
						<Input />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title={editingSession ? 'Sửa lịch học' : 'Thêm lịch học'}
				visible={sessionModal}
				onCancel={() => setSessionModal(false)}
				onOk={onSaveSession}
				width={720}
			>
				<Form form={sessionForm} layout='vertical'>
					<Form.Item label='Môn học' name='subjectId' rules={[{ required: true, message: 'Chọn môn học' }]}>
						<Select placeholder='Chọn môn học'>
							{subjects.map((subject) => (
								<Select.Option key={subject.id} value={subject.id}>
									{subject.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label='Ngày giờ học' name='studyTime' rules={[{ required: true, message: 'Chọn ngày giờ học' }]}>
						<DatePicker showTime style={{ width: '100%' }} format='DD/MM/YYYY HH:mm' />
					</Form.Item>
					<Form.Item label='Thời lượng (giờ)' name='duration' rules={[{ required: true, message: 'Nhập thời lượng học' }]}>
						<InputNumber min={0.5} step={0.5} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item label='Nội dung đã học' name='content' rules={[{ required: true, message: 'Nhập nội dung' }]}>
						<Input.TextArea rows={3} />
					</Form.Item>
					<Form.Item label='Ghi chú' name='note'>
						<Input.TextArea rows={2} />
					</Form.Item>
				</Form>
			</Modal>
		</Space>
	);
};

export default QuanLyHocTapPage;