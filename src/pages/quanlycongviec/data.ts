export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'Cao' | 'Trung bình' | 'Thấp';

export interface TaskItem {
	id: string;
	title: string;
	description: string;
	deadline: string;
	priority: TaskPriority;
	status: TaskStatus;
	tags: string[];
}

export interface KanbanColumn {
	key: TaskStatus;
	title: string;
	description: string;
}

export const STORAGE_KEY = 'quan_ly_cong_viec_tasks';

export const statusLabels: Record<TaskStatus, string> = {
	todo: 'Cần làm',
	doing: 'Đang làm',
	done: 'Hoàn thành',
};

export const priorityColors: Record<TaskPriority, string> = {
	Cao: 'red',
	'Trung bình': 'orange',
	Thấp: 'green',
};

export const statusColors: Record<TaskStatus, string> = {
	todo: 'blue',
	doing: 'gold',
	done: 'green',
};

export const kanbanColumns: KanbanColumn[] = [
	{
		key: 'todo',
		title: statusLabels.todo,
		description: 'Các task cần bắt đầu',
	},
	{
		key: 'doing',
		title: statusLabels.doing,
		description: 'Các task đang xử lý',
	},
	{
		key: 'done',
		title: statusLabels.done,
		description: 'Các task đã hoàn tất',
	},
];

export const mockTasks: TaskItem[] = [
	{
		id: 'task-1',
		title: 'Lập kế hoạch học React',
		description: 'Chia nhỏ các chủ đề React cần ôn tập trong tuần.',
		deadline: '2026-05-08',
		priority: 'Cao',
		status: 'todo',
		tags: ['React', 'Study'],
	},
	{
		id: 'task-2',
		title: 'Hoàn thiện giao diện Kanban',
		description: 'Thiết kế 3 cột Cần làm, Đang làm và Hoàn thành.',
		deadline: '2026-05-10',
		priority: 'Cao',
		status: 'doing',
		tags: ['UI', 'Kanban'],
	},
	{
		id: 'task-3',
		title: 'Viết tài liệu sử dụng',
		description: 'Ghi chú cách thêm, sửa, lọc và kéo thả task.',
		deadline: '2026-05-15',
		priority: 'Trung bình',
		status: 'todo',
		tags: ['Docs'],
	},
	{
		id: 'task-4',
		title: 'Nộp bài thực hành',
		description: 'Kiểm tra lại chức năng và nộp source code.',
		deadline: '2026-05-03',
		priority: 'Thấp',
		status: 'done',
		tags: ['Submit'],
	},
];

