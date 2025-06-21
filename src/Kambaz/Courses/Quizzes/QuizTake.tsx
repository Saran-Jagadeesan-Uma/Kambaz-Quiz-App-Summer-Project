import { useEffect, useState } from "react";
import { Button, Card, Form, Alert } from "react-bootstrap";
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

export default function QuizTake() {
  const { quizId } = useParams();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(1);

  const fetchQuizData = async () => {
    if (!quizId || !currentUser) return;

    const qz = await client.findQuizById(quizId);
    const qs = await questionClient.findQuestionsForQuiz(quizId);
    setQuiz(qz);
    setQuestions(qs);

    if (qz.multipleAttempts && currentUser?._id) {
      const count = await client.getAttemptCount(quizId, currentUser._id);
      setAttemptsLeft((qz.maxAttempts ?? 1) - count);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const handleChange = (qid: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
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
        correct = (q.correctAnswer as string[])?.some(
          (a: string) => a.toLowerCase().trim() === given?.toLowerCase().trim()
        );
      }

      result.answers.push({ question: q._id, selected: given, correct });
      if (correct) total += q.points;
    }

    result.score = total;
    const saved = await client.submitAttempt(quizId!, result);
    setScore(saved.score);
    setSubmitted(true);
  };

  if (!quiz) return <p>Loading quiz...</p>;

  if (submitted) {
    return (
      <div>
        <h4>Quiz Submitted!</h4>
        <p>Your Score: {score}</p>
        {questions.map((q) => {
          const selected = answers[q._id];
          let correct = false;
          if (q.type === "True/False" || q.type === "Multiple Choice") {
            correct = selected === q.correctAnswer;
          } else {
            correct = (q.correctAnswer as string[])?.some(
              (a: string) => a.toLowerCase().trim() === selected?.toLowerCase().trim()
            );
          }

          return (
            <Card key={q._id} className="mb-3 border">
              <Card.Body>
                <Card.Title>
                  {q.title} — {correct ? "✔️" : "❌"}
                </Card.Title>
                <Card.Text>{q.text}</Card.Text>
                <p><b>Your Answer:</b> {selected?.toString()}</p>
                {!correct && (
                  <p><b>Correct Answer:</b> {Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.join(", ")
                    : q.correctAnswer?.toString()}</p>
                )}
              </Card.Body>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <h4>Take Quiz: {quiz.title}</h4>
      {attemptsLeft <= 0 && <Alert variant="danger">You have no attempts left.</Alert>}
      {questions.map((q) => (
        <Card key={q._id} className="mb-3">
          <Card.Body>
            <Card.Title>{q.title}</Card.Title>
            <Card.Text>{q.text}</Card.Text>

            {q.type === "Multiple Choice" && q.choices?.map((c, idx) => (
              <Form.Check
                key={idx}
                type="radio"
                name={q._id}
                label={c}
                checked={answers[q._id] === c}
                onChange={() => handleChange(q._id, c)}
              />
            ))}

            {q.type === "True/False" && (
              <>
                <Form.Check
                  type="radio"
                  name={q._id}
                  label="True"
                  checked={answers[q._id] === true}
                  onChange={() => handleChange(q._id, true)}
                />
                <Form.Check
                  type="radio"
                  name={q._id}
                  label="False"
                  checked={answers[q._id] === false}
                  onChange={() => handleChange(q._id, false)}
                />
              </>
            )}

            {q.type === "Fill in the Blank" && (
              <Form.Control
                type="text"
                value={answers[q._id] || ""}
                onChange={(e) => handleChange(q._id, e.target.value)}
              />
            )}
          </Card.Body>
        </Card>
      ))}
      <Button
        disabled={attemptsLeft <= 0}
        onClick={handleSubmit}
        variant="primary"
      >
        Submit Quiz
      </Button>
    </div>
  );
}
