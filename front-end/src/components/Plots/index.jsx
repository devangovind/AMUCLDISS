import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

function Plots({ isFinished, metric }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(
      `http://localhost:8000/list-images?context=${encodeURIComponent(metric)}`
    )
      .then((response) => response.json())
      .then((data) => {
        setImages(
          data.map((filename) => `http://localhost:8000/images/${filename}`)
        );
      })
      .catch((error) => console.error("Error fetching images:", error));
  }, [isFinished]);
  return (
    <Box maxWidth="100%">
      {images.map((url, index) => (
        <img
          // maxWidth="100%"
          width="120%"
          key={index}
          src={url}
          alt={`Dynamic Image ${index}`}
          style={{ objectFit: "contain" }}
        />
      ))}
    </Box>
  );
}

export default Plots;
