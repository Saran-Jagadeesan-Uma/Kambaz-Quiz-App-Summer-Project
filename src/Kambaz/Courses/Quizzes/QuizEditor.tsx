import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as client from "./client";
import QuizQuestions from "./Questions/questions";
import { Form, Button, Row, Col, Tabs, Tab } from "react-bootstrap";

export default function QuizEditor() {
  const { quizId, cid } = useParams();
  const navigate = useNavigate();
  const isNew = !quizId || quizId === "new";

  const [quiz, setQuiz] = useState<client.Quiz>({
    title: "New Quiz",
    description: "",
    dueDate: "",
    availableFrom: "",
    availableUntil: "",
    points: 0,
    published: false,
    quizType: "Graded Quiz",
    assignmentGroup: "Quizzes",
    shuffleAnswers: true,
    timeLimit: 20,
    multipleAttempts: false,
    maxAttempts: 1,
    showCorrectAnswers: false,
    accessCode: "",
    oneQuestionAtATime: true,
    webcamRequired: false,
    lockQuestionsAfterAnswering: false,
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

  const handleChange = (field: string, value: any) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const save = async (publishState?: boolean) => {
    if (!cid) return;
    try {
      const { questions, ...quizWithoutQuestions } = quiz;
      const payload = {
        ...quizWithoutQuestions,
        published: publishState ?? quiz.published,
      };

      if (isNew) {
        await client.createQuiz(cid, payload);
      } else {
        await client.updateQuiz(quizId!, payload);
      }

      navigate(`/Kambaz/Courses/${cid}/Quizzes`);
    } catch (err) {
      console.error("Error saving quiz:", err);
    }
  };

  const cancel = () => navigate(`/Kambaz/Courses/${cid}/Quizzes`);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  return (
    <div className="p-4">
      <h3 className="mb-3">{isNew ? "Create New Quiz" : "Edit Quiz"}</h3>

      <Tabs defaultActiveKey="details" className="mb-3">
        <Tab eventKey="details" title="Details">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={quiz.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={quiz.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quiz Type</Form.Label>
                  <Form.Select
                    value={quiz.quizType}
                    onChange={(e) => handleChange("quizType", e.target.value)}
                  >
                    <option>Graded Quiz</option>
                    <option>Practice Quiz</option>
                    <option>Graded Survey</option>
                    <option>Ungraded Survey</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assignment Group</Form.Label>
                  <Form.Select
                    value={quiz.assignmentGroup}
                    onChange={(e) =>
                      handleChange("assignmentGroup", e.target.value)
                    }
                  >
                    <option>Quizzes</option>
                    <option>Exams</option>
                    <option>Assignments</option>
                    <option>Project</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Points</Form.Label>
                  <Form.Control
                    type="number"
                    value={quiz.points}
                    onChange={(e) =>
                      handleChange("points", parseInt(e.target.value) || 0)
                    }
                  />
                </Form.Group>
              </Col>
              <Form.Check
                type="switch"
                id="time-limit-toggle"
                label="Set Time Limit"
                checked={(quiz.timeLimit ?? 0) > 0}
                onChange={(e) =>
                  handleChange("timeLimit", e.target.checked ? 20 : 0)
                }
              />

              {(quiz.timeLimit ?? 0) > 0 && (
                <Form.Control
                  type="number"
                  className="mt-2"
                  value={quiz.timeLimit ?? 1}
                  onChange={(e) =>
                    handleChange("timeLimit", parseInt(e.target.value) || 1)
                  }
                />
              )}
            </Row>

            <Form.Check
              type="switch"
              label="Shuffle Answers"
              checked={quiz.shuffleAnswers}
              onChange={(e) => handleChange("shuffleAnswers", e.target.checked)}
            />

            <Form.Check
              type="switch"
              label="Multiple Attempts"
              checked={quiz.multipleAttempts}
              onChange={(e) =>
                handleChange("multipleAttempts", e.target.checked)
              }
            />

            {quiz.multipleAttempts && (
              <Form.Group className="mb-3 mt-2">
                <Form.Label>Max Attempts</Form.Label>
                <Form.Control
                  type="number"
                  value={quiz.maxAttempts}
                  onChange={(e) =>
                    handleChange("maxAttempts", parseInt(e.target.value) || 1)
                  }
                />
              </Form.Group>
            )}

            <Form.Check
              type="switch"
              label="Show Correct Answers"
              checked={quiz.showCorrectAnswers}
              onChange={(e) =>
                handleChange("showCorrectAnswers", e.target.checked)
              }
            />

            <Form.Group className="mb-3">
              <Form.Label>Access Code</Form.Label>
              <Form.Control
                value={quiz.accessCode}
                onChange={(e) => handleChange("accessCode", e.target.value)}
              />
            </Form.Group>

            <Form.Check
              type="switch"
              label="One Question at a Time"
              checked={quiz.oneQuestionAtATime}
              onChange={(e) =>
                handleChange("oneQuestionAtATime", e.target.checked)
              }
            />

            <Form.Check
              type="switch"
              label="Webcam Required"
              checked={quiz.webcamRequired}
              onChange={(e) => handleChange("webcamRequired", e.target.checked)}
            />

            <Form.Check
              type="switch"
              label="Lock Questions After Answering"
              checked={quiz.lockQuestionsAfterAnswering}
              onChange={(e) =>
                handleChange("lockQuestionsAfterAnswering", e.target.checked)
              }
            />

            <Row className="mt-3">
              <Col md={4}>
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={quiz.dueDate?.substring(0, 10) || ""}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Available From</Form.Label>
                <Form.Control
                  type="date"
                  value={quiz.availableFrom?.substring(0, 10) || ""}
                  onChange={(e) =>
                    handleChange("availableFrom", e.target.value)
                  }
                />
              </Col>
              <Col md={4}>
                <Form.Label>Available Until</Form.Label>
                <Form.Control
                  type="date"
                  value={quiz.availableUntil?.substring(0, 10) || ""}
                  onChange={(e) =>
                    handleChange("availableUntil", e.target.value)
                  }
                />
              </Col>
            </Row>
          </Form>
        </Tab>

        <Tab eventKey="questions" title="Questions">
          <QuizQuestions quizId={quizId!} />
        </Tab>
      </Tabs>

      <div className="d-flex gap-2 mt-3">
        <Button variant="primary" onClick={() => save(undefined)}>
          Save
        </Button>
        <Button
          variant={quiz.published ? "warning" : "success"}
          onClick={() => save(!quiz.published)}
        >
          {quiz.published ? "Save and Unpublish" : "Save and Publish"}
        </Button>
        <Button variant="secondary" onClick={cancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
