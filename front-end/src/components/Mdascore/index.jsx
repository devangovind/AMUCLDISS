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

const Mdascore = ({ score }) => {
  let scoreColor = "#000000";
  if (score >= 80) {
    scoreColor = "#027200";
  } else if (score >= 70) {
    scoreColor = "#558a00";
  } else if (score >= 60) {
    scoreColor = "#9f9f00";
  } else if (score >= 50) {
    scoreColor = "#9f6f00";
  } else {
    scoreColor = "#9f4000";
  }

  return (
    <Stack flexDirection="row" alignItems="center">
      <Typography fontSize="xl" paddingY={1.75} fontWeight="bold">
        Sentiment Score:
      </Typography>
      <svg height="80" width="80">
        <circle r="25" cx="40" cy="40" fill={scoreColor}></circle>

        <text x="50%" y="57%" textAnchor="middle" fill="white" fontSize="20px">
          {score}
        </text>
      </svg>
    </Stack>
  );
};

export default Mdascore;
