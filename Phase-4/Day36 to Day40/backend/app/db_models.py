import json
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, Integer, Text, DateTime  # type: ignore # pyrefly: ignore
from sqlalchemy.orm import Mapped, mapped_column  # type: ignore # pyrefly: ignore
from .database import Base


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), default="Analyst", nullable=False
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class AssessmentModel(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    subject: Mapped[str] = mapped_column(String(120), nullable=False)
    kind: Mapped[str] = mapped_column(
        String(30), nullable=False, default="Loan"
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    income: Mapped[float] = mapped_column(Float, nullable=False)
    credit_score: Mapped[int] = mapped_column(Integer, nullable=False)
    employment: Mapped[Optional[str]] = mapped_column(
        String(50), default="Full time"
    )
    term_months: Mapped[Optional[int]] = mapped_column(
        Integer, default=36
    )
    channel: Mapped[Optional[str]] = mapped_column(
        String(50), default="Branch"
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    verdict: Mapped[str] = mapped_column(String(30), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    factors_json: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    @property
    def factors(self) -> list:
        raw = self.factors_json
        if raw is not None:
            try:
                return json.loads(str(raw))
            except Exception:
                return []
        return []

    @factors.setter
    def factors(self, value):
        if value is not None:
            self.factors_json = json.dumps(value)
        else:
            self.factors_json = json.dumps([])


class TeamMemberModel(Base):
    __tablename__ = "team_members"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(20), default="Analyst", nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), default="Active", nullable=False
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class RevokedTokenModel(Base):
    __tablename__ = "revoked_tokens"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    token: Mapped[str] = mapped_column(
        String(512), nullable=False, index=True
    )
    revoked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
