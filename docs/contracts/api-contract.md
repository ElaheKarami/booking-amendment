# API Contract

Every backend interaction follows the same pipeline.

Flow:
Component
→ Hook
→ Service
→ apiRequestObject
→ Axios
→ Backend

Rules:
- Never bypass the service layer.
- Normalize every response.
- Transform every request and response.
- Handle errors through centralized error handling.
- Use typed models throughout the application.
