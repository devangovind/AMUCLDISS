import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import App from "./App";

import ThemeProvider from "./theme";
import { ThemeSettings } from "./theme/themeSettings";
import { TextEncoder } from "util";

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.endsWith("/uploadfiles/")) {
      return Promise.resolve({
        ok: true,
      });
    } else if (url.endsWith("/prompt/")) {
      return Promise.resolve({
        ok: true,
        body: {
          getReader: () => ({
            read: () =>
              Promise.resolve({
                done: true,
                value: new TextEncoder().encode("Mocked overview response"),
              }),
            releaseLock: () => {},
          }),
        },
      });
    } else if (url.endsWith("/plotprompt/")) {
      return Promise.resolve({ ok: true });
    } else if (url.startsWith("http://localhost:8000/list-images")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    } else if (url.endsWith("/mdascore/")) {
      return Promise.resolve({
        ok: true,
        text: () => "50",
      });
    } else if (url.endsWith("/chatprompt/")) {
      return Promise.resolve({
        ok: true,
        text: () => "mock chat response",
      });
    } else if (url.endsWith("/download-ppt/")) {
      const pptBlob = new Blob(["Mocked PowerPoint file content"], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
      return Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(pptBlob),
      });
    } else {
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    }
  });
  global.TextDecoder = jest.fn(() => ({
    decode: jest.fn((value) => new TextDecoder().decode(value)),
  }));
  global.URL.createObjectURL = jest.fn(() => "mocked-url");
  global.URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});
const CustomRender = ({ children }) => {
  return (
    <ThemeSettings
      defaultSettings={{
        themeMode: "light", // 'light' | 'dark'
      }}
    >
      <ThemeProvider>{children}</ThemeProvider>
    </ThemeSettings>
  );
};

test("renders drap and drop box", () => {
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const Drag = screen.getByText(/Drag and drop your files here/i);
  expect(Drag).toBeInTheDocument();
});

test("allows for file upload", () => {
  const file = [
    new File(["testfile1"], "test.pdf", { type: "application/pdf" }),
  ];
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const uploadInput = screen.getByLabelText(/Browse files/i);

  userEvent.upload(uploadInput, file);

  expect(uploadInput.files).toHaveLength(1);
});

test("allows for multiple files to be uploaded", () => {
  const currDate = Date.now();
  const files = [
    new File(["testfile1"], "test.pdf", {
      type: "application/pdf",
      lastModified: currDate,
    }),
    new File(["testfile2"], "test2.pdf", {
      type: "application/pdf",
      lastModified: currDate,
    }),
  ];
  const file2 = [
    new File(["testfile3"], "test3.pdf", {
      type: "application/pdf",
      lastModified: currDate,
    }),
  ];
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const uploadInput = screen.getByLabelText(/Browse files/i);
  userEvent.upload(uploadInput, files);
  userEvent.upload(uploadInput, file2);

  const uploaded1 = screen.getByText(/test.pdf/i);
  const uploaded2 = screen.getByText(/test2.pdf/i);
  const uploaded3 = screen.getByText(/test3.pdf/i);
  expect(uploaded1).toBeInTheDocument();
  expect(uploaded2).toBeInTheDocument();
  expect(uploaded3).toBeInTheDocument();
});

test("doesn't allows for duplicate file uploads", () => {
  const currDate = Date.now();
  const file1 = [
    new File(["testfile1"], "test.pdf", {
      type: "application/pdf",
      lastModified: currDate,
    }),
  ];
  const file2 = [
    new File(["testfile1"], "test.pdf", {
      type: "application/pdf",
      lastModified: currDate,
    }),
  ];
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const uploadInput = screen.getByLabelText(/Browse files/i);
  userEvent.upload(uploadInput, file1);
  userEvent.upload(uploadInput, file2);
  const uploaded = screen.getAllByText(/test.pdf/i);
  expect(uploaded).toHaveLength(1);
  expect(uploadInput.files).toHaveLength(1);
});

test("doesn't render AI financial advisor before documents are uploaded", () => {
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const aiFinancialAdvisor = screen.queryByLabelText(/chat-bot/i);
  expect(aiFinancialAdvisor).not.toBeInTheDocument();
});

test("displays AI financial advisor after upload", async () => {
  const file = [
    new File(["testfile1"], "test.pdf", { type: "application/pdf" }),
  ];
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const uploadInput = screen.getByLabelText(/Browse files/i);
  userEvent.upload(uploadInput, file);

  userEvent.click(screen.getByText(/Business Overview/i));

  const button = screen.getByText(/Submit/i);
  await act(async () => {
    userEvent.click(button);
  });

  const aiFinancialAdvisor = screen.getByText(/AI Financial Advisor Chat/i);
  expect(aiFinancialAdvisor).toBeInTheDocument();
});

test("AI financial advisor is correctly opened", async () => {
  const file = [
    new File(["testfile1"], "test.pdf", { type: "application/pdf" }),
  ];
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const uploadInput = screen.getByLabelText(/Browse files/i);
  userEvent.upload(uploadInput, file);

  userEvent.click(screen.getByText(/Business Overview/i));

  const button = screen.getByText(/Submit/i);
  await act(async () => {
    userEvent.click(button);
  });

  const aiFinancialAdvisorOpen = screen.queryByLabelText(/chat-bot-toggle/i);
  expect(aiFinancialAdvisorOpen).toBeInTheDocument();

  userEvent.click(aiFinancialAdvisorOpen);

  const aiFinancialAdvisorMessage = screen.getByText(
    /Send a prompt here and the documents uploaded will be queried for an answer/i
  );
  expect(aiFinancialAdvisorMessage).toBeInTheDocument();
});

test("displays download button after completion", async () => {
  const file = [
    new File(["testfile1"], "test.pdf", { type: "application/pdf" }),
  ];
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const uploadInput = screen.getByLabelText(/Browse files/i);
  userEvent.upload(uploadInput, file);
  userEvent.click(screen.getByText(/Business Overview/i));
  expect(screen.queryByLabelText(/download-button/i)).not.toBeInTheDocument();

  const button = screen.getByText(/Submit/i);
  await act(async () => {
    userEvent.click(button);
  });
  await waitFor(() => {
    expect(screen.getByLabelText(/download-button/i)).toBeInTheDocument();
  });
});

test("clicking download downloads powerpoint", async () => {
  const file = [
    new File(["testfile1"], "test.pdf", { type: "application/pdf" }),
  ];
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const uploadInput = screen.getByLabelText(/Browse files/i);
  userEvent.upload(uploadInput, file);

  userEvent.click(screen.getByText(/Business Overview/i));

  const button = screen.getByText(/Submit/i);
  await act(async () => {
    userEvent.click(button);
  });
  expect(screen.getByText("Results")).toBeInTheDocument();
  await waitFor(() => {
    const dlButton = screen.getByLabelText(/download-button/i);
    expect(dlButton).toBeInTheDocument();
    userEvent.click(dlButton);
  });
  expect(global.URL.createObjectURL).toHaveBeenCalled();
});

//
//
//
//
// INTEGRATION

test("displays the analysis", async () => {
  const file = [
    new File(["testfile1"], "test.pdf", { type: "application/pdf" }),
  ];

  render(
    <CustomRender>
      <App />
    </CustomRender>
  );

  const uploadInput = screen.getByLabelText(/Browse files/i);

  userEvent.upload(uploadInput, file);

  userEvent.click(screen.getByText(/Business Overview/i));
  userEvent.click(screen.getByText(/Revenue/i));

  const button = screen.getByText(/Submit/i);
  await act(async () => {
    userEvent.click(button);
  });
  expect(screen.getByText("Results")).toBeInTheDocument();
  expect(screen.getByText("Business Overview")).toBeInTheDocument();
  expect(screen.getByText("Revenue")).toBeInTheDocument();
});

test("displays sentiment score", async () => {
  const file = [
    new File(["testfile1"], "test.pdf", { type: "application/pdf" }),
  ];
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const uploadInput = screen.getByLabelText(/Browse files/i);
  userEvent.upload(uploadInput, file);
  userEvent.click(screen.getByText(/Business Overview/i));
  userEvent.click(
    screen.getByLabelText(
      /Include sentiment analysis on Managament Discussion & Analysis section?/i
    )
  );

  const button = screen.getByText(/Submit/i);
  await act(async () => {
    userEvent.click(button);
  });
  await waitFor(() => {
    expect(screen.getByText(/Sentiment score:/i)).toBeInTheDocument();
  });
});

test("message system of financial advisor", async () => {
  const file = [
    new File(["testfile1"], "test.pdf", { type: "application/pdf" }),
  ];
  render(
    <CustomRender>
      <App />
    </CustomRender>
  );
  const uploadInput = screen.getByLabelText(/Browse files/i);
  userEvent.upload(uploadInput, file);

  userEvent.click(screen.getByText(/Business Overview/i));

  const button = screen.getByText(/Submit/i);
  await act(async () => {
    userEvent.click(button);
  });

  const aiFinancialAdvisorOpen = screen.queryByLabelText(/chat-bot-toggle/i);
  expect(aiFinancialAdvisorOpen).toBeInTheDocument();

  userEvent.click(aiFinancialAdvisorOpen);

  const chatPrompt = "test-chat-prompt";
  const inputField = screen.getByPlaceholderText(/Enter document prompt.../i);
  expect(screen.queryByText(chatPrompt)).not.toBeInTheDocument();

  userEvent.type(inputField, chatPrompt);

  const sendPrompt = screen.getByLabelText("chat-bot-send");

  userEvent.click(sendPrompt);

  await waitFor(() => {
    expect(screen.getAllByText(chatPrompt)).toHaveLength(2);
  });
  await waitFor(() => {
    expect(screen.getByText("mock chat response")).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getAllByText(chatPrompt)).toHaveLength(1);
  });
});

// // // // test("doesn't render AI financial advisor before documents are uploaded", () => {
// // // //   render(
// // // //     <CustomRender>
// // // //       <App />
// // // //     </CustomRender>
// // // //   );
// // // //   const aiFinancialAdvisor = screen.queryByText(/AI Financial Advisor/i);
// // // //   expect(aiFinancialAdvisor).toBeInTheDocument();
// // // // });
