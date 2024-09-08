import { Box, Grid, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import Plots from "../Plots";
import Mdascore from "../Mdascore";

const Response = ({ metrics, setSubmitted, includeSentiment }) => {
  const [responseTexts, setResponseTexts] = useState({});
  const [mdaScore, setmdaScore] = useState(null);
  const [mdaLabelScores, setmdaLabelScores] = useState({});
  const [images, setImages] = useState({});
  const [analysisComplete, setanalysisComplete] = useState(false);

  const fetchAndStreamMetrics = async () => {
    const responses = metrics.map((metric) =>
      fetch("http://localhost:8000/prompt/", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: metric.label,
      })
    );
    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i].key;
      const response = await responses[i]; // Wait for the response of the current metric
      await fetch("http://localhost:8000/plotprompt/", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: metrics[i].label,
      });
      const imageNamesReq = await fetch(
        `http://localhost:8000/list-images?metric=${encodeURIComponent(metric)}`
      );
      const imageNames = await imageNamesReq.json();
      setImages((prev) => {
        const newState = { ...prev };
        newState[metric] = imageNames.map(
          (filename) => `http://localhost:8000/images/${filename}`
        );
        return newState;
      });
      const content = await response.text();
      streamContent(content, metric);
    }
    setanalysisComplete(true);
  };

  const streamContent = (content, metric, index = 0) => {
    if (index < content.length) {
      setResponseTexts((prev) => ({
        ...prev,
        [metric]: (prev[metric] || "") + content[index],
      }));

      setTimeout(() => {
        streamContent(content, metric, index + 1);
      }, 5);
    }
  };
  // Kick off the fetching and streaming when the component mounts or when metrics change
  useEffect(() => {
    fetchAndStreamMetrics();
  }, []);
  const getMdaScore = async () => {
    const mda_response = await fetch("http://localhost:8000/mdascore/", {
      method: "GET",
      headers: {
        "Content-Type": "text/plain",
      },
    });
    const text = await mda_response.text();
    console.log("text response", text);
    if (text === null || text === "null") {
      setmdaScore("Error generating score");
    } else {
      const scores = text.split(",");
      const total_mda_score = parseFloat(scores[0].replace(/"/g, ""), 10);
      const labelScores = {
        positive: parseFloat(scores[1].replace(/"/g, ""), 10),
        neutral: parseFloat(scores[2].replace(/"/g, ""), 10),
        negative: parseFloat(scores[3].replace(/"/g, ""), 10),
      };
      setmdaLabelScores(labelScores);
      setmdaScore(
        isNaN(total_mda_score) ? "Error generating score" : total_mda_score
      );
    }
  };
  useEffect(() => {
    if (includeSentiment) {
      getMdaScore();
    }
  }, [includeSentiment]);
  useEffect(() => {
    if (
      analysisComplete &&
      mdaScore !== "Error generating score" &&
      mdaScore !== null
    ) {
      setSubmitted(true);
    }
  }, [analysisComplete, mdaScore, setSubmitted]);
  return (
    <>
      {metrics.map((metric) => (
        <Stack key={metric.key}>
          {metric.key === "businessoverview" ? (
            <>
              <Typography variant="h5" fontWeight="bold" padding={2}>
                {metric.label}
              </Typography>
              <Typography
                sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: responseTexts[metric.key] }}
                marginBottom={5}
                marginX={2}
              />
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight="bold" padding={2}>
                {metric.label}
              </Typography>
              <Grid
                container
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
                paddingBottom={5}
              >
                {/* Text */}
                <Grid item xs={12} md={7}>
                  <Box>
                    <Typography
                      sx={{ flexGrow: "auto", whiteSpace: "pre-wrap" }}
                      dangerouslySetInnerHTML={{
                        __html: responseTexts[metric.key],
                      }}
                      marginX={2}
                    />
                  </Box>
                </Grid>
                {/* Image */}
                {images[metric.key] && <Plots images={images[metric.key]} />}
              </Grid>
            </>
          )}
        </Stack>
      ))}

      {includeSentiment && (
        <Mdascore score={mdaScore} labelScores={mdaLabelScores} />
      )}
    </>
  );
};
export default Response;
