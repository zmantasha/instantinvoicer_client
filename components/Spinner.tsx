import React from 'react';
// import HashLoader from "react-spinners/HashLoader";
import PulseLoader from "react-spinners/PulseLoader";

const Spinner = ({ loading = true, color = "blue" }: { loading?: boolean, color?: string }) => {
  const override: React.CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  const spinnerWrapperStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",  // Center horizontally
    alignItems: "center",      // Center vertically
    height: "30vh",           // Full viewport height
  };
  return (
    <div style={spinnerWrapperStyles}>
      <PulseLoader

        color={color}
        loading={loading}
        cssOverride={override}
        size={10}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Spinner;
