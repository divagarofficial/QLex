from pydantic import BaseModel, ConfigDict, EmailStr, Field
from uuid import UUID


class SendOTPRequest(BaseModel):
    email: EmailStr
    year_id: str | None = None


class SendOTPResponse(BaseModel):
    success: bool = True
    message: str


class RegisterRequest(BaseModel):
    register_number: str = Field(min_length=3, max_length=30)
    full_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=10, max_length=15)
    email: EmailStr
    otp_code: str = Field(min_length=6, max_length=6)
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)

    department_id: str
    year_id: str
    section_name: str = Field(min_length=1, max_length=10, description="Section name, e.g. A, B, C")


class LoginRequest(BaseModel):
    register_number: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    register_number: str
    full_name: str
    phone: str
    email: EmailStr | None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


class CurrentUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    register_number: str
    full_name: str
    phone: str
    email: EmailStr | None
    department_name: str = ""
    year_number: int = 0
    section_name: str = ""


class DepartmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    code: str


class YearResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    year_number: int


class SectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str


class DepartmentsListResponse(BaseModel):
    departments: list[DepartmentResponse]


class YearsListResponse(BaseModel):
    years: list[YearResponse]


class SectionsListResponse(BaseModel):
    sections: list[SectionResponse]


class ShopLoginRequest(BaseModel):
    pin: str


class ShopLoginResponse(BaseModel):
    success: bool = True
    message: str
    token: str | None = None


class AdminLoginRequest(BaseModel):
    password: str


class AdminLoginResponse(BaseModel):
    success: bool = True
    message: str
    token: str | None = None


