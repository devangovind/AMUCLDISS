import { Box, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import Plots from "../Plots";

const Response = ({ metrics, setSubmitted }) => {
  const [responseTexts, setResponseTexts] = useState({});
  const [finishedResponses, setFinishedResponses] = useState({});

  const fetchAndStreamMetrics = async () => {
    const date = new Date();

    const responses = metrics.map((metric) =>
      fetch("http://localhost:8000/prompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: metric,
      })
    );

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
      const metric = metrics[i];
      console.log("prev", metric, responses, date.getTime());
      const response = await responses[i]; // Wait for the response of the current metric
      console.log("curr", metric, date.getTime());
      await fetch("http://localhost:8000/plotprompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: metric,
      });
      setFinishedResponses((prev) => ({ ...prev, [metric]: true }));
      console.log("curr post plot", metric, date.getTime());
      await gensection(response, metric);
      console.log("curr post gen", metric, date.getTime());
      console.log("big responses", responses);
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

  return (
    <>
      {metrics.map((metric) => (
        <>
          {metric === "overview" ? (
            <>
              <Typography variant="subtitle">{metric}</Typography>
              <Typography
                sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: responseTexts[metric] }}
                marginBottom={10}
                marginX={2}
              />
            </>
          ) : (
            <>
              <Typography variant="subtitle">{metric}</Typography>
              <Stack flexDirection="row">
                <Box maxWidth="55%">
                  <Typography
                    sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{ __html: responseTexts[metric] }}
                    marginBottom={10}
                    marginX={2}
                  />
                </Box>
                <Box maxWidth="35%">
                  <Plots
                    isFinished={finishedResponses[metric]}
                    metric={metric}
                  />
                </Box>
              </Stack>
            </>
          )}
        </>
      ))}
    </>
  );
};

export default Response;
