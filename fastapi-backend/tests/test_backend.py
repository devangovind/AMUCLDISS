# test_main.py

from fastapi.testclient import TestClient
from main import app, check_env

client = TestClient(app)
import unittest
from unittest.mock import patch, MagicMock
from assistant_test import AIModel  
import os
import pytest

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

def test_initialization_does_not_raise_404():
    # Example test for AIModel initialization
    from assistant_test import AIModel
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

def test_prompt():
    # Ensure the application behaves correctly when environment variables are missing
    response = client.post("/prompt/", json={"body": "Test Item"})
    assert response.status_code == 200  # Adjust based on expected behavior

def test_env_check_with_missing_vars(set_env_vars):
    # Use monkeypatch to simulate missing environment variables
    # monkeypatch.delenv('AZURE_OPENAI_API_KEY', raising=False)
    # monkeypatch.delenv('AZURE_OPENAI_ENDPOINT', raising=False)

    # Check if ValueError is raised
    with pytest.raises(ValueError, match="AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT must be set in the environment variables"):
        check_env()






# if __name__ == "__main__":

#     unittest.main()