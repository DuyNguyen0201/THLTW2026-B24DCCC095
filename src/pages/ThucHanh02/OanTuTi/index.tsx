import { Button, Card, Col, Row, Space, Table, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';

type LuaChon = 'Kéo' | 'Búa' | 'Bao';

type KetQua = 'Thắng' | 'Thua' | 'Hòa';

interface LuotChoi {
	key: number;
	nguoiChoi: LuaChon;
	mayTinh: LuaChon;
	ketQua: KetQua;
}

const CAC_LUA_CHON: LuaChon[] = ['Kéo', 'Búa', 'Bao'];

const soSanhKetQua = (nguoiChoi: LuaChon, mayTinh: LuaChon): KetQua => {
	if (nguoiChoi === mayTinh) return 'Hòa';

	const nguoiChoiThang =
		(nguoiChoi === 'Kéo' && mayTinh === 'Bao') ||
		(nguoiChoi === 'Búa' && mayTinh === 'Kéo') ||
		(nguoiChoi === 'Bao' && mayTinh === 'Búa');

	return nguoiChoiThang ? 'Thắng' : 'Thua';
};

const OanTuTiPage: React.FC = () => {
	const [lichSu, setLichSu] = useState<LuotChoi[]>([]);

	const choi = (luaChonNguoiChoi: LuaChon) => {
		const luaChonMayTinh = CAC_LUA_CHON[Math.floor(Math.random() * CAC_LUA_CHON.length)];
		const ketQua = soSanhKetQua(luaChonNguoiChoi, luaChonMayTinh);

		setLichSu((oldData) => [
			{
				key: oldData.length + 1,
				nguoiChoi: luaChonNguoiChoi,
				mayTinh: luaChonMayTinh,
				ketQua,
			},
			...oldData,
		]);
	};

	const thongKe = useMemo(() => {
		const tong = lichSu.length;
		const thang = lichSu.filter((item) => item.ketQua === 'Thắng').length;
		const thua = lichSu.filter((item) => item.ketQua === 'Thua').length;
		const hoa = lichSu.filter((item) => item.ketQua === 'Hòa').length;

		return { tong, thang, thua, hoa };
	}, [lichSu]);

	return (
		<Card title='Bài 1 - Trò chơi Oẳn Tù Tì'>
			<Space direction='vertical' size='large' style={{ width: '100%' }}>
				<div>
					<Typography.Text strong>Chọn nước đi:</Typography.Text>
					<Space style={{ marginLeft: 12 }}>
						{CAC_LUA_CHON.map((item) => (
							<Button key={item} type='primary' onClick={() => choi(item)}>
								{item}
							</Button>
						))}
					</Space>
				</div>

				<Row gutter={12}>
					<Col>
						<Tag color='blue'>Tổng ván: {thongKe.tong}</Tag>
					</Col>
					<Col>
						<Tag color='success'>Thắng: {thongKe.thang}</Tag>
					</Col>
					<Col>
						<Tag color='error'>Thua: {thongKe.thua}</Tag>
					</Col>
					<Col>
						<Tag color='default'>Hòa: {thongKe.hoa}</Tag>
					</Col>
				</Row>

				<Table<LuotChoi>
					rowKey='key'
					pagination={false}
					dataSource={lichSu}
					locale={{ emptyText: 'Chưa có lượt chơi nào' }}
					columns={[
						{ title: 'Lượt', dataIndex: 'key', width: 80 },
						{ title: 'Bạn chọn', dataIndex: 'nguoiChoi' },
						{ title: 'Máy chọn', dataIndex: 'mayTinh' },
						{
							title: 'Kết quả',
							dataIndex: 'ketQua',
							render: (value: KetQua) => {
								const color = value === 'Thắng' ? 'success' : value === 'Thua' ? 'error' : 'default';
								return <Tag color={color}>{value}</Tag>;
							},
						},
					]}
				/>
			</Space>
		</Card>
	);
};

export default OanTuTiPage;