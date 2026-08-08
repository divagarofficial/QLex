"""add extra_settings to platform_settings

Revision ID: f8a9b2c3d4e5
Revises: 07bc294cf8b4
Create Date: 2026-07-27 20:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'f8a9b2c3d4e5'
down_revision: Union[str, Sequence[str], None] = '07bc294cf8b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('platform_settings', sa.Column('extra_settings', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('platform_settings', 'extra_settings')
