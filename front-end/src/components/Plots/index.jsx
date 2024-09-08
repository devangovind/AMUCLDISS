import { Box, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

function Plots({ images }) {
  return (
    <>
      {images.map((url, index) => (
        <Grid
          item
          xs={12} // Full width on small screens i.e portrait view
          md={5} // 5/12 of the width on medium and larger screens -> roughly 40%
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
