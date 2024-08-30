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
from transformers import BertTokenizer, BertForSequenceClassification
import nltk
nltk.download('vader_lexicon')
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from transformers import BertTokenizer, BertForSequenceClassification
from transformers import pipeline

# Load model directly
from transformers import AutoTokenizer, AutoModelForSequenceClassification
# Use a pipeline as a high-level helper
from transformers import pipeline

nlp = pipeline("text-classification", model="ProsusAI/finbert")


import multiprocessing

# Set start method for multiprocessing to 'spawn' to avoid resource tracker issues
multiprocessing.set_start_method('spawn', force=True)
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
    self.assistant = self.client.beta.assistants.create(name="Finance Visualisation", instructions="You are a finance assistant. Your job is to interpret financial documents and provide analysis based on it. Compare to the wider industry where possible. For new lines signify via newline character in python. To make something a title rather than use ###, wrap it in <h3> tags. To make a subtitle/bold, wrap it in **. Don't present any calculations only present the answer. DO NOT USE ANY LaTeX!! There should be NO partial calculations without a final evaluated answer!! All code produced needs to be in a single ``` block. Do not speak in the first person. The data you read from in the vector store will likely be annual or quarterly report so in the analysis take into account the timeframe of the data and specify if its just quarterly. Remember to look at whether the quantitative values are positive or negative (indicated by () or the caption (loss)). When analysing and reading the documents focus on quantitative data. Do not include the citations/sources at all in the response",tools=[{"type": "file_search"}, {"type": "code_interpreter"}],
                                          model="gpt-4o")
    self.chatthread = self.client.beta.threads.create()
    self.threads_dict = {}
  def create_vector_store(self, file_paths):
    self.vector_store = self.client.beta.vector_stores.create(name="Financial Statements")
    file_streams = [open(path, "rb") for path in file_paths]
    file_batch = self.client.beta.vector_stores.file_batches.upload_and_poll(vector_store_id=self.vector_store.id, files=file_streams)
    self.assistant = self.client.beta.assistants.update(assistant_id =self.assistant.id, tool_resources={"file_search":{"vector_store_ids":[self.vector_store.id]}})
    self.thread = self.client.beta.threads.create()
  def analyse(self, instructions=None, messages=None):
    # and plot the data. Also pick out other key KPIs from the report such as PBT margin, income to cost ratio, gross yield 
    # nalyse the revenue of the company and how it has changed over time. Use all data possible to give most in depth analysis and changes over time and specify if some data is only quarterly vs annual. Also pick out other key KPIs from the report such as PBT margin, income to cost ratio, gross yield, cost of risk, return on tangible equity, net interest margin for all years available. Discuss how theyve changed year on year/quarter. If any of the KPIs arent explicitly mentioned but can be calculated, calculate the value. If a KPI cant be calcualted and isnt stated, then ignore it and move to the next one. When completing a calculation only show the final answer as latex will not show up properly in HTML.  The KPIs should be section headers. Start with an overall overview and then go into specifics of the answer. In the overview explain whether the changes have been positive or negative. Compare to the metrics to the wider industry. Produce code to generate plots as well. Keep all the code in one coherent block. Output the KPIs into a dictionary of structure key=metric, value=[yearly/quarterly values] also have a single key/value pair of years:[years]
    thread = self.client.beta.threads.create(messages = [{"role":"assistant", "content":"To make something a title rather than use ###, wrap it in <h3> tags. To make a subtitle/bold, wrap it in **. USE NEWLINE CHARACTERS TO BREAK UP DIFFERENT SECTIONS!!!!. Additionally this is going to be displayed on a webpage so using special formatting for code etc. shouldnt be used. Don't present any calculations only present the answer. KPIs not shown explicitily but can be calculated should be. All code produced for plots needs to be in a single ``` block (not block per section). DO NOT USE ANY LaTeX!!. Don't speak in the first person."}, 
                                                         {"role":"user", "content":"Analyse the revenue of the company and how it has changed over time. Use all data possible to give most in depth analysis and changes over time and specify if some data is only quarterly vs annual. Also pick out other key KPIs from the report such as PBT margin, income to cost ratio, gross yield, cost of risk, return on tangible equity, net interest margin for all years available. Discuss how theyve changed year on year/quarter. If any of the KPIs arent explicitly mentioned but can be calculated or derived, calculate the value and include it in the KPI dictionary.  \
                                                          If a KPI cant be calcualted and isnt stated, then completely ignore it and DON'T include it in the response. When completing a calculation only show the final answer as latex will not show up properly in HTML. The KPIs should be section headers. Start with an overall overview and then go into specifics of the answer. In the overview explain whether the changes have been positive or negative. Compare to the metrics to the wider industry. Produce code to store the KPIs in a dictionary called 'kpis'. The first key/value pair must be time: [years/quarters/dates]. \
                                                          Specify if the dates are based on annual or quarterly. The other key/value pairs should take the form of metric: [time interval values]. Name the metrics as if they were to be plotted with units e.g. Revenue (in millions) USD. Don't assume any KPIs, only quantitative data. Also don't have calculations as the values in the dictionary, evaluate the result and store the value as int/float. In the explanation of revenue break down where its come from (which operations and regions) and how that changed over time"}])
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread.id,
    assistant_id=self.assistant.id,
    instructions=""
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread.id)

      images = []
      image_name = 0
      message_index = 0
      if messages.data:
          for message_content in messages.data[0].content:
            if hasattr(message_content, "image_file"):
              message_index += 1
              file = message_content.image_file.file_id
              resp = self.client.files.with_raw_response.content(file)
              image_data = BytesIO(resp.content)

              img=Image.open(image_data)
              # img.show()
              
              img.save(f"plot{len(images)}.png")
              images.append(f"plot{len(images)}.png")

          return messages.data[0].content[message_index].text.value.replace("\n\n", "\n"), images

    print(run.status)
    print(run)
    return "Error in analysis",[]

  # def create_thread(self):
  #   self.thread =self.client.beta.threads.create(messages = [{"role":"assistant", "content":"To make something a title rather than use ###, wrap it in <h3> tags. To make a subtitle/bold, wrap it in **. USE NEWLINE CHARACTERS TO BREAK UP DIFFERENT SECTIONS!!!!. Additionally this is going to be displayed on a webpage so using special formatting for code etc. shouldnt be used. Don't present any calculations only present the answer. KPIs not shown explicitily but can be calculated should be. All code produced for plots needs to be in a single ``` block (not block per section). DO NOT USE ANY LaTeX!!. Don't speak in the first person."}])
    
  def analyse2(self, instructions="", prompt=None, reattempted=False):
    thread_key = prompt.split()[0]
    if thread_key not in self.threads_dict:
      thread = self.client.beta.threads.create(messages = [{"role": "user", "content": prompt}])
      self.threads_dict[thread_key] = thread.id
      thread_id = thread.id
    else:
      thread_id = self.threads_dict[thread_key]
      message = self.client.beta.threads.messages.create(thread_id=thread_id, role="user", content=prompt)
    # message = self.client.beta.threads.messages.create(thread_id=self.thread.id, role="user", content=prompt)
    # run = self.client.beta.threads.runs.create_and_poll(
    # thread_id=thread.id,
    # assistant_id=self.assistant.id,
    # instructions=f"Analyse the data and at the end use all years/quarters/time quantitative data in the financial statements to create a python dictionary called kpis with a key called time. Segment related data should be grouped in nested dictionary. USE ALL THE TIME FRAME DATA PRESENTED IN THE UPLOADED DOCUMENTS. Annual reports typically contain 2 or 3 years of quantitative data. Do not introduce the dictionary. {instructions}"
    # )
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread_id,
    assistant_id=self.assistant.id,
    instructions="Analyse the data and use all years/quarters/time quantitative data in the financial statements. When present calculations do not use latex just normal string text. Not using latex also means not wrapping calculations in /."
    )
    # thread = self.client.beta.threads.create(messages = [{"role": "user", "content": "This was a good answer but upadte the dictionary to include all time frame (years, quaters, etc.) data from the financial statements in the dictionary but dont include additional metrics. I literally want the exact same response but guarantee the existing metrics use all the time frame data in all of the documents. Keep all the written section the exact same. Remember do not introduce the dictionary. Keep the analysis the same and keep same structure and format of dictionary!"}])
    # run = self.client.beta.threads.runs.create_and_poll(
    # thread_id=thread.id,
    # assistant_id=self.assistant.id,
    # instructions=""
    # )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread_id)

      
      if messages.data:
          for message in reversed(messages.data):
            for message_content in message.content:

              if hasattr(message_content, "image_file"):
                file_id = message_content.image_file.file_id
                resp = self.client.files.with_raw_response.content(file_id)
                if resp.status_code == 200:
                  image_data = BytesIO(resp.content)
                  img = Image.open(image_data)
                  img.show()
              if hasattr(message_content, "text"):
                 value = message_content.text.value
          # print("message_data analyse", messages.data)
          # print(messages.data[0].content[0].text)
          # return value

          return messages.data[0].content[0].text.value.replace("\n\n", "\n")
    if run.status == "failed" and not reattempted:
        print("Made it here")
        time.sleep(40)
        return self.analyse2(prompt=prompt, reattempted=True)

    print(run.status)
    print(run)
    return "Error in analysis"

  def analyse3(self, instructions="", metric=None, reattempted=False):
    prompt = f"Analyse specifically the {metric} of the company and how its changed over time. Have a max of 200 words.Use all time frame data and specify where its come from."
    thread_key = metric
    if thread_key not in self.threads_dict:
      thread = self.client.beta.threads.create(messages = [{"role": "user", "content": prompt}])
      self.threads_dict[thread_key] = thread.id
      thread_id = thread.id
    else:
      thread_id = self.threads_dict[thread_key]
      message = self.client.beta.threads.messages.create(thread_id=thread_id, role="user", content=prompt)
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread_id,
    assistant_id=self.assistant.id,
    instructions="Analyse the data and use all years/quarters/time quantitative data in the financial statements. When present calculations do not use latex just normal string text. Not using latex also means not wrapping calculations in /."
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread_id)

      
      if messages.data:
          for message in reversed(messages.data):
            for message_content in message.content:

              if hasattr(message_content, "image_file"):
                file_id = message_content.image_file.file_id
                resp = self.client.files.with_raw_response.content(file_id)
                if resp.status_code == 200:
                  image_data = BytesIO(resp.content)
                  img = Image.open(image_data)
                  img.show()
              if hasattr(message_content, "text"):
                 value = message_content.text.value
          # print("message_data analyse", messages.data)
          # print(messages.data[0].content[0].text)
          # return value

          return messages.data[0].content[0].text.value.replace("\n\n", "\n")
    if run.status == "failed" and not reattempted:
        print("Made it here")
        time.sleep(40)
        return self.analyse2(prompt=prompt, reattempted=True)

    print(run.status)
    print(run)
    return "Error in analysis"


  def plots(self, instructions="", prompt=None, reattempted=False):
    thread_key = prompt.split()[0]
    if thread_key not in self.threads_dict:
      thread = self.client.beta.threads.create(messages = [{"role": "user", "content": prompt}])
    else:
      thread = self.threads_dict[thread_key]
      message = self.client.beta.threads.messages.create(thread_id=thread.id, role="user", content=prompt)
    # message = self.client.beta.threads.messages.create(thread_id=self.thread.id, role="user", content=prompt)
    instructions = "Generate a dictionary called 'kpis'. There should be one key called 'Time' which has value of the timeframes present in the report. The other keys should be the metrics in the prompt. If a metric is broken down by sector/segment, include the segment/sector inside a nested dictionary. Make the format for a segment broken down metric: [{sector1: [value1, value2..], sector2:[value1...]}]. Do not give the segments their own keys outside of the nested dictioanry. Name the metrics appropriately as they will be the titles of the plots"
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread.id,
    assistant_id=self.assistant.id,
    instructions=instructions
    )
    # thread = self.client.beta.threads.create(messages = [{"role": "user", "content": "This was a good answer but upadte the dictionary to include all time frame (years, quaters, etc.) data from the financial statements in the dictionary but dont include additional metrics. I literally want the exact same response but guarantee the existing metrics use all the time frame data in all of the documents. Keep all the written section the exact same. Remember do not introduce the dictionary. Keep the analysis the same and keep same structure and format of dictionary!"}])
    # run = self.client.beta.threads.runs.create_and_poll(
    # thread_id=thread.id,
    # assistant_id=self.assistant.id,
    # instructions=""
    # )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread.id)


      file_names = []
      if messages.data:
          for message in reversed(messages.data):
            for message_content in message.content:

              if hasattr(message_content, "image_file"):
                file_id = message_content.image_file.file_id
                resp = self.client.files.with_raw_response.content(file_id)
                if resp.status_code == 200:
                  image_data = BytesIO(resp.content)
                  img = Image.open(image_data)
              if hasattr(message_content, "text"):
                 value = message_content.text.value

          return value
    if run.status == "failed" and not reattempted:

        time.sleep(40)
        return self.plots(prompt=prompt, reattempted=True)

    print(run.status)
    print(run)
    return "Error in analysis"


  def plots2(self, instructions="", metric=None, reattempted=False):
    thread_key = metric.split()[0]
    prompt = f"Generate the code to create plots that can be used to analyse the {metric} of the company. Use the time frame data from all consolidated statements in the plots."
    if thread_key not in self.threads_dict:
      thread = self.client.beta.threads.create(messages = [{"role": "user", "content": prompt}])
      self.threads_dict[thread_key] = thread.id
      thread_id = thread.id
    else:
      thread_id = self.threads_dict[thread_key]
      message = self.client.beta.threads.messages.create(thread_id=thread_id, role="user", content=prompt)

    instructions = f"Generate matplotlib python code to plot the trends in the data for the given metric. Include in the code the saving of the plot as a static image in the ./plots folder with the EXACT name of {metric}_i where i increments for each plot created. The folder has already been created. Do not run and save the file directly, only generate the code to do so. Some metrics (typically revenue, cashflow and operating income) can be broken down into segments and these should all be on a single plot. Use all time frame data from all consolidated statements in the plots. Don't include plt.show() in the code. The x-axis should ONLY have labels for the xaxis points with data! If data is not avaiable/cannot be calculated DO NOT make up fake data, just ignore the plot completely! If your previous response did not include a metric, do not include it as a plot. Make a maximum of 3 plots so present the most relevant data for {metric}"
    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=thread_id,
    assistant_id=self.assistant.id,
    instructions=instructions
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=thread_id)
      file_names = []
      if messages.data:
          for message in messages.data:
            for message_content in message.content:

              if hasattr(message_content, "image_file"):
                continue
                file_id = message_content.image_file.file_id
                resp = self.client.files.with_raw_response.content(file_id)
                if resp.status_code == 200:
                  image_data = BytesIO(resp.content)
                  img = Image.open(image_data)
              if hasattr(message_content, "text"):
                value = message_content.text.value
                print("code value", messages.data, value)
                return value
    if run.status == "failed" and not reattempted:

        time.sleep(40)
        return self.plots2(prompt=prompt, reattempted=True)

    print(run.status)
    print(run)
    return "Error in analysis"

  def chat_prompt(self, instructions="", prompt=None):
    # thread = self.client.beta.threads.create(messages = [{"role": "user", "content": prompt}])
    message = self.client.beta.threads.messages.create(thread_id=self.chatthread.id, role="user", content=prompt)

    run = self.client.beta.threads.runs.create_and_poll(
    thread_id=self.chatthread.id,
    assistant_id=self.assistant.id,
    instructions="Answer in 100 words maximum. Do not use any latex at all! All calculations must be written in plain text"
    )
    if run.status == 'completed': 
      messages = self.client.beta.threads.messages.list(thread_id=self.chatthread.id,)

      
      if messages.data:
          # return value
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
    for i in range(0,len(full_section), 100):
      if i+100 > len(full_section):
        parts.append(full_section[i:])
      else:
        parts.append(full_section[i:i+100])
    return parts
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