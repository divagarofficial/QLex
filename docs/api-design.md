# QLex API Endpoint Design Specification

## 1. Authentication Endpoints (`/api/v1/auth`)
- `POST /api/v1/auth/register`: Register new student account.
- `POST /api/v1/auth/login`: Authenticate and issue Bearer JWT token.
- `GET /api/v1/auth/me`: Fetch current authenticated user metadata.
- `GET /api/v1/auth/departments`: List active academic departments.
- `GET /api/v1/auth/years`: List academic years (1–4).
- `GET /api/v1/auth/sections`: List section codes (A, B, C...).

---

## 2. Order Management Endpoints (`/orders`, `/student`)
- `POST /orders`: Initialize draft order with pricing breakdown.
- `POST /orders/{order_id}/documents`: Upload document attachments.
- `PATCH /orders/{order_id}/documents/{document_id}`: Update print parameters.
- `DELETE /orders/{order_id}/documents/{document_id}`: Remove document from draft.
- `POST /orders/{order_id}/confirm`: Finalize and confirm order draft.
- `GET /student/orders`: Retrieve user order history.
- `GET /student/orders/{order_id}`: Get detailed order summary.
- `GET /student/token`: Retrieve active order token and status.

---

## 3. Payment Processing Endpoints (`/orders`, `/student/payments`)
- `POST /orders/{order_id}/payments/create`: Create Razorpay payment order.
- `POST /orders/verify`: Verify Razorpay signature callback.
- `POST /orders/webhook`: Webhook listener for Razorpay payment events.
- `GET /student/payments`: List user transaction receipts.

---

## 4. Waiting Room Endpoints (`/waiting-room`)
- `POST /waiting-room/enter`: Queue user for traffic admission.
- `GET /waiting-room/status`: Check current admission status & session token.
- `POST /waiting-room/leave`: Explicitly exit waiting room queue.

---

## 5. Shop Operator Endpoints (`/shop`)
- `GET /shop/orders`: Fetch active shop order queue.
- `POST /shop/orders/{order_id}/print`: Mark order as printing.
- `POST /shop/orders/{order_id}/ready`: Mark order ready for pickup.
- `POST /shop/orders/{order_id}/serve`: Mark order completed & handed over.
- `POST /shop/orders/{order_id}/reject`: Cancel order with reason.

---

## 6. Admin Control Endpoints (`/admin`, `/pricing`, `/settlements`)
- `GET /admin/overview`: Fetch executive system metrics.
- `GET /admin/recent-orders`: Global order monitoring.
- `GET /admin/recent-payments`: Global payment logs.
- `GET /pricing/config`: Platform fee configuration.
- `PUT /pricing/{pricing_id}`: Update base pricing matrix.
- `GET /settlements/pending`: View pending shop payouts.
- `POST /settlements/generate`: Generate daily shop settlement batch.
