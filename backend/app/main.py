from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import snippets

app = FastAPI(title="CodeShare Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(snippets.router, prefix="/api/snippets", tags=["snippets"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CodeShare Platform API"}
