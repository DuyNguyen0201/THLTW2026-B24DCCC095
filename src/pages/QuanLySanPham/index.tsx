import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, message, Modal, Popconfirm, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

interface ProductItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
}

const initialProducts: ProductItem[] = [
	{ id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
	{ id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
	{ id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
	{ id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
	{ id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
];

const QuanLySanPham: React.FC = () => {
	const [products, setProducts] = useState<ProductItem[]>(initialProducts);
	const [searchTerm, setSearchTerm] = useState('');
	const [openModal, setOpenModal] = useState(false);
	const [form] = Form.useForm();

	const filteredProducts = useMemo(() => {
		const keyword = searchTerm.trim().toLowerCase();
		if (!keyword) {
			return products;
		}
		return products.filter((item) => item.name.toLowerCase().includes(keyword));
	}, [products, searchTerm]);

	const handleAddProduct = async () => {
		try {
			const values = await form.validateFields();
			const nextId = products.length ? Math.max(...products.map((item) => item.id)) + 1 : 1;
			const newProduct: ProductItem = {
				id: nextId,
				name: values.name,
				price: values.price,
				quantity: values.quantity,
			};
			setProducts((prev) => [...prev, newProduct]);
			message.success('Thêm sản phẩm thành công');
			form.resetFields();
			setOpenModal(false);
		} catch (error) {
			// Validation errors are handled by Form
		}
	};

	const handleDeleteProduct = (id: number) => {
		setProducts((prev) => prev.filter((item) => item.id !== id));
		message.success('Xóa sản phẩm thành công');
	};

	const columns: ColumnsType<ProductItem> = [
		{
			title: 'STT',
			key: 'index',
			width: 80,
			render: (_value, _record, index) => index + 1,
		},
		{
			title: 'Tên sản phẩm',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Giá',
			dataIndex: 'price',
			key: 'price',
			align: 'right',
			render: (value: number) => `${value.toLocaleString('vi-VN')} đ`,
		},
		{
			title: 'Số lượng',
			dataIndex: 'quantity',
			key: 'quantity',
			align: 'center',
		},
		{
			title: 'Thao tác',
			key: 'actions',
			align: 'center',
			render: (_value, record) => (
				<Popconfirm
					title='Bạn có chắc chắn muốn xóa?'
					onConfirm={() => handleDeleteProduct(record.id)}
					okText='Xóa'
					cancelText='Hủy'
				>
					<Button danger type='link' icon={<DeleteOutlined />}>
						Xóa
					</Button>
				</Popconfirm>
			),
		},
	];

	return (
		<div>
			<Space direction='vertical' size={16} style={{ width: '100%' }}>
				<Space align='center' style={{ width: '100%', justifyContent: 'space-between' }}>
					<Input.Search
						allowClear
						placeholder='Tìm kiếm theo tên sản phẩm'
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						style={{ maxWidth: 320 }}
					/>
					<Button type='primary' icon={<PlusCircleOutlined />} onClick={() => setOpenModal(true)}>
						Thêm sản phẩm
					</Button>
				</Space>
				<Table<ProductItem>
					rowKey='id'
					columns={columns}
					dataSource={filteredProducts}
					pagination={{ pageSize: 5 }}
				/>
			</Space>

			<Modal
				title='Thêm sản phẩm mới'
				visible={openModal}
				onCancel={() => {
					setOpenModal(false);
					form.resetFields();
				}}
				onOk={handleAddProduct}
				okText='Thêm'
				cancelText='Hủy'
				destroyOnClose
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						label='Tên sản phẩm'
						name='name'
						rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
					>
						<Input placeholder='Nhập tên sản phẩm' />
					</Form.Item>
					<Form.Item
						label='Giá'
						name='price'
						rules={[
							{ required: true, message: 'Vui lòng nhập giá sản phẩm' },
							{ type: 'number', min: 1, message: 'Giá phải là số dương' },
						]}
					>
						<InputNumber
							style={{ width: '100%' }}
							min={1}
							formatter={(value) =>
								`${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
							}
							parser={(value) => (value ?? '').replace(/[^\d]/g, '')}
							placeholder='Nhập giá sản phẩm'
						/>
					</Form.Item>
					<Form.Item
						label='Số lượng'
						name='quantity'
						rules={[
							{ required: true, message: 'Vui lòng nhập số lượng' },
							{ type: 'number', min: 1, message: 'Số lượng phải là số nguyên dương' },
						]}
					>
						<InputNumber
							style={{ width: '100%' }}
							min={1}
							precision={0}
							placeholder='Nhập số lượng'
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default QuanLySanPham;