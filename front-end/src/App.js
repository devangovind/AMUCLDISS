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
  const [response, setResponse] = useState("");
  const [revenue, setRevenue] = useState("");
  const [operatingIncome, setOperatingIncome] = useState("");
  const [cashflow, setCashFlow] = useState("");
  const [otherKPIs, setOtherKPIs] = useState("");
  const [files, setFiles] = useState([]);
  const [mdaScore, setmdaScore] = useState(null);
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
    setResponse("Uploading files..."); // Clear previous response
    console.log(files);
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
      setResponse("Uploaded");
    }
  };

  const gensection = async (response, setSection) => {
    const reader = response.body.getReader();
    const chunks = [];
    const decoder = new TextDecoder("utf-8");
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      const chunk = decoder.decode(value, { stream: true });
      setSection((prev) => prev + chunk);
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

            {/* {selectedChips.map( (index, metric) => {
              <>
              <Typography
              sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: response }}
              marginBottom={10}
              marginX={2}
            />
            <Stack flexDirection="row">
              <Box maxWidth="55%">
                <Typography
                  sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{ __html: revenue }}
                  marginBottom={10}
                  marginX={2}
                />
              </Box>
              <Box maxWidth="35%">
                <Plots isSubmitted={isFinished} context={"Revenue"} />
              </Box>
            </Stack>
            </>
            })}
            <Typography
              sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: response }}
              marginBottom={10}
              marginX={2}
              aria-label="response-overview"
            />
            <Stack flexDirection="row">
              <Box maxWidth="55%">
                <Typography
                  sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{ __html: revenue }}
                  marginBottom={10}
                  marginX={2}
                />
              </Box>
              <Box maxWidth="35%">
                <Plots isSubmitted={isFinished} context={"Revenue"} />
              </Box>
            </Stack>

            <Stack flexDirection="row">
              <Box maxWidth="55%">
                <Typography
                  sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{ __html: operatingIncome }}
                  marginBottom={10}
                  marginX={2}
                />
              </Box>
              <Box maxWidth="35%">
                <Plots isSubmitted={isFinished} context="Operating" />
              </Box>
            </Stack>
            <Stack flexDirection="row">
              <Box maxWidth="55%">
                <Typography
                  sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{ __html: cashflow }}
                  marginBottom={10}
                  marginX={2}
                />
              </Box>
              <Box maxWidth="35%">
                <Plots isSubmitted={isFinished} context="Cash" />
              </Box>
            </Stack>
            <Stack flexDirection="row">
              <Box maxWidth="55%">
                <Typography
                  sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{ __html: otherKPIs }}
                  marginBottom={10}
                  marginX={2}
                />
              </Box>
              <Box maxWidth="35%">
                <Plots isSubmitted={isFinished} context="" />
              </Box>
            </Stack>
            {mdaScore !== null && (
              <>
                <Mdascore score={mdaScore} />
              </>
            )} */}
          </Card>
        </>
      )}

      {/* </div> */}
    </Container>
  );
}
export default App;
