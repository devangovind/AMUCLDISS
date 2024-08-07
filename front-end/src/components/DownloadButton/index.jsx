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
      const a = document.createElement("a");
      a.href = url;
      a.download = "analysis.pptx"; // The default filename for the downloaded file
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
    >
      {/* <svg height="100" width="100">
        <circle r="30" cx="50" cy="50" fill="#265079"></circle>

        <text
          x="50%"
          y="57%"
          text-anchor="middle"
          fill="white"
          font-size="25px"
        >
          DL
        </text>
      </svg> */}
      <Typography fontSize="xl" paddingY={1.75}>
        DL
      </Typography>
    </Button>
  );
};

export default DownloadButton;
