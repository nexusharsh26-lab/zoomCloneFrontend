import React, { useContext, useState } from "react";
import withAuth from "../../../utils/withAuth";
import { useNavigate } from "react-router-dom";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import "./homepage.css";
import { Restore } from "@mui/icons-material";
import logo3 from "../../../assets/logo3.png";
import { AuthContext } from "../../../contexts/AuthContext";

function Home() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <Box className="navBar">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography> Apna Video Call</Typography>{" "}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={() => {
              navigate("/history");
            }}
          >
            <Restore />
          </IconButton>
          <Typography>History</Typography>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
      <Box className="meetContainer">
        <Box className="leftPanel">
          <Box>
            <Typography>
              Providing Quality Video Call just like Quality Education
            </Typography>
            <Box sx={{ display: "flex", gap: "10px" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                label="Meeting Code"
              ></TextField>
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </Box>
          </Box>
        </Box>
        <Box className="rightPanel">
          <img src={logo3} alt="" />
        </Box>
      </Box>
    </>
  );
}

export default withAuth(Home);
