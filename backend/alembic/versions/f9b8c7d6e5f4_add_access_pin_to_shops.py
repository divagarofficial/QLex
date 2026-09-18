"""add access_pin to shops

Revision ID: f9b8c7d6e5f4
Revises: c3d4e5f6a7b8
Create Date: 2026-09-18 07:24:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9b8c7d6e5f4'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('shops', sa.Column('access_pin', sa.String(length=4), server_default='0810', nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('shops', 'access_pin')
