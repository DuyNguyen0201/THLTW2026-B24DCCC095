import dayjs from 'dayjs';

export type WorkoutType = 'Cardio' | 'Strength' | 'Yoga' | 'HIIT' | 'Other';
export type WorkoutStatus = 'Hoàn thành' | 'Bỏ lỡ';

export interface WorkoutLogItem {
  id: string;
  date: string;
  type: WorkoutType;
  duration: number;
  calories: number;
  note: string;
  status: WorkoutStatus;
}

export interface HealthLogItem {
  id: string;
  date: string;
  weight: number;
  height: number;
  restingHeartRate: number;
  sleepHours: number;
}

export type GoalType = 'Giảm cân' | 'Tăng cơ' | 'Cải thiện sức bền' | 'Khác';
export type GoalStatus = 'Đang thực hiện' | 'Đã đạt' | 'Đã hủy';

export interface GoalItem {
  id: string;
  name: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: GoalStatus;
}

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
export type Difficulty = 'Dễ' | 'Trung bình' | 'Khó';

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  description: string;
  instruction: string;
  avgCaloriesPerHour: number;
}

export const workoutTypeOptions: WorkoutType[] = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Other'];
export const workoutStatusOptions: WorkoutStatus[] = ['Hoàn thành', 'Bỏ lỡ'];
export const goalTypeOptions: GoalType[] = ['Giảm cân', 'Tăng cơ', 'Cải thiện sức bền', 'Khác'];
export const goalStatusOptions: GoalStatus[] = ['Đang thực hiện', 'Đã đạt', 'Đã hủy'];
export const muscleGroupOptions: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
export const difficultyOptions: Difficulty[] = ['Dễ', 'Trung bình', 'Khó'];

export const initialWorkouts: WorkoutLogItem[] = [
  { id: 'w1', date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), type: 'Cardio', duration: 45, calories: 380, note: 'Chạy bộ công viên', status: 'Hoàn thành' },
  { id: 'w2', date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), type: 'Strength', duration: 60, calories: 420, note: 'Tập tạ thân trên', status: 'Hoàn thành' },
  { id: 'w3', date: dayjs().subtract(4, 'day').format('YYYY-MM-DD'), type: 'Yoga', duration: 40, calories: 180, note: 'Giãn cơ phục hồi', status: 'Hoàn thành' },
  { id: 'w4', date: dayjs().subtract(6, 'day').format('YYYY-MM-DD'), type: 'HIIT', duration: 30, calories: 350, note: 'Circuit 20/10', status: 'Bỏ lỡ' },
  { id: 'w5', date: dayjs().subtract(8, 'day').format('YYYY-MM-DD'), type: 'Other', duration: 50, calories: 280, note: 'Đạp xe nhẹ', status: 'Hoàn thành' },
];

export const initialHealthLogs: HealthLogItem[] = [
  { id: 'h1', date: dayjs().subtract(20, 'day').format('YYYY-MM-DD'), weight: 74, height: 172, restingHeartRate: 68, sleepHours: 7 },
  { id: 'h2', date: dayjs().subtract(14, 'day').format('YYYY-MM-DD'), weight: 73.5, height: 172, restingHeartRate: 67, sleepHours: 7.2 },
  { id: 'h3', date: dayjs().subtract(8, 'day').format('YYYY-MM-DD'), weight: 73, height: 172, restingHeartRate: 66, sleepHours: 7.5 },
  { id: 'h4', date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), weight: 72.8, height: 172, restingHeartRate: 65, sleepHours: 7.8 },
];

export const initialGoals: GoalItem[] = [
  { id: 'g1', name: 'Giảm 5kg', type: 'Giảm cân', targetValue: 5, currentValue: 2.2, deadline: dayjs().add(60, 'day').format('YYYY-MM-DD'), status: 'Đang thực hiện' },
  { id: 'g2', name: 'Squat 100kg', type: 'Tăng cơ', targetValue: 100, currentValue: 85, deadline: dayjs().add(120, 'day').format('YYYY-MM-DD'), status: 'Đang thực hiện' },
  { id: 'g3', name: 'Chạy 10km < 55 phút', type: 'Cải thiện sức bền', targetValue: 100, currentValue: 100, deadline: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), status: 'Đã đạt' },
];

export const initialExercises: ExerciseItem[] = [
  { id: 'e1', name: 'Push-up', muscleGroup: 'Chest', difficulty: 'Dễ', description: 'Hít đất cơ bản tăng sức mạnh thân trên.', instruction: 'Giữ người thẳng, hạ ngực gần sàn rồi đẩy lên. 3 hiệp x 12 lần.', avgCaloriesPerHour: 320 },
  { id: 'e2', name: 'Deadlift', muscleGroup: 'Back', difficulty: 'Khó', description: 'Bài compound cho lưng dưới và chân sau.', instruction: 'Giữ lưng trung lập, đẩy hông ra sau, nâng tạ sát ống chân.', avgCaloriesPerHour: 480 },
  { id: 'e3', name: 'Plank', muscleGroup: 'Core', difficulty: 'Trung bình', description: 'Tăng sức bền cơ trung tâm.', instruction: 'Giữ khuỷu tay dưới vai, siết core, giữ 30-60 giây.', avgCaloriesPerHour: 250 },
];
