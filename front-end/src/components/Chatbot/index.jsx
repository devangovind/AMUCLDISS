import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Icon,
  IconButton,
  Input,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Icon as Icon2 } from "@iconify/react";
import { useEffect, useState } from "react";
import Iconify from "../Iconify";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      message:
        "Send a prompt here and the documents uploaded will be queried for an answer",
    },
  ]);
  const [currMessage, setcurrMessage] = useState("");
  const [inputDisabled, setinputDisabled] = useState(false);
  const [sendDisabled, setsendDisabled] = useState(true);
  const theme = useTheme();
  useEffect(() => {
    if (currMessage.trim() === "") {
      setsendDisabled(true);
    } else {
      setsendDisabled(false);
    }
  }, [currMessage]);
  const toggleOpen = () => {
    console.log(open);
    setOpen(!open);
  };
  const sendMessage = async () => {
    console.log("sent message");
    const sentMessage = {
      sender: "user",
      message: currMessage,
    };

    setMessages((prevMessages) => [...prevMessages, sentMessage]);
    setinputDisabled(true);
    setsendDisabled(true);
    console.log(sentMessage);
    console.log(messages);
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "ai", message: "Analysing..." },
    ]);
    const newResponse = await fetch("http://localhost:8000/chatprompt/", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain", // Explicitly declare the content type
      },
      body: currMessage,
    });
    console.log("hereeee");

    const text = await newResponse.text();
    // await genresponse(newResponse);
    const aiResponse = {
      sender: "ai",
      message: text,
    };
    console.log(messages);
    setMessages((prevMessages) => [
      ...prevMessages.slice(0, prevMessages.length - 1),
      aiResponse,
    ]);
    setcurrMessage("");
    setinputDisabled(false);
  };
  const _handleInputChange = (e) => {
    setcurrMessage(e.target.value);
  };
  const genresponse = async (response) => {
    let currMessages = messages;
    let lastResponse = messages[-1];
    lastResponse.message = "";
    currMessages.pop();
    currMessages.push(lastResponse);
    setMessages(currMessage);
    const reader = response.body.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      const chunk = new TextDecoder("utf-8").decode(value, { stream: true });
      let currMessages = messages;
      let lastResponse = messages[-1];
      lastResponse.message += chunk;
      currMessages.pop();
      currMessages.push(lastResponse);
      setMessages(currMessage);
    }
  };

  return (
    <Container
      sx={{
        right: 0,
        position: "fixed",
        bottom: 4,
        width: "35%",
        zIndex: 99,
      }}
    >
      <Card
        sx={{
          height: open ? "50vh" : "auto",
          boxShadow: "0px 0px 10px 1px rgba(0,0,0,0.5);",
          borderRadius: "10px",
        }}
      >
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          position="sticky"
          top={0}
          sx={{ boxShadow: "0px 1px 20px -3px rgba(0,0,0,0.5)" }}
          alignItems="center"
          borderRadius="5px"
          backgroundColor={theme.palette.am.dark}
        >
          <Typography fontWeight="bold" color="white" marginLeft={1}>
            AI Financial Advisor
          </Typography>
          <IconButton onClick={() => toggleOpen()}>
            <Iconify
              icon={
                open
                  ? "material-symbols:keyboard-arrow-down"
                  : "material-symbols:keyboard-arrow-up"
              }
            />
          </IconButton>
        </Stack>
        {open && (
          <>
            <Card
              sx={{
                height: "84%",
                display: "flex",
                flexDirection: "column",
                overflowY: "scroll",
                // marginBottom: "20px",
              }}
            >
              {messages.map((messageObj) => (
                <ChatMessage
                  sender={messageObj.sender}
                  message={messageObj.message}
                />
              ))}
            </Card>
            <Divider />
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              position="sticky"
              bottom={-1}
              paddingY={0.5}
              alignItems="center"
              borderRadius="10px"
              // backgroundColor={theme.palette.grey[700]}
              backgroundColor={theme.palette.am.dark}
            >
              <Input
                placeholder="Enter document prompt..."
                variant="contained"
                multiline={true}
                sx={{
                  width: "80%",
                  marginLeft: "20px",
                  color: theme.palette.common.white,
                }}
                value={currMessage}
                onChange={_handleInputChange}
                disabled={inputDisabled}
              />
              {/* <Button
                onClick={() => sendMessage()}
                disabled={sendDisabled}
                sx={{ marginRight: "10px" }}
              >
                Send
              </Button> */}
              <IconButton
                onClick={() => sendMessage()}
                disabled={sendDisabled}
                sx={{ marginRight: "10px" }}
              >
                <Iconify icon="bi:send-fill" />
              </IconButton>
            </Stack>
          </>
        )}
      </Card>
    </Container>
  );
};

export default Chatbot;

const ChatMessage = ({ sender, message }) => {
  const theme = useTheme();
  const receivedStyles = {
    backgroundColor: theme.palette.am.grey,
    maxWidth: "50%",
    borderRadius: "5px",
    marginLeft: "2px",
    width: "auto",
    margin: "2px",
    paddingRight: "10px",
    paddingY: "5px",
  };
  const sentStyles = {
    backgroundColor: theme.palette.am.main,
    maxWidth: "50%",
    borderRadius: "5px",
    width: "auto",
    margin: "2px",
    marginRight: "5px",
    paddingLeft: "5px",
    paddingRight: "10px",
    paddingY: "5px",
  };
  return (
    <Box
      display="flex"
      justifyContent={sender === "user" ? "flex-end" : "flex-start"}
    >
      <Box sx={sender === "user" ? sentStyles : receivedStyles}>
        <Typography color="white" sx={{ marginLeft: "5px", lineHeight: 1 }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};
