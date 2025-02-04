from openai import AzureOpenAI

from dotenv import find_dotenv, load_dotenv
import pandas as pd
import re

from io import BytesIO
import matplotlib.pyplot as plt
from PIL import Image
import time
import os
os.environ['KMP_DUPLICATE_LIB_OK']='True'
import nltk
nltk.download('vader_lexicon')
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from transformers import pipeline


dotenv_path = find_dotenv()
load_dotenv(dotenv_path)
AI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
if not AI_API_KEY or not AI_ENDPOINT:
    raise ValueError("AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT must be set in the environment variables")

api_version = "2024-05-01-preview"
model = "gpt-4o"

class AIModel:
  def __init__(self):
    self.client = AzureOpenAI(api_key=AI_API_KEY, azure_endpoint=AI_ENDPOINT, api_version="2024-05-01-preview")
    self.assistant = self.client.beta.assistants.create(name="Finance Analysis", 
                        instructions=f"You are a finance assistant. \
                        Your job is to interpret financial documents and provide analysis based on it. \
                        Compare to the wider industry where possible. \
                        For new lines signify via newline character in python. \
                        Don't present any calculations only present the answer. Do not use LaTeX. \
                        There should be no partial calculations without a final evaluated answer. \
                        Do not speak in the first person. \
                        When analysing and reading the documents focus on quantitative data. ",
                        tools=[{"type": "file_search"}, {"type": "code_interpreter"}],
                        model="gpt-4o")
    self.chatthread = self.client.beta.threads.create()
    self.threads_dict = {}
    
  def create_vector_store(self, file_paths):
    self.vector_store = self.client.beta.vector_stores.create(name="Financial Statements")
    file_streams = [open(path, "rb") for path in file_paths]
    file_batch = self.client.beta.vector_stores.file_batches.upload_and_poll(
                  vector_store_id=self.vector_store.id, files=file_streams)
    self.assistant = self.client.beta.assistants.update(
                    assistant_id=self.assistant.id, 
                    tool_resources={"file_search":{"vector_store_ids":[self.vector_store.id]}})

  def company_name(self):
    prompt = f"Return the company name of the company from the financial documents"
    thread = self.client.beta.threads.create(messages = [{"role": "user", "content": prompt}])
    thread_id = thread.id
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread_id,
    assistant_id=self.assistant.id,
    instructions="Return nothing other than the company name. Capitalise each word (title case)."
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread_id)
    
      if messages.data:
          return messages.data[0].content[0].text.value.replace("\n\n", "\n")


  def business_overview(self):
    prompt = f"Give a general business overview of the company. Focus on more recent data of the company. The overview should include a small amount about fiscal performance and future directions. Maximum of 200 words"
    thread = self.client.beta.threads.create(messages = [{"role": "user", "content": prompt}])
    thread_id = thread.id
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread_id,
    assistant_id=self.assistant.id,
    instructions=f"Use all years/quarters/time quantitative data in the financial statements.  When presenting calculations do not use latex just normal markdown text. Do not wrap any calculations in /."
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread_id)
      if messages.data:
          return messages.data[0].content[0].text.value.replace("\n\n", "\n")



  def analyse(self, instructions="", metric=None, reattempted=False):
    thread_key = metric.replace(" ", "").lower()
    prompt = f"Analyse specifically the {metric} of the company and how its changed over time. Have a max of 200 words. Use data from all time frames presented in documents."
    if thread_key not in self.threads_dict:
      thread = self.client.beta.threads.create(messages = [{"role": "user", "content": prompt}])
      self.threads_dict[thread_key] = thread.id
      thread_id = thread.id
    else:
      thread_id = self.threads_dict[thread_key]
      self.client.beta.threads.messages.create(thread_id=thread_id, role="user", content=prompt)
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread_id,
    assistant_id=self.assistant.id,
    instructions=f"Analyse the data and use all years/quarters/time quantitative data in the financial statements. \
                   When presenting calculations do not use latex just markdown text. Do not wrap calculations in /. \
                    {instructions}"
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread_id)
      if messages.data:
          return messages.data[0].content[0].text.value.replace("\n\n", "\n")
    if run.status == "failed" and not reattempted:
        time.sleep(40)
        return self.analyse(metric=metric, reattempted=True)
    return "Error in analysis"
  
  def plots(self, instructions="", metric=None, reattempted=False, customPrompt=""):
    thread_key = metric.replace(" ", "")
    if customPrompt != "":
      prompt = customPrompt
    else:
      prompt = f"Generate the code to create plots that can be used to analyse the {metric} of the company. \
              Use the time frame data from all consolidated statements in the plots. \
              Name the plots exactly {metric}_i where i increments for each plot.  \
              The plot should represent the analysis you previously conducted."
    if thread_key not in self.threads_dict:
      thread = self.client.beta.threads.create(messages = [{"role": "user", "content": prompt}])
      self.threads_dict[thread_key] = thread.id
      thread_id = thread.id
    else:
      thread_id = self.threads_dict[thread_key]
      message = self.client.beta.threads.messages.create(thread_id=thread_id, role="user", content=prompt)
    instructions = f"Generate matplotlib python code to plot the trends in the data for the given metric. \
                    The plot should represent the analysis you previously conducted. \
                    Include in the code the saving of the plot as a static image in the ./plots folder \
                    with the name of {metric}_i where i increments for each plot created, do not deviate \
                    from this naming convention at all. The folder has already been created. Do not run and \
                    save the file directly, only generate the code to do so. Some metrics (only revenue, \
                    cashflow and operating income) can be broken down into segments and these should all \
                    be on a single plot with the total. Don't have multiple plots that show the same data. \
                    Use all time frame data from all consolidated statements in the plots. \
                    Don't include plt.show() in the code. The x-axis should only have labels for the xaxis \
                    points with data. If data is not avaiable/cannot be calculated do not make up fake data, \
                    just ignore the plot completely! Make a maximum of 3 plots, so present only the most \
                    relevant data for {metric}. Make each plot have figsize=(10,6). \
                    Make the code compatible to be run via python exec(). {instructions}"
    run = self.client.beta.threads.runs.create_and_poll(thread_id=thread_id, assistant_id=self.assistant.id,instructions=instructions)
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread_id)
      if messages.data:
          for message in messages.data:
            for message_content in message.content:
              if hasattr(message_content, "image_file"):
                continue
              if hasattr(message_content, "text"):
                return message_content.text.value
    if run.status == "failed" and not reattempted:
        time.sleep(40)
        return self.plots(metric=metric, reattempted=True)
    return "Error in analysis"

  def chat_prompt(self, instructions="", prompt=None):
    message = self.client.beta.threads.messages.create(thread_id=self.chatthread.id, role="user", content=prompt)
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=self.chatthread.id,
    assistant_id=self.assistant.id,
    instructions="Answer in 100 words maximum. Do not use any latex at all. All calculations must be written in plain text"
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=self.chatthread.id,)
      if messages.data:
          return messages.data[0].content[0].text.value.replace("\n\n", "\n")
    return "Error in prompt"

  def yield_mda_chunks(self, full_section):
    for i in range(0,len(full_section), 511):
      if i+511 > len(full_section):
        yield full_section[i:]
      else:
        yield full_section[i:i+511]
  def mda_score(self):
    thread = self.client.beta.threads.create(messages = 
    [{"role": "user", "content": "Return the entire Management Discussion and Analysis section as plain text"}])
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread.id,
    assistant_id=self.assistant.id,
    instructions="Return the entire text of the most recent Management Discussion and Analysis section \
                  from the documents in the vector store and nothing else. The section may roll onto multiple pages, \
                  return the entire section as plain text"
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread.id)
      if messages.data:
          content = messages.data[0].content[0].text.value
      else:
        return None
    pipe = pipeline("text-classification", model="ProsusAI/finbert")
    mda_labels = {"positive": 0, "neutral": 0, "negative": 0}
    mda_chunked = self.yield_mda_chunks(content)
    i = 0
    # biases: pos = 100, neutal = 50, negative = 0
    for chunk in mda_chunked:
      new_sentiment = pipe(chunk)[0]
      mda_labels[new_sentiment["label"]] += new_sentiment["score"]
      i += 1
                        #  positive                     average neutral (total - neg - pos)
    final_score = round((mda_labels["positive"]*100 + (i-mda_labels["negative"]-mda_labels["positive"])*50)/i)
    for k,v in mda_labels.items():
      mda_labels[k] = round(v/i, 2)
    return f"{final_score},{mda_labels['positive']},{mda_labels['neutral']},{mda_labels['negative']}"
    
