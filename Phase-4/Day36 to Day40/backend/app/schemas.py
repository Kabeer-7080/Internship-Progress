from datetime import datetime
from typing import Literal, Optional, List
from pydantic import BaseModel, EmailStr, Field  # type: ignore # pyrefly: ignore

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=4, max_length=128)
    role: str = 'Analyst'

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: dict

class AssessmentRequest(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    type: Optional[str] = None
    kind: Optional[str] = None
    income: float = Field(gt=0, description='Monthly income or account balance')
    amount: float = Field(gt=0)
    credit_score: Optional[int] = Field(default=None, ge=300, le=850)
    credit: Optional[int] = Field(default=None, ge=300, le=850)
    employment: str = 'Full time'
    term_months: int = Field(default=36, ge=1, le=120)
    channel: str = 'Branch'

    def get_subject(self) -> str:
        return self.subject or self.name or 'Applicant'

    def get_kind(self) -> str:
        k = self.kind or self.type or 'Loan'
        return k.capitalize()

    def get_credit_score(self) -> int:
        if self.credit_score is not None:
            return self.credit_score
        if self.credit is not None:
            return self.credit
        return 680

class AssessmentUpdateRequest(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    income: Optional[float] = Field(default=None, gt=0)
    amount: Optional[float] = Field(default=None, gt=0)
    credit_score: Optional[int] = Field(default=None, ge=300, le=850)
    credit: Optional[int] = Field(default=None, ge=300, le=850)
    employment: Optional[str] = None
    term_months: Optional[int] = Field(default=None, ge=1, le=120)
    channel: Optional[str] = None

class AssessmentResponse(BaseModel):
    id: str
    type: str
    kind: str
    name: str
    subject: str
    amount: float
    income: float
    credit_score: int
    credit: int
    employment: str
    term_months: int
    channel: str
    score: int
    verdict: str
    reason: str
    factors: List[dict] = []
    created: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TeamMemberCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    role: str = 'Analyst'
    status: str = 'Invited'

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    status: Optional[str] = None

class TeamMemberResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str

    class Config:
        from_attributes = True
