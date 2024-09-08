import {
  alpha,
  Box,
  Button,
  Card,
  Container,
  IconButton,
  Input,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import Iconify from "../Iconify";

const DownloadButton = () => {
  const handleDownload = async () => {
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
    <IconButton
      sx={{
        borderRadius: "1000px",
        backgroundColor: theme.palette.am.dark,
        ":hover": { backgroundColor: alpha(theme.palette.am.main, 0.5) },
        boxShadow: "0px 0px 10px 1px rgba(0,0,0,0.5);",
      }}
      onClick={handleDownload}
      aria-label="download-button"
    >
      <Iconify icon="material-symbols:download" width={40} color="white" />
    </IconButton>
  );
};

export default DownloadButton;
