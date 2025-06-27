from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    agent_name: str = "wanderbot_agent"

@router.post("/chat")
async def chat_with_agent(request: Request, chat_request: ChatRequest):
    """
    This endpoint receives a user's message, finds the requested ADK agent,
    processes the message, and returns the agent's reply.
    """
    try:
        agent = request.app.state.agents.get(chat_request.agent_name)

        if not agent:
            raise HTTPException(
                status_code=404, 
                detail=f"Agent '{chat_request.agent_name}' not found."
            )
        print(f"Using agent '{agent.name}' to process message: '{chat_request.message}'")
        agent_response = await agent.process(chat_request.message)
        
        return {"reply": agent_response}

    except Exception as e:
        print(f"Error in /chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Error processing your request.")