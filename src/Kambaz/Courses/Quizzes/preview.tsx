import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Form, Alert } from "react-bootstrap";
import * as client from "./client";
import * as questionClient from "./Questions/client";

type QuestionType = "Multiple Choice" | "True/False" | "Fill in the Blank";

interface Question {
  _id: string;
  title: string;
  text: string;
  type: QuestionType;
  points: number;
  choices?: string[];
  correctAnswer?: string | boolean | string[];
}

export default function QuizPreview() {
  const { quizId, cid } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!quizId) return;
      const qz = await client.findQuizById(quizId);
      const qs = await questionClient.findQuestionsForQuiz(quizId);
      setQuiz(qz);
      setQuestions(qs);
    };
    load();
  }, [quizId]);

  const handleAnswerChange = (qid: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = () => {
    let total = 0;
    for (const q of questions) {
      const answer = answers[q._id];
      const correct = q.correctAnswer;

      if (q.type === "Multiple Choice" || q.type === "Fill in the Blank") {
        if (typeof correct === "string" && answer === correct) {
          total += q.points;
        } else if (Array.isArray(correct) && correct.includes(answer?.trim())) {
          total += q.points;
        }
      } else if (q.type === "True/False") {
        if (answer === correct) {
          total += q.points;
        }
      }
    }
    setScore(total);
    setSubmitted(true);
  };

  const getFeedback = (q: Question): string => {
    const given = answers[q._id];
    const correct = q.correctAnswer;
    if (q.type === "True/False") {
      return given === correct ? "✅ Correct" : "❌ Incorrect";
    }
    if (typeof correct === "string") {
      return given === correct ? "✅ Correct" : "❌ Incorrect";
    }
    if (Array.isArray(correct)) {
      return correct.includes(given?.trim()) ? "✅ Correct" : "❌ Incorrect";
    }
    return "";
  };

  if (!quiz) return <p>Loading quiz...</p>;

  const renderQuestion = (q: Question, idx: number) => (
    <Card className="mb-3" key={q._id}>
      <Card.Body>
        <h5>
          {idx + 1}. {q.title}
        </h5>
        <p>
          <i>{q.text}</i>
        </p>
        <p>
          <b>{q.points} points</b>
        </p>

        {q.type === "Multiple Choice" && q.choices && (
          <Form>
            {q.choices.map((choice, i) => (
              <Form.Check
                type="radio"
                key={i}
                name={`q-${q._id}`}
                label={choice}
                value={choice}
                disabled={submitted}
                checked={answers[q._id] === choice}
                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
              />
            ))}
          </Form>
        )}

        {q.type === "True/False" && (
          <Form>
            <Form.Check
              type="radio"
              label="True"
              name={`q-${q._id}`}
              disabled={submitted}
              checked={answers[q._id] === true}
              onChange={() => handleAnswerChange(q._id, true)}
            />
            <Form.Check
              type="radio"
              label="False"
              name={`q-${q._id}`}
              disabled={submitted}
              checked={answers[q._id] === false}
              onChange={() => handleAnswerChange(q._id, false)}
            />
          </Form>
        )}

        {q.type === "Fill in the Blank" && (
          <Form.Control
            type="text"
            value={answers[q._id] || ""}
            disabled={submitted}
            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
          />
        )}

        {submitted && <p className="mt-2">{getFeedback(q)}</p>}
      </Card.Body>
    </Card>
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3>{quiz.title}</h3>
          <p>{quiz.description}</p>
        </div>
        <Button
          variant="outline-primary"
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${quizId}`)}
        >
          Back to details
        </Button>
      </div>

      {submitted && (
        <Alert variant="info">
          Your Score:{" "}
          <strong>
            {score} / {questions.reduce((sum, q) => sum + q.points, 0)}
          </strong>
        </Alert>
      )}

      {questions.length === 0 ? (
        <Alert variant="warning">No questions in this quiz.</Alert>
      ) : quiz.oneQuestionAtATime ? (
        <>
          {renderQuestion(questions[currentIndex], currentIndex)}
          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Previous
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button onClick={() => setCurrentIndex((i) => i + 1)}>
                Next
              </Button>
            ) : (
              !submitted && (
                <Button variant="success" onClick={handleSubmit}>
                  Submit Preview
                </Button>
              )
            )}
          </div>
        </>
      ) : (
        <>
          {questions.map(renderQuestion)}
          {!submitted && (
            <Button variant="success" onClick={handleSubmit}>
              Submit Preview
            </Button>
          )}
        </>
      )}
    </div>
  );
}
