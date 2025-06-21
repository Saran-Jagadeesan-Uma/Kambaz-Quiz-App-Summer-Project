import CourseNavigation from "./Navigation";
import Modules from "./Modules";
import Home from "./Home";
import Assignments from "./Assignments";
import { Navigate, Route, Routes, useParams, useLocation } from "react-router";
import AssignmentEditor from "./Assignments/editor";
import People from "./People";
import Quizzes from "./Quizzes";
import QuizEditor from "./Quizzes/QuizEditor";
import { FaAlignJustify } from "react-icons/fa";
import QuizDetails from "./Quizzes/QuizDetails";
import QuizPreview from "./Quizzes/preview";
import QuizTake from "./Quizzes/QuizTake";

export default function Courses({ courses }: { courses: any[] }) {
  const { cid } = useParams();
  const course = courses.find((course) => course._id === cid);
  const { pathname } = useLocation();

  return (
    <div id="wd-courses">
      <h2 className="text-danger">
        <FaAlignJustify className="me-3 fs-4 mb-1" />
        {course && course.name} &gt; {pathname.split("/")[4]}
      </h2>
      <hr />
      <div className="d-flex">
        <div className="d-none d-md-block">
          <CourseNavigation />
        </div>
        <div className="flex-fill">
          <Routes>
            <Route path="/" element={<Navigate to="Home" />} />
            <Route path="Home" element={<Home />} />
            <Route path="Modules" element={<Modules />} />
            <Route path="Assignments" element={<Assignments />} />
            <Route path="Assignments/:aid" element={<AssignmentEditor />} />
            <Route path="Quizzes" element={<Quizzes />} />
            <Route path="Quizzes/:quizId/edit" element={<QuizEditor />} />
            <Route path="Quizzes/:quizId/preview" element={<QuizPreview />} />
            <Route path="People" element={<People />} />
            <Route path="Quizzes/:quizId" element={<QuizDetails />} />
            <Route path="Quizzes/:quizId/take" element={<QuizTake />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
