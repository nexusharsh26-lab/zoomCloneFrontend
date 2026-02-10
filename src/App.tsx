import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/components/landingPage/landing";
import Authentication from "./pages/components/authentication/authentication";
import { AuthProvider } from "./contexts/AuthContext";
import VideoMeet from "./pages/components/videoMeet/VideoMeet";

function App() {
  return (
    <>
      {/* // you will have to write authcontext inside Router because you can only access useNavigate inside  Router */}
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/:url" element={<VideoMeet />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
