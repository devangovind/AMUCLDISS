import {
  Box,
  Button,
  Card,
  Container,
  Input,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const Mdascore = ({ score, labelScores }) => {
  let scoreColor = "#000000";
  if (score >= 80) {
    scoreColor = "#027200";
  } else if (score >= 70) {
    scoreColor = "#558a00";
  } else if (score >= 60) {
    scoreColor = "#9f9f00";
  } else if (score >= 50) {
    scoreColor = "#9f6f00";
  } else if (score < 50) {
    scoreColor = "#9f4000";
  } else {
    scoreColor = "#000000";
  }

  return (
    <>
      <Typography variant="h5" fontWeight="bold" padding={2}>
        Sentiment Score
      </Typography>
      {score === null ? (
        <Typography padding={2}>Analysing...</Typography>
      ) : score === "Error generating score" ? (
        <Typography>Error generating score</Typography>
      ) : (
        <Stack flexDirection="column">
          <Stack flexDirection="row" alignItems="center">
            <Typography fontWeight="bold" padding={2}>
              Overall Score:
            </Typography>
            <svg height="80" width="80">
              <circle r="25" cx="40" cy="40" fill={scoreColor}></circle>

              <text
                x="50%"
                y="57%"
                text-anchor="middle"
                fill="white"
                font-size="20px"
              >
                {score}
              </text>
            </svg>
          </Stack>
          <Stack flexDirection="row" alignItems="center">
            <Stack flexDirection="row" alignItems="center">
              <Typography padding={2}>Positive: </Typography>
              <svg height="80" width="80">
                <circle r="25" cx="40" cy="40" fill="green"></circle>

                <text
                  x="50%"
                  y="57%"
                  text-anchor="middle"
                  fill="white"
                  font-size="20px"
                >
                  {labelScores["positive"]}
                </text>
              </svg>
            </Stack>
            <Stack flexDirection="row" alignItems="center">
              <Typography padding={2}>Neutral: </Typography>
              <svg height="80" width="80">
                <circle r="25" cx="40" cy="40" fill="orange"></circle>

                <text
                  x="50%"
                  y="57%"
                  text-anchor="middle"
                  fill="white"
                  font-size="20px"
                >
                  {labelScores["neutral"]}
                </text>
              </svg>
            </Stack>
            <Stack flexDirection="row" alignItems="center">
              <Typography padding={2}>Negative: </Typography>
              <svg height="80" width="80">
                <circle r="25" cx="40" cy="40" fill="red"></circle>

                <text
                  x="50%"
                  y="57%"
                  text-anchor="middle"
                  fill="white"
                  font-size="20px"
                >
                  {labelScores["negative"]}
                </text>
              </svg>
            </Stack>
          </Stack>
        </Stack>
      )}
    </>
  );
};

export default Mdascore;
