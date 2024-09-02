# test_main.py

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
import unittest
from unittest.mock import patch, MagicMock
from assistant_test import AIModel  

class BackendTests(unittest.TestCase):
    @patch('assistant_test.AzureOpenAI')  
    def test_initialization_does_not_raise_404(self, MockAzureOpenAI):
        mock_client = MagicMock()
        MockAzureOpenAI.return_value = mock_client
        mock_client.beta.assistants.create.return_value = MagicMock()
        mock_client.beta.threads.create.return_value = MagicMock()
        try:
            model = AIModel()
            self.assertIsNotNone(model.client)
            self.assertIsNotNone(model.assistant)
            self.assertIsNotNone(model.chatthread)
            self.assertIsInstance(model.threads_dict, dict)
        except Exception as e:
            self.fail(f'AIModel initialization raised an exception: {e}')
    
    def test_prompt(self):
        response = client.post("/prompt/", json={"body": "Test Item"})
        self.assertEqual(response.status_code, 200)

# def test_read_item():
#     response = client.get("/items/42?q=test")
#     assert response.status_code == 200
#     assert response.json() == {"item_id": 42, "q": "test"}

# def test_read_item_no_query():
#     response = client.get("/items/42")
#     assert response.status_code == 200
#     assert response.json() == {"item_id": 42, "q": None}
# def test_initialisation():





if __name__ == "__main__":

    unittest.main()