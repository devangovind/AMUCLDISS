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
      console.log(formData);
      formData.getAll("files").forEach((file) => {
        console.log(file.name); // Logs the name of each file
      });
      const uploadfiles = await fetch("http://localhost:8000/uploadfiles/", {
        method: "POST",
        body: formData,
      });
      setIsUploaded(true);
      setResponse("Uploaded");
      // const responses = selectedChips.map((metric) =>
      //   fetch("http://localhost:8000/prompt/", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "text/plain", // Explicitly declare the content type
      //     },
      //     body: metric,
      //   })
      // );

      // const plots = selectedChips.map((metric) =>
      //   fetch("http://localhost:8000/plotprompt/", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "text/plain", // Explicitly declare the content type
      //     },
      //     body: metric,
      //   })
      // );

      // const overview = await fetch("http://localhost:8000/prompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: "Give a 100 word overview on the company and its financial performance based on the data uploaded to the vector store",
      // });
      // setResponse("");
      // await gensection(overview, setResponse);
      // setRevenue("Analysing revenue...");
      // const revenue_analysis = await fetch("http://localhost:8000/prompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: "Revenue analysis. Analyse specifically the revenue not the operating income and general profit and loss of the company and how its changed over time. Calculate implied metrics such as where the revenue has come from. Have a max of 200 words. Use all time frame data and specify where its come from. Calculate and analysis the derivates of the trends if possible and relevant",
      // });

      // setRevenue("");
      // await gensection(revenue_analysis, setRevenue);
      // const opIncomeReq = fetch("http://localhost:8000/prompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: "OperatingIncome analysis. Analyse specifically the operating income not the revenue of the company and how its changed over time. Have a max of 200 words.Use all time frame data and specify where its come from.",
      // });
      // const othersReq = fetch("http://localhost:8000/prompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: "KPIs analysis. Analyse any remaining KPIs. This includes PBT margin, income to cost ratio, gross yield, cost of risk, return on tangible equity, net interest margin. If a KPI isnt explicitly stated, but can be calculated present the calcualted result for each time period possible and analyse how its changed. Do not use latex. If a KPI isnt stated and cannot be calculated to a final quantitative value then ignore it and don't mention it at all! Do not mention any of the KPIs I listed if they cannot be calculated. Only present the KPIs that have a value. Maximum of 200 words.",
      // });

      // const revenue_plots_str =
      //   "Revenue plots. Generate the code to create plots that can be used to analyse the revenue of the company. Have total revenue as well as revenue broekn down by segment";
      // const revenue_plots = await fetch("http://localhost:8000/plotprompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: revenue_plots_str,
      // });

      // setOperatingIncome("Analysing Operating Income...");
      // const opIncome = await opIncomeReq;
      // const op_plots_str =
      //   "OperatingIncome plots. Generate the code to create plots that can be used to analyse the operating income of the company, not the revenue. Have total operating income as well as operating income broken down by segment";
      // const op_plots = await fetch("http://localhost:8000/plotprompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: op_plots_str,
      // });
      // setOperatingIncome("");
      // console.log("Revenue", revenue_analysis);
      // console.log("Opreq", opIncomeReq);
      // console.log("Op", opIncome);
      // await gensection(opIncome, setOperatingIncome);
      // setCashFlow("Analysing cash flow...");
      // const cash_flow_analysis = await fetch("http://localhost:8000/prompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: "CashFlow analysis. Analyse specifically the cash flow of the company and how its changed over time. Have a max of 200 words. Use all time frame data and specify where its come from.",
      // });
      // const cash_flow_str =
      //   "CashFlow plots. Generate the code to create plots that can be used to analyse the cash flow of the company.";
      // const cash_flow_plots = await fetch("http://localhost:8000/plotprompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: cash_flow_str,
      // });
      // setCashFlow("");
      // await gensection(cash_flow_analysis, setCashFlow);
      // setOtherKPIs("Analysing additional KPIs...");
      // const otherKpis = await othersReq;
      // setOtherKPIs("");
      // await gensection(otherKpis, setOtherKPIs);
      // const otherkpis_str =
      //   "KPIs plot. Generate the code to create plots that can be used to analyse the other kpis of the company. This includes PBT margin, income to cost ratio, gross yield, cost of risk, return on tangible equity, net interest margin. If a KPI cannot be calculated or derived then ignore it completely and do not try make a plot! DO NOT MAKE UP/USE EXAMPLE DATA! Have the KPIs each have their own plot";
      // const otherkpis = await fetch("http://localhost:8000/plotprompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: otherkpis_str,
      // });
      // const mda_response = await fetch("http://localhost:8000/mdascore/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: "",
      // });
      // console.log("mdres", mda_response);
      // const text = await mda_response.text();
      // console.log(text, text.split(","));
      // const mda_score = Math.round(
      //   parseFloat(text.split(",")[0].replace(/"/g, ""), 10)
      // );

      // setmdaScore(isNaN(mda_score) ? null : mda_score);
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
              <Response metrics={selectedChips} setSubmitted={setIsFinished} />
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
