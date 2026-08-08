from enum import StrEnum


class ServicePricingType(StrEnum):
    FIXED = "fixed"

    PER_PAGE = "per_page"

    PER_COPY = "per_copy"