import axios from "axios";

const axiosWithCredentials = axios.create({ withCredentials: true });
export const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
export const QUIZZES_URL = `${REMOTE_SERVER}/api/quizzes`;
export const COURSES_URL = `${REMOTE_SERVER}/api/courses`;

export interface Quiz {
  _id?: string;
  title: string;
  description?: string;
  course?: string;
  availableFrom?: string;
  availableUntil?: string;
  due?: string;
  dueDate?: string;
  points?: number;
  published?: boolean;
  quizType?: string;
  assignmentGroup?: string;
  shuffleAnswers?: boolean;
  timeLimit?: number;
  multipleAttempts?: boolean;
  maxAttempts?: number;
  showCorrectAnswers?: boolean;
  accessCode?: string;
  oneQuestionAtATime?: boolean;
  webcamRequired?: boolean;
  lockQuestionsAfterAnswering?: boolean;
  questions?: string[];
  score?: number;
}

export const findAllQuizzes = async (): Promise<Quiz[]> => {
  const { data } = await axiosWithCredentials.get(QUIZZES_URL);
  return data;
};

export const findQuizzesForCourse = async (cid: string): Promise<Quiz[]> => {
  const { data } = await axiosWithCredentials.get(
    `${COURSES_URL}/${cid}/quizzes`
  );
  return data;
};

export const findQuizById = async (qid: string): Promise<Quiz> => {
  const { data } = await axiosWithCredentials.get(`${QUIZZES_URL}/${qid}`);
  return data;
};

export const createQuiz = async (cid: string, quiz: Quiz): Promise<Quiz> => {
  const payload = { ...quiz, course: cid };
  const { data } = await axiosWithCredentials.post(
    `${COURSES_URL}/${cid}/quizzes`,
    payload
  );
  return data;
};

export const updateQuiz = async (
  qid: string,
  quiz: Partial<Quiz>
): Promise<Quiz> => {
  const { data } = await axiosWithCredentials.put(
    `${QUIZZES_URL}/${qid}`,
    quiz
  );
  return data;
};

export const deleteQuiz = async (qid: string): Promise<void> => {
  await axiosWithCredentials.delete(`${QUIZZES_URL}/${qid}`);
};

export const submitAttempt = async (quizId: string, attempt: any) =>
  axiosWithCredentials
    .post(`${QUIZZES_URL}/${quizId}/attempts`, attempt)
    .then((res) => res.data);

export const getAttemptsForStudent = async (
  quizId: string,
  studentId: string
) =>
  axiosWithCredentials
    .get(`${QUIZZES_URL}/${quizId}/attempts/${studentId}`)
    .then((res) => res.data);

export const getAttemptCount = async (quizId: string, studentId: string) =>
  axiosWithCredentials
    .get(`${QUIZZES_URL}/${quizId}/attempts/${studentId}/count`)
    .then((res) => res.data.count);
