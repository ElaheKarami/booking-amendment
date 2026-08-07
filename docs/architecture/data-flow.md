# Data Flow

## API Flow

Component
→ Hook
→ Service
→ apiRequestObject
→ Axios
→ Backend

Never skip layers.

## Response Flow

Backend DTO
→ Transformer
→ Frontend Model
→ Component

Components never consume raw backend responses.

## Request Flow

Form
→ Input Transformer
→ Backend DTO
→ Backend API

## Loading Flow

Loading
→ Skeleton
→ Success / Empty / Error
