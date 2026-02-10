import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { useContext, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { Snackbar } from "@mui/material";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export default function SignInCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState();
  const [message, setMessage] = useState();

  const [formState, setFormState] = useState(0);
  const [open, setOpen] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  let handleAuth = async () => {
    if (!username || !password || (formState === 1 && !name)) {
      setError("All fields are required");
      return;
    }
    try {
      setError("");
      setMessage("");
      if (formState === 0) {
        const result = await handleLogin(username, password);
        console.log(result);
        setMessage(result);
        setOpen(true);
      }
      if (formState == 1) {
        const result = await handleRegister(name, username, password);
        console.log(result);
        setMessage(result);
        setOpen(true);
        setFormState(0);
        // to remove value from text field we normally use useRef , we refer it and then make it empty
        setUsername("");
        setPassword("");
        setError("");
      }
    } catch (err) {
      let message = err.response.data.message;
      setError(message);
    }
  };

  return (
    <Card variant="outlined" sx={{}}>
      <Box sx={{ display: { xs: "flex", md: "none" } }}></Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{
          fontSize: "24px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          variant={formState === 0 ? "contained" : ""}
          onClick={() => {
            setError("");
            setMessage("");
            setFormState(0);
          }}
        >
          Sign In
        </Button>
        <Button
          variant={formState === 1 ? "contained" : ""}
          onClick={() => {
            setError("");
            setMessage("");
            setFormState(1);
          }}
        >
          {" "}
          Sign Up
        </Button>
      </Typography>
      <Box
        component="form"
        // noValidate
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
      >
        {formState === 1 ? (
          <FormControl>
            <FormLabel htmlFor="email">Full Name</FormLabel>
            <TextField
              id="fullname"
              type="text"
              name="name"
              autoFocus
              value={name}
              required
              fullWidth
              variant="outlined"
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
        ) : (
          <></>
        )}

        <FormControl>
          <FormLabel htmlFor="email">Username</FormLabel>
          <TextField
            id="username"
            type="text"
            name="username"
            autoFocus
            required
            value={username}
            fullWidth
            variant="outlined"
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <FormLabel htmlFor="password">Password</FormLabel>
          </Box>
          <TextField
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            value={password}
            autoComplete="current-password"
            // autoFocus
            required
            fullWidth
            variant="outlined"
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Typography sx={{ color: "red" }}>{error}</Typography>

        <Box>
          <Button
            type="button"
            fullWidth
            variant="contained"
            onClick={handleAuth}
          >
            {formState == 0 ? "Login" : "Register"}
          </Button>
        </Box>
      </Box>
      <Snackbar open={open} autoHideDuration={3000} message={message} />
    </Card>
  );
}
