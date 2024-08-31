import { Box, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import Plots from "../Plots";
import Mdascore from "../Mdascore";

const Response = ({ metrics, setSubmitted, includeSentiment }) => {
  const [responseTexts, setResponseTexts] = useState({});
  const [finishedResponses, setFinishedResponses] = useState({});
  const [mdaScore, setmdaScore] = useState(null);

  const fetchAndStreamMetrics = async () => {
    const date = new Date();

    // const responses = metrics.map((metric) =>
    //   fetch("http://localhost:8000/prompt/", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "text/plain",
    //     },
    //     body: metric.key,
    //   })
    // );

    // const plots = metrics.map((metric) =>
    //   fetch("http://localhost:8000/plotprompt/", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "text/plain",
    //     },
    //     body: metric,
    //   })
    // );

    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i].key;

      //   const response = await responses[i]; // Wait for the response of the current metric
      const response = await fetch("http://localhost:8000/prompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: metrics[i].label,
      });

      await fetch("http://localhost:8000/plotprompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: metric,
      });
      setFinishedResponses((prev) => ({ ...prev, [metric]: true }));

      await gensection(response, metric);
    }
    setSubmitted(true);
  };

  const gensection = async (response, metric) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // Update the state for the specific metric
      setResponseTexts((prev) => ({
        ...prev,
        [metric]: (prev[metric] || "") + chunk,
      }));
    }
  };

  // Kick off the fetching and streaming when the component mounts or when metrics change
  useEffect(() => {
    if (metrics.length > 0) {
      fetchAndStreamMetrics();
    }
  }, []);
  const getMdaScore = async () => {
    const mda_response = await fetch("http://localhost:8000/mdascore/", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain", // Explicitly declare the content type
      },
      body: "",
    });

    const text = await mda_response.text();

    const mda_score = Math.round(
      parseFloat(text.split(",")[0].replace(/"/g, ""), 10)
    );

    setmdaScore(isNaN(mda_score) ? null : mda_score);
  };
  useEffect(() => {
    if (includeSentiment) {
      getMdaScore();
    }
  }, [includeSentiment]);
  return (
    <>
      {metrics.map((metric) => (
        <>
          {metric.key === "overview" ? (
            <>
              <Typography variant="subtitle" fontWeight="bold">
                {metric.label}
              </Typography>
              <Typography
                sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: responseTexts[metric.key] }}
                marginBottom={10}
                marginX={2}
              />
            </>
          ) : (
            <>
              <Typography variant="subtitle" fontWeight="bold">
                {metric.label}
              </Typography>
              <Stack flexDirection="row">
                <Box maxWidth="55%">
                  <Typography
                    sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{
                      __html: responseTexts[metric.key],
                    }}
                    marginBottom={10}
                    marginX={2}
                  />
                </Box>
                <Box maxWidth="35%">
                  <Plots
                    isFinished={finishedResponses[metric.key]}
                    metric={metric.key}
                  />
                </Box>
              </Stack>
            </>
          )}
        </>
      ))}
      {includeSentiment && <Mdascore score={mdaScore} />}
    </>
  );
};

export default Response;
