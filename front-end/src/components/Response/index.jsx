import { Box, Grid, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import Plots from "../Plots";
import Mdascore from "../Mdascore";

const Response = ({ metrics, setSubmitted, includeSentiment }) => {
  const [responseTexts, setResponseTexts] = useState({});
  const [finishedResponses, setFinishedResponses] = useState({});
  const [mdaScore, setmdaScore] = useState(null);
  const [images, setImages] = useState({});

  const fetchAndStreamMetrics = async () => {
    const responses = metrics.map((metric) =>
      fetch("http://localhost:8000/prompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: metric.label,
      })
    );

    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i].key;

      const response = await responses[i]; // Wait for the response of the current metric
      await fetch("http://localhost:8000/plotprompt/", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: metric,
      });
      const imageNamesReq = await fetch(
        `http://localhost:8000/list-images?metric=${encodeURIComponent(metric)}`
      );
      const imageNames = await imageNamesReq.json();
      console.log("imgnames", imageNames);
      setImages((prev) => {
        const newState = { ...prev };
        newState[metric] = imageNames.map(
          (filename) => `http://localhost:8000/images/${filename}`
        );
        console.log("nState", newState);

        return newState;
      });

      // await new Promise((resolve) => {
      //   const checkImagesUpdate = () => {
      //     console.log("tried");
      //     if (images[metric]) {
      //       resolve();
      //     } else {
      //       setTimeout(checkImagesUpdate, 100); // Check every 100ms
      //     }
      //   };
      //   checkImagesUpdate();
      // });

      console.log("imagesssss", images);
      const content = await response.text();
      setFinishedResponses((prev) => ({ ...prev, [metric]: true }));
      streamContent(content, metric);
    }
    setSubmitted(true);
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
  useEffect(() => {});
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
                {/* Text Section */}
                <Grid
                  item
                  xs={12} // Full width on small screens
                  md={7}
                >
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
                {/* Spacing */}

                {/* Image Section */}
                {images[metric.key] && <Plots images={images[metric.key]} />}
              </Grid>
            </>
          )}
        </>
      ))}

      {includeSentiment && <Mdascore score={mdaScore} />}
    </>
  );
};
export default Response;
