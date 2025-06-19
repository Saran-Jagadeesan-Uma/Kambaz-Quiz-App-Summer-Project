import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as client from "./client";

function QuizEditor() {
  const params = useParams();
  const courseId = params.cid || params.courseId;
  const { quizId } = params;
  const navigate = useNavigate();

  const isNew = !quizId || quizId === "new";

  const [quiz, setQuiz] = useState<client.Quiz>({
    title: "",
    description: "",
    dueDate: "",
    availableFrom: "",
    availableUntil: "",
    points: 0,
    published: false,
  });

  const fetchQuiz = async () => {
    if (!isNew && quizId) {
      try {
        const data = await client.findQuizById(quizId);
        setQuiz(data);
      } catch (error) {
        console.error("Error loading quiz:", error);
      }
    }
  };

  const save = async () => {
    if (!courseId) {
      console.error("❌ courseId is missing.");
      return;
    }

    try {
      if (isNew) {
        await client.createQuiz(courseId, quiz);
      } else {
        await client.updateQuiz(quizId!, quiz);
      }
      navigate(`/Kambaz/Courses/${courseId}/Quizzes`);
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const cancel = () => {
    navigate(`/Kambaz/Courses/${courseId}/Quizzes`);
  };

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  return (
    <div>
      <h3>{isNew ? "Create New Quiz" : "Edit Quiz"}</h3>

      <div className="form-group mb-2">
        <label>Title</label>
        <input
          className="form-control"
          value={quiz.title}
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
        />
      </div>

      <div className="form-group mb-2">
        <label>Description</label>
        <textarea
          className="form-control"
          value={quiz.description}
          onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
        />
      </div>

      <div className="form-group mb-2">
        <label>Due Date</label>
        <input
          type="date"
          className="form-control"
          value={quiz.dueDate?.substring(0, 10) || ""}
          onChange={(e) => setQuiz({ ...quiz, dueDate: e.target.value })}
        />
      </div>

      <div className="form-group mb-2">
        <label>Available From</label>
        <input
          type="date"
          className="form-control"
          value={quiz.availableFrom?.substring(0, 10) || ""}
          onChange={(e) => setQuiz({ ...quiz, availableFrom: e.target.value })}
        />
      </div>

      <div className="form-group mb-2">
        <label>Available Until</label>
        <input
          type="date"
          className="form-control"
          value={quiz.availableUntil?.substring(0, 10) || ""}
          onChange={(e) => setQuiz({ ...quiz, availableUntil: e.target.value })}
        />
      </div>

      <div className="form-group mb-2">
        <label>Points</label>
        <input
          type="number"
          className="form-control"
          value={quiz.points || 0}
          onChange={(e) =>
            setQuiz({ ...quiz, points: parseInt(e.target.value) || 0 })
          }
        />
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={save}>
          Save
        </button>
        <button className="btn btn-secondary" onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default QuizEditor;
