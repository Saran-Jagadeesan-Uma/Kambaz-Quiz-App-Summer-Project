import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as client from "./client";
import { FaPlus, FaTrash, FaPen } from "react-icons/fa";

function Quizzes() {
  const { cid: courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<client.Quiz[]>([]);

  const fetchQuizzes = async () => {
    if (courseId) {
      const data = await client.findQuizzesForCourse(courseId);
      console.log("📡 Fetched quizzes:", data); // ✅ log the API response
      setQuizzes(data);
    }
  };

  const remove = async (qid: string) => {
    await client.deleteQuiz(qid);
    await fetchQuizzes();
  };

  useEffect(() => {
    console.log("📘 courseId:", courseId); // ✅ log current courseId
    fetchQuizzes();
  }, [courseId]);

  return (
    <div>
      <h3>Quizzes</h3>

      <button
        className="btn btn-success mb-3"
        onClick={() => navigate(`/Kambaz/Courses/${courseId}/Quizzes/new`)}
      >
        <FaPlus /> Add Quiz
      </button>

      {quizzes.length === 0 && (
        <div className="alert alert-info">
          No quizzes yet. Click "+ Add Quiz".
        </div>
      )}

      <ul className="list-group">
        {quizzes.map((q, i) => {
          console.log(`📌 Quiz ${i}:`, q); // ✅ log each quiz
          return (
            <li key={q._id} className="list-group-item">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-bold">{q.title}</div>
                  <div className="text-muted">
                    Due: {q.dueDate?.substring(0, 10) || "N/A"} | Points:{" "}
                    {q.points}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-warning"
                    onClick={() =>
                      navigate(
                        `/Kambaz/Courses/${courseId}/Quizzes/${q._id}/edit`
                      )
                    }
                  >
                    <FaPen /> Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => remove(q._id!)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Quizzes;
