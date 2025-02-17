import React from 'react';
import HashLoader from "react-spinners/HashLoader";

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
    height: "80vh",           // Full viewport height
  };
  return (
    <div style={spinnerWrapperStyles}>
      <HashLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Spinner;
