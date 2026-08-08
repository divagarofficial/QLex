class QLexException(Exception):
    """Base exception for QLex."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class DuplicateRegisterNumberException(QLexException):
    def __init__(self):
        super().__init__("Register number already exists.")


class DuplicatePhoneException(QLexException):
    def __init__(self):
        super().__init__("Phone number already exists.")


class DuplicateEmailException(QLexException):
    def __init__(self):
        super().__init__("Email already exists.")


class InvalidDepartmentException(QLexException):
    def __init__(self):
        super().__init__("Invalid department.")


class InvalidYearException(QLexException):
    def __init__(self):
        super().__init__("Invalid year.")


class InvalidSectionException(QLexException):
    def __init__(self):
        super().__init__("Invalid section.")


class PasswordMismatchException(QLexException):
    def __init__(self):
        super().__init__("Passwords do not match.")

class InvalidCredentialsException(QLexException):
    def __init__(self):
        super().__init__("Invalid register number or password.")