import { Button, Card, InputNumber, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

const MAX_TURNS = 10;
const MIN = 1;
const MAX = 100;

const randomNumber = () => Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

const DoanSoPage: React.FC = () => {
	const [target, setTarget] = useState<number>(() => randomNumber());
	const [guess, setGuess] = useState<number | null>(null);
	const [turn, setTurn] = useState<number>(0);
	const [message, setMessage] = useState<string>('Hệ thống đã sẵn sàng, hãy nhập số bạn dự đoán!');
	const [done, setDone] = useState<boolean>(false);

	const turnsLeft = useMemo(() => MAX_TURNS - turn, [turn]);

	const resetGame = () => {
		setTarget(randomNumber());
		setGuess(null);
		setTurn(0);
		setDone(false);
		setMessage('Trò chơi mới bắt đầu, chúc bạn may mắn!');
	};

	const submitGuess = () => {
		if (guess === null || done) return;

		const nextTurn = turn + 1;
		setTurn(nextTurn);

		if (guess === target) {
			setMessage('Chúc mừng! Bạn đã đoán đúng!');
			setDone(true);
			return;
		}

		if (nextTurn >= MAX_TURNS) {
			setMessage(`Bạn đã hết lượt! Số đúng là ${target}.`);
			setDone(true);
			return;
		}

		if (guess < target) {
			setMessage('Bạn đoán quá thấp!');
		} else {
			setMessage('Bạn đoán quá cao!');
		}
	};

	return (
		<Card title='Bài 1 - Trò chơi đoán số'>
			<Space direction='vertical' size='middle' style={{ width: '100%' }}>
				<Typography.Text>
					Hệ thống sinh số ngẫu nhiên từ {MIN} đến {MAX}. Bạn có tối đa {MAX_TURNS} lượt đoán.
				</Typography.Text>
				<Space wrap>
					<InputNumber
						min={MIN}
						max={MAX}
						value={guess ?? undefined}
						onChange={(value) => setGuess(typeof value === 'number' ? value : null)}
						disabled={done}
					/>
					<Button type='primary' onClick={submitGuess} disabled={done || guess === null}>
						Đoán số
					</Button>
					<Button onClick={resetGame}>Chơi lại</Button>
				</Space>
				<Typography.Text>Lượt còn lại: {turnsLeft}</Typography.Text>
				<Typography.Paragraph strong>{message}</Typography.Paragraph>
			</Space>
		</Card>
	);
};

export default DoanSoPage;