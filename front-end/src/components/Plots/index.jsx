import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

function Plots({ isSubmitted, context }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(
      `http://localhost:8000/list-images?context=${encodeURIComponent(context)}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setImages(
            data.map((filename) => `http://localhost:8000/images/${filename}`)
          );
        } else {
          setImages([]); // Handle unexpected non-array responses gracefully
        }
      })
      .catch((error) => console.error("Error fetching images:", error));
  }, [isSubmitted]);

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
