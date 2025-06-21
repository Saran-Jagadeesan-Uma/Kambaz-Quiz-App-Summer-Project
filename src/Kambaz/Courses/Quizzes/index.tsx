import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as client from "./client";
import {
  ListGroup,
  Row,
  Col,
  Dropdown,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { BsGripVertical, BsThreeDotsVertical } from "react-icons/bs";
import { HiOutlinePencilAlt, HiCheckCircle } from "react-icons/hi";
import { useSelector } from "react-redux";

export default function Quizzes() {
  const { cid: courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<client.Quiz[]>([]);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isStudent = currentUser?.role === "STUDENT";

  const fetchQuizzes = async () => {
    if (courseId) {
      const data = await client.findQuizzesForCourse(courseId);
      setQuizzes(data);
    }
  };

  const remove = async (qid: string) => {
    await client.deleteQuiz(qid);
    await fetchQuizzes();
  };

  const togglePublish = async (quiz: client.Quiz) => {
    if (!quiz._id) return;
    await client.updateQuiz(quiz._id, {
      ...quiz,
      published: !quiz.published,
    });
    await fetchQuizzes();
  };

  const getAvailability = (quiz: client.Quiz) => {
    const now = new Date();
    const from = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
    const until = quiz.availableUntil ? new Date(quiz.availableUntil) : null;

    if (from && now < from) {
      return `Not available until ${from.toLocaleDateString()}`;
    }
    if (until && now > until) {
      return "Closed";
    }
    if (from && until && now >= from && now <= until) {
      return "Available";
    }
    return "Availability unknown";
  };

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Quizzes</h3>
        <button
          className="btn btn-success"
          onClick={() =>
            navigate(`/Kambaz/Courses/${courseId}/Quizzes/new/edit`)
                    }
        >
          + Add Quiz
        </button>
      </div>

      <ListGroup className="rounded-0">
        <ListGroup.Item className="p-0 mb-4 fs-5 border-bottom border-secondary">
          <div className="d-flex justify-content-between align-items-center p-3 ps-2 bg-secondary text-white">
            <div className="d-flex align-items-center">
              <BsGripVertical className="me-2 fs-3" />
              Quiz List
            </div>
          </div>

          <ListGroup className="wd-lessons rounded-0">
            {quizzes.length === 0 ? (
              <ListGroup.Item className="p-3 text-muted">
                No quizzes yet. Click "+ Add Quiz".
              </ListGroup.Item>
            ) : (
              quizzes.map((quiz) => (
                <ListGroup.Item key={quiz._id} className="p-3">
                  <Row className="align-items-center">
                    <Col md={1} className="d-flex align-items-center">
                      <BsGripVertical className="me-2 fs-3" />
                      <HiOutlinePencilAlt className="me-2 fs-3 text-success" />
                    </Col>
                    <Col md={9}>
                      <b
                        className="d-block text-primary text-decoration-none"
                        role="button"
                        onClick={() =>
                        navigate(`/Kambaz/Courses/${courseId}/Quizzes/${quiz._id}`)
                        }
                      >
                        {quiz.title}
                      </b>
                      <div className="text-secondary small">
                        {getAvailability(quiz)} | Due {formatDate(quiz.dueDate)} |{" "}
                        {quiz.points} pts | {quiz.questions?.length ?? 0} questions
                        {isStudent && quiz.score !== undefined
                          ? ` | Score: ${quiz.score}`
                          : ""}
                      </div>
                    </Col>
                    <Col
                      md={2}
                      className="text-end d-flex align-items-center justify-content-end"
                    >
                      {quiz.published ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Published</Tooltip>}
                        >
                          <HiCheckCircle className="me-3 text-success fs-4" />
                        </OverlayTrigger>
                      ) : (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Unpublished</Tooltip>}
                        >
                          <span
                            role="button"
                            className="me-3 fs-4"
                            onClick={() => togglePublish(quiz)}
                          >
                            🚫
                          </span>
                        </OverlayTrigger>
                      )}

                      <Dropdown as={ButtonGroup}>
                        <Dropdown.Toggle variant="light">
                          <BsThreeDotsVertical />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              navigate(
                                `/Kambaz/Courses/${courseId}/Quizzes/${quiz._id}/edit`
                              )
                            }
                          >
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => remove(quiz._id!)}>
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
}
