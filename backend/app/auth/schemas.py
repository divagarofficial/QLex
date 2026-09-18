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


class StaffRegisterRequest(BaseModel):
    staff_id: str = Field(min_length=3, max_length=30, description="Staff ID (replaces Register Number)")
    full_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=10, max_length=15)
    email: EmailStr
    otp_code: str = Field(min_length=6, max_length=6)
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)
    department_id: str


class LoginRequest(BaseModel):
    register_number: str
    password: str


class StaffLoginRequest(BaseModel):
    staff_id: str
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
    role: str = "student"


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
    role: str = "student"
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
    pin: str = Field(min_length=4, max_length=4)
    shop_slug: str | None = None


class ShopLoginResponse(BaseModel):
    success: bool = True
    message: str
    token: str | None = None
    shop_name: str | None = None
    shop_slug: str | None = None


class ShopRegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    slug: str = Field(min_length=2, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    email: str | None = None
    address: str | None = None
    tagline: str | None = None
    description: str | None = None
    operating_hours: str | None = "8:00 AM - 8:00 PM"
    is_express_enabled: bool = True
    requires_account: bool = False
    pin: str = Field(min_length=4, max_length=4)


class ShopRegisterResponse(BaseModel):
    success: bool = True
    message: str
    shop_id: UUID | None = None
    slug: str
    token: str | None = None


class UpdateShopPinRequest(BaseModel):
    shop_slug: str | None = None
    pin: str = Field(min_length=4, max_length=4)


class AdminLoginRequest(BaseModel):
    password: str


class AdminLoginResponse(BaseModel):
    success: bool = True
    message: str
    token: str | None = None



