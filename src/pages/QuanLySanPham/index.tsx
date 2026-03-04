import {
	AppstoreOutlined,
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	PlusCircleOutlined,
	ShoppingCartOutlined,
} from '@ant-design/icons';
import {
	Badge,
	Button,
	Card,
	DatePicker,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Popconfirm,
	Progress,
	Select,
	Slider,
	Space,
	Statistic,
	Table,
	Tabs,
	Tag,
	Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface ProductItem {
	id: number;
	name: string;
	category: string;
	price: number;
	quantity: number;
}

interface OrderProduct {
	productId: number;
	productName: string;
	quantity: number;
	price: number;
}

type OrderStatus = 'Chờ xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';

interface OrderItem {
	id: string;
	customerName: string;
	phone: string;
	address: string;
	products: OrderProduct[];
	status: OrderStatus;
	createdAt: string;
}

const initialProducts: ProductItem[] = [
	{ id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
	{ id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
	{ id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
	{ id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
	{ id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
	{ id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
	{ id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
	{ id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

const initialOrders: OrderItem[] = [
	{
		id: 'DH001',
		customerName: 'Nguyễn Văn A',
		phone: '0912345678',
		address: '123 Nguyễn Huệ, Q1, TP.HCM',
		products: [
			{ productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 },
		],
		status: 'Chờ xử lý',
		createdAt: '2024-01-15',
	},
];

const storageKeys = {
	products: 'qlsp_products',
	orders: 'qlsp_orders',
};

const productStatusConfig = (quantity: number) => {
	if (quantity === 0) {
		return { label: 'Hết hàng', color: 'red' };
	}
	if (quantity <= 10) {
		return { label: 'Sắp hết', color: 'orange' };
	}
	return { label: 'Còn hàng', color: 'green' };
};

const statusOptions: OrderStatus[] = ['Chờ xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

const QuanLySanPham: React.FC = () => {
	const [activeTab, setActiveTab] = useState('products');
	const [products, setProducts] = useState<ProductItem[]>(initialProducts);
	const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
	const [productSearch, setProductSearch] = useState('');
	const [orderSearch, setOrderSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
	const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000000]);
	const [productSort, setProductSort] = useState<string>('name-asc');
	const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | undefined>(undefined);
	const [orderSort, setOrderSort] = useState<string>('date-desc');
	const [orderDateRange, setOrderDateRange] = useState<[moment.Moment | null, moment.Moment | null] | null>(
		null,
	);
	const [openProductModal, setOpenProductModal] = useState(false);
	const [openOrderModal, setOpenOrderModal] = useState(false);
	const [openOrderDetail, setOpenOrderDetail] = useState(false);
	const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
	const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);

	const [productForm] = Form.useForm();
	const [orderForm] = Form.useForm();

	useEffect(() => {
		const storedProducts = localStorage.getItem(storageKeys.products);
		const storedOrders = localStorage.getItem(storageKeys.orders);
		if (storedProducts) {
			setProducts(JSON.parse(storedProducts));
		}
		if (storedOrders) {
			setOrders(JSON.parse(storedOrders));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(storageKeys.products, JSON.stringify(products));
	}, [products]);

	useEffect(() => {
		localStorage.setItem(storageKeys.orders, JSON.stringify(orders));
	}, [orders]);

	const categories = useMemo(() => {
		const uniqueCategories = new Set(products.map((item) => item.category));
		return Array.from(uniqueCategories);
	}, [products]);

	const priceBounds = useMemo(() => {
		const prices = products.map((item) => item.price);
		const min = prices.length ? Math.min(...prices) : 0;
		const max = prices.length ? Math.max(...prices) : 0;
		return [min, max] as [number, number];
	}, [products]);

	useEffect(() => {
		setPriceRange([priceBounds[0], priceBounds[1] || 30000000]);
	}, [priceBounds]);

	const getOrderTotal = useCallback((order: OrderItem) => {
		return order.products.reduce((sum, item) => sum + item.price * item.quantity, 0);
	}, []);

	const filteredProducts = useMemo(() => {
		const keyword = productSearch.trim().toLowerCase();
		let data = products.filter((item) => item.name.toLowerCase().includes(keyword));
		if (categoryFilter) {
			data = data.filter((item) => item.category === categoryFilter);
		}
		if (statusFilter) {
			data = data.filter((item) => productStatusConfig(item.quantity).label === statusFilter);
		}
		data = data.filter((item) => item.price >= priceRange[0] && item.price <= priceRange[1]);
		switch (productSort) {
			case 'name-desc':
				data = [...data].sort((a, b) => b.name.localeCompare(a.name));
				break;
			case 'price-asc':
				data = [...data].sort((a, b) => a.price - b.price);
				break;
			case 'price-desc':
				data = [...data].sort((a, b) => b.price - a.price);
				break;
			case 'quantity-asc':
				data = [...data].sort((a, b) => a.quantity - b.quantity);
				break;
			case 'quantity-desc':
				data = [...data].sort((a, b) => b.quantity - a.quantity);
				break;
			default:
				data = [...data].sort((a, b) => a.name.localeCompare(b.name));
		}
		return data;
	}, [products, productSearch, categoryFilter, statusFilter, priceRange, productSort]);

	const filteredOrders = useMemo(() => {
		const keyword = orderSearch.trim().toLowerCase();
		let data = orders.filter(
			(order) =>
				order.customerName.toLowerCase().includes(keyword) || order.id.toLowerCase().includes(keyword),
		);
		if (orderStatusFilter) {
			data = data.filter((order) => order.status === orderStatusFilter);
		}
		if (orderDateRange?.[0] && orderDateRange?.[1]) {
			const [start, end] = orderDateRange;
			data = data.filter((order) => {
				const date = moment(order.createdAt, 'YYYY-MM-DD');
				return date.isSameOrAfter(start, 'day') && date.isSameOrBefore(end, 'day');
			});
		}
		switch (orderSort) {
			case 'date-asc':
				data = [...data].sort((a, b) => moment(a.createdAt).diff(moment(b.createdAt)));
				break;
			case 'total-asc':
				data = [...data].sort((a, b) => getOrderTotal(a) - getOrderTotal(b));
				break;
			case 'total-desc':
				data = [...data].sort((a, b) => getOrderTotal(b) - getOrderTotal(a));
				break;
			default:
				data = [...data].sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
		}
		return data;
	}, [orders, orderSearch, orderStatusFilter, orderDateRange, orderSort]);

	const totals = useMemo(() => {
		const totalProducts = products.reduce((sum, item) => sum + item.quantity, 0);
		const inventoryValue = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
		const orderCount = orders.length;
		const revenue = orders
			.filter((order) => order.status === 'Hoàn thành')
			.reduce((sum, order) => sum + getOrderTotal(order), 0);
		const statusCount = statusOptions.reduce(
			(acc, status) => ({ ...acc, [status]: orders.filter((order) => order.status === status).length }),
			{} as Record<OrderStatus, number>,
		);
		return { totalProducts, inventoryValue, orderCount, revenue, statusCount };
	}, [products, orders]);

	const handleOpenAddProduct = () => {
		setEditingProduct(null);
		productForm.resetFields();
		setOpenProductModal(true);
	};

	const handleEditProduct = (record: ProductItem) => {
		setEditingProduct(record);
		productForm.setFieldsValue(record);
		setOpenProductModal(true);
	};

	const handleSaveProduct = async () => {
		try {
			const values = await productForm.validateFields();
			if (editingProduct) {
				setProducts((prev) =>
					prev.map((item) => (item.id === editingProduct.id ? { ...item, ...values } : item)),
				);
				message.success('Cập nhật sản phẩm thành công');
			} else {
				const nextId = products.length ? Math.max(...products.map((item) => item.id)) + 1 : 1;
				setProducts((prev) => [...prev, { id: nextId, ...values }]);
				message.success('Thêm sản phẩm thành công');
			}
			setOpenProductModal(false);
			productForm.resetFields();
		} catch (error) {
			// Validation errors are handled by Form
		}
	};

	const handleDeleteProduct = (id: number) => {
		setProducts((prev) => prev.filter((item) => item.id !== id));
		message.success('Xóa sản phẩm thành công');
	};

	const orderItems = Form.useWatch('items', orderForm) || [];
	const orderTotal = useMemo(() => {
		return (orderItems as { productId?: number; quantity?: number }[]).reduce((sum, item) => {
			const product = products.find((productItem) => productItem.id === item.productId);
			if (!product || !item.quantity) {
				return sum;
			}
			return sum + product.price * item.quantity;
		}, 0);
	}, [orderItems, products]);

	const handleOpenOrderModal = () => {
		orderForm.resetFields();
		setOpenOrderModal(true);
	};

	const handleCreateOrder = async () => {
		try {
			const values = await orderForm.validateFields();
			const createdAt = moment().format('YYYY-MM-DD');
			const items = values.items.map((item: { productId: number; quantity: number }) => {
				const product = products.find((productItem) => productItem.id === item.productId);
				return {
					productId: item.productId,
					productName: product?.name ?? '',
					quantity: item.quantity,
					price: product?.price ?? 0,
				};
			});
			const nextId = `DH${String(orders.length + 1).padStart(3, '0')}`;
			const newOrder: OrderItem = {
				id: nextId,
				customerName: values.customerName,
				phone: values.phone,
				address: values.address,
				products: items,
				status: 'Chờ xử lý',
				createdAt,
			};
			setOrders((prev) => [newOrder, ...prev]);
			message.success('Tạo đơn hàng thành công');
			setOpenOrderModal(false);
			orderForm.resetFields();
		} catch (error) {
			// Validation errors are handled by Form
		}
	};

	const handleOrderStatusChange = useCallback(
		(order: OrderItem, nextStatus: OrderStatus) => {
			if (order.status === nextStatus) {
				return;
			}
			let updatedProducts = [...products];

			const restoreStock = () => {
				updatedProducts = updatedProducts.map((product) => {
					const orderItem = order.products.find((item) => item.productId === product.id);
					if (!orderItem) {
						return product;
					}
					return { ...product, quantity: product.quantity + orderItem.quantity };
				});
			};

			const reduceStock = () => {
				const insufficient = order.products.find((item) => {
					const product = updatedProducts.find((prod) => prod.id === item.productId);
					return !product || product.quantity < item.quantity;
				});
				if (insufficient) {
					message.error('Số lượng tồn kho không đủ để hoàn thành đơn hàng');
					return false;
				}
				updatedProducts = updatedProducts.map((product) => {
					const orderItem = order.products.find((item) => item.productId === product.id);
					if (!orderItem) {
						return product;
					}
					return { ...product, quantity: product.quantity - orderItem.quantity };
				});
				return true;
			};

			if (order.status === 'Hoàn thành' && nextStatus !== 'Hoàn thành') {
				restoreStock();
			}
			if (order.status !== 'Hoàn thành' && nextStatus === 'Hoàn thành') {
				const canReduce = reduceStock();
				if (!canReduce) {
					return;
				}
			}
			setProducts(updatedProducts);
			setOrders((prev) =>
				prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item)),
			);
			message.success('Cập nhật trạng thái đơn hàng thành công');
		},
		[products],
	);

	const productColumns: ColumnsType<ProductItem> = [
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
			title: 'Danh mục',
			dataIndex: 'category',
			key: 'category',
		},
		{
			title: 'Giá',
			dataIndex: 'price',
			key: 'price',
			align: 'right',
			render: (value: number) => `${value.toLocaleString('vi-VN')} đ`,
		},
		{
			title: 'Tồn kho',
			dataIndex: 'quantity',
			key: 'quantity',
			align: 'center',
		},
		{
			title: 'Trạng thái',
			key: 'status',
			align: 'center',
			render: (_value, record) => {
				const status = productStatusConfig(record.quantity);
				return <Tag color={status.color}>{status.label}</Tag>;
			},
		},
		{
			title: 'Thao tác',
			key: 'actions',
			align: 'center',
			render: (_value, record) => (
				<Space>
					<Button type='link' icon={<EditOutlined />} onClick={() => handleEditProduct(record)}>
						Sửa
					</Button>
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
				</Space>
			),
		},
	];

	const orderColumns: ColumnsType<OrderItem> = [
		{
			title: 'Mã đơn hàng',
			dataIndex: 'id',
			key: 'id',
			width: 120,
		},
		{
			title: 'Tên khách hàng',
			dataIndex: 'customerName',
			key: 'customerName',
		},
		{
			title: 'Số sản phẩm',
			key: 'productCount',
			align: 'center',
			render: (_value, record) => record.products.length,
		},
		{
			title: 'Tổng tiền',
			key: 'total',
			align: 'right',
			render: (_value, record) => `${getOrderTotal(record).toLocaleString('vi-VN')} đ`,
		},
		{
			title: 'Trạng thái',
			key: 'status',
			render: (_value, record) => (
				<Select
					value={record.status}
					onChange={(value) => handleOrderStatusChange(record, value)}
					options={statusOptions.map((status) => ({ value: status, label: status }))}
				/>
			),
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (value: string) => moment(value).format('DD/MM/YYYY'),
		},
		{
			title: 'Thao tác',
			key: 'actions',
			align: 'center',
			render: (_value, record) => (
				<Button
					icon={<EyeOutlined />}
					type='link'
					onClick={() => {
						setViewingOrder(record);
						setOpenOrderDetail(true);
					}}
				>
					Xem
				</Button>
			),
		},
	];

	const renderDashboard = () => (
		<Space direction='vertical' size={16} style={{ width: '100%' }}>
			<Space wrap style={{ width: '100%' }}>
				<Card style={{ minWidth: 220 }}>
					<Statistic
						title='Tổng số sản phẩm'
						value={totals.totalProducts}
						prefix={<AppstoreOutlined />}
					/>
				</Card>
				<Card style={{ minWidth: 220 }}>
					<Statistic
						title='Giá trị tồn kho'
						value={totals.inventoryValue}
						precision={0}
						prefix='₫'
					/>
				</Card>
				<Card style={{ minWidth: 220 }}>
					<Statistic
						title='Tổng đơn hàng'
						value={totals.orderCount}
						prefix={<ShoppingCartOutlined />}
					/>
				</Card>
				<Card style={{ minWidth: 220 }}>
					<Statistic
						title='Doanh thu hoàn thành'
						value={totals.revenue}
						precision={0}
						prefix='₫'
					/>
				</Card>
			</Space>
			<Card title='Thống kê trạng thái đơn hàng'>
				<Space wrap>
					{statusOptions.map((status) => {
						const count = totals.statusCount[status];
						const percent = totals.orderCount ? Math.round((count / totals.orderCount) * 100) : 0;
						return (
							<Space key={status} direction='vertical' align='center'>
								<Badge count={count} showZero />
								<Text>{status}</Text>
								<Progress type='circle' percent={percent} width={80} />
							</Space>
						);
					})}
				</Space>
			</Card>
		</Space>
	);

	return (
		<div>
			{renderDashboard()}
			<Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} style={{ marginTop: 16 }}>
				<Tabs.TabPane tab='Quản lý Sản phẩm' key='products'>
					<Space direction='vertical' size={16} style={{ width: '100%' }}>
						<Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
							<Space wrap>
								<Input.Search
									allowClear
									placeholder='Tìm kiếm theo tên sản phẩm'
									value={productSearch}
									onChange={(event) => setProductSearch(event.target.value)}
									style={{ width: 220 }}
								/>
								<Select
									allowClear
									placeholder='Lọc theo danh mục'
									style={{ width: 180 }}
									value={categoryFilter}
									onChange={(value) => setCategoryFilter(value)}
									options={categories.map((item) => ({ value: item, label: item }))}
								/>
								<Select
									allowClear
									placeholder='Lọc trạng thái'
									style={{ width: 150 }}
									value={statusFilter}
									onChange={(value) => setStatusFilter(value)}
									options={['Còn hàng', 'Sắp hết', 'Hết hàng'].map((item) => ({ value: item, label: item }))}
								/>
							</Space>
							<Button type='primary' icon={<PlusCircleOutlined />} onClick={handleOpenAddProduct}>
								Thêm sản phẩm
							</Button>
						</Space>
						<Space wrap style={{ width: '100%' }}>
							<Space direction='vertical' style={{ width: 260 }}>
								<Text>Khoảng giá</Text>
								<Slider
									range
									min={priceBounds[0]}
									max={priceBounds[1] || 30000000}
									value={priceRange}
									onChange={(value) => setPriceRange(value as [number, number])}
								/>
							</Space>
							<Select
								style={{ width: 200 }}
								value={productSort}
								onChange={(value) => setProductSort(value)}
								options={[
									{ value: 'name-asc', label: 'Tên A-Z' },
									{ value: 'name-desc', label: 'Tên Z-A' },
									{ value: 'price-asc', label: 'Giá tăng dần' },
									{ value: 'price-desc', label: 'Giá giảm dần' },
									{ value: 'quantity-asc', label: 'Số lượng tăng dần' },
									{ value: 'quantity-desc', label: 'Số lượng giảm dần' },
								]}
							/>
						</Space>
						<Table<ProductItem>
							rowKey='id'
							columns={productColumns}
							dataSource={filteredProducts}
							pagination={{ pageSize: 5 }}
						/>
					</Space>
				</Tabs.TabPane>
				<Tabs.TabPane tab='Quản lý Đơn hàng' key='orders'>
					<Space direction='vertical' size={16} style={{ width: '100%' }}>
						<Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
							<Space wrap>
								<Input.Search
									allowClear
									placeholder='Tìm theo mã đơn hoặc khách hàng'
									value={orderSearch}
									onChange={(event) => setOrderSearch(event.target.value)}
									style={{ width: 240 }}
								/>
								<Select
									allowClear
									placeholder='Lọc trạng thái'
									style={{ width: 180 }}
									value={orderStatusFilter}
									onChange={(value) => setOrderStatusFilter(value)}
									options={statusOptions.map((status) => ({ value: status, label: status }))}
								/>
								<RangePicker value={orderDateRange as [moment.Moment, moment.Moment] | null} onChange={setOrderDateRange} />
								<Select
									style={{ width: 200 }}
									value={orderSort}
									onChange={(value) => setOrderSort(value)}
									options={[
										{ value: 'date-desc', label: 'Ngày tạo mới nhất' },
										{ value: 'date-asc', label: 'Ngày tạo cũ nhất' },
										{ value: 'total-desc', label: 'Tổng tiền cao - thấp' },
										{ value: 'total-asc', label: 'Tổng tiền thấp - cao' },
									]}
								/>
							</Space>
							<Button type='primary' icon={<PlusCircleOutlined />} onClick={handleOpenOrderModal}>
								Tạo đơn hàng
							</Button>
						</Space>
						<Table<OrderItem>
							rowKey='id'
							columns={orderColumns}
							dataSource={filteredOrders}
							pagination={{ pageSize: 5 }}
						/>
					</Space>
				</Tabs.TabPane>
			</Tabs>

			<Modal
				title={editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
				visible={openProductModal}
				onCancel={() => {
					setOpenProductModal(false);
					productForm.resetFields();
				}}
				onOk={handleSaveProduct}
				okText={editingProduct ? 'Cập nhật' : 'Thêm'}
				cancelText='Hủy'
				destroyOnClose
			>
				<Form form={productForm} layout='vertical'>
					<Form.Item
						label='Tên sản phẩm'
						name='name'
						rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
					>
						<Input placeholder='Nhập tên sản phẩm' />
					</Form.Item>
					<Form.Item
						label='Danh mục'
						name='category'
						rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
					>
						<Select
							placeholder='Chọn danh mục'
							options={categories.map((item) => ({ value: item, label: item }))}
						/>
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
							formatter={(value) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
							parser={(value?: string) =>
                                value ? Number(value.replace(/,/g, '')) : 1
                              }
							placeholder='Nhập giá sản phẩm'
						/>
					</Form.Item>
					<Form.Item
						label='Số lượng'
						name='quantity'
						rules={[
							{ required: true, message: 'Vui lòng nhập số lượng' },
							{ type: 'number', min: 0, message: 'Số lượng phải là số nguyên' },
						]}
					>
						<InputNumber style={{ width: '100%' }} min={0} precision={0} placeholder='Nhập số lượng' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Tạo đơn hàng mới'
				visible={openOrderModal}
				onCancel={() => {
					setOpenOrderModal(false);
					orderForm.resetFields();
				}}
				onOk={handleCreateOrder}
				okText='Tạo đơn'
				cancelText='Hủy'
				destroyOnClose
			>
				<Form form={orderForm} layout='vertical'>
					<Form.Item
						label='Tên khách hàng'
						name='customerName'
						rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
					>
						<Input placeholder='Nhập tên khách hàng' />
					</Form.Item>
					<Form.Item
						label='Số điện thoại'
						name='phone'
						rules={[
							{ required: true, message: 'Vui lòng nhập số điện thoại' },
							{
								pattern: /^[0-9]{10,11}$/,
								message: 'Số điện thoại phải từ 10-11 chữ số',
							},
						]}
					>
						<Input placeholder='Nhập số điện thoại' />
					</Form.Item>
					<Form.Item
						label='Địa chỉ'
						name='address'
						rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
					>
						<Input placeholder='Nhập địa chỉ' />
					</Form.Item>
					<Form.List
						name='items'
						rules={[
							{
								validator: async (_, items) => {
									if (!items || items.length === 0) {
										return Promise.reject(new Error('Vui lòng chọn sản phẩm'));
									}
								},
							},
						]}
					>
						{(fields, { add, remove }, { errors }) => (
							<>
								{fields.map((field, index) => (
									<Space key={field.key} align='baseline' style={{ display: 'flex' }}>
										<Form.Item
											{...field}
											name={[field.name, 'productId']}
											fieldKey={[field.fieldKey ?? '', 'productId']}
											rules={[{ required: true, message: 'Chọn sản phẩm' }]}
										>
											<Select
												placeholder='Chọn sản phẩm'
												style={{ width: 200 }}
												options={products.map((product) => ({
													value: product.id,
													label: product.name,
												}))}
											/>
										</Form.Item>
										<Form.Item
											{...field}
											name={[field.name, 'quantity']}
											fieldKey={[field.fieldKey ?? '', 'quantity']}
											rules={[
												{ required: true, message: 'Nhập số lượng' },
												{
													validator: (_, value) => {
														const productId = orderForm.getFieldValue(['items', index, 'productId']);
														const product = products.find((item) => item.id === productId);
														if (!product || value <= product.quantity) {
															return Promise.resolve();
														}
															return Promise.reject('Số lượng vượt quá tồn kho');
														},
													},
												]}
										>
											<InputNumber min={1} precision={0} placeholder='Số lượng' />
										</Form.Item>
										<Button danger type='link' onClick={() => remove(field.name)}>
											Xóa
										</Button>
									</Space>
								))}
								<Form.Item>
									<Button type='dashed' onClick={() => add()}>
										Thêm sản phẩm
									</Button>
									<Form.ErrorList errors={errors} />
								</Form.Item>
							</>
						)}
					</Form.List>
					<Card type='inner' style={{ marginTop: 16 }}>
						<Text strong>Tổng tiền: {orderTotal.toLocaleString('vi-VN')} đ</Text>
					</Card>
				</Form>
			</Modal>

			<Modal
				title='Chi tiết đơn hàng'
				visible={openOrderDetail}
				onCancel={() => setOpenOrderDetail(false)}
				footer={null}
				width={720}
				destroyOnClose
			>
				{viewingOrder && (
					<Space direction='vertical' size={16} style={{ width: '100%' }}>
						<Card type='inner'>
							<Text strong>Khách hàng:</Text> {viewingOrder.customerName}
							<br />
							<Text strong>Số điện thoại:</Text> {viewingOrder.phone}
							<br />
							<Text strong>Địa chỉ:</Text> {viewingOrder.address}
							<br />
							<Text strong>Trạng thái:</Text> {viewingOrder.status}
							<br />
							<Text strong>Ngày tạo:</Text>{' '}
							{moment(viewingOrder.createdAt).format('DD/MM/YYYY')}
						</Card>
						<Table<OrderProduct>
							rowKey='productId'
							pagination={false}
							dataSource={viewingOrder.products}
							columns={[
								{ title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
								{
									title: 'Số lượng',
									dataIndex: 'quantity',
									key: 'quantity',
									align: 'center',
								},
								{
									title: 'Đơn giá',
									dataIndex: 'price',
									key: 'price',
									align: 'right',
									render: (value: number) => `${value.toLocaleString('vi-VN')} đ`,
								},
								{
									title: 'Thành tiền',
									key: 'total',
									align: 'right',
									render: (_value, record) => `${(record.price * record.quantity).toLocaleString('vi-VN')} đ`,
								},
							]}
						/>
					</Space>
				)}
			</Modal>
		</div>
	);
};

export default QuanLySanPham;