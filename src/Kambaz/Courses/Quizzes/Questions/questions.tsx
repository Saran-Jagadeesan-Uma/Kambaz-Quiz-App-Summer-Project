import React, { useEffect, useState } from "react";
import { Button, Form, Card, Row, Col } from "react-bootstrap";
import * as questionClient from "./client";

type QuestionType = "Multiple Choice" | "True/False" | "Fill in the Blank";

interface Question {
  _id?: string;
  quizId: string;
  type: QuestionType;
  title: string;
  points: number;
  text: string;
  choices?: string[];
  correctAnswer?: string | boolean | string[];
  isEditing: boolean;
  isNew?: boolean;
}

const defaultNewQuestion = (quizId: string): Question => ({
  quizId,
  type: "Multiple Choice",
  title: "",
  text: "",
  points: 0,
  choices: ["", ""],
  correctAnswer: "",
  isEditing: true,
  isNew: true,
});

const QuizQuestions: React.FC<{ quizId: string }> = ({ quizId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await questionClient.findQuestionsForQuiz(quizId);
        const loadedQuestions = data.map((q: any) => ({
          ...q,
          isEditing: false,
        }));
        setQuestions(loadedQuestions);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId]);

  const addNewQuestion = () => {
    setQuestions((prev) => [...prev, defaultNewQuestion(quizId)]);
  };

  const updateQuestion = (
    id: string | undefined,
    updatedFields: Partial<Question>
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === id || (!q._id && q.isNew) ? { ...q, ...updatedFields } : q
      )
    );
  };

  const cancelEdit = (id: string | undefined) => {
    setQuestions((prev) =>
      prev.filter((q) => !(q._id === id || (!q._id && q.isNew)))
    );
  };

  const deleteQuestion = async (question: Question) => {
    if (question._id) {
      try {
        await questionClient.deleteQuestion(question._id);
      } catch (err) {
        console.error("Failed to delete question", err);
      }
    }
    setQuestions((prev) => prev.filter((q) => q !== question));
  };

  const saveEdit = async (question: Question) => {
    try {
      let savedQuestion;

      if (question.isNew) {
        savedQuestion = await questionClient.createQuestion(quizId, question);
      } else {
        savedQuestion = await questionClient.updateQuestion(question);
      }

      setQuestions((prev) => {
        const filtered = prev.filter((q) => q._id !== question._id && !q.isNew);
        return [...filtered, { ...savedQuestion, isEditing: false }];
      });
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const renderEditor = (question: Question, index: number) => (
    <Card className="mb-3" key={question._id ?? `new-${index}`}>
      <Card.Body>
        <Form.Group className="mb-2">
          <Form.Label>Title</Form.Label>
          <Form.Control
            value={question.title}
            onChange={(e) =>
              updateQuestion(question._id, { title: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Points</Form.Label>
          <Form.Control
            type="number"
            value={question.points}
            onChange={(e) =>
              updateQuestion(question._id, {
                points: parseInt(e.target.value) || 0,
              })
            }
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Question Type</Form.Label>
          <Form.Select
            value={question.type}
            onChange={(e) => {
              const type = e.target.value as QuestionType;
              const base: Partial<Question> = { type, correctAnswer: "" };
              if (type === "Multiple Choice") base.choices = ["", ""];
              if (type === "Fill in the Blank") base.correctAnswer = [""];
              updateQuestion(question._id, base);
            }}
          >
            <option>Multiple Choice</option>
            <option>True/False</option>
            <option>Fill in the Blank</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Question Text</Form.Label>
          <Form.Control
            as="textarea"
            value={question.text}
            onChange={(e) =>
              updateQuestion(question._id, { text: e.target.value })
            }
            rows={3}
          />
        </Form.Group>

        {question.type === "Multiple Choice" && (
          <>
            <Form.Label>Choices</Form.Label>
            {(question.choices ?? []).map((choice, idx) => (
              <Row key={idx} className="align-items-center mb-2">
                <Col xs={1}>
                  <Form.Check
                    type="radio"
                    name={`correct-${index}`}
                    checked={question.correctAnswer === choice}
                    onChange={() =>
                      updateQuestion(question._id, { correctAnswer: choice })
                    }
                  />
                </Col>
                <Col xs={10}>
                  <Form.Control
                    value={choice}
                    onChange={(e) => {
                      const updated = [...(question.choices ?? [])];
                      updated[idx] = e.target.value;
                      updateQuestion(question._id, { choices: updated });
                    }}
                  />
                </Col>
                <Col xs={1}>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      const filtered = (question.choices ?? []).filter(
                        (_, i) => i !== idx
                      );
                      updateQuestion(question._id, { choices: filtered });
                    }}
                    disabled={(question.choices?.length ?? 0) <= 2}
                  >
                    ×
                  </Button>
                </Col>
              </Row>
            ))}
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                updateQuestion(question._id, {
                  choices: [...(question.choices ?? []), ""],
                })
              }
            >
              Add Choice
            </Button>
          </>
        )}

        {question.type === "True/False" && (
          <Form.Group className="mb-2">
            <Form.Check
              inline
              label="True"
              type="radio"
              checked={question.correctAnswer === true}
              onChange={() =>
                updateQuestion(question._id, { correctAnswer: true })
              }
            />
            <Form.Check
              inline
              label="False"
              type="radio"
              checked={question.correctAnswer === false}
              onChange={() =>
                updateQuestion(question._id, { correctAnswer: false })
              }
            />
          </Form.Group>
        )}

        {question.type === "Fill in the Blank" &&
          Array.isArray(question.correctAnswer) && (
            <>
              {(question.correctAnswer as string[]).map((ans, idx) => (
                <Row key={idx} className="mb-2">
                  <Col xs={10}>
                    <Form.Control
                      value={ans}
                      onChange={(e) => {
                        const updated = [
                          ...(question.correctAnswer as string[]),
                        ];
                        updated[idx] = e.target.value;
                        updateQuestion(question._id, {
                          correctAnswer: updated,
                        });
                      }}
                    />
                  </Col>
                  <Col xs={2}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        const updated = (
                          question.correctAnswer as string[]
                        ).filter((_, i) => i !== idx);
                        updateQuestion(question._id, {
                          correctAnswer: updated,
                        });
                      }}
                    >
                      ×
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  updateQuestion(question._id, {
                    correctAnswer: [
                      ...(question.correctAnswer as string[]),
                      "",
                    ],
                  })
                }
              >
                Add Answer
              </Button>
            </>
          )}

        <div className="d-flex gap-2 mt-3">
          <Button variant="secondary" onClick={() => cancelEdit(question._id)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => saveEdit(question)}>
            Save
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => deleteQuestion(question)}
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const renderPreview = (q: Question, index: number) => (
    <Card className="mb-3" key={q._id ?? `new-${index}`}>
      <Card.Body>
        <h5>{q.title}</h5>
        <p>
          <b>{q.text}</b>
        </p>
        <p>Points: {q.points}</p>
        {q.type === "Multiple Choice" && (
          <ul>
            {(q.choices ?? []).map((c, i) => (
              <li key={i}>
                {c} {q.correctAnswer === c && <b>(Correct)</b>}
              </li>
            ))}
          </ul>
        )}
        {q.type === "True/False" && (
          <p>
            Answer: <b>{q.correctAnswer ? "True" : "False"}</b>
          </p>
        )}
        {q.type === "Fill in the Blank" && (
          <p>Answers: {(q.correctAnswer as string[])?.join(", ")}</p>
        )}
        <div className="d-flex gap-2 mt-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => updateQuestion(q._id, { isEditing: true })}
          >
            Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => deleteQuestion(q)}
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Questions</h4>
        <Button onClick={addNewQuestion}>+ New Question</Button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {questions.map((q, index) =>
            q.isEditing ? renderEditor(q, index) : renderPreview(q, index)
          )}
          <div className="mt-3">
            <h5>Total Points: {totalPoints}</h5>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizQuestions;
