from openai import AzureOpenAI

from dotenv import find_dotenv, load_dotenv
import pandas as pd
import re
from openai import AssistantEventHandler
from typing_extensions import override
from io import BytesIO
import matplotlib.pyplot as plt
from PIL import Image
import time
import os
os.environ['KMP_DUPLICATE_LIB_OK']='True'
# from transformers import BertTokenizer, BertForSequenceClassification
import nltk
nltk.download('vader_lexicon')
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from transformers import pipeline
# from transformers import BertTokenizer, BertForSequenceClassification
# from transformers import pipeline

# # Load model directly
# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# # Use a pipeline as a high-level helper
# from transformers import pipeline

# nlp = pipeline("text-classification", model="ProsusAI/finbert")


# import multiprocessing

# # Set start method for multiprocessing to 'spawn' to avoid resource tracker issues
# multiprocessing.set_start_method('spawn', force=True)
# import torch







dotenv_path = find_dotenv()
load_dotenv(dotenv_path)
AI_API_KEY = os.getenv("AI_API_KEY")
AI_ENDPOINT = os.getenv("AI_ENDPOINT")

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
  
# for message in reversed(messages.data):
#             for message_content in message.content:
#               if hasattr(message_content, "image_file"):
#                 file_id = message_content.image_file.file_id
#                 resp = self.client.files.with_raw_response.content(file_id)
#                 if resp.status_code == 200:
#                   image_data = BytesIO(resp.content)
#                   img = Image.open(image_data)
#                   img.show()
#               if hasattr(message_content, "text"):
#                  value = message_content.text.value

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
  
  # def mda_score(self):
  #   # thread = self.client.beta.threads.create(messages = [{"role": "user", "content": "Analyse the documents as a whole and specifically the managements discussion and analysis section from the latest information in the vector store and perform sentiment analysis on it. The response should be a two numbers separated by a comma. The first number should be a rating of the companies performance and future outlook out of 100. The second number should be a probability/trust value as to how accurate the first number is based on the report."}])
  #   thread = self.client.beta.threads.create(messages = [{"role": "user", "content": "Analyse the documents specifically the most recent information and perform sentiment analysis on it. From the document(s) use the most recent Management Discussion and Analysis (MD&A) section to perform sentiment analysis. Give the company a rating out of 100 based on its future outlook. Return only the number on its own!"}])
  #   run = self.client.beta.threads.runs.create_and_poll(
  #   thread_id=thread.id,
  #   assistant_id=self.assistant.id,
  #   instructions="Return the sentiment score which should be a rating of the companies performance and future outlook out of 100 based on sentiment analysis from the Management Discussion and Analysis (MD&A) section. A higher score represents a better company outlook. Return only the sentiment score. Do not return anything else other than the score on its own! If the MD&A section is not present in the document or sentiment analysis cannot be performed, return an error"
  #   )
  #   if run.status == 'completed': 
  #     messages = self.client.beta.threads.messages.list(thread_id=thread.id)
  #     print(messages)
      
  #     if messages.data:
  #         # return value
  #         return messages.data[0].content[0].text.value.replace("\n\n", "\n")
  #   return "Error in prompt"
  def mda_chunks(self, full_section):
    parts = []
    for i in range(0,len(full_section), 511):
      if i+100 > len(full_section):
        parts.append(full_section[i:])
      else:
        parts.append(full_section[i:i+100])
    return parts

  def yield_mda_chunks(self, full_section):
    for i in range(0,len(full_section), 511):
      if i+511 > len(full_section):
        yield full_section[i:]
      else:
        yield full_section[i:i+511]

  
  def mda_score2(self):
    thread = self.client.beta.threads.create(messages = [{"role": "user", "content": "Return the entire Management Discussion and Analysis section as plain text"}])
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread.id,
    assistant_id=self.assistant.id,
    instructions="Return the entire text of the most recent Management Discussion and Analysis section from the documents in the vector store and nothing else. The section may roll onto multiple pages, return the entire section as plain text"
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread.id)
      if messages.data:
          # return value
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
    final_score = round((mda_labels["positive"]*100 + (i-mda_labels["negative"]-mda_labels["positive"])*50)/i)
    for k,v in mda_labels.items():
      mda_labels[k] = round(v/i, 2)
    return f"{final_score},{mda_labels['positive']},{mda_labels['neutral']},{mda_labels['negative']}"
    
  def mda_score(self):

    thread = self.client.beta.threads.create(messages = [{"role": "user", "content": "Return the entire Management Discussion and Analysis section as plain text"}])
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread.id,
    assistant_id=self.assistant.id,
    instructions="Return the entire text of the most recent Management Discussion and Analysis section from the documents in the vector store"
    )
    analyzer = SentimentIntensityAnalyzer()
    # tokenizer = BertTokenizer.from_pretrained('yiyanghkust/finbert-tone')
    # model = BertForSequenceClassification.from_pretrained('yiyanghkust/finbert-tone')
    # model.eval()
    
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread.id)

      
      if messages.data:
          # return value
          content = messages.data[0].content[0].text.value
          scores = analyzer.polarity_scores(content)
          # parts = self.mda_chunks(content)
          # for p in parts:
          #   print(nlp(p))
          # inputs = tokenizer(messages.data[0].content[0].text.value[:512], return_tensors='pt')
          # print(inputs)
          # tokens = tokenizer.encode(messages.data[0].content[0].text.value[:512], return_tensors='pt')
          # print(tokens)
          # result = model(tokens)
          # print("tokens", result)

# Get the model's outputs
          # with torch.no_grad():
          #     outputs = model(**inputs)

          # The output contains logits, which we can use for sentiment classification
          # logits = outputs.logits

          # # Convert logits to probabilities
          # probabilities = torch.softmax(logits, dim=1).cpu().numpy()
          # print("probs", probabilities)
          # Get the sentiment scores for each class (positive, negative, neutral)
          # sentiment_scores = probabilities[0]
          print("SENTIMENT SCOREEEEEE", scores, ((scores["compound"]+1)*50), (scores["neu"]*0.5 + scores["pos"])*100)
          return (scores["neu"]*0.5 + scores["pos"])*100
    return "Error in prompt"
     
     
# if __name__ == "__main__":
#    model = AIModel()
#   #  with open("saved_files/Amazon-2022-Annual-Report.pdf") as f:
#   #     print(f)
#    file_path = ["Ash_Random/2/fastapi-backend/saved_files/Amazon-2022-Annual-Report.pdf"]
#    file_path = ["Ash_Random/2/fastapi-backend/saved_files/goog023-alphabet-2023-annual-report-web-1.pdf"]
#    model.add_vector_store(file_path)
#    time.sleep(5)


#    print(model.analyse2(prompt="What is the name of the company presented in the files uplaoded (and wh7at are the files named) and explain why you know this is correct. Give the source"))