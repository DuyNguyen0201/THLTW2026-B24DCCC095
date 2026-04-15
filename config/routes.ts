export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/van-bang',
		name: 'VanBang',
		icon: 'BookOutlined',
		component: './VanBang',
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},
	{
		path: '/thuc-hanh-03',
		name: 'Practice03',
		icon: 'CalendarOutlined',
		component: './DatLichHen',
	},
	{
		path: '/bai-thuc-hanh',
		name: 'BaiThucHanh',
		icon: 'ExperimentOutlined',
		routes: [
			{
				path: '/bai-thuc-hanh',
				redirect: '/bai-thuc-hanh/doan-so',
			},
			{
				path: '/bai-thuc-hanh/doan-so',
				name: 'DoanSo',
				component: './BaiThucHanh/DoanSo',
			},
			{
				path: '/bai-thuc-hanh/quan-ly-hoc-tap',
				name: 'QuanLyHocTap',
				component: './BaiThucHanh/QuanLyHocTap',
			},
		],
	},
	{
		path: '/quan-ly-san-pham',
		name: 'QuanLySanPham',
		icon: 'AppstoreOutlined',
		component: './QuanLySanPham',
	},
	{
		path: '/thuc-hanh-05',
		name: 'Practice05',
		icon: 'TeamOutlined',
		component: './ThucHanh05',
	},
	{
		path: '/travel-planner',
		name: 'TravelPlanner',
		icon: 'CompassOutlined',
		component: './TravelPlanner',
	},
	{
        path: '/KTGK/quan-ly-phong-hoc',
        name: 'Quản Lý phòng học',
        icon: 'TeamOutlined',
        component: './QuanLyPhongHoc',
    },


	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		name: 'ThucHanh02',
		path: '/thuc-hanh-02',
		icon: 'BookOutlined',
		routes: [
			{
				name: 'ThucHanh02.Bai1',
				path: 'oan-tu-ti',
				component: './ThucHanh02/OanTuTi',
			},
			{
				name: 'ThucHanh02.Bai2',
				path: 'quan-ly-ngan-hang-cau-hoi',
				component: './ThucHanh02/QuanLyNganHangCauHoi',
			},
		],
	},

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
		redirect: '/dashboard',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
