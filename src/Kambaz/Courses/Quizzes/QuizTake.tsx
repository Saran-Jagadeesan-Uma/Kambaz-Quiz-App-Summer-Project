import { useEffect, useState } from "react";
import { Button, Card, Form, Alert, ProgressBar } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
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

interface Attempt {
  _id?: string;
  student: string;
  quiz: string;
  answers: { question: string; selected: any; correct: boolean }[];
  score: number;
  submittedAt?: string;
}

export default function QuizTake() {
  const { quizId } = useParams();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(1);
  const [previousAttempts, setPreviousAttempts] = useState<Attempt[]>([]);

  const fetchQuizData = async () => {
    if (!quizId || !currentUser) return;

    const qz = await client.findQuizById(quizId);
    const qs = await questionClient.findQuestionsForQuiz(quizId);
    setQuiz(qz);
    setQuestions(qs);

    const attempts = await client.getAttemptsForStudent(
      quizId,
      currentUser._id
    );
    setPreviousAttempts(attempts || []);

    if (qz.multipleAttempts && currentUser?._id) {
      const count = await client.getAttemptCount(quizId, currentUser._id);
      setAttemptsLeft((qz.maxAttempts ?? 1) - count);
    } else {
      setAttemptsLeft(1);
    }

    if (attempts && attempts.length > 0) {
      const lastAttempt = attempts[attempts.length - 1];
      setAnswers(
        lastAttempt.answers.reduce((acc: Record<string, any>, ans: any) => {
          acc[ans.question] = ans.selected;
          return acc;
        }, {})
      );
      setScore(lastAttempt.score);
      setSubmitted(true);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  const handleChange = (qid: string, value: any) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (submitted) return;

    let total = 0;
    const result = {
      student: currentUser._id,
      quiz: quizId,
      answers: [] as any[],
      score: 0,
    };

    for (const q of questions) {
      const given = answers[q._id];
      let correct = false;

      if (q.type === "True/False" || q.type === "Multiple Choice") {
        correct = given === q.correctAnswer;
      } else if (q.type === "Fill in the Blank") {
        if (Array.isArray(q.correctAnswer)) {
          correct =
            Array.isArray(given) &&
            given.length === q.correctAnswer.length &&
            given.every(
              (ans, i) =>
                ans?.toLowerCase().trim() ===
                (q.correctAnswer as string[])[i]?.toLowerCase().trim()
            );
        }
      }

      result.answers.push({ question: q._id, selected: given, correct });
      if (correct) total += q.points;
    }

    result.score = total;
    const saved = await client.submitAttempt(quizId!, result);
    setScore(saved.score);
    setSubmitted(true);

    const attempts = await client.getAttemptsForStudent(
      quiz._id || quizId,
      currentUser._id
    );
    setPreviousAttempts(attempts || []);

    if (quiz.multipleAttempts && currentUser?._id) {
      const count = await client.getAttemptCount(
        quiz._id || quizId,
        currentUser._id
      );
      setAttemptsLeft((quiz.maxAttempts ?? 1) - count);
    } else {
      setAttemptsLeft(0);
    }
  };

  const resetQuiz = () => {
    setSubmitted(false);
    setAnswers({});
    setScore(null);
    setCurrentIndex(0);
  };

  const currentQuestion = questions[currentIndex];
  const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);

  if (!quiz || questions.length === 0) return <p>Loading quiz...</p>;

  return (
    <div>
      {!submitted ? (
        <>
          <h4>
            Question {currentIndex + 1} of {questions.length}
          </h4>
          <ProgressBar
            now={((currentIndex + 1) / questions.length) * 100}
            label={`${Math.round(
              ((currentIndex + 1) / questions.length) * 100
            )}%`}
            className="mb-3"
          />

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>{currentQuestion.title}</Card.Title>
              <Card.Text>{currentQuestion.text}</Card.Text>

              {currentQuestion.type === "Multiple Choice" &&
                currentQuestion.choices?.map((c, idx) => (
                  <Form.Check
                    key={idx}
                    type="radio"
                    name={currentQuestion._id}
                    label={c}
                    checked={answers[currentQuestion._id] === c}
                    onChange={() => handleChange(currentQuestion._id, c)}
                  />
                ))}

              {currentQuestion.type === "True/False" && (
                <>
                  <Form.Check
                    type="radio"
                    name={currentQuestion._id}
                    label="True"
                    checked={answers[currentQuestion._id] === true}
                    onChange={() => handleChange(currentQuestion._id, true)}
                  />
                  <Form.Check
                    type="radio"
                    name={currentQuestion._id}
                    label="False"
                    checked={answers[currentQuestion._id] === false}
                    onChange={() => handleChange(currentQuestion._id, false)}
                  />
                </>
              )}

              {currentQuestion.type === "Fill in the Blank" &&
                Array.isArray(currentQuestion.correctAnswer) &&
                currentQuestion.correctAnswer.map((_, idx) => (
                  <Form.Control
                    key={idx}
                    className="mb-2"
                    type="text"
                    placeholder={`Blank ${idx + 1}`}
                    value={answers[currentQuestion._id]?.[idx] || ""}
                    onChange={(e) => {
                      const currentAnswers = answers[currentQuestion._id] || [];
                      currentAnswers[idx] = e.target.value;
                      handleChange(currentQuestion._id, [...currentAnswers]);
                    }}
                  />
                ))}
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-between align-items-center">
            <Button
              variant="secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                Next
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit}>
                Submit Quiz
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <h4>Quiz Submitted!</h4>
          <p>
            Your Score: {score} / {totalPossiblePoints}
          </p>

          {questions.map((q) => {
            const selected = answers[q._id];
            let correct = false;

            if (q.type === "True/False" || q.type === "Multiple Choice") {
              correct = selected === q.correctAnswer;
            } else if (q.type === "Fill in the Blank") {
              if (Array.isArray(q.correctAnswer)) {
                correct =
                  Array.isArray(selected) &&
                  selected.length === q.correctAnswer.length &&
                  selected.every(
                    (ans, i) =>
                      ans?.toLowerCase().trim() ===
                      (q.correctAnswer as string[])[i]?.toLowerCase().trim()
                  );
              }
            }

            return (
              <Card key={q._id} className="mb-3 border">
                <Card.Body>
                  <Card.Title>
                    {q.title} — {correct ? "✔" : "❌"}
                  </Card.Title>
                  <Card.Text>{q.text}</Card.Text>
                  <p>
                    <b>Your Answer:</b>{" "}
                    {Array.isArray(selected)
                      ? selected.join(", ")
                      : selected?.toString()}
                  </p>
                  {!correct && (
                    <p>
                      <b>Correct Answer:</b>{" "}
                      {Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.join(", ")
                        : q.correctAnswer?.toString()}
                    </p>
                  )}
                </Card.Body>
              </Card>
            );
          })}

          {attemptsLeft > 0 && (
            <Button variant="primary" onClick={resetQuiz}>
              Retake Quiz ({attemptsLeft} attempt
              {attemptsLeft > 1 ? "s" : ""} left)
            </Button>
          )}
          {attemptsLeft <= 0 && (
            <Alert variant="danger">You have no attempts left.</Alert>
          )}

          <hr />

          <h5>Previous Attempts</h5>
          {previousAttempts.length === 0 && <p>No previous attempts.</p>}
          {previousAttempts.map((attempt, idx) => (
            <Card key={idx} className="mb-3 border">
              <Card.Body>
                <Card.Title>
                  Attempt {idx + 1} - Score: {attempt.score}
                </Card.Title>
                {attempt.submittedAt && (
                  <small className="text-muted">
                    Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                  </small>
                )}
                {attempt.answers.map((ans, i) => {
                  const question = questions.find(
                    (q) => q._id === ans.question
                  );
                  if (!question) return null;
                  return (
                    <div key={i} className="mt-2">
                      <b>{question.title}:</b> Your answer:{" "}
                      {Array.isArray(ans.selected)
                        ? ans.selected.join(", ")
                        : ans.selected?.toString()}{" "}
                      — {ans.correct ? "✔" : "❌"}
                      {!ans.correct && (
                        <div>
                          Correct answer:{" "}
                          {Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.join(", ")
                            : question.correctAnswer?.toString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
