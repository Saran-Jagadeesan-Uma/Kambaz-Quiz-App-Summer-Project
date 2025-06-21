import axios from "axios";

const axiosWithCredentials = axios.create({ withCredentials: true });

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUESTIONS_API = `${REMOTE_SERVER}/api/questions`;

export const createQuestion = async (quizId: string, question: any) => {
  try {
    const { data } = await axiosWithCredentials.post(
      `${REMOTE_SERVER}/api/quizzes/${quizId}/questions`,
      question
    );
    return data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

export const findQuestionsForQuiz = async (quizId: string) => {
  try {
    const { data } = await axiosWithCredentials.get(
      `${REMOTE_SERVER}/api/quizzes/${quizId}/questions`
    );
    return data;
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    throw error;
  }
};

export const updateQuestion = async (question: any) => {
  try {
    const { data } = await axiosWithCredentials.put(
      `${QUESTIONS_API}/${question._id}`,
      question
    );
    return data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

export const deleteQuestion = async (questionId: string) => {
  try {
    await axiosWithCredentials.delete(`${QUESTIONS_API}/${questionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};
