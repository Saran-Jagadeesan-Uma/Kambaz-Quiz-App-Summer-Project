import { useNavigate } from "react-router-dom";
import { Button, Card, Container, Row, Col } from "react-bootstrap";

function Landing() {
  const navigate = useNavigate();

  return (
    <Container className="d-flex flex-column align-items-center mt-5">
      <Card style={{ width: "35rem", padding: "2rem" }} className="shadow-lg">
        <h2 className="mb-4 text-center">🎓 Welcome to Kambaz Quiz App</h2>

        <Row className="mb-3">
          <Col>
            <h5 className="mb-2">Developed By:</h5>
            <ul className="mb-0 ps-3">
              <li><strong>Saran Jagadeesan Uma</strong></li>
              <li><strong>Sai Rashwant Venkataraman Sundaram</strong></li>
              <li><strong>Mithun Dineshkumar</strong></li>
            </ul>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <h5 className="mb-2">GitHub Repositories:</h5>
            <ul className="mb-0 ps-3">
              <li>
                <a
                  href="https://github.com/Saran-Jagadeesan-Uma/kambaz-node-server-app"
                  target="_blank"
                  rel="noreferrer"
                >
                  🛠️ Server Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Saran-Jagadeesan-Uma/Kambaz-Quiz-App-Summer-Project"
                  target="_blank"
                  rel="noreferrer"
                >
                  🎨 Frontend Repository
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => navigate("/Kambaz")}>
            🚀 Enter Quiz App
          </Button>
        </div>
      </Card>
    </Container>
  );
}

export default Landing;
