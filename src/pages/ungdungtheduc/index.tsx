import {
    Card, Row, Col, Statistic, Table, Input, Select, DatePicker, Button, Modal, Form, InputNumber,
    Tag, Popconfirm, Timeline, Drawer, Progress, Segmented, Space, Typography, message,
  } from 'antd';
  import ColumnChart from '@/components/Chart/ColumnChart';
  import LineChart from '@/components/Chart/LineChart';
  import dayjs from 'dayjs';
  import React, { useMemo, useState } from 'react';
  import {
    difficultyOptions, ExerciseItem, GoalItem, goalStatusOptions, goalTypeOptions, HealthLogItem,
    initialExercises, initialGoals, initialHealthLogs, initialWorkouts, muscleGroupOptions,
    WorkoutLogItem, workoutStatusOptions, workoutTypeOptions,
  } from '../ungdungtheduc/data';
  
  const { RangePicker } = DatePicker;
  
  const bmiTag = (bmi: number) => {
    if (bmi < 18.5) return <Tag color="blue">Thiếu cân ({bmi.toFixed(1)})</Tag>;
    if (bmi < 25) return <Tag color="green">Bình thường ({bmi.toFixed(1)})</Tag>;
    if (bmi < 30) return <Tag color="gold">Thừa cân ({bmi.toFixed(1)})</Tag>;
    return <Tag color="red">Béo phì ({bmi.toFixed(1)})</Tag>;
  };
  
  const Page = () => {
    const [workouts, setWorkouts] = useState<WorkoutLogItem[]>(initialWorkouts);
    const [healthLogs, setHealthLogs] = useState<HealthLogItem[]>(initialHealthLogs);
    const [goals, setGoals] = useState<GoalItem[]>(initialGoals);
    const [exercises, setExercises] = useState<ExerciseItem[]>(initialExercises);
    const [workoutKeyword, setWorkoutKeyword] = useState('');
    const [workoutType, setWorkoutType] = useState<string>();
    const [workoutRange, setWorkoutRange] = useState<any>();
    const [workoutOpen, setWorkoutOpen] = useState(false);
    const [healthOpen, setHealthOpen] = useState(false);
    const [goalOpen, setGoalOpen] = useState(false);
    const [exerciseOpen, setExerciseOpen] = useState(false);
    const [exerciseDetail, setExerciseDetail] = useState<ExerciseItem>();
    const [editingWorkout, setEditingWorkout] = useState<WorkoutLogItem>();
    const [editingHealth, setEditingHealth] = useState<HealthLogItem>();
    const [editingExercise, setEditingExercise] = useState<ExerciseItem>();
    const [goalFilter, setGoalFilter] = useState<string>('Tất cả');
    const [exerciseKeyword, setExerciseKeyword] = useState('');
    const [muscleFilter, setMuscleFilter] = useState<string>();
    const [difficultyFilter, setDifficultyFilter] = useState<string>();
    const [wf] = Form.useForm(); const [hf] = Form.useForm(); const [gf] = Form.useForm(); const [ef] = Form.useForm();
  
    const thisMonth = dayjs().month();
    const monthWorkouts = workouts.filter((w) => dayjs(w.date).month() === thisMonth && w.status === 'Hoàn thành');
    const calories = monthWorkouts.reduce((s, i) => s + i.calories, 0);
    const streak = useMemo(() => {
      const done = workouts.filter((w) => w.status === 'Hoàn thành').map((w) => w.date);
      let count = 0;
      for (let i = 0; i < 365; i += 1) {
        const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        if (done.includes(d)) count += 1; else break;
      }
      return count;
    }, [workouts]);
    const goalProgress = goals.length ? Math.round(goals.reduce((s, g) => s + Math.min(100, (g.currentValue / g.targetValue) * 100), 0) / goals.length) : 0;
  
    const weekData = [1, 2, 3, 4, 5].map((w) => ({ week: `Tuần ${w}`, sessions: monthWorkouts.filter((x) => Math.ceil(dayjs(x.date).date() / 7) === w).length }));
    const weightData = healthLogs.map((h) => ({ date: h.date, weight: h.weight }));
  
    const filteredWorkouts = workouts.filter((w) =>
      w.type.toLowerCase().includes(workoutKeyword.toLowerCase())
      && (!workoutType || w.type === workoutType)
      && (!workoutRange || (dayjs(w.date).isAfter(workoutRange[0].subtract(1, 'day')) && dayjs(w.date).isBefore(workoutRange[1].add(1, 'day'))))
    );
  
    return <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="1. Dashboard — Trang chủ">
        <Row gutter={16}><Col span={6}><Card><Statistic title="Tổng buổi tập trong tháng" value={monthWorkouts.length} /></Card></Col>
          <Col span={6}><Card><Statistic title="Tổng calo đã đốt" value={calories} suffix="kcal" /></Card></Col>
          <Col span={6}><Card><Statistic title="Số ngày tập liên tiếp" value={streak} /></Card></Col>
          <Col span={6}><Card><Statistic title="Mục tiêu hoàn thành" value={goalProgress} suffix="%" /></Card></Col></Row>
        <Row gutter={16} style={{ marginTop: 16 }}><Col span={12}><Card title="Số buổi tập theo tuần"><ColumnChart xAxis={weekData.map((x) => x.week)} yAxis={[weekData.map((x) => x.sessions)]} yLabel={['Buổi tập']} /></Card></Col>
          <Col span={12}><Card title="Biến động cân nặng"><LineChart xAxis={weightData.map((x) => x.date)} yAxis={[weightData.map((x) => x.weight)]} yLabel={['Cân nặng']} /></Card></Col></Row>
        <Card title="5 buổi tập gần nhất" style={{ marginTop: 16 }}>
          <Timeline items={[...workouts].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()).slice(0, 5).map((w) => ({ children: `${w.date} - ${w.type} (${w.duration} phút, ${w.calories} kcal)` }))} />
        </Card>
      </Card>
  
      <Card title="2. Nhật ký tập luyện" extra={<Button type="primary" onClick={() => { setEditingWorkout(undefined); wf.resetFields(); setWorkoutOpen(true); }}>Thêm buổi tập</Button>}>
        <Space wrap style={{ marginBottom: 12 }}><Input placeholder="Tìm theo tên bài tập" value={workoutKeyword} onChange={(e) => setWorkoutKeyword(e.target.value)} />
          <Select allowClear placeholder="Lọc loại" style={{ width: 160 }} options={workoutTypeOptions.map((x) => ({ label: x, value: x }))} onChange={setWorkoutType} />
          <RangePicker onChange={setWorkoutRange} /></Space>
        <Table rowKey="id" dataSource={filteredWorkouts} columns={[
          { title: 'Ngày', dataIndex: 'date' }, { title: 'Loại bài tập', dataIndex: 'type' }, { title: 'Thời lượng (phút)', dataIndex: 'duration' },
          { title: 'Calo đốt', dataIndex: 'calories' }, { title: 'Ghi chú', dataIndex: 'note' },
          { title: 'Trạng thái', dataIndex: 'status', render: (v) => <Tag color={v === 'Hoàn thành' ? 'green' : 'red'}>{v}</Tag> },
          { title: 'Thao tác', render: (_, r: WorkoutLogItem) => <Space><Button size="small" onClick={() => { setEditingWorkout(r); wf.setFieldsValue(r); setWorkoutOpen(true); }}>Sửa</Button><Popconfirm title="Xóa buổi tập?" onConfirm={() => setWorkouts(workouts.filter((x) => x.id !== r.id))}><Button size="small" danger>Xóa</Button></Popconfirm></Space> },
        ]} />
      </Card>
  
      <Card title="3. Nhật ký chỉ số sức khỏe" extra={<Button type="primary" onClick={() => { setEditingHealth(undefined); hf.resetFields(); setHealthOpen(true); }}>Thêm chỉ số</Button>}>
        <Table rowKey="id" dataSource={healthLogs} columns={[
          { title: 'Ngày', dataIndex: 'date' }, { title: 'Cân nặng (kg)', dataIndex: 'weight' }, { title: 'Chiều cao (cm)', dataIndex: 'height' },
          { title: 'BMI', render: (_, r: HealthLogItem) => bmiTag(r.weight / (r.height / 100) ** 2) }, { title: 'Nhịp tim lúc nghỉ (bpm)', dataIndex: 'restingHeartRate' }, { title: 'Giờ ngủ', dataIndex: 'sleepHours' },
          { title: 'Thao tác', render: (_, r: HealthLogItem) => <Space><Button size="small" onClick={() => { setEditingHealth(r); hf.setFieldsValue(r); setHealthOpen(true); }}>Sửa</Button><Popconfirm title="Xóa chỉ số?" onConfirm={() => setHealthLogs(healthLogs.filter((x) => x.id !== r.id))}><Button size="small" danger>Xóa</Button></Popconfirm></Space> },
        ]} />
      </Card>
  
      <Card title="4. Quản lý mục tiêu" extra={<Space><Segmented value={goalFilter} options={['Tất cả', ...goalStatusOptions]} onChange={(v) => setGoalFilter(v as string)} /><Button type="primary" onClick={() => { gf.resetFields(); setGoalOpen(true); }}>Thêm mục tiêu</Button></Space>}>
        <Row gutter={[16, 16]}>{goals.filter((g) => goalFilter === 'Tất cả' || g.status === goalFilter).map((g) => {
          const p = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
          return <Col key={g.id} span={8}><Card title={g.name} extra={<Popconfirm title="Xóa mục tiêu?" onConfirm={() => setGoals(goals.filter((x) => x.id !== g.id))}><Button size="small" danger>Xóa</Button></Popconfirm>}>
            <Typography.Text>Loại: {g.type}</Typography.Text><br />
            <Typography.Text>Giá trị mục tiêu: {g.targetValue}</Typography.Text><br />
            <Typography.Text>Giá trị hiện tại: </Typography.Text><InputNumber value={g.currentValue} onChange={(v) => setGoals(goals.map((x) => x.id === g.id ? { ...x, currentValue: Number(v || 0) } : x))} />
            <Progress percent={p} />
            <Typography.Text>Deadline: {g.deadline}</Typography.Text><br />
            <Tag color={g.status === 'Đang thực hiện' ? 'blue' : g.status === 'Đã đạt' ? 'green' : 'red'}>{g.status}</Tag>
          </Card></Col>;
        })}</Row>
      </Card>
  
      <Card title="5. Thư viện bài tập" extra={<Button type="primary" onClick={() => { ef.resetFields(); setEditingExercise(undefined); setExerciseOpen(true); }}>Thêm bài tập</Button>}>
        <Space wrap style={{ marginBottom: 12 }}><Input placeholder="Tìm kiếm bài tập" value={exerciseKeyword} onChange={(e) => setExerciseKeyword(e.target.value)} />
          <Select allowClear placeholder="Nhóm cơ" options={muscleGroupOptions.map((x) => ({ label: x, value: x }))} onChange={setMuscleFilter} style={{ width: 180 }} />
          <Select allowClear placeholder="Mức độ" options={difficultyOptions.map((x) => ({ label: x, value: x }))} onChange={setDifficultyFilter} style={{ width: 140 }} /></Space>
        <Row gutter={[16, 16]}>{exercises.filter((e) => e.name.toLowerCase().includes(exerciseKeyword.toLowerCase()) && (!muscleFilter || e.muscleGroup === muscleFilter) && (!difficultyFilter || e.difficulty === difficultyFilter)).map((e) => <Col span={8} key={e.id}>
          <Card onClick={() => setExerciseDetail(e)} title={e.name} extra={<Tag color={e.difficulty === 'Dễ' ? 'green' : e.difficulty === 'Trung bình' ? 'gold' : 'red'}>{e.difficulty}</Tag>}>
            <p>Nhóm cơ: {e.muscleGroup}</p><p>{e.description}</p><p>Calo đốt TB/giờ: {e.avgCaloriesPerHour}</p>
            <Space><Button size="small" onClick={(evt) => { evt.stopPropagation(); setEditingExercise(e); ef.setFieldsValue(e); setExerciseOpen(true); }}>Sửa</Button>
              <Popconfirm title="Xóa bài tập?" onConfirm={(evt) => { evt?.stopPropagation(); setExercises(exercises.filter((x) => x.id !== e.id)); }}><Button size="small" danger onClick={(evt) => evt.stopPropagation()}>Xóa</Button></Popconfirm></Space>
          </Card>
        </Col>)}</Row>
      </Card>
  
      <Modal open={workoutOpen} title={editingWorkout ? 'Sửa buổi tập' : 'Thêm buổi tập'} onCancel={() => setWorkoutOpen(false)} onOk={() => wf.submit()}>
        <Form form={wf} layout="vertical" onFinish={(v) => { const item = { ...v, date: dayjs(v.date).format('YYYY-MM-DD'), id: editingWorkout?.id || `${Date.now()}` }; setWorkouts(editingWorkout ? workouts.map((x) => x.id === editingWorkout.id ? item : x) : [item, ...workouts]); setWorkoutOpen(false); }}>
          <Form.Item name="date" label="Ngày tập" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="type" label="Loại bài tập" rules={[{ required: true }]}><Select options={workoutTypeOptions.map((x) => ({ value: x, label: x }))} /></Form.Item>
          <Form.Item name="duration" label="Thời lượng" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="calories" label="Calo" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input /></Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}><Select options={workoutStatusOptions.map((x) => ({ value: x, label: x }))} /></Form.Item>
        </Form>
      </Modal>
  
      <Modal open={healthOpen} title={editingHealth ? 'Sửa chỉ số' : 'Thêm chỉ số'} onCancel={() => setHealthOpen(false)} onOk={() => hf.submit()}><Form form={hf} layout="vertical" onFinish={(v) => { const item = { ...v, date: dayjs(v.date).format('YYYY-MM-DD'), id: editingHealth?.id || `${Date.now()}` }; setHealthLogs(editingHealth ? healthLogs.map((x) => x.id === editingHealth.id ? item : x) : [item, ...healthLogs]); setHealthOpen(false); }}>
        <Form.Item name="date" label="Ngày" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item><Form.Item name="weight" label="Cân nặng" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item><Form.Item name="height" label="Chiều cao" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item><Form.Item name="restingHeartRate" label="Nhịp tim lúc nghỉ"><InputNumber style={{ width: '100%' }} /></Form.Item><Form.Item name="sleepHours" label="Giờ ngủ"><InputNumber style={{ width: '100%' }} /></Form.Item>
      </Form></Modal>
  
      <Drawer title="Thêm mục tiêu" open={goalOpen} onClose={() => setGoalOpen(false)} width={420}><Form form={gf} layout="vertical" onFinish={(v) => { setGoals([{ ...v, id: `${Date.now()}`, deadline: dayjs(v.deadline).format('YYYY-MM-DD') }, ...goals]); setGoalOpen(false); message.success('Đã thêm mục tiêu'); }}>
        <Form.Item name="name" label="Tên mục tiêu" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="type" label="Loại" rules={[{ required: true }]}><Select options={goalTypeOptions.map((x) => ({ value: x, label: x }))} /></Form.Item><Form.Item name="targetValue" label="Giá trị mục tiêu" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item><Form.Item name="currentValue" label="Giá trị hiện tại" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item><Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item><Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}><Select options={goalStatusOptions.map((x) => ({ value: x, label: x }))} /></Form.Item>
        <Button type="primary" onClick={() => gf.submit()}>Lưu mục tiêu</Button>
      </Form></Drawer>
  
      <Modal open={!!exerciseDetail} title={exerciseDetail?.name} footer={null} onCancel={() => setExerciseDetail(undefined)}><p>Nhóm cơ: {exerciseDetail?.muscleGroup}</p><p>Mức độ: {exerciseDetail?.difficulty}</p><p>{exerciseDetail?.instruction}</p></Modal>
      <Modal open={exerciseOpen} title={editingExercise ? 'Sửa bài tập' : 'Thêm bài tập'} onCancel={() => setExerciseOpen(false)} onOk={() => ef.submit()}><Form form={ef} layout="vertical" onFinish={(v) => { const item = { ...v, id: editingExercise?.id || `${Date.now()}` }; setExercises(editingExercise ? exercises.map((x) => x.id === editingExercise.id ? item : x) : [item, ...exercises]); setExerciseOpen(false); }}>
        <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="muscleGroup" label="Nhóm cơ" rules={[{ required: true }]}><Select options={muscleGroupOptions.map((x) => ({ label: x, value: x }))} /></Form.Item><Form.Item name="difficulty" label="Mức độ" rules={[{ required: true }]}><Select options={difficultyOptions.map((x) => ({ label: x, value: x }))} /></Form.Item><Form.Item name="description" label="Mô tả"><Input /></Form.Item><Form.Item name="instruction" label="Hướng dẫn"><Input.TextArea rows={4} /></Form.Item><Form.Item name="avgCaloriesPerHour" label="Calo đốt TB/giờ"><InputNumber style={{ width: '100%' }} /></Form.Item>
      </Form></Modal>
    </Space>;
  };
  
  export default Page;
  