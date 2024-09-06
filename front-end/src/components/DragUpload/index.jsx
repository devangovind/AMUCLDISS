import React, { useEffect, useState } from "react";
import { chipLabels } from "./metrics";
// import { AiOutlineCheckCircle, AiOutlineCloudUpload } from "react-icons/ai";
// import { MdClear } from "react-icons/md";
// import "./DragUpload.css";
import {
  Box,
  Button,
  ButtonBase,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Input,
  Stack,
  Typography,
  alpha,
  styled,
  useTheme,
} from "@mui/material";
import Iconify from "../Iconify";
const DragUpload = ({
  onFilesSelected,
  onSubmit,
  files,
  setFiles,
  selectedChips,
  setSelectedChips,
  includeSentiment,
  setIncludeSentiment,
}) => {
  const [additionalMetric, setAdditionalMetric] = useState("");
  const [sendDisabled, setsendDisabled] = useState(true);
  const [chips, setChips] = useState(chipLabels);
  const [allowSubmit, setAllowSubmit] = useState(false);
  const theme = useTheme();

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      const filesToBeAdded = newFiles.filter((elem) => !files.includes(elem));
      setFiles((prevFiles) => [...prevFiles, ...filesToBeAdded]);
    }
  };
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      const filesToBeAdded = newFiles.filter((elem) => !files.includes(elem));
      setFiles((prevFiles) => [...prevFiles, ...filesToBeAdded]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // useEffect(() => {
  //   onFilesSelected && onFilesSelected(files);
  // }, [files, onFilesSelected]);

  useEffect(() => {
    if (additionalMetric.trim() === "") {
      setsendDisabled(true);
    } else {
      setsendDisabled(false);
    }
  }, [additionalMetric]);

  const _handleInputChange = (e) => {
    setAdditionalMetric(e.target.value);
  };

  const addMetric = () => {
    const newMetric = additionalMetric.replace(/\s+/g, "").toLowerCase();
    const metricAsChip = { key: newMetric, label: additionalMetric };
    const chipExists = chips.some((item) => item.key === newMetric);
    if (chipExists) {
      const chipSelected = selectedChips.some((item) => item.key === newMetric);
      if (chipSelected) {
        setSelectedChips((prev) => [...prev, metricAsChip]);
      }
    } else {
      setChips((prev) => [
        ...prev,
        { key: newMetric, label: additionalMetric },
      ]);
      setSelectedChips((prev) => [...prev, metricAsChip]);
    }
    setAdditionalMetric("");
  };
  useEffect(() => {
    if (selectedChips.length > 0 || includeSentiment) {
      setAllowSubmit(true);
    } else {
      setAllowSubmit(false);
    }
  }, [selectedChips, includeSentiment]);
  return (
    <DragDropBox
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      <Box
        marginBottom={5}
        sx={{
          textAlign: "center",
          backgroundColor: "transparent",
          border: "none",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Drag and drop your files here
        </Typography>
        <Typography variant="body1" sx={{ padding: 2 }}>
          Limit 15MB per file. Supported files: .PDF, .DOCX, .PPTX, .TXT, .XLSX,
          .CSV
        </Typography>

        <input
          type="file"
          hidden
          id="browse"
          onChange={handleFileChange}
          accept=".pdf,.docx,.pptx,.txt,.xlsx,.csv"
          multiple
        />
        <label htmlFor="browse">Browse files</label>
      </Box>

      {files.length > 0 && (
        <>
          {files.map((file, index) => (
            <div key={index}>
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                marginX={2}
                alignItems="center"
              >
                <p>{file.name}</p>

                <Button
                  onClick={() => handleRemoveFile(index)}
                  color="error"
                  variant="contained"
                  padding={0}
                  size="xs"
                  sx={{ maxHeight: "40px" }}
                >
                  Delete
                </Button>
              </Stack>
              <Divider />
            </div>
          ))}
        </>
      )}

      {files.length > 0 && (
        <Box
          justifyContent="center"
          display="flex"
          maxWidth="60%"
          sx={{ margin: "0 auto" }}
        >
          <Stack
            flexDirection="column"
            justifyContent="center"
            marginTop={2}
            gap={2}
          >
            <Typography
              variant="subtitle"
              justifyContent="center"
              display="flex"
            >
              {files.length} file(s) selected
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              justifyContent="center"
              display="flex"
            >
              Metrics for analysis:
            </Typography>
            <ChipsWithCheckboxGroup
              chips={chips}
              selectedChips={selectedChips}
              setSelectedChips={setSelectedChips}
            />
            <Typography
              variant="subtitle"
              justifyContent="center"
              display="flex"
            >
              Add additional metrics:
            </Typography>
            <Box justifyContent="center" display="flex">
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                paddingY={0.5}
                alignItems="center"
                sx={{ width: "50%" }}
              >
                <Input
                  placeholder="Add additional metrics"
                  variant="contained"
                  multiline={true}
                  sx={{
                    width: "80%",
                  }}
                  value={additionalMetric}
                  onChange={_handleInputChange}
                  // disabled={inputDisabled}
                />

                <IconButton
                  onClick={() => addMetric()}
                  disabled={sendDisabled}
                  sx={{ marginRight: "10px" }}
                >
                  <Iconify
                    icon="mingcute:add-line"
                    color={
                      sendDisabled
                        ? theme.palette.action.disabled
                        : theme.palette.text.primary
                    }
                  />
                </IconButton>
              </Stack>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeSentiment}
                  onChange={() => setIncludeSentiment((prev) => !prev)}
                  color="primary"
                />
              }
              label="Include sentiment analysis on Managament Discussion & Analysis section?"
              sx={{ margin: "0 auto" }}
            />
            <Button
              onClick={onSubmit}
              variant="contained"
              sx={{ width: "50%", margin: "0 auto" }}
              disabled={!allowSubmit}
            >
              Submit
            </Button>
          </Stack>
        </Box>
      )}
    </DragDropBox>
    // </section>
  );
};

const DragDropBox = styled(Card)(({ theme }) => ({
  borderRadius: 6,
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: theme.palette.action.customHover,
  },
  padding: 10,
  width: "auto",
  flexGrow: "auto",
  borderStyle: "dashed",
  borderColor: theme.palette.am.main,
  borderWidth: 2,
}));

const ChipsWithCheckboxGroup = ({ chips, selectedChips, setSelectedChips }) => {
  // const chipsOrder = chips.map((item) => item.key);
  const handleToggleChip = (chip) => {
    const chipSelected = selectedChips.some((item) => item.key === chip.key);
    console.log("pre seelcted: ", selectedChips);
    setSelectedChips((prevSelectedChips) =>
      chipSelected
        ? prevSelectedChips.filter((item) => item.key !== chip.key)
        : [...prevSelectedChips, chip]
    );
    console.log(chipSelected, "clicked", chip, "seelcted: ", selectedChips);
    setSelectedChips((prevSelectedChips) =>
      prevSelectedChips.sort((a, b) => {
        let indexA = chips.indexOf(a);
        let indexB = chips.indexOf(b);

        if (indexA === -1 && indexB === -1) {
          return 0;
        } else if (indexA === -1) {
          return 1;
        } else if (indexB === -1) {
          return -1;
        } else {
          return indexA - indexB;
        }
      })
    );
  };

  return (
    <Box sx={{ maxWidth: "100%", margin: "0 auto" }}>
      <Stack
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="center"
        gap={2}
      >
        {chips.map((item) => (
          <CustomChips
            key={item.key}
            label={item.label}
            isSelected={selectedChips.some((prev) => prev.key === item.key)}
            onToggle={() => handleToggleChip(item)}
          />
        ))}
      </Stack>
    </Box>
  );
};

const CustomChips = ({ key, label, isSelected, onToggle }) => {
  return (
    <Chip
      label={
        <FormControlLabel
          control={
            <Checkbox
              checked={isSelected}
              onChange={onToggle}
              color="primary"
            />
          }
          label={label}
        />
      }
      variant={isSelected ? "default" : "outlined"}
      // onClick={onToggle}
    />
  );
};

export default DragUpload;
