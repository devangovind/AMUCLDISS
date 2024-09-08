# AM-UCL

### Environment Variables

Create a .env, if not already present. Inside initialise the variables AZURE_OPENAI_API_KEY, and AZURE_OPENAI_ENDPOINT for use in assistant.py

### Docker

The project is split into 2 docker containers (front and backend). From top level dir, Run docker compose build to create both docker images, followed by docker compose up to run the application

### Tests

Frontend: CD into front-end and run npm test
Backend: CD into fastapi-backend and run pytest
