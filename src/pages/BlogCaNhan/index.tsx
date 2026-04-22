import {
	ArrowLeftOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Button,
	Card,
	Col,
	Divider,
	Form,
	Image,
	Input,
	Modal,
	Pagination,
	Popconfirm,
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
import debounce from 'lodash/debounce';
import React, { useEffect, useMemo, useState } from 'react';
import { AUTHOR_PROFILE, INITIAL_POSTS, INITIAL_TAGS } from './data';
import type { BlogPost, BlogTag, PostStatus } from './data';

const { Paragraph, Text, Title, Link } = Typography;
const { TextArea } = Input;

const PAGE_SIZE = 9;

const toVietnameseStatus = (status: PostStatus) => (status === 'draft' ? 'Nháp' : 'Đã đăng');

const slugify = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-{2,}/g, '-');

const markdownToHtml = (markdown: string) => {
	let html = markdown
		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
		.replace(/^# (.*$)/gim, '<h1>$1</h1>')
		.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
		.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
		.replace(/^- (.*$)/gim, '<li>$1</li>');

	html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
	html = html.replace(/\n\n/g, '<br/><br/>');
	return html;
};

const BlogCaNhanPage: React.FC = () => {
	const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
	const [tags, setTags] = useState<BlogTag[]>(INITIAL_TAGS);
	const [activeTab, setActiveTab] = useState('home');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedTag, setSelectedTag] = useState<string | undefined>();
	const [keyword, setKeyword] = useState('');
	const [currentPostId, setCurrentPostId] = useState<number | null>(null);

	const [postModalOpen, setPostModalOpen] = useState(false);
	const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
	const [postForm] = Form.useForm();

	const [tagModalOpen, setTagModalOpen] = useState(false);
	const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
	const [tagForm] = Form.useForm();

	const [manageKeyword, setManageKeyword] = useState('');
	const [manageStatus, setManageStatus] = useState<PostStatus | 'all'>('all');

	const debouncedSearch = useMemo(
		() =>
			debounce((value: string) => {
				setKeyword(value);
				setCurrentPage(1);
			}, 300),
		[],
	);

	useEffect(() => {
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);

	const filteredHomePosts = useMemo(() => {
		return posts
			.filter((item) => item.status === 'published')
			.filter((item) => (selectedTag ? item.tags.includes(selectedTag) : true))
			.filter((item) => {
				if (!keyword.trim()) return true;
				const q = keyword.toLowerCase();
				return item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q);
			});
	}, [posts, selectedTag, keyword]);

	const pagePosts = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE;
		return filteredHomePosts.slice(start, start + PAGE_SIZE);
	}, [currentPage, filteredHomePosts]);

	const currentPost = useMemo(
		() => posts.find((item) => item.id === currentPostId) || null,
		[currentPostId, posts],
	);

	const relatedPosts = useMemo(() => {
		if (!currentPost) return [];
		return posts
			.filter((item) => item.id !== currentPost.id && item.status === 'published')
			.filter((item) => item.tags.some((tag) => currentPost.tags.includes(tag)))
			.slice(0, 4);
	}, [posts, currentPost]);

	const managePostData = useMemo(() => {
		return posts.filter((item) => {
			const statusMatch = manageStatus === 'all' ? true : item.status === manageStatus;
			const keywordMatch = item.title.toLowerCase().includes(manageKeyword.toLowerCase());
			return statusMatch && keywordMatch;
		});
	}, [posts, manageKeyword, manageStatus]);

	const openDetail = (post: BlogPost) => {
		setPosts((prev) => prev.map((item) => (item.id === post.id ? { ...item, views: item.views + 1 } : item)));
		setCurrentPostId(post.id);
		setActiveTab('detail');
	};

	const openCreatePostModal = () => {
		setEditingPost(null);
		postForm.resetFields();
		postForm.setFieldsValue({ status: 'draft', tags: [] });
		setPostModalOpen(true);
	};

	const openEditPostModal = (post: BlogPost) => {
		setEditingPost(post);
		postForm.setFieldsValue(post);
		setPostModalOpen(true);
	};

	const submitPost = async () => {
		const values = await postForm.validateFields();
		const payload: BlogPost = {
			id: editingPost?.id || Date.now(),
			title: values.title,
			slug: values.slug || slugify(values.title),
			summary: values.summary,
			content: values.content,
			thumbnail: values.thumbnail,
			author: AUTHOR_PROFILE.name,
			createdAt: editingPost?.createdAt || new Date().toISOString(),
			status: values.status,
			tags: values.tags,
			views: editingPost?.views || 0,
		};

		if (editingPost) {
			setPosts((prev) => prev.map((item) => (item.id === editingPost.id ? payload : item)));
			message.success('Cập nhật bài viết thành công');
		} else {
			setPosts((prev) => [payload, ...prev]);
			message.success('Thêm bài viết thành công');
		}
		setPostModalOpen(false);
	};

	const removePost = (id: number) => {
		setPosts((prev) => prev.filter((item) => item.id !== id));
		message.success('Đã xoá bài viết');
	};

	const tagUsageMap = useMemo(() => {
		const map = new Map<string, number>();
		posts.forEach((post) => {
			post.tags.forEach((tag) => {
				map.set(tag, (map.get(tag) || 0) + 1);
			});
		});
		return map;
	}, [posts]);

	const submitTag = async () => {
		const values = await tagForm.validateFields();
		const name = values.name.trim();
		if (tags.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editingTag?.id)) {
			message.error('Thẻ đã tồn tại');
			return;
		}
		if (editingTag) {
			setTags((prev) => prev.map((item) => (item.id === editingTag.id ? { ...item, name } : item)));
			setPosts((prev) =>
				prev.map((post) => ({
					...post,
					tags: post.tags.map((tag) => (tag === editingTag.name ? name : tag)),
				})),
			);
			message.success('Cập nhật thẻ thành công');
		} else {
			setTags((prev) => [...prev, { id: Date.now(), name }]);
			message.success('Thêm thẻ thành công');
		}
		setTagModalOpen(false);
	};

	const removeTag = (tag: BlogTag) => {
		setTags((prev) => prev.filter((item) => item.id !== tag.id));
		setPosts((prev) => prev.map((post) => ({ ...post, tags: post.tags.filter((item) => item !== tag.name) })));
		if (selectedTag === tag.name) setSelectedTag(undefined);
		message.success('Đã xoá thẻ');
	};

	return (
		<div style={{ padding: 24 }}>
			<Title level={2}>Blog cá nhân</Title>
			<Tabs activeKey={activeTab} onChange={setActiveTab}>
				<Tabs.TabPane tab='Trang chủ' key='home'>
					<Space direction='vertical' size={16} style={{ width: '100%' }}>
						<Input
							allowClear
							prefix={<SearchOutlined />}
							placeholder='Tìm kiếm bài viết... (debounce 300ms)'
							onChange={(e) => debouncedSearch(e.target.value)}
						/>
						<Space wrap>
							<Button size='small' type={!selectedTag ? 'primary' : 'default'} onClick={() => setSelectedTag(undefined)}>
								Tất cả tag
							</Button>
							{tags.map((tag) => (
								<Tag
									key={tag.id}
									color={selectedTag === tag.name ? 'blue' : 'default'}
									style={{ cursor: 'pointer' }}
									onClick={() => {
										setSelectedTag(tag.name);
										setCurrentPage(1);
									}}
								>
									{tag.name}
								</Tag>
							))}
						</Space>

						<Row gutter={[16, 16]}>
							{pagePosts.map((post) => (
								<Col xs={24} sm={12} md={8} key={post.id}>
									<Card
										hoverable
										cover={<Image preview={false} src={post.thumbnail} alt={post.title} height={180} style={{ objectFit: 'cover' }} />}
										onClick={() => openDetail(post)}
									>
										<Title level={5}>{post.title}</Title>
										<Paragraph ellipsis={{ rows: 2 }}>{post.summary}</Paragraph>
										<Text type='secondary'>
											{new Date(post.createdAt).toLocaleDateString('vi-VN')} - {post.author}
										</Text>
										<div style={{ marginTop: 8 }}>
											{post.tags.map((tag) => (
												<Tag key={tag}>{tag}</Tag>
											))}
										</div>
									</Card>
								</Col>
							))}
						</Row>

						<Pagination
							current={currentPage}
							total={filteredHomePosts.length}
							pageSize={PAGE_SIZE}
							onChange={setCurrentPage}
							showSizeChanger={false}
						/>
					</Space>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Chi tiết bài viết' key='detail'>
					{currentPost ? (
						<Space direction='vertical' size={16} style={{ width: '100%' }}>
							<Button icon={<ArrowLeftOutlined />} onClick={() => setActiveTab('home')}>
								Quay lại danh sách
							</Button>
							<Title>{currentPost.title}</Title>
							<Space>
								<Text>{currentPost.author}</Text>
								<Text type='secondary'>
									{new Date(currentPost.createdAt).toLocaleString('vi-VN')}
								</Text>
								<Text strong>{currentPost.views} lượt xem</Text>
							</Space>
							<Space>
								{currentPost.tags.map((tag) => (
									<Tag key={tag}>{tag}</Tag>
								))}
							</Space>
							<Image src={currentPost.thumbnail} alt={currentPost.title} preview={false} />
							<div
								style={{ lineHeight: 1.8 }}
								dangerouslySetInnerHTML={{ __html: markdownToHtml(currentPost.content) }}
							/>
							<Divider>Bài viết liên quan</Divider>
							<Row gutter={[16, 16]}>
								{relatedPosts.length ? (
									relatedPosts.map((item) => (
										<Col span={12} key={item.id}>
											<Card hoverable size='small' onClick={() => openDetail(item)} title={item.title}>
												<Paragraph ellipsis={{ rows: 2 }}>{item.summary}</Paragraph>
											</Card>
										</Col>
									))
								) : (
									<Col span={24}>
										<Text type='secondary'>Chưa có bài viết liên quan.</Text>
									</Col>
								)}
							</Row>
						</Space>
					) : (
						<Text>Vui lòng chọn một bài viết ở trang chủ.</Text>
					)}
				</Tabs.TabPane>

				<Tabs.TabPane tab='Giới thiệu' key='about'>
					<Card>
						<Space align='start'>
							<Avatar src={AUTHOR_PROFILE.avatar} size={96} />
							<div>
								<Title level={4}>{AUTHOR_PROFILE.name}</Title>
								<Paragraph>{AUTHOR_PROFILE.bio}</Paragraph>
								<Paragraph>
									<Text strong>Kỹ năng: </Text>
									{AUTHOR_PROFILE.skills.map((skill) => (
										<Tag key={skill}>{skill}</Tag>
									))}
								</Paragraph>
								<Space>
									{AUTHOR_PROFILE.socials.map((social) => (
										<Link key={social.label} href={social.url} target='_blank'>
											{social.label}
										</Link>
									))}
								</Space>
							</div>
						</Space>
					</Card>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Quản lý bài viết' key='manage-posts'>
					<Space direction='vertical' style={{ width: '100%' }}>
						<Space>
							<Input
								placeholder='Tìm theo tiêu đề'
								allowClear
								onChange={(e) => setManageKeyword(e.target.value)}
								style={{ width: 240 }}
							/>
							<Select value={manageStatus} style={{ width: 180 }} onChange={(value) => setManageStatus(value)}>
								<Select.Option value='all'>Tất cả trạng thái</Select.Option>
								<Select.Option value='draft'>Nháp</Select.Option>
								<Select.Option value='published'>Đã đăng</Select.Option>
							</Select>
							<Button type='primary' icon={<PlusOutlined />} onClick={openCreatePostModal}>
								Thêm bài viết
							</Button>
						</Space>

						<Table
							rowKey='id'
							dataSource={managePostData}
							pagination={{ pageSize: 8 }}
							columns={[
								{ title: 'Tiêu đề', dataIndex: 'title' },
								{
									title: 'Trạng thái',
									dataIndex: 'status',
									render: (value: PostStatus) => (
										<Tag color={value === 'published' ? 'green' : 'gold'}>{toVietnameseStatus(value)}</Tag>
									),
								},
								{
									title: 'Thẻ',
									dataIndex: 'tags',
									render: (value: string[]) => value.map((tag) => <Tag key={tag}>{tag}</Tag>),
								},
								{
									title: 'Lượt xem',
									dataIndex: 'views',
									render: (v: number) => <Statistic value={v} valueStyle={{ fontSize: 14 }} />,
								},
								{
									title: 'Ngày tạo',
									dataIndex: 'createdAt',
									render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
								},
								{
									title: 'Hành động',
									render: (_, record: BlogPost) => (
										<Space>
											<Button icon={<EditOutlined />} size='small' onClick={() => openEditPostModal(record)} />
											<Popconfirm title='Bạn có chắc muốn xoá?' onConfirm={() => removePost(record.id)}>
												<Button danger icon={<DeleteOutlined />} size='small' />
											</Popconfirm>
										</Space>
									),
								},
							]}
						/>
					</Space>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Quản lý thẻ' key='manage-tags'>
					<Space direction='vertical' style={{ width: '100%' }}>
						<Button
							type='primary'
							onClick={() => {
								setEditingTag(null);
								tagForm.resetFields();
								setTagModalOpen(true);
							}}
						>
							Thêm thẻ
						</Button>

						<Table
							rowKey='id'
							pagination={false}
							dataSource={tags}
							columns={[
								{ title: 'Tên thẻ', dataIndex: 'name' },
								{
									title: 'Số bài viết',
									render: (_, record: BlogTag) => tagUsageMap.get(record.name) || 0,
								},
								{
									title: 'Hành động',
									render: (_, record: BlogTag) => (
										<Space>
											<Button
												size='small'
												icon={<EditOutlined />}
												onClick={() => {
													setEditingTag(record);
													tagForm.setFieldsValue(record);
													setTagModalOpen(true);
												}}
											/>
											<Popconfirm title='Xoá thẻ này?' onConfirm={() => removeTag(record)}>
												<Button danger size='small' icon={<DeleteOutlined />} />
											</Popconfirm>
										</Space>
									),
								},
							]}
						/>
					</Space>
				</Tabs.TabPane>
			</Tabs>

			<Modal
				destroyOnClose
				visible={postModalOpen}
				title={editingPost ? 'Sửa bài viết' : 'Thêm bài viết'}
				onCancel={() => setPostModalOpen(false)}
				onOk={submitPost}
				okText='Lưu'
			>
				<Form layout='vertical' form={postForm}>
					<Form.Item name='title' label='Tiêu đề' rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
						<Input
							onChange={(e) => {
								const value = e.target.value;
								if (!editingPost) {
									postForm.setFieldsValue({ slug: slugify(value) });
								}
							}}
						/>
					</Form.Item>
					<Form.Item name='slug' label='Slug' rules={[{ required: true, message: 'Vui lòng nhập slug' }]}>
						<Input />
					</Form.Item>
					<Form.Item name='summary' label='Tóm tắt' rules={[{ required: true, message: 'Vui lòng nhập tóm tắt' }]}>
						<TextArea rows={3} />
					</Form.Item>
					<Form.Item name='content' label='Nội dung (Markdown)' rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
						<TextArea rows={6} />
					</Form.Item>
					<Form.Item
						name='thumbnail'
						label='Ảnh đại diện (URL)'
						rules={[{ required: true, message: 'Vui lòng nhập URL ảnh' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item name='tags' label='Thẻ' rules={[{ required: true, message: 'Chọn ít nhất 1 thẻ' }]}>
						<Select mode='multiple' options={tags.map((tag) => ({ label: tag.name, value: tag.name }))} />
					</Form.Item>
					<Form.Item name='status' label='Trạng thái' rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
						<Select>
							<Select.Option value='draft'>Nháp</Select.Option>
							<Select.Option value='published'>Đã đăng</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				destroyOnClose
				visible={tagModalOpen}
				title={editingTag ? 'Sửa thẻ' : 'Thêm thẻ'}
				onCancel={() => setTagModalOpen(false)}
				onOk={submitTag}
				okText='Lưu'
			>
				<Form form={tagForm} layout='vertical'>
					<Form.Item name='name' label='Tên thẻ' rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default BlogCaNhanPage;
