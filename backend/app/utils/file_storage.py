import os
from pathlib import Path
from uuid import UUID

import aiofiles

if os.path.exists("/data"):
    UPLOAD_ROOT = Path("/data/uploads")
elif os.path.exists("/tmp"):
    UPLOAD_ROOT = Path("/tmp/uploads")
else:
    UPLOAD_ROOT = Path("uploads")

DRAFT_ROOT = UPLOAD_ROOT / "drafts"

ORDER_ROOT = UPLOAD_ROOT / "orders"


def get_draft_directory(order_id: UUID):

    directory = DRAFT_ROOT / str(order_id)

    directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    return directory


async def save_file(file, destination):

    async with aiofiles.open(destination, "wb") as out:

        while True:

            chunk = await file.read(1024 * 1024)

            if not chunk:
                break

            await out.write(chunk)

    await file.seek(0)