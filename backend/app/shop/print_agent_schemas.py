from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class DocumentPrintSpec(BaseModel):
    id: UUID
    original_filename: str
    stored_filename: str
    url: str
    file_size: int
    page_count: int
    paper_size: str
    print_type: str  # "bw" or "color"
    print_side: str  # "single" or "double"
    copies: int


class PrintJobResponse(BaseModel):
    order_id: UUID
    token: str
    is_priority: bool
    student_name: str
    register_number: str
    created_at: datetime
    documents: List[DocumentPrintSpec]


class JobStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="PRINTING, COMPLETED, or FAILED")
    error_message: Optional[str] = None
    assigned_printer: Optional[str] = None


class PrintAgentStatusResponse(BaseModel):
    success: bool
    order_id: UUID
    new_queue_state: str
    message: str


class AgentHeartbeatRequest(BaseModel):
    agent_id: str = "QLex Central Print Hub"
    active_printers: List[str] = []
    mock_mode: bool = False


class AgentHeartbeatResponse(BaseModel):
    status: str
    is_connected: bool
    last_seen: datetime
    active_printers: List[str]
