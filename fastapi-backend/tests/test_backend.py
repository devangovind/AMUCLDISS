# test_main.py

from fastapi.testclient import TestClient
from main import app, check_env

client = TestClient(app)
import unittest
from unittest.mock import patch, MagicMock
from assistant_test import AIModel  
import os
import pytest
import tempfile

# class BackendTests(unittest.TestCase):
#     @patch('assistant_test.AzureOpenAI')  
#     def test_initialization_does_not_raise_404(self, MockAzureOpenAI):
#         mock_client = MagicMock()
#         MockAzureOpenAI.return_value = mock_client
#         mock_client.beta.assistants.create.return_value = MagicMock()
#         mock_client.beta.threads.create.return_value = MagicMock()
#         try:
#             model = AIModel()
#             self.assertIsNotNone(model.client)
#             self.assertIsNotNone(model.assistant)
#             self.assertIsNotNone(model.chatthread)
#             self.assertIsInstance(model.threads_dict, dict)
#         except Exception as e:
#             self.fail(f'AIModel initialization raised an exception: {e}')
    
#     def test_prompt(self):
#         response = client.post("/prompt/", json={"body": "Test Item"})
#         self.assertEqual(response.status_code, 200)
    
   

#     def test_ai_endpoint_with_missing_vars(self, monkeypatch):
#     # Use monkeypatch to simulate missing environment variables
#         monkeypatch.delenv('AZURE_OPENAI_API_KEY', raising=False)
#         monkeypatch.delenv('AZURE_OPENAI_ENDPOINT', raising=False)

#         # Make a request to ensure the application behaves correctly with missing vars
#         response = client.post("/prompt/", json={"body": "Test Item"})
#         assert response.status_code == 500  # Adjust based on expected behavior

#     def test_ai_endpoint(self):
#         os.environ.pop('AZURE_OPENAI_API_KEY', None)
#         os.environ.pop('AZURE_OPENAI_ENDPOINT', None)
#         with pytest.raises(ValueError, match="AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT must be set in the environment variables"):
#             response = client.post("/prompt/", json={"body": "Test Item"})
# def test_read_item():
#     response = client.get("/items/42?q=test")
#     assert response.status_code == 200
#     assert response.json() == {"item_id": 42, "q": "test"}

# def test_read_item_no_query():
#     response = client.get("/items/42")
#     assert response.status_code == 200
#     assert response.json() == {"item_id": 42, "q": None}
# def test_initialisation():

# Use pytest fixtures for setup and teardown if needed
@pytest.fixture
def set_env_vars(monkeypatch):
    # Remove the environment variables to simulate them being unset
    monkeypatch.delenv('AZURE_OPENAI_API_KEY', raising=False)
    monkeypatch.delenv('AZURE_OPENAI_ENDPOINT', raising=False)

@pytest.fixture
def create_images():
    plots_dir = os.path.join(os.path.dirname(__file__), '../plots')
    if not os.path.exists(plots_dir):
        os.makedirs(plots_dir)
    file_name = 'dummy.png'
    file_path = os.path.join(plots_dir, file_name)

    # Create an empty file with the specified name
    with open(file_path, 'w') as file:
        file.write('')  # Optionally, you can write some content if needed

    yield file_path
    if os.path.exists(file_path):
        os.remove(file_path)
    

def test_initialization_does_not_raise_404():
    with patch('assistant_test.AzureOpenAI') as MockAzureOpenAI:
        mock_client = MagicMock()
        MockAzureOpenAI.return_value = mock_client
        mock_client.beta.assistants.create.return_value = MagicMock()
        mock_client.beta.threads.create.return_value = MagicMock()
        try:
            model = AIModel()
            assert model.client is not None
            assert model.assistant is not None
            assert model.chatthread is not None
            assert isinstance(model.threads_dict, dict)
        except Exception as e:
            pytest.fail(f'AIModel initialization raised an exception: {e}')

def test_env_check_with_missing_vars(set_env_vars):
    # Check if ValueError is raised
    with pytest.raises(ValueError, match="AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT must be set in the environment variables"):
        check_env()
def test_prompt():
    response = client.post("/prompt/", json={"body": "Test Item"})
    assert response.status_code == 200
def test_plotprompt():
    response = client.post("/plotprompt/", json={"body": "Test Item"})
    assert response.status_code == 200
def test_mda():
    response = client.post("/mdascore/", json={"body": "Test Item"})
    assert response.status_code == 200
def test_download():
    response = client.get("/download-ppt/")
    assert response.status_code == 200
def test_list_images(create_images):
    response = client.get("/list-images?context=dummy")
    assert response.status_code == 200
    files = response.json()
    assert isinstance(files, list)
    assert len(files) == 1


# if __name__ == "__main__":

#     unittest.main()