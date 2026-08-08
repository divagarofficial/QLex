from decimal import Decimal
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.enums.paper_size import PaperSize
from app.enums.print_side import PrintSide
from app.enums.print_type import PrintType

from app.models.order_document import OrderDocument
from app.models.order_document_service import OrderDocumentService

from app.orders.pricing_service import PricingService
from app.orders.repository import OrderRepository
from app.orders.service_repository import ServiceRepository
from app.orders.upload_repository import UploadRepository

from app.utils.file_storage import (
    get_draft_directory,
    save_file,
)
from app.utils.file_validation import validate_pdf
from app.utils.pdf import get_pdf_information


class UploadService:

    def __init__(self, db: Session):

        self.db = db

        self.order_repository = OrderRepository(db)

        self.upload_repository = UploadRepository(db)

        self.pricing_service = PricingService(db)

        self.service_repository = ServiceRepository(db)


    async def upload_documents(
        self,
        order_id: UUID,
        files: list[UploadFile],
    ):

        order = self.order_repository.get_by_id(order_id)

        if order is None:
            raise ValueError("Order not found.")

        folder = get_draft_directory(order.id)

        uploaded_documents = []

        # Continue numbering after existing documents
        display_order = len(order.documents) + 1

        for file in files:

            await validate_pdf(file)

            extension = Path(file.filename).suffix.lower()

            stored_filename = f"{uuid4()}{extension}"

            storage_path = folder / stored_filename

            await save_file(
                file=file,
                destination=storage_path,
            )

            pdf_info = get_pdf_information(
                str(storage_path)
            )

            document = OrderDocument(

                order_id=order.id,

                original_filename=file.filename,

                stored_filename=stored_filename,

                storage_path=str(storage_path),

                mime_type=file.content_type,

                file_size=storage_path.stat().st_size,

                page_count=pdf_info["pages"],

                paper_size=PaperSize.A4,

                print_type=PrintType.BLACK_WHITE,

                print_side=PrintSide.SINGLE,

                copies=1,

                display_order=display_order,

                shop_price_per_page=Decimal("0.00"),

                document_total=Decimal("0.00"),
            )

            self.upload_repository.create(document)

            uploaded_documents.append(document)

            display_order += 1

        self.upload_repository.commit()

        for document in uploaded_documents:

            self.upload_repository.refresh(document)

        return uploaded_documents


    async def update_document(
        self,
        order_id: UUID,
        document_id: UUID,
        request,
    ):

        order = self.order_repository.get_by_id(
            order_id
        )

        if order is None:

            raise ValueError(
                "Order not found."
            )

        document = (
            self.upload_repository.get_document(
                document_id
            )
        )

        if document is None:

            raise ValueError(
                "Document not found."
            )

        if document.order_id != order.id:

            raise ValueError(
                "Document does not belong to this order."
            )


        # Update document print settings

        document.paper_size = (
            request.paper_size
        )

        document.print_type = (
            request.print_type
        )

        document.print_side = (
            request.print_side
        )

        document.copies = (
            request.copies
        )


        # Get the configured print price

        pricing = (
            self.pricing_service.get_print_price(

                paper_size=request.paper_size,

                print_type=request.print_type,

                print_side=request.print_side,
            )
        )

        if pricing is None:

            raise ValueError(
                "Pricing is not configured "
                "for the selected print options."
            )

        document.shop_price_per_page = (
            pricing.shop_price
        )


        # Remove previously selected services

        (
            self.db
            .query(OrderDocumentService)
            .filter(

                OrderDocumentService
                .order_document_id
                == document.id

            )
            .delete(
                synchronize_session=False
            )
        )


        # Add Spiral Binding

        if request.spiral_binding:

            spiral_service = (
                self.service_repository
                .get_by_name(
                    "Spiral Binding"
                )
            )

            if spiral_service is None:

                raise ValueError(
                    "Spiral Binding service "
                    "is not configured."
                )

            self.db.add(

                OrderDocumentService(

                    order_document_id=(
                        document.id
                    ),

                    service_id=(
                        spiral_service.id
                    ),

                    quantity=1,

                    price=(
                        spiral_service.price
                    ),

                    total=(
                        spiral_service.price
                    ),
                )
            )


        # Add Soft Binding

        if request.soft_binding:

            soft_service = (
                self.service_repository
                .get_by_name(
                    "Soft Binding"
                )
            )

            if soft_service is None:

                raise ValueError(
                    "Soft Binding service "
                    "is not configured."
                )

            self.db.add(

                OrderDocumentService(

                    order_document_id=(
                        document.id
                    ),

                    service_id=(
                        soft_service.id
                    ),

                    quantity=1,

                    price=(
                        soft_service.price
                    ),

                    total=(
                        soft_service.price
                    ),
                )
            )


        # Calculate document total

        document.document_total = (

            self.pricing_service
            .calculate_document_total(

                page_count=(
                    document.page_count
                ),

                copies=(
                    document.copies
                ),

                paper_size=(
                    document.paper_size
                ),

                print_type=(
                    document.print_type
                ),

                print_side=(
                    document.print_side
                ),

                spiral_binding=(
                    request.spiral_binding
                ),

                soft_binding=(
                    request.soft_binding
                ),
            )
        )


        # Recalculate order subtotal
# and convenience fee for all documents

        subtotal = Decimal("0.00")

        convenience_fee_total = Decimal("0.00")


        for current_document in order.documents:

            # Use the newly calculated total
            # for the currently updated document

            if current_document.id == document.id:

                subtotal += (
                    document.document_total
                    or Decimal("0.00")
                )

                convenience_fee_total += (
                    self.pricing_service
                    .calculate_document_convenience_fee(

                        page_count=(
                            document.page_count
                        ),

                        copies=(
                            document.copies
                        ),

                        paper_size=(
                            document.paper_size
                        ),

                        print_type=(
                            document.print_type
                        ),

                        print_side=(
                            document.print_side
                        ),
                    )
                )

            else:

                subtotal += (
                    current_document.document_total
                    or Decimal("0.00")
                )

                convenience_fee_total += (
                    self.pricing_service
                    .calculate_document_convenience_fee(

                        page_count=(
                            current_document.page_count
                        ),

                        copies=(
                            current_document.copies
                        ),

                        paper_size=(
                            current_document.paper_size
                        ),

                        print_type=(
                            current_document.print_type
                        ),

                        print_side=(
                            current_document.print_side
                        ),
                    )
                )


        order.subtotal = subtotal

        order.convenience_fee = (
            convenience_fee_total
        )


        # Recalculate order grand total

        order.grand_total = (

            order.subtotal

            + (
                order.platform_fee
                or Decimal("0.00")
            )

            + (
                order.convenience_fee
                or Decimal("0.00")
            )

            + (
                order.priority_fee
                or Decimal("0.00")
            )
        )


        self.db.commit()

        self.db.refresh(document)

        return document

    async def delete_document(
        self,
        order_id: UUID,
        document_id: UUID,
    ):
        order = self.order_repository.get_by_id(order_id)
        if order is None:
            raise ValueError("Order not found.")

        document = self.upload_repository.get_document(document_id)
        if document is None:
            raise ValueError("Document not found.")

        if document.order_id != order.id:
            raise ValueError("Document does not belong to this order.")

        try:
            if document.storage_path and Path(document.storage_path).exists():
                Path(document.storage_path).unlink()
        except Exception:
            pass

        self.db.delete(document)
        self.db.commit()
        self.db.refresh(order)

        subtotal = Decimal("0.00")
        convenience_fee_total = Decimal("0.00")
        for current_document in order.documents:
            subtotal += current_document.document_total or Decimal("0.00")
            convenience_fee_total += self.pricing_service.calculate_document_convenience_fee(
                page_count=current_document.page_count,
                copies=current_document.copies,
                paper_size=current_document.paper_size,
                print_type=current_document.print_type,
                print_side=current_document.print_side,
            )
        order.subtotal = subtotal
        order.convenience_fee = convenience_fee_total
        order.grand_total = (
            order.subtotal
            + (order.platform_fee or Decimal("0.00"))
            + (order.convenience_fee or Decimal("0.00"))
            + (order.priority_fee or Decimal("0.00"))
        )
        self.db.commit()
        return {"success": True, "message": "Document deleted successfully"}