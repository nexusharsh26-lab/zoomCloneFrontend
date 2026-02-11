import { Box, Card, IconButton, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { Home } from "@mui/icons-material";

export const History = () => {
  const { getHistoryOfUser } = useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);

  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        console.log(history, "-----");
        setMeetings(history);
      } catch {
        //implement snack bar
      }
    };
    fetchHistory();
  }, []);

  let formatData = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <Box>
      <IconButton
        onClick={() => {
          routeTo("/home");
        }}
      >
        <Home />
      </IconButton>
      {meetings.length !== 0 ? (
        meetings.map((e, index) => {
          return (
            <React.Fragment key={index}>
              <Card sx={{ minWidth: 275, border: "1px solid black" }}>
                <CardContent>
                  <Typography
                    gutterBottom
                    sx={{ color: "text.secondary", fontSize: 14 }}
                  >
                    Code:{e.meetingCode}{" "}
                  </Typography>

                  <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                    Date:{formatData(e.date)}{" "}
                  </Typography>
                </CardContent>
              </Card>{" "}
            </React.Fragment>
          );
        })
      ) : (
        <></>
      )}
    </Box>
  );
};
