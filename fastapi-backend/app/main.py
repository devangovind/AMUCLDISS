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
from assistant import AIModel
import matplotlib.pyplot as plt
import time
import re
from collections import defaultdict
import pandas as pd
from presentation import PPT
import datetime


load_dotenv()

app = FastAPI()

api_version = "2023-07-01-preview"

PLOT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "plots")

def check_env():
    api_key = os.getenv('AZURE_OPENAI_API_KEY')
    azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    if not api_key or not azure_endpoint:
        raise ValueError("AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT must be set in the environment variables")

@app.on_event("startup")
async def on_startup():
    check_env()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/images", StaticFiles(directory=PLOT_DIR), name="images")


def format_to_html(text):
    text = re.sub(r'### (.+)', r'<h4>\1</h4>', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    text = re.sub(r"【.*?】", "", text)
    return text

def format_to_chat(text):
    text = re.sub(r'### (.+)', r'\1', text)
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

def gen_plots(code):
    try:
        exec(code)
        return True
    except Exception as e:
        print("genplots exception", code, e)
        return e
    
class main_AIModel:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(main_AIModel, cls).__new__(cls)
            cls._instance.model = AIModel()  
        return cls._instance
    def create_vector_store(self, file_paths):
        self.model.create_vector_store(file_paths)
        return True
    def business_overview(self):
        return self.model.business_overview()
    def analyse(self, metric, instructions=""):
        return self.model.analyse(metric=metric, instructions=instructions)
    def company_name(self):
        return self.model.company_name()
    def plot_prompt(self, prompt, customPrompt=""):
        return self.model.plots(metric=prompt, customPrompt=customPrompt)
    def chat_prompt(self, prompt):
        return self.model.chat_prompt(prompt=prompt)
    def mda_score(self):
        return self.model.mda_score()

class main_PPT:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(main_PPT, cls).__new__(cls)
            cls._instance.pptobj = PPT() 
        return cls._instance
    def add_content(self, title, content):
        self.pptobj.add_content(title, content)
    def update_title(self, title):
        self.pptobj.update_title(title)
    def add_images(self, metric):
        self.pptobj.add_images(metric)
    def output_path(self):
        return self.pptobj.outputpath
    def add_mda(self, scores):
        self.pptobj.add_mda(scores)
    


@app.post("/uploadfiles/")
async def upload_files(files: List[UploadFile] = File(...)):
    model = main_AIModel()
    ppt = main_PPT()
    excel_names = []
    for file in files:
        contents = await file.read()
        with open(f'saved_files/{file.filename}', 'wb') as f:
            f.write(contents)
        if "xlsx" in file.filename:
            sheets_dict = pd.read_excel(f'saved_files/{file.filename}', sheet_name=None)
            for name, sheet in sheets_dict.items():   
                sheet.to_csv(f'saved_files/{name}_{sheet}.txt', '|', index = None, header=True)
                excel_names.append(f'saved_files/{name}_{sheet}.txt')
    file_paths = [f"saved_files/{file.filename}" for file in files if "xlsx" not in file.filename]
    file_paths.extend(excel_names)
    model.create_vector_store(file_paths)
    company_name = model.company_name()
    ppt.update_title(f"{company_name} Analysis")
    return True

@app.post("/prompt/")
async def prompt(request: Request):
    prompt = await request.body()
    prompt_text = prompt.decode('utf-8')
    model = main_AIModel()
    ppt = main_PPT()
    if prompt_text == "businessoverview":
        res = model.business_overview()
    else:
        res = model.analyse(prompt_text)
    ppt.add_content(prompt_text, res)
    return PlainTextResponse(format_to_html(res))

@app.post("/plotprompt/")
async def plotprompt(request: Request):
    prompt = await request.body()
    prompt_text = prompt.decode('utf-8')
    plot_prompt_text = prompt.decode('utf-8').replace(" ", "").lower()
    model = main_AIModel()
    if plot_prompt_text == "businessoverview":
        return ""
    res = model.plot_prompt(plot_prompt_text)
    code_part = parse_code(res)
    code_result = gen_plots(code_part)
    if  code_result != True:
        # Retry functionality
        new_prompt = f"This didn't work, i got the error {code_result}. Retry using the same instructions as before; \
                        make code for plots for metric {plot_prompt_text}"
        res = model.plot_prompt(prompt=plot_prompt_text, customPrompt=new_prompt)
        code_part = parse_code(res)
        code_result = gen_plots(code_part)
    ppt = main_PPT()
    ppt.add_images(prompt_text)
    return res

@app.get("/mdascore")
def mda_score():
    model = main_AIModel()
    ppt = main_PPT()
    res = model.mda_score()
    ppt.add_mda(res)
    return res


@app.post("/chatprompt/")
async def chat_prompt(request: Request):
    prompt = await request.body()
    prompt_text = prompt.decode('utf-8')
    model = main_AIModel()
    res = model.chat_prompt(prompt_text)
    return PlainTextResponse(format_to_chat(res))

@app.get("/download-ppt/")
def download_ppt():
    ppt = main_PPT()
    file_path = ppt.output_path()
    return FileResponse(file_path, 
                        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", 
                        filename="analysis.pptx")

@app.get("/list-images")
def list_images(image_context = Query(None, alias="metric")):
    if not image_context:
        return []
    with os.scandir(PLOT_DIR) as entries:
        files = [entry.name for entry in entries if entry.is_file() and image_context.lower() in entry.name.lower()]
    return files

if __name__ == '__main__':
    with os.scandir(PLOT_DIR) as existing_plots:
        for plot in existing_plots:
            os.remove(plot.path)
    with os.scandir("./saved_files") as existing_files:
        for f in existing_files:
            os.remove(f.path)
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
