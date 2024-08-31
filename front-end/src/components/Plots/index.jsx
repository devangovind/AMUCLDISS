import { Box, Grid, Typography } from "@mui/material";
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
    // <Box
    //   sx={{
    //     maxWidth: "100%",
    //     display: "flex",
    //     flexDirection: "column",
    //     alignItems: "center",
    //     overflow: "hidden",
    //   }}
    // >
    //   {images.map((url, index) => (
    //     <img
    //       // maxWidth="100%"
    //       width="120%"
    //       key={index}
    //       src={url}
    //       alt={`Dynamic ${index}`}
    //       style={{ objectFit: "contain" }}
    //     />
    //   ))}
    // </Box>
    <>
      {images.map((url, index) => (
        <Grid
          item
          xs={12} // Full width on small screens
          md={5} // 5/12 of the width on medium and larger screens (~41.67%)
          key={index}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingX: 2,
            paddingBottom: 1,
          }}
        >
          <img
            src={url}
            alt={`Dynamic ${index}`}
            style={{
              width: "100%",
              objectFit: "contain",
            }}
          />
        </Grid>
      ))}
    </>
  );
}

export default Plots;
