# API Pattern

Every new endpoint follows the same process.

1. Create a request transformer.
2. Create a response transformer.
3. Add the service function.
4. Consume the service from a hook.
5. Render data in the component.

Never skip any layer.
Never call the backend directly from components or hooks.
