from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request, Query
from fastapi.responses import StreamingResponse, PlainTextResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import AzureOpenAI, OpenAIError
import os
from dotenv import load_dotenv
import logging
from typing import List
import tiktoken
from assistant_test import AIModel
import matplotlib.pyplot as plt
import time
import re
from collections import defaultdict
import pandas as pd
from presentation_create import CreatePPT
import datetime


load_dotenv()

app = FastAPI()

api_key = os.getenv('AZURE_OPENAI_API_KEY')
azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
api_version = "2023-07-01-preview"
PLOT_DIR = "./plots"

if not api_key or not azure_endpoint:
    raise ValueError("AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT must be set in the environment variables")
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/images", StaticFiles(directory=PLOT_DIR), name="images")

def streamed_res(content):
    chunks = 3000

    for l in range(len(content)):
        time.sleep(0.005)
        yield content[l]

def format_to_html(text):
    # Replace headers denoted by '###'
    text = re.sub(r'### (.+)', r'<h4>\1</h4>', text)
    # Replace bold text denoted by '**'
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    text = re.sub(r"【.*?】", "", text)
    return text

def format_to_chat(text):
    text = re.sub(r'### (.+)', r'\1', text)

    # Replace bold text denoted by '**'
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    text = re.sub(r"【.*?】", "", text)
    return text

def parse_code(text):
    code_pattern = r"```(.*?)```"
    code = re.findall(code_pattern, text, re.DOTALL)
    if len(code) == 1:
        code = code[0]
    else: code = "\n".join(code)
    if code[:6] == "python":
        return code[6:]
    return code

def gen_plots2(code):
    try:
        exec(code)
        return
    except Exception as e:
        print("genplots exception", code, e)


def gen_plots3(years, data):
    for metric, value in data.items():
        if isinstance(value[0], dict):
            # do something
            sector_dict = defaultdict(list)
            for sector in value:
                for k,v in sector.items():
                    sector_dict[k].append(v)
            plt.figure(figsize=(10,6))
            plt.title(metric)
            for k,v in sector_dict.items():
                plt.plot(years, v, label=k, marker="o")
            plt.xticks(years)
            plt.ylabel(metric)
            plt.legend()
            figure_name = metric.replace(" ", "_")
            plt.savefig(f'./plots/{figure_name}.png')
        else:
            plt.figure(figsize=(10,6))
            plt.title(metric)
            plt.plot(years, value, marker="o")
            plt.xlabel("Years")
            plt.xticks(years)
            plt.ylabel(metric)
            figure_name = metric.replace(" ", "_")
            plt.savefig(f'./plots/{figure_name}.png')
            # if len(value) > 2:
            #     change = []
            #     for i in range(len(value)-1):
            #         change.append(((value[i+1]/value[i])-1)*100)
            #     plt.figure(figsize=(10,6))
            #     plt.title(f"{metric} % change")
            #     plt.bar(years[1:], change)
            #     plt.xlabel("Years")
            #     plt.xticks(years[1:])
            #     plt.ylabel("% Change")
            #     figure_name = metric.replace(" ", "_")
            #     plt.savefig(f'./plots/{figure_name}_change.png')
            
class Model:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Model, cls).__new__(cls)
            cls._instance.model = AIModel()  
        return cls._instance
    def create_vector_store(self, file_paths):
        self.model.create_vector_store(file_paths)
        return True
    def ask_prompt(self, prompt, instructions=""):
        return self.model.analyse2(prompt=prompt, instructions=instructions)
    def ask_metric(self, metric, instructions=""):
        if metric == "businessoverview":
            return self.model.businessoverview()
        return self.model.analyse3(metric=metric, instructions=instructions)
    def company_name(self):
        return self.model.company_name()
    def plot_prompt(self, prompt):
        return self.model.plots2(metric=prompt)
    def ask_chat_prompt(self, prompt):
        return self.model.chat_prompt(prompt=prompt)
    def mda_score(self):
        return self.model.mda_score()

class PPT:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PPT, cls).__new__(cls)
            cls._instance.pptobj = CreatePPT()  # Initialize your AI pptobj here
        return cls._instance
    def update_slide(self, slide, to_replace, content):
        self.pptobj.update_textbox(slide, to_replace, content)
    def add_content(self, title, content):
        self.pptobj.add_content(title, content)
    def update_title(self, title):
        self.pptobj.update_title(title)
    def add_images(self, metric):
        self.pptobj.add_images(metric)
    def output_path(self):
        return self.pptobj.outputpath


@app.post("/uploadfiles/")
async def upload_files(files: List[UploadFile] = File(...)):
    model = Model()
    ppt = PPT()
    file_contents = []
    content = {}
    excel_names = []

    for file in files:
        contents = await file.read()
        file_contents.append(contents) #remove line???
        with open(f'saved_files/{file.filename}', 'wb') as f:
            f.write(contents)
        
        if "xlsx" in file.filename:
            sheets_dict = pd.read_excel(f'saved_files/{file.filename}', sheet_name=None)
            for name, sheet in sheets_dict.items():   
                sheet.to_csv(f'saved_files/{name}.txt', '|', index = None, header=True)
                excel_names.append(f'saved_files/{name}.txt')
    file_paths = [f"saved_files/{file.filename}" for file in files if "xlsx" not in file.filename]
    file_paths.extend(excel_names)
    model.create_vector_store(file_paths)
    company_name = model.company_name()
    ppt.update_title(f"{company_name} Analysis")
    return True

@app.post("/prompt/")
async def ask_prompt(request: Request):
    prompt = await request.body()
    prompt_text = prompt.decode('utf-8')
    model = Model()
    ppt = PPT()
    ppt_slide = prompt_text.split()[0]
    res = model.ask_metric(prompt_text)
    # ppt.update_slide(ppt_slide.lower(),ppt_slide.lower(), res)
    ppt.add_content(prompt_text, res)
    return StreamingResponse(streamed_res(format_to_html(res)), media_type='text/event-stream')

@app.post("/plotprompt/")
async def ask_plots(request: Request):
    prompt = await request.body()
    prompt_text = prompt.decode('utf-8')
    ppt_slide = prompt_text.split()[0]
    model = Model()
    print("plotprompt prompttt", prompt_text)
    if prompt_text == "businessoverview":
        print('here, should be here once only')
        return ""
    res = model.plot_prompt(prompt_text)
    code_part = parse_code(res)
    print("parssed code", code_part)
    gen_plots2(code_part)
    ppt = PPT()
    ppt.add_images(prompt_text)
    return res

@app.post("/mdascore")
async def mda_score():
    model = Model()
    res = model.mda_score()
    return res

@app.post("/chatprompt/")
async def ask_chat_prompt(request: Request):
    prompt = await request.body()
    prompt_text = prompt.decode('utf-8')
    model = Model()
    res = model.ask_chat_prompt(prompt_text)
    return PlainTextResponse(format_to_chat(res))

@app.get("/download-ppt/")
def download_ppt():
    ppt = PPT()
    file_path = ppt.output_path()
    print("UPDATED TO SEE")
    return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", filename="analysis.pptx")



@app.get("/list-images")
def list_images(image_context = Query(None, alias="context")):
    print(image_context)
    with os.scandir(PLOT_DIR) as entries:
        files = [entry.name for entry in entries if entry.is_file() and image_context.lower() in entry.name.lower()]
    if image_context == "":
        with os.scandir(PLOT_DIR) as entries:
            files = [entry.name for entry in entries if entry.is_file() if "revenue" not in entry.name.lower() and "operating" not in entry.name.lower() and "cash" not in entry.name.lower()]
    print(files)
    return files



if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
