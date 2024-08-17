import React, { useEffect, useState } from "react";
// import { AiOutlineCheckCircle, AiOutlineCloudUpload } from "react-icons/ai";
// import { MdClear } from "react-icons/md";
// import "./DragUpload.css";
import {
  Box,
  Button,
  ButtonBase,
  Card,
  Divider,
  Stack,
  Typography,
  alpha,
  styled,
} from "@mui/material";
const DragUpload = ({
  onFilesSelected,
  width,
  height,
  onSubmit,
  files,
  setFiles,
}) => {
  //   const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prevFiles) => {
        const existingFiles = new Set(
          prevFiles.map((file) => file.name + file.size + file.lastModified)
        );
        const filesToBeAdded = newFiles.filter(
          (file) =>
            !existingFiles.has(file.name + file.size + file.lastModified)
        );

        return [...prevFiles, ...filesToBeAdded];
      });
    }
  };
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      setFiles((prevFiles) => {
        const existingFiles = new Set(
          prevFiles.map((file) => file.name + file.size + file.lastModified)
        );
        const filesToBeAdded = newFiles.filter(
          (file) =>
            !existingFiles.has(file.name + file.size + file.lastModified)
        );

        return [...prevFiles, ...filesToBeAdded];
      });
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    document.getElementById("file-input").value = "";
  };

  // useEffect(() => {
  //   onFilesSelected && onFilesSelected(files);
  // }, [files, onFilesSelected]);

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
          Limit 15MB per file. Supported files: .PDF, .DOCX, .PPTX, .TXT, .XLSX
        </Typography>

        <input
          type="file"
          hidden
          id="file-input"
          onChange={handleFileChange}
          accept=".pdf,.docx,.pptx,.txt,.xlsx"
          multiple
        />
        <label htmlFor="file-input">Browse files</label>
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
        <Box justifyContent="center" display="flex">
          <Stack flexDirection="column">
            <p>{files.length} file(s) selected</p>
            <Button onClick={onSubmit} variant="contained">
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
}));

export default DragUpload;
