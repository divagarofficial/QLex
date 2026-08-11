from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.schemas import RegisterRequest, UserResponse
from app.auth.service import AuthService
from app.db.database import get_db
from app.auth.schemas import LoginRequest, LoginResponse
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.auth.schemas import CurrentUserResponse
from app.auth.schemas import (
    DepartmentsListResponse,
    YearsListResponse,
    SectionsListResponse,
    DepartmentResponse,
    YearResponse,
    SectionResponse,
)
from app.models.department import Department
from app.models.year import Year
from app.models.section import Section

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    return service.register(request)

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):

    service = AuthService(db)

    return service.login(
        register_number=request.register_number,
        password=request.password,
    )

from app.auth.schemas import LoginRequest, LoginResponse, ShopLoginRequest, ShopLoginResponse
import os
from fastapi import HTTPException

@router.post(
    "/shop-login",
    response_model=ShopLoginResponse,
)
def shop_login(
    request: ShopLoginRequest,
):
    expected_pin = os.getenv("SHOP_ACCESS_PIN", "0810")
    if request.pin == expected_pin:
        return ShopLoginResponse(
            success=True,
            message="Access Granted",
            token="shop-operator-session-token",
        )
    raise HTTPException(status_code=401, detail="Incorrect PIN. Access Denied.")

@router.get(
    "/departments",
    response_model=DepartmentsListResponse,
)
def list_departments(
    db: Session = Depends(get_db),
):
    departments = db.query(Department).filter(Department.is_active == True).order_by(Department.display_order).all()
    return DepartmentsListResponse(departments=departments)


@router.get(
    "/years",
    response_model=YearsListResponse,
)
def list_years(
    db: Session = Depends(get_db),
):
    years = db.query(Year).filter(Year.is_active == True).order_by(Year.year_number).all()
    return YearsListResponse(years=years)


@router.get(
    "/sections",
    response_model=SectionsListResponse,
)
def list_sections(
    db: Session = Depends(get_db),
):
    sections = db.query(Section).filter(Section.is_active == True).order_by(Section.name).all()
    return SectionsListResponse(sections=sections)


@router.get(
    "/me",
    response_model=CurrentUserResponse,
)
def me(
    current_user: User = Depends(get_current_user),
):
    return CurrentUserResponse(
        id=current_user.id,
        register_number=current_user.register_number,
        full_name=current_user.full_name,
        phone=current_user.phone,
        email=current_user.email,
        department_name=current_user.department.name if current_user.department else "",
        year_number=current_user.year.year_number if current_user.year else 0,
        section_name=current_user.section.name if current_user.section else "",
    )
