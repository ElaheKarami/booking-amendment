# Transformer Pattern

Every backend model is transformed.

Backend DTO
→ Transformer
→ Frontend Model
→ UI

Every frontend request is transformed before sending.

Frontend Model
→ Input Transformer
→ Backend DTO

Components never consume or send raw backend objects.
