# QLex System Requirements & Functional Specifications

## 1. Executive Summary
**QLex** is an intelligent, high-concurrency campus print ordering and automated queue management platform. It streamlines document uploading, print configuration, Razorpay automated payment processing, waiting room admission control, live token tracking, and daily shop settlements.

---

## 2. Core User Roles & Portals

### A. Student Portal (`/student`)
- **Authentication**: JWT-based registration & login using Register Number and password.
- **Smart Waiting Room**: Admission control queue (`/waiting-room`) to handle peak traffic load gracefully before order creation.
- **Order Placement**: Multi-document PDF/image upload with configuration (B/W vs. Colour, Single vs. Double sided, Paper sizes A4/A3, Page ranges, Service addons).
- **Payment Processing**: Integrated Razorpay UPI payment gateway with fallback verification.
- **Live Token Tracker**: Digital token display with estimated pickup time, status progression (Pending → Printing → Ready → Completed), and receipt generation.

### B. Shop Operator Portal (`/shop`)
- **Operator Authentication**: Quick PIN access for shop operators.
- **Live Order Queue**: Priority queue filtering (Priority vs. Regular orders), printer assignment, single-click order state updates (Print, Ready, Serve, Reject).
- **Pricing Control**: Shop-level base rate adjustments per page side.
- **Daily Settlements**: Automatic settlement generation and bank sync.

### C. Executive Admin Portal (`/admin`)
- **Executive Overview**: Total revenue metrics, platform fee earnings, live system load, active student metrics, and server health.
- **Platform Pricing & Fees**: Governance of global platform fees, convenience fees, and priority fees.
- **Settlement Operations**: Manual & automated shop settlement triggering and verification.
- **System Monitoring**: Live WhatsApp notification bot controls and queue flush tools.

---

## 3. Microservices Architecture
- **Backend API**: Python FastAPI application handling database operations, authentication, order calculation, and payment callbacks.
- **Frontend App**: Next.js 15 App Router application with TailwindCSS and glassmorphic UI design.
- **WhatsApp Notification Daemon**: Node.js microservice (`whatsapp-service`) for automated customer alerts on order confirmation and ready-for-pickup status.
