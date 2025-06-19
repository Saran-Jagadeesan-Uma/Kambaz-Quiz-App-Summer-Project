import { useEffect, useState } from "react";
import * as client from "./client";
import { useParams } from "react-router-dom";
import { FaPlus, FaTrash, FaPen } from "react-icons/fa";

function Quizzes() {
  const { cid: courseId } = useParams();
  const [quizzes, setQuizzes] = useState<client.Quiz[]>([]);
  const [quiz, setQuiz] = useState<client.Quiz>({
    title: "New Quiz",
    description: "",
    due: "",
    availableFrom: "",
    availableUntil: "",
    points: 0,
    published: false,
  });
  const [showForm, setShowForm] = useState(false);

  const fetchQuizzes = async () => {
    const quizzes = await client.findQuizzesForCourse(courseId!);
    setQuizzes(quizzes);
  };

  const create = async () => {
    await client.createQuiz(courseId!, quiz);
    setQuiz({
      title: "New Quiz",
      description: "",
      due: "",
      availableFrom: "",
      availableUntil: "",
      points: 0,
      published: false,
    });
    setShowForm(false);
    await fetchQuizzes();
  };

  const update = async () => {
    if (quiz._id) {
      await client.updateQuiz(quiz._id, quiz);
      setQuiz({
        title: "New Quiz",
        description: "",
        due: "",
        availableFrom: "",
        availableUntil: "",
        points: 0,
        published: false,
      });
      setShowForm(false);
      await fetchQuizzes();
    }
  };

  const remove = async (qid: string) => {
    await client.deleteQuiz(qid);
    await fetchQuizzes();
  };

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  return (
    <div>
      <h3>Quizzes</h3>

      <button
        className="btn btn-success mb-3"
        onClick={() => {
          setQuiz({
            title: "New Quiz",
            description: "",
            due: "",
            availableFrom: "",
            availableUntil: "",
            points: 0,
            published: false,
          });
          setShowForm(true);
        }}
      >
        <FaPlus /> Add Quiz
      </button>

      {showForm && (
        <div className="card p-3 mb-4">
          <input
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            className="form-control mb-2"
            placeholder="Title"
          />
          <textarea
            placeholder="Description"
            value={quiz.description}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            className="form-control mb-2"
          />
          <input
            type="date"
            value={quiz.availableFrom || ""}
            onChange={(e) =>
              setQuiz({ ...quiz, availableFrom: e.target.value })
            }
            className="form-control mb-2"
          />
          <input
            type="date"
            value={quiz.availableUntil || ""}
            onChange={(e) =>
              setQuiz({ ...quiz, availableUntil: e.target.value })
            }
            className="form-control mb-2"
          />
          <input
            type="date"
            value={quiz.due || ""}
            onChange={(e) => setQuiz({ ...quiz, due: e.target.value })}
            className="form-control mb-2"
          />
          <input
            type="number"
            placeholder="Points"
            value={quiz.points || ""}
            onChange={(e) =>
              setQuiz({ ...quiz, points: parseInt(e.target.value) || 0 })
            }
            className="form-control mb-2"
          />
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={quiz._id ? update : create}
            >
              <FaPen /> {quiz._id ? "Update" : "Create"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ul className="list-group">
        {quizzes.map((q) => (
          <li key={q._id} className="list-group-item d-flex flex-column gap-2">
            <div className="fw-bold fs-5">{q.title}</div>
            <div>{q.description}</div>
            <div className="text-muted">Course: {q.course}</div>
            <div className="text-muted">
              Quiz Type: {q.quizType} | Assignment Group: {q.assignmentGroup}
            </div>
            <div className="text-muted">
              Available From:{" "}
              {q.availableFrom
                ? new Date(q.availableFrom).toLocaleString()
                : "N/A"}
            </div>
            <div className="text-muted">
              Available Until:{" "}
              {q.availableUntil
                ? new Date(q.availableUntil).toLocaleString()
                : "N/A"}
            </div>
            <div className="text-muted">
              Due:{" "}
              {q.dueDate
                ? new Date(q.dueDate).toLocaleString()
                : q.due
                ? new Date(q.due).toLocaleString()
                : "N/A"}
            </div>
            <div className="text-muted">
              Points: {q.points} | Time Limit: {q.timeLimit} mins
            </div>
            <div className="text-muted">
              Published: {q.published ? "Yes" : "No"} | Shuffle Answers:{" "}
              {q.shuffleAnswers ? "Yes" : "No"}
            </div>
            <div className="text-muted">
              Attempts:{" "}
              {q.multipleAttempts ? `${q.maxAttempts} allowed` : "1 attempt"}
            </div>
            <div className="text-muted">
              Show Correct Answers: {q.showCorrectAnswers ? "Yes" : "No"}
            </div>
            <div className="text-muted">
              Access Code: {q.accessCode || "None"}
            </div>
            <div className="text-muted">
              One Question At A Time: {q.oneQuestionAtATime ? "Yes" : "No"}
            </div>
            <div className="text-muted">
              Webcam Required: {q.webcamRequired ? "Yes" : "No"} | Lock
              Questions After Answering:{" "}
              {q.lockQuestionsAfterAnswering ? "Yes" : "No"}
            </div>
            <div className="text-muted">
              Question IDs: {q.questions?.join(", ") || "None"}
            </div>
            <div className="d-flex gap-2 mt-2">
              <button
                className="btn btn-warning"
                onClick={() => {
                  setQuiz(q);
                  setShowForm(true);
                }}
              >
                <FaPen /> Edit
              </button>
              <button className="btn btn-danger" onClick={() => remove(q._id!)}>
                <FaTrash /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Quizzes;
