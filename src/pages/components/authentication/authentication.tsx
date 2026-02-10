import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Content from "./Content";
import SignInCard from "./SignInCard";

export default function Authentication() {
  return (
    <>
      {" "}
      <CssBaseline enableColorScheme />
      {/* <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} /> */}
      <Stack
        direction={"row"}
        sx={{ height: "100vh", width: "100vw", overflow: "hidden" }}
      >
        <Stack
          sx={{
            border: "1px solid black ",
            backgroundImage: `url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop")`,

            flex: 0.6,
            backgroundSize: "cover",
            backgroundPosition: "center",
            // width: "60vw",
            // height: "100vh",
          }}
        >
          {/* <Content /> */}
        </Stack>
        <Stack sx={{ flex: 0.4 }} justifyContent="center" alignItems="center">
          <SignInCard />
        </Stack>
      </Stack>
    </>
  );
}
