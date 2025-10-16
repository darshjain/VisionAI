# Authentication service
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt as jose_jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import logging

from app.models.user import User, UserSession
from app.models.schemas import TokenData
from app.core.config import settings

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.JWT_SECRET_KEY = settings.JWT_SECRET_KEY
        self.JWT_ALGORITHM = settings.JWT_ALGORITHM
        self.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        self.JWT_REFRESH_TOKEN_EXPIRE_DAYS = settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)

    def create_access_token(
        self, data: dict, expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=self.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
            )

        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jose_jwt.encode(
            to_encode, self.JWT_SECRET_KEY, algorithm=self.JWT_ALGORITHM
        )
        return encoded_jwt

    def create_refresh_token(self, data: dict) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jose_jwt.encode(
            to_encode, self.JWT_SECRET_KEY, algorithm=self.JWT_ALGORITHM
        )
        return encoded_jwt

    def verify_token(
        self, token: str, token_type: str = "access"
    ) -> Optional[TokenData]:
        """Verify and decode JWT token"""
        try:
            payload = jose_jwt.decode(
                token, self.JWT_SECRET_KEY, algorithms=[self.JWT_ALGORITHM]
            )
            username: str = payload.get("sub")
            user_id: int = payload.get("user_id")
            token_type_check: str = payload.get("type")

            if username is None or token_type_check != token_type:
                return None

            return TokenData(username=username, user_id=user_id)
        except JWTError:
            return None

    def authenticate_user(
        self, db: Session, username: str, password: str
    ) -> Optional[User]:
        """Authenticate user with username and password"""
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    def create_user(self, db: Session, user_data) -> User:
        """Create a new user"""
        hashed_password = self.get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def get_user(self, db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()

    def get_user_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    def update_last_login(self, db: Session, user: User):
        """Update user's last login time"""
        user.last_login = datetime.utcnow()
        db.commit()

    def create_session(
        self, db: Session, user_id: int, session_token: str
    ) -> UserSession:
        """Create a new user session"""
        session = UserSession(
            user_id=user_id,
            session_token=session_token,
            expires_at=datetime.utcnow()
            + timedelta(days=self.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def get_active_session(
        self, db: Session, session_token: str
    ) -> Optional[UserSession]:
        """Get active session by token"""
        return (
            db.query(UserSession)
            .filter(
                UserSession.session_token == session_token,
                UserSession.is_active == True,
                UserSession.expires_at > datetime.utcnow(),
            )
            .first()
        )

    def deactivate_session(self, db: Session, session_token: str):
        """Deactivate a session"""
        session = (
            db.query(UserSession)
            .filter(UserSession.session_token == session_token)
            .first()
        )
        if session:
            session.is_active = False
            db.commit()

    def cleanup_expired_sessions(self, db: Session):
        """Clean up expired sessions"""
        expired_sessions = (
            db.query(UserSession)
            .filter(UserSession.expires_at < datetime.utcnow())
            .all()
        )

        for session in expired_sessions:
            session.is_active = False

        db.commit()
        logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
