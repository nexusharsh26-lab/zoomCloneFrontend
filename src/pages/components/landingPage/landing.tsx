import React from "react";
import "./landing.css";
import mobileImg from "../../../assets/mobile.png";
import { Link, useNavigate } from "react-router-dom";

export default function landingPage() {
  const router = useNavigate();
  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>Apna Video Call</h2>
        </div>
        <div className="navList">
          <p
            onClick={() => {
              router("/guestlink");
            }}
          >
            {" "}
            Join as Guest
          </p>
          <p
            onClick={() => {
              router("/auth");
            }}
          >
            Register
          </p>
          <div
            role="button"
            onClick={() => {
              router("/auth");
            }}
          >
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#FF9839" }}>Connect</span> with your Loved
            Ones
          </h1>
          <p>cover the distance with Apna Video call </p>
          <div role="button">
            <Link to="/auth">Get Started</Link>
          </div>
        </div>
        <div>
          <img src={mobileImg}></img>
        </div>
      </div>
    </div>
  );
}
//CSS to JSX
// PRE MADE COMPONENTS TO CUSTOMISE IT
