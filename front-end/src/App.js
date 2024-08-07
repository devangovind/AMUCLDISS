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

function App() {
  const [isSubmitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState("");
  const [revenue, setRevenue] = useState("");
  const [operatingIncome, setOperatingIncome] = useState("");
  const [otherKPIs, setOtherKPIs] = useState("");
  const [files, setFiles] = useState([]);
  const [mdaScore, setmdaScore] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const handleFileChange = (e) => {
    // e.preventDefault();

    setFiles(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse("Uploading files..."); // Clear previous response
    console.log(files);

    if (files.length > 0) {
      setSubmitted(true);
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
      setResponse("Uploaded");
      const overview = await fetch("http://localhost:8000/prompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Explicitly declare the content type
        },
        body: "Give a 100 word overview on the company and its financial performance based on the data uploaded to the vector store",
      });
      setResponse("");
      await gensection(overview, setResponse);
      setRevenue("Analysing revenue...");
      const revenue_analysis = await fetch("http://localhost:8000/prompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Explicitly declare the content type
        },
        body: "Revenue analysis. Analyse specifically the revenue of the company and how its changed over time. Calculate implied metrics such as where the revenue has come from. Have a max of 200 words. Use all time frame data and specify where its come from. Calculate and analysis the derivates of the trends if possible and relevant",
      });

      setRevenue("");
      await gensection(revenue_analysis, setRevenue);
      const opIncomeReq = fetch("http://localhost:8000/prompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Explicitly declare the content type
        },
        body: "OperatingIncome analysis. Analyse specifically the operating income not the revenue of the company and how its changed over time. Have a max of 200 words.Use all time frame data and specify where its come from.",
      });
      const othersReq = fetch("http://localhost:8000/prompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Explicitly declare the content type
        },
        body: "KPIs analysis. Analyse any remaining KPIs. This includes PBT margin, income to cost ratio, gross yield, cost of risk, return on tangible equity, net interest margin. If a KPI isnt explicitly stated, but can be calculated present the calcualted result for each time period possible and analyse how its changed. Do not use latex. If a KPI isnt stated and cannot be calculated to a final quantitative value then ignore it and don't mention it at all! Maximum of 200 words.",
      });

      const revenue_plots_str =
        "Revenue plots. Generate the code to create plots that can be used to analyse the revenue of the company. Have total revenue as well as revenue broekn down by segment";
      const revenue_plots = await fetch("http://localhost:8000/plotprompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Explicitly declare the content type
        },
        body: revenue_plots_str,
      });

      setOperatingIncome("Analysing Operating Income...");
      const opIncome = await opIncomeReq;
      const op_plots_str =
        "OperatingIncome plots. Generate the code to create plots that can be used to analyse the operating income of the company, not the revenue. Have total operating income as well as operating income broken down by segment";
      const op_plots = await fetch("http://localhost:8000/plotprompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Explicitly declare the content type
        },
        body: op_plots_str,
      });
      setOperatingIncome("");
      console.log("Revenue", revenue_analysis);
      console.log("Opreq", opIncomeReq);
      console.log("Op", opIncome);
      await gensection(opIncome, setOperatingIncome);
      setOtherKPIs("Analysing additional KPIs...");
      const otherKpis = await othersReq;

      // const othersReq = await fetch("http://localhost:8000/prompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: "Analyse any remaining KPIs that haven't been analysed yet. This includes PBT margin, income to cost ratio, gross yield, cost of risk, return on tangible equity, net interest margin. If a KPI isnt explicitly stated, but can be calculated present the calcualted result for each time period possible and analyse how its changed. Do not use latex. If it isnt stated or can be calculated then ignore it and don't mention it. Maximum of 200 words.",
      // });
      setOtherKPIs("");
      await gensection(otherKpis, setOtherKPIs);
      const otherkpis_str =
        "KPIs plot. Generate the code to create plots that can be used to analyse the other kpis of the company. This includes PBT margin, income to cost ratio, gross yield, cost of risk, return on tangible equity, net interest margin. If a KPI cannot be calculated or derived then ignore it completely and do not try make a plot! DO NOT MAKE UP/USE EXAMPLE DATA! Have the KPIs each have their own plot";
      const otherkpis = await fetch("http://localhost:8000/plotprompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Explicitly declare the content type
        },
        body: otherkpis_str,
      });
      const mda_response = await fetch("http://localhost:8000/mdascore/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Explicitly declare the content type
        },
        body: "",
      });
      console.log("mdres", mda_response);
      const text = await mda_response.text();
      console.log(text, text.split(","));
      const mda_score = Math.round(
        parseFloat(text.split(",")[0].replace(/"/g, ""), 10)
      );

      setmdaScore(isNaN(mda_score) ? null : mda_score);
      console.log("mada", mdaScore);
      // console.log(revenue_plots);
      // // await gensection(revenue_plots, setOperatingIncome);
      // // const revenue = await fetch("http://localhost:8000/prompt/", {
      // //   method: "POST",
      // //   headers: {
      // //     "Content-Type": "text/plain", // Explicitly declare the content type
      // //   },
      // //   body: "Analyse specifically the revenue of the company and how its changed over time. Calculate implied metrics such as where the revenue has come from. Have a max of 200 words. Produce a python dictionary with the first key as time and value as [years/quarters]. The next keys should be the metric (e.g. revenue per year, revenue per sector) with values corresponding to the time intervals in an array. When looking specifically the sectors/makeup of a metric, group the sectors into their own nested dictionary ('Revenue by sector': [{sector:value, sector2:value2},{sector:value...}]), sectors/segments should only appear in a nested dicitonary not as standalone keys. No key should be time specific on its own. Call the metric keys a good name as they will be the titles of plots. Also give units in the metric key. Call the dictionary 'kpis'. Do not include any derivatives in the dictionary",
      // // });
      // const others = await fetch("http://localhost:8000/prompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: "Analyse any remaining KPIs that haven't been analysed yet. This includes PBT margin, income to cost ratio, gross yield, cost of risk, return on tangible equity, net interest margin. If a KPI isnt explicitly stated, but can be calculated present the calcualted result for each time period possible and analyse how its changed. Do not use latex. If it isnt stated or can be calculated then ignore it and don't mention it. Maximum of 200 words. Produce a python dictionary with the first key as time and value as [years/quarters]. The next keys should be the metric with values corresponding to the time intervals in an array. Call the metric keys a good name as they will be the titles of plots. Do not include any KPI that doesnt have a calcualted value, only have quantitative values in the dictionary. DONT PUT 'None' in the dictionary.",
      // });
      // const opIncome = await fetch("http://localhost:8000/prompt/", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "text/plain", // Explicitly declare the content type
      //   },
      //   body: "Analyse specifically the operating income not the revenue of the company and how its changed over time. Have a max of 200 words. Produce a python dictionary regarding the operating income of the company, with the first key as time and value as [years/quarters]. The next keys should be the metric with values corresponding to the time intervals in an array. Call the metric keys a good name as they will be the titles of plots. If you break the operating income down by segment follow the same template of dictionary created for revenue",
      // });
      // setOtherKPIs("");
      // // setRevenue("");
      // // await gensection(revenue, setRevenue);
      // // setOperatingIncome("Analysing income...");

      // setOperatingIncome("");
      // await gensection(opIncome, setOperatingIncome);
      // setOtherKPIs("Analysing other KPIs...");

      // setOtherKPIs("");
      // await gensection(others, setOtherKPIs);
      setIsFinished(true);
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
          />
          <Chatbot />
          {/* <div className="output-container"> */}
        </>
      )}
      {isSubmitted && (
        <>
          {isFinished && (
            <Box sx={{ position: "fixed", left: 5, bottom: 5 }}>
              <DownloadButton />
            </Box>
          )}

          <Chatbot />
          <Card
            sx={{ flexGrow: "auto", maxWidth: "100%", marginBottom: "20px" }}
          >
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
            )}

            {/* <Plots isSubmitted={isSubmitted} /> */}
            {/* Updated to use <pre> for better formatting */}
          </Card>
        </>
      )}

      {/* </div> */}
    </Container>
  );
}
export default App;
