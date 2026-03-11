import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useMemo, useState } from 'react';

type MucDoKho = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

interface KhoiKienThuc {
	id: number;
	tenKhoi: string;
}

interface MonHoc {
	id: number;
	maMon: string;
	tenMon: string;
	soTinChi: number;
}

interface CauHoi {
	id: number;
	maCauHoi: string;
	monHocId: number;
	noiDung: string;
	mucDo: MucDoKho;
	khoiKienThucId: number;
}

interface CauTrucDeThiItem {
	mucDo: MucDoKho;
	khoiKienThucId: number;
	soLuong: number;
}

interface DeThi {
	id: number;
	tenDe: string;
	monHocId: number;
	cauTruc: CauTrucDeThiItem[];
	cauHoiDuocChon: CauHoi[];
}

const MUC_DO_KHO: MucDoKho[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

const QuanLyNganHangCauHoiPage: React.FC = () => {
	const [formKhoi] = Form.useForm();
	const [formMonHoc] = Form.useForm();
	const [formCauHoi] = Form.useForm();
	const [formTimKiem] = Form.useForm();
	const [formCauTruc] = Form.useForm();
	const [formDeThi] = Form.useForm();

	const [dsKhoiKienThuc, setDsKhoiKienThuc] = useState<KhoiKienThuc[]>([
		{ id: 1, tenKhoi: 'Tổng quan' },
		{ id: 2, tenKhoi: 'Chuyên sâu' },
	]);
	const [dsMonHoc, setDsMonHoc] = useState<MonHoc[]>([{ id: 1, maMon: 'INT2201', tenMon: 'Lập trình Web', soTinChi: 3 }]);
	const [dsCauHoi, setDsCauHoi] = useState<CauHoi[]>([]);
	const [dsDeThi, setDsDeThi] = useState<DeThi[]>([]);
	const [cauTrucTam, setCauTrucTam] = useState<CauTrucDeThiItem[]>([]);

	const [ketQuaLoc, setKetQuaLoc] = useState<CauHoi[] | null>(null);

	const mapKhoi = useMemo(
		() => Object.fromEntries(dsKhoiKienThuc.map((item) => [item.id, item.tenKhoi])),
		[dsKhoiKienThuc],
	);
	const mapMon = useMemo(() => Object.fromEntries(dsMonHoc.map((item) => [item.id, item.tenMon])), [dsMonHoc]);

	const themKhoiKienThuc = (values: { tenKhoi: string }) => {
		setDsKhoiKienThuc((oldData) => [...oldData, { id: oldData.length + 1, tenKhoi: values.tenKhoi }]);
		formKhoi.resetFields();
	};

	const themMonHoc = (values: { maMon: string; tenMon: string; soTinChi: number }) => {
		setDsMonHoc((oldData) => [...oldData, { id: oldData.length + 1, ...values }]);
		formMonHoc.resetFields();
	};

	const themCauHoi = (values: Omit<CauHoi, 'id'>) => {
		setDsCauHoi((oldData) => [...oldData, { id: oldData.length + 1, ...values }]);
		formCauHoi.resetFields();
	};

	const timKiemCauHoi = (values: { monHocId?: number; mucDo?: MucDoKho; khoiKienThucId?: number }) => {
		const duLieuLoc = dsCauHoi.filter((item) => {
			const dungMon = !values.monHocId || item.monHocId === values.monHocId;
			const dungMucDo = !values.mucDo || item.mucDo === values.mucDo;
			const dungKhoi = !values.khoiKienThucId || item.khoiKienThucId === values.khoiKienThucId;

			return dungMon && dungMucDo && dungKhoi;
		});

		setKetQuaLoc(duLieuLoc);
	};

	const themDongCauTruc = (values: CauTrucDeThiItem) => {
		setCauTrucTam((oldData) => [...oldData, values]);
		formCauTruc.resetFields();
	};

	const taoDeThi = (values: { tenDe: string; monHocId: number }) => {
		if (!cauTrucTam.length) {
			message.error('Bạn cần thêm ít nhất 1 dòng cấu trúc đề thi');
			return;
		}

		const cauHoiTheoMon = dsCauHoi.filter((item) => item.monHocId === values.monHocId);
		const dsDuocChon: CauHoi[] = [];

		for (const item of cauTrucTam) {
			const duLieuPhuHop = cauHoiTheoMon.filter(
				(cauHoi) =>
					cauHoi.mucDo === item.mucDo &&
					cauHoi.khoiKienThucId === item.khoiKienThucId &&
					!dsDuocChon.some((daChon) => daChon.id === cauHoi.id),
			);

			if (duLieuPhuHop.length < item.soLuong) {
				message.error(`Không đủ câu hỏi cho mức "${item.mucDo}" và khối "${mapKhoi[item.khoiKienThucId] || ''}"`);
				return;
			}

			dsDuocChon.push(...duLieuPhuHop.slice(0, item.soLuong));
		}

		setDsDeThi((oldData) => [
			...oldData,
			{
				id: oldData.length + 1,
				tenDe: values.tenDe,
				monHocId: values.monHocId,
				cauTruc: cauTrucTam,
				cauHoiDuocChon: dsDuocChon,
			},
		]);

		message.success('Tạo đề thi thành công');
		setCauTrucTam([]);
		formDeThi.resetFields();
	};

	const dsHienThi = ketQuaLoc ?? dsCauHoi;

	return (
		<Space direction='vertical' size='large' style={{ width: '100%' }}>
			<Card title='Bài 2 - Quản lý ngân hàng câu hỏi tự luận'>
				<Typography.Paragraph>
					Hệ thống mẫu đơn giản gồm: quản lý danh mục, thêm câu hỏi, tìm kiếm câu hỏi và tạo đề thi theo cấu trúc.
				</Typography.Paragraph>
			</Card>

			<Row gutter={[16, 16]}>
				<Col xs={24} lg={12}>
					<Card title='1) Danh mục khối kiến thức'>
						<Form form={formKhoi} layout='vertical' onFinish={themKhoiKienThuc}>
							<Form.Item label='Tên khối kiến thức' name='tenKhoi' rules={[{ required: true }]}>
								<Input placeholder='VD: Nâng cao' />
							</Form.Item>
							<Button htmlType='submit' type='primary'>
								Thêm khối
							</Button>
						</Form>
						<Table<KhoiKienThuc>
							style={{ marginTop: 16 }}
							dataSource={dsKhoiKienThuc}
							rowKey='id'
							pagination={false}
							columns={[
								{ title: 'ID', dataIndex: 'id', width: 70 },
								{ title: 'Tên khối', dataIndex: 'tenKhoi' },
							]}
						/>
					</Card>
				</Col>

				<Col xs={24} lg={12}>
					<Card title='2) Danh mục môn học'>
						<Form form={formMonHoc} layout='vertical' onFinish={themMonHoc}>
							<Row gutter={8}>
								<Col span={8}>
									<Form.Item label='Mã môn' name='maMon' rules={[{ required: true }]}>
										<Input />
									</Form.Item>
								</Col>
								<Col span={10}>
									<Form.Item label='Tên môn' name='tenMon' rules={[{ required: true }]}>
										<Input />
									</Form.Item>
								</Col>
								<Col span={6}>
									<Form.Item label='Số tín chỉ' name='soTinChi' rules={[{ required: true }]}>
										<InputNumber min={1} style={{ width: '100%' }} />
									</Form.Item>
								</Col>
							</Row>
							<Button htmlType='submit' type='primary'>
								Thêm môn học
							</Button>
						</Form>
						<Table<MonHoc>
							style={{ marginTop: 16 }}
							dataSource={dsMonHoc}
							rowKey='id'
							pagination={false}
							columns={[
								{ title: 'Mã môn', dataIndex: 'maMon' },
								{ title: 'Tên môn', dataIndex: 'tenMon' },
								{ title: 'Tín chỉ', dataIndex: 'soTinChi', width: 80 },
							]}
						/>
					</Card>
				</Col>
			</Row>

			<Card title='3) Quản lý câu hỏi và tìm kiếm câu hỏi'>
				<Row gutter={16}>
					<Col xs={24} lg={12}>
						<Form form={formCauHoi} layout='vertical' onFinish={themCauHoi}>
							<Form.Item label='Mã câu hỏi' name='maCauHoi' rules={[{ required: true }]}>
								<Input />
							</Form.Item>
							<Form.Item label='Môn học' name='monHocId' rules={[{ required: true }]}>
								<Select options={dsMonHoc.map((item) => ({ value: item.id, label: `${item.maMon} - ${item.tenMon}` }))} />
							</Form.Item>
							<Form.Item label='Nội dung câu hỏi' name='noiDung' rules={[{ required: true }]}>
								<Input.TextArea rows={3} />
							</Form.Item>
							<Row gutter={8}>
								<Col span={12}>
									<Form.Item label='Mức độ khó' name='mucDo' rules={[{ required: true }]}>
										<Select options={MUC_DO_KHO.map((item) => ({ value: item, label: item }))} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label='Khối kiến thức' name='khoiKienThucId' rules={[{ required: true }]}>
										<Select options={dsKhoiKienThuc.map((item) => ({ value: item.id, label: item.tenKhoi }))} />
									</Form.Item>
								</Col>
							</Row>
							<Button htmlType='submit' type='primary'>
								Thêm câu hỏi
							</Button>
						</Form>
					</Col>
					<Col xs={24} lg={12}>
						<Form form={formTimKiem} layout='vertical' onFinish={timKiemCauHoi}>
							<Row gutter={8}>
								<Col span={8}>
									<Form.Item label='Môn học' name='monHocId'>
										<Select allowClear options={dsMonHoc.map((item) => ({ value: item.id, label: item.tenMon }))} />
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item label='Mức độ' name='mucDo'>
										<Select allowClear options={MUC_DO_KHO.map((item) => ({ value: item, label: item }))} />
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item label='Khối kiến thức' name='khoiKienThucId'>
										<Select
											allowClear
											options={dsKhoiKienThuc.map((item) => ({ value: item.id, label: item.tenKhoi }))}
										/>
									</Form.Item>
								</Col>
							</Row>
							<Space>
								<Button htmlType='submit' type='primary'>
									Tìm kiếm
								</Button>
								<Button
									onClick={() => {
										formTimKiem.resetFields();
										setKetQuaLoc(null);
									}}
								>
									Xóa lọc
								</Button>
							</Space>
						</Form>
					</Col>
				</Row>

				<Table<CauHoi>
					style={{ marginTop: 16 }}
					rowKey='id'
					dataSource={dsHienThi}
					columns={[
						{ title: 'Mã câu hỏi', dataIndex: 'maCauHoi', width: 120 },
						{ title: 'Môn học', render: (_, record) => mapMon[record.monHocId] || 'N/A', width: 180 },
						{ title: 'Nội dung', dataIndex: 'noiDung' },
						{ title: 'Mức độ', dataIndex: 'mucDo', width: 120, render: (value: MucDoKho) => <Tag>{value}</Tag> },
						{ title: 'Khối kiến thức', render: (_, record) => mapKhoi[record.khoiKienThucId] || 'N/A', width: 150 },
					]}
				/>
			</Card>

			<Card title='4) Quản lý đề thi'>
				<Row gutter={16}>
					<Col xs={24} lg={10}>
						<Typography.Text strong>Thêm 1 dòng cấu trúc đề thi</Typography.Text>
						<Form form={formCauTruc} layout='vertical' onFinish={themDongCauTruc} style={{ marginTop: 8 }}>
							<Row gutter={8}>
								<Col span={8}>
									<Form.Item label='Mức độ' name='mucDo' rules={[{ required: true }]}>
										<Select options={MUC_DO_KHO.map((item) => ({ value: item, label: item }))} />
									</Form.Item>
								</Col>
								<Col span={10}>
									<Form.Item label='Khối kiến thức' name='khoiKienThucId' rules={[{ required: true }]}>
										<Select options={dsKhoiKienThuc.map((item) => ({ value: item.id, label: item.tenKhoi }))} />
									</Form.Item>
								</Col>
								<Col span={6}>
									<Form.Item label='Số lượng' name='soLuong' rules={[{ required: true }]}>
										<InputNumber min={1} style={{ width: '100%' }} />
									</Form.Item>
								</Col>
							</Row>
							<Button htmlType='submit'>Thêm vào cấu trúc</Button>
						</Form>
					</Col>

					<Col xs={24} lg={14}>
						<Typography.Text strong>Tạo đề thi</Typography.Text>
						<Form form={formDeThi} layout='vertical' onFinish={taoDeThi} style={{ marginTop: 8 }}>
							<Row gutter={8}>
								<Col span={12}>
									<Form.Item label='Tên đề thi' name='tenDe' rules={[{ required: true }]}>
										<Input placeholder='VD: Đề giữa kỳ 1' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label='Môn học' name='monHocId' rules={[{ required: true }]}>
										<Select options={dsMonHoc.map((item) => ({ value: item.id, label: item.tenMon }))} />
									</Form.Item>
								</Col>
							</Row>
							<Button htmlType='submit' type='primary'>
								Tạo đề thi tự động
							</Button>
						</Form>
					</Col>
				</Row>

				<Table<CauTrucDeThiItem>
					style={{ marginTop: 16 }}
					rowKey={(_, index) => String(index)}
					dataSource={cauTrucTam}
					pagination={false}
					columns={[
						{ title: 'Mức độ', dataIndex: 'mucDo' },
						{ title: 'Khối kiến thức', render: (_, record) => mapKhoi[record.khoiKienThucId] || 'N/A' },
						{ title: 'Số lượng', dataIndex: 'soLuong', width: 100 },
					]}
				/>

				<Table<DeThi>
					style={{ marginTop: 16 }}
					rowKey='id'
					dataSource={dsDeThi}
					expandable={{
						expandedRowRender: (record) => (
							<ul style={{ margin: 0, paddingLeft: 16 }}>
								{record.cauHoiDuocChon.map((item) => (
									<li key={item.id}>{`${item.maCauHoi}: ${item.noiDung}`}</li>
								))}
							</ul>
						),
					}}
					columns={[
						{ title: 'Tên đề', dataIndex: 'tenDe' },
						{ title: 'Môn học', render: (_, record) => mapMon[record.monHocId] || 'N/A' },
						{ title: 'Số câu đã tạo', render: (_, record) => record.cauHoiDuocChon.length, width: 130 },
						{
							title: 'Cấu trúc đề đã lưu',
							render: (_, record) =>
								record.cauTruc
									.map((item) => `${item.mucDo} - ${mapKhoi[item.khoiKienThucId]} (${item.soLuong})`)
									.join('; '),
						},
					]}
				/>
			</Card>
		</Space>
	);
};

export default QuanLyNganHangCauHoiPage;