from openai import AzureOpenAI
import os
from dotenv import find_dotenv, load_dotenv

dotenv_path = find_dotenv()
load_dotenv(dotenv_path)
AI_API_KEY = '14012253e9bb4d998f39f49ec8a7f5e6'
AI_ENDPOINT = 'https://ucl-dev-01.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-03-15'

client = AzureOpenAI(api_key=AI_API_KEY, azure_endpoint=AI_ENDPOINT, api_version="2024-02-01")

response = client.chat.completions.create(model="gpt-35-turbo", messages=[{"role": "user", "content": "Who is the current UK prime minister?"}] )
print(response)
print(response.choices[0].message.content)
