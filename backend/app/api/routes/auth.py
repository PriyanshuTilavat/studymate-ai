
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    AuthResponse,
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


security = HTTPBearer()


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Create user
    new_user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create login token
    token = create_access_token(new_user.id)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=new_user,
    )


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    # Find user
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    # Don't reveal whether email exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Verify password
    if not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Create token
    token = create_access_token(user.id)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user,
    )


# =========================================================
# CURRENT USER
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
):
    try:
        user_id = decode_access_token(
            credentials.credentials
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    # Find user
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    return user

