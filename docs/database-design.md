1. users
Column	Type	Description
id	UUID	Primary Key
register_number	VARCHAR(20)	Unique
full_name	VARCHAR(100)	Student Name
department	VARCHAR(100)	Department
year	INTEGER	1–4
section	VARCHAR(10)	A, B, C...
phone	VARCHAR(15)	Mobile Number
email	VARCHAR(255)	Optional
password_hash	TEXT	Hashed Password
role	ENUM	student, staff, admin
is_active	BOOLEAN	Account Status
created_at	TIMESTAMP	Created
updated_at	TIMESTAMP	Updated


2. orders
Column	Type	Description
id	UUID	Primary Key
user_id	UUID	Student
printing_cost	DECIMAL	Shop Share
convenience_fee_amount	DECIMAL	QLex Convenience Fee
platform_fee_amount	DECIMAL	Platform Fee
priority_fee_amount	DECIMAL	Priority Fee
final_amount	DECIMAL	Student Pays
priority	BOOLEAN	Priority Order
payment_status	ENUM	Pending, Paid, Failed
status	ENUM	Pending, Printing, Ready, Completed, Cancelled
settlement_status	ENUM	Pending, Settled
pickup_qr	TEXT	QR Code
created_at	TIMESTAMP	Created
updated_at	TIMESTAMP	Updated


3. order_documents
Column	Type	Description
id	UUID	Primary Key
order_id	UUID	Parent Order
file_name	TEXT	Original Name
file_path	TEXT	Stored File
file_size	BIGINT	Size
total_pages	INTEGER	Total Pages
copies	INTEGER	Copies
print_type	ENUM	B/W, Colour
print_side	ENUM	Single, Double
paper_size	ENUM	A4, A3
page_range	VARCHAR	Example: 1-5,8,10
document_price	DECIMAL	Printing Cost for this document
created_at	TIMESTAMP	Created


4. shop_pricing

Controlled by the Shop.

Column	Type
id	UUID
paper_size	ENUM
print_type	ENUM
print_side	ENUM
shop_price_per_side	DECIMAL


5. qlex_pricing

Controlled only by you.

Column	Type
id	UUID
bw_convenience_fee	DECIMAL
colour_convenience_fee	DECIMAL
platform_fee	DECIMAL
priority_fee	DECIMAL
updated_at	TIMESTAMP

Only one row will exist in this table.

6. payments
Column	Type
id	UUID
order_id	UUID
amount	DECIMAL
payment_method	VARCHAR
transaction_id	TEXT
payment_status	ENUM
paid_at	TIMESTAMP


7. notifications
Column	Type
id	UUID
user_id	UUID
title	VARCHAR
message	TEXT
is_read	BOOLEAN
created_at	TIMESTAMP



Final ER Diagram
Users
   │
   │ 1
   │
   ▼
Orders
   │
   │ 1
   │
   ▼
OrderDocuments

Orders
   │
   ▼
Payments

Users
   │
   ▼
Notifications

ShopPricing

QLexPricing