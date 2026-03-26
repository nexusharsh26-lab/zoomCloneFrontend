import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent: React.ReactNode) => {
  const AuthComponent = (props) => {
    const router = useNavigate();

    const isAuthenticated = () => {
      if (localStorage.getItem("token")) {
        return true;
      }
      //todo validate this  as well
      return false;
    };

    useEffect(() => {
      if (!isAuthenticated) {
        router("/auth");
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
  return AuthComponent;
};

export default withAuth;
