import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonBase,
  Card,
  Container,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
// import "./App.css";
import DragUpload from "./components/DragUpload";
import Chatbot from "./components/Chatbot";
import Plots from "./components/Plots";
import DownloadButton from "./components/DownloadButton";
import Mdascore from "./components/Mdascore";
import { useThemeContext } from "./theme/themeContext";
import ThemeChangeButton from "./components/ThemeChangeButton";
import Response from "./components/Response";

function App() {
  const [isSubmitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedChips, setSelectedChips] = useState([]);
  const [isUploaded, setIsUploaded] = useState(false);
  const [includeSentiment, setIncludeSentiment] = useState(false);

  const handleFileChange = (e) => {
    // e.preventDefault();

    setFiles(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (files.length > 0) {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const uploadfiles = await fetch("http://localhost:8000/uploadfiles/", {
        method: "POST",
        body: formData,
      });
      setIsUploaded(true);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ flex: 1 }}>
      <Stack justifyContent="space-evenly" flexDirection="row">
        <Typography variant="h3" padding={1}>
          Alvarez & Marsal AI Financial Advisor
        </Typography>
      </Stack>
      <Divider />
      <Stack flexDirection="row" justifyContent="space-between" paddingY={2}>
        <Typography variant="h4">
          {!isSubmitted ? "Upload Files" : "Results"}
        </Typography>

        <ThemeChangeButton />
      </Stack>

      {!isSubmitted && (
        <>
          <DragUpload
            width="auto"
            height={10}
            onFilesSelected={handleFileChange}
            onSubmit={handleSubmit}
            files={files}
            setFiles={setFiles}
            selectedChips={selectedChips}
            setSelectedChips={setSelectedChips}
            includeSentiment={includeSentiment}
            setIncludeSentiment={setIncludeSentiment}
          />
        </>
      )}
      {isSubmitted && (
        <>
          {isFinished && (
            <Box sx={{ position: "fixed", left: 24, bottom: 5 }}>
              <DownloadButton />
            </Box>
          )}

          <Chatbot />
          <Card
            sx={{ flexGrow: "auto", maxWidth: "100%", marginBottom: "20px" }}
          >
            {isUploaded && (
              <Response
                metrics={selectedChips}
                setSubmitted={setIsFinished}
                includeSentiment={includeSentiment}
              />
            )}
          </Card>
        </>
      )}
    </Container>
  );
}
export default App;
