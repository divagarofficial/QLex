"""add staff support and shop_name

Revision ID: b2c3d4e5f6a7
Revises: f8a9b2c3d4e5
Create Date: 2026-08-26 07:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'f8a9b2c3d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make year_id and section_id nullable in users table
    op.alter_column('users', 'year_id', existing_type=sa.VARCHAR(), nullable=True)
    op.alter_column('users', 'section_id', existing_type=sa.VARCHAR(), nullable=True)
    
    # Add shop_name column to orders table
    op.add_column('orders', sa.Column('shop_name', sa.String(length=100), nullable=False, server_default='QLex Central Print Hub'))


def downgrade() -> None:
    op.drop_column('orders', 'shop_name')
    op.alter_column('users', 'section_id', existing_type=sa.VARCHAR(), nullable=False)
    op.alter_column('users', 'year_id', existing_type=sa.VARCHAR(), nullable=False)
