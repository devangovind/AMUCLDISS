import {
  Box,
  Button,
  Card,
  Container,
  Input,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

const DownloadButton = () => {
  const handleDownload = async () => {
    console.log("Download");
    const response = await fetch("http://localhost:8000/download-ppt/", {
      method: "GET",
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      // creating an <a> element forced to have the download as its href then forcing it to be clicked
      const a = document.createElement("a");
      a.href = url;
      a.download = "analysis.pptx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      console.error("Failed to download file");
    }
  };
  const theme = useTheme();
  return (
    <Button
      sx={{
        borderRadius: "1000px",
        backgroundColor: theme.palette.am.main,
      }}
      variant="contained"
      onClick={handleDownload}
      aria-label="download-button"
    >
      <Typography fontSize="xl" paddingY={1.75}>
        DL
      </Typography>
    </Button>
  );
};

export default DownloadButton;
