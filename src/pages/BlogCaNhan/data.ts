export type PostStatus = 'draft' | 'published';

export interface AuthorProfile {
	name: string;
	avatar: string;
	bio: string;
	skills: string[];
	socials: SocialLink[];
}

export interface SocialLink {
	label: string;
	url: string;
}

export interface BlogPost {
	id: number;
	title: string;
	slug: string;
	summary: string;
	content: string;
	thumbnail: string;
	author: string;
	createdAt: string;
	status: PostStatus;
	tags: string[];
	views: number;
}

export interface BlogTag {
	id: number;
	name: string;
}

const now = new Date();
const toDate = (offset: number) => {
	const d = new Date(now);
	d.setDate(d.getDate() - offset);
	return d.toISOString();
};

export const AUTHOR_PROFILE: AuthorProfile = {
	name: 'Nguyen Van A',
	avatar: 'https://i.pravatar.cc/300?img=12',
	bio: 'Frontend Developer yêu thích chia sẻ kiến thức về React, TypeScript và UI/UX.',
	skills: ['React', 'TypeScript', 'Ant Design', 'Node.js', 'UI/UX'],
	socials: [
		{ label: 'GitHub', url: 'https://github.com' },
		{ label: 'LinkedIn', url: 'https://linkedin.com' },
		{ label: 'Facebook', url: 'https://facebook.com' },
	],
};

export const INITIAL_TAGS: BlogTag[] = [
	{ id: 1, name: 'React' },
	{ id: 2, name: 'TypeScript' },
	{ id: 3, name: 'CSS' },
	{ id: 4, name: 'Backend' },
	{ id: 5, name: 'Career' },
	{ id: 6, name: 'Productivity' },
];

const sampleContent = (title: string, topic: string) => `# ${title}

## Mở đầu

Bài viết này tập trung vào chủ đề **${topic}** và cách áp dụng vào dự án thực tế.

## Nội dung chính

- Phân tích vấn đề.
- Giải pháp theo từng bước.
- Ví dụ minh hoạ ngắn gọn.

### Kết luận

> Học đều đặn mỗi ngày giúp bạn tiến bộ nhanh hơn.

Cảm ơn bạn đã đọc bài viết.`;

const tagPool: string[] = ['React', 'TypeScript', 'CSS', 'Backend', 'Career', 'Productivity'];

export const INITIAL_POSTS: BlogPost[] = Array.from({ length: 14 }).map((_, index) => {
	const n = index + 1;
	const tagA = tagPool[index % tagPool.length];
	const tagB = tagPool[(index + 2) % tagPool.length];
	return {
		id: n,
		title: `Bài viết số ${n}`,
		slug: `bai-viet-so-${n}`,
		summary: `Đây là tóm tắt nhanh cho bài viết số ${n}, giúp người đọc nắm được nội dung chính trước khi xem chi tiết.`,
		content: sampleContent(`Bài viết số ${n}`, `${tagA} và ${tagB}`),
		thumbnail: `https://picsum.photos/seed/blog-${n}/600/360`,
		author: AUTHOR_PROFILE.name,
		createdAt: toDate(index),
		status: n % 4 === 0 ? 'draft' : 'published',
		tags: [tagA, tagB],
		views: 20 + n,
	};
});
