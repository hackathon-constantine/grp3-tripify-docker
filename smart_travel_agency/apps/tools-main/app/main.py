import os
from api.agent_router import router as agent_router
# from settings import settings
# from settings import setting
from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from contextlib import asynccontextmanager
from google.adk.cli.fast_api import get_fast_api_app
import asyncpg
from api.tools import router as tools_router

db_url="postgresql://neondb_owner:npg_NeY0xvjPiR2K@ep-dawn-term-a8acacq1.eastus2.azure.neon.tech/neondb?sslmode=require"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_event()
    yield
    await shutdown_event()
    
   
# @app.on_event("startup")
async def startup_event():
    try :
        pool = await asyncpg.create_pool(
            dsn="postgresql://neondb_owner:npg_NeY0xvjPiR2K@ep-dawn-term-a8acacq1.eastus2.azure.neon.tech/neondb?sslmode=require",

        )
        app.state.db_pool= pool
        print("Database connection established successfully.")
    except:
        pool = None
        print("Database connection failed. Please check your DATABASE_URL.")

# url=settings.Settings.DATABASE_URL
# db_url = setting.DATABASE_URL
    
# @app.on_event("shutdown")
async def shutdown_event():
    await app.state.db_pool.close()
    
AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

    
app = get_fast_api_app(
    agents_dir=f"{AGENT_DIR}/tools", 
    web=False, 
    lifespan=lifespan, 
    
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
) 
# app.include_router(agent_router, prefix="/api", tags=["Agent Interaction"])
app.include_router(tools_router,prefix="/api", tags=["Tools"])
@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Travel Agency API"}



    