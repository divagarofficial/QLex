from sqlalchemy.orm import Session

from app.auth.repository import AuthRepository
from app.auth.schemas import RegisterRequest
from app.common.exceptions import (
    DuplicateEmailException,
    DuplicatePhoneException,
    DuplicateRegisterNumberException,
    InvalidDepartmentException,
    InvalidSectionException,
    InvalidYearException,
    PasswordMismatchException,
)
from app.core.security import hash_password
from app.models.department import Department
from app.models.section import Section
from app.models.user import User
from app.models.year import Year
from app.common.exceptions import InvalidCredentialsException
from app.core.security import verify_password, create_access_token


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = AuthRepository(db)

    def register(self, request: RegisterRequest) -> User:
        """
        Register a new student.
        """

        # Password confirmation
        if request.password != request.confirm_password:
            raise PasswordMismatchException()

        # Register number already exists
        if self.repository.get_by_register_number(request.register_number):
            raise DuplicateRegisterNumberException()

        # Phone number already exists
        if self.repository.get_by_phone(request.phone):
            raise DuplicatePhoneException()

        # Email already exists
        if request.email:
            if self.repository.get_by_email(request.email):
                raise DuplicateEmailException()

        # Validate Department
        department = self.db.get(Department, request.department_id)
        if department is None:
            raise InvalidDepartmentException()

        # Validate Year
        year = self.db.get(Year, request.year_id)
        if year is None:
            raise InvalidYearException()

        # Validate email format and OTP verification (1st years can use personal email if enabled by admin)
        is_first_year = False
        if year.year_number == 1:
            from app.models.platform_setting import PlatformSetting
            setting = self.db.query(PlatformSetting).first()
            if setting is None or getattr(setting, "allow_first_year_personal_email", True):
                is_first_year = True

        from app.auth.otp_service import is_rit_email, verify_otp
        if not is_rit_email(request.email, is_first_year=is_first_year):
            raise ValueError("Registration is restricted to official RIT student email addresses (@ritchennai.edu.in).")

        if not verify_otp(request.email, request.otp_code):
            raise ValueError("Invalid or expired OTP verification code. Please request a new OTP.")

        # Validate/Lookup Section by name (allow any alphabet A-Z)
        sec_name = request.section_name.strip().upper()
        if not sec_name:
            raise InvalidSectionException()

        section = self.db.query(Section).filter(Section.name == sec_name).first()
        if section is None:
            section = Section(name=sec_name)
            self.db.add(section)
            self.db.flush()

        # Create User
        user = User(
            register_number=request.register_number,
            full_name=request.full_name,
            phone=request.phone,
            email=request.email,
            password_hash=hash_password(request.password),
            department_id=request.department_id,
            year_id=request.year_id,
            section_id=str(section.id),
        )

        return self.repository.create(user)
    
    def login(self, register_number: str, password: str):

        user = self.repository.authenticate(register_number)

        if user is None:
            raise InvalidCredentialsException()

        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsException()

        token = create_access_token(
    {
        "sub": str(user.id),
        "register_number": user.register_number,
        "role": user.role.value,
    }
)

        return {
            "access_token": token,
            "token_type": "bearer",
        }