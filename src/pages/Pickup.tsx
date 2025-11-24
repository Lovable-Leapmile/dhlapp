import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Pickup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to select pickup bin page
    navigate("/pickup/select-bin", { replace: true });
  }, [navigate]);

  return null;
};

export default Pickup;
