import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as client from "./client";
import { useSelector } from "react-redux";
import { Button, Card, Row, Col } from "react-bootstrap";

export default function QuizDetails() {
  const { quizId, cid } = useParams();
  const [quiz, setQuiz] = useState<client.Quiz | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";
  const isStudent = currentUser?.role === "STUDENT";

  const fetchQuiz = async () => {
    if (!quizId) return;
    try {
      const data = await client.findQuizById(quizId);
      setQuiz(data);
    } catch (e) {
      console.error("Failed to load quiz", e);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const formatDate = (date?: string) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleString();
  };

  const handleUnpublish = async () => {
    if (!quiz?._id) return;
    try {
      const updated = { ...quiz, published: false };
      await client.updateQuiz(quiz._id, updated);
      setQuiz(updated);
    } catch (e) {
      console.error("Failed to unpublish quiz", e);
    }
  };

  const handlePublish = async () => {
    if (!quiz?._id) return;
    try {
      const updated = { ...quiz, published: true };
      await client.updateQuiz(quiz._id, updated);
      setQuiz(updated);
    } catch (e) {
      console.error("Failed to publish quiz", e);
    }
  };

  if (!quiz) return <div>Loading quiz...</div>;

  return (
    <div className="p-4">
      <h3 className="mb-3">{quiz.title}</h3>
      <p className="text-muted">{quiz.description}</p>

      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col md={6}>
              <b>Due Date:</b> {formatDate(quiz.dueDate)}
            </Col>
            <Col md={6}>
              <b>Points:</b> {quiz.points}
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <b>Available From:</b> {formatDate(quiz.availableFrom)}
            </Col>
            <Col md={6}>
              <b>Available Until:</b> {formatDate(quiz.availableUntil)}
            </Col>
          </Row>

          {isFaculty && (
            <>
              <hr />
              <Row>
                <Col md={6}>
                  <b>Quiz Type:</b> {quiz.quizType}
                </Col>
                <Col md={6}>
                  <b>Assignment Group:</b> {quiz.assignmentGroup}
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <b>Shuffle Answers:</b> {quiz.shuffleAnswers ? "Yes" : "No"}
                </Col>
                <Col md={6}>
                  <b>Time Limit:</b> {quiz.timeLimit} mins
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <b>Multiple Attempts:</b>{" "}
                  {quiz.multipleAttempts ? `Yes (${quiz.maxAttempts})` : "No"}
                </Col>
                <Col md={6}>
                  <b>Show Correct Answers:</b>{" "}
                  {quiz.showCorrectAnswers ? "Yes" : "No"}
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <b>Access Code:</b> {quiz.accessCode || "None"}
                </Col>
                <Col md={6}>
                  <b>One Question at a Time:</b>{" "}
                  {quiz.oneQuestionAtATime ? "Yes" : "No"}
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <b>Webcam Required:</b> {quiz.webcamRequired ? "Yes" : "No"}
                </Col>
                <Col md={6}>
                  <b>Lock After Answering:</b>{" "}
                  {quiz.lockQuestionsAfterAnswering ? "Yes" : "No"}
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex gap-2">
        {isFaculty && (
          <>
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`/Kambaz/Courses/${cid}/Quizzes/${quizId}/edit`)
              }
            >
              Edit
            </Button>
            <Button
              variant="info"
              onClick={() =>
                navigate(`/Kambaz/Courses/${cid}/Quizzes/${quizId}/preview`)
              }
            >
              Preview
            </Button>
            {quiz.published ? (
              <Button variant="danger" onClick={handleUnpublish}>
                Unpublish Quiz
              </Button>
            ) : (
              <Button variant="success" onClick={handlePublish}>
                Publish Quiz
              </Button>
            )}
          </>
        )}
        {isStudent && (
          <Button
            variant="primary"
            onClick={() =>
              navigate(`/Kambaz/Courses/${cid}/Quizzes/${quizId}/take`)
            }
          >
            Start Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
