from app.payments.directpay_service import DirectPayService
from app.core.config import settings

def test_airtel_directpay():
    print("==================================================")
    print("   TESTING QLEX AIRTEL PAYMENTS BANK DIRECTPAY    ")
    print("==================================================")
    print(f"Configured UPI ID    : {settings.DIRECTPAY_UPI_ID}")
    print(f"Configured Payee Name: {settings.DIRECTPAY_PAYEE_NAME}")
    print(f"Configured Account   : {settings.DIRECTPAY_ACCOUNT_NUMBER}")
    print(f"Configured IFSC      : {settings.DIRECTPAY_IFSC_CODE}")
    print("--------------------------------------------------")

    service = DirectPayService()
    result = service.generate_upi_intent(
        order_id="a1b2c3d4e5f67890",
        amount=45.00,
        shop_name="QLex Express Hub",
    )

    print("Generated Dynamic UPI Intent Result:")
    print(f"  Success       : {result.get('success')}")
    print(f"  Payee VPA     : {result.get('payee_vpa')}")
    print(f"  Payee Name    : {result.get('payee_name')}")
    print(f"  Amount        : {result.get('amount')}")
    print(f"  Reference Code: {result.get('reference_code')}")
    print(f"  UPI Intent URI: {result.get('upi_intent_url')}")
    print("--------------------------------------------------")

    # SMS Parsing Test Suite across Multiple Indian Banks
    sms_test_cases = [
        ("Airtel Payments Bank a/c is credited with Rs.1.50. Txn ID: 618351692231.", 1.50, "618351692231"),
        ("Dear Customer, your a/c XXXXX1234 is credited by Rs 45.00 on 21-09-26 by UPI/618351692231.", 45.00, "618351692231"),
        ("Rs. 1.50 credited to your A/c ending 1234 on 21-Sep-26 via UPI Ref No 987654321012.", 1.50, "987654321012"),
        ("Received payment of Rs 100.00 from John via PhonePe. Ref: 112233445566.", 100.00, "112233445566"),
    ]

    for sms, expected_amt, expected_txn in sms_test_cases:
        parsed = service.parse_bank_sms(sms)
        print(f"Parsing SMS: '{sms}' => Amount: {parsed.get('amount')}, Txn ID: {parsed.get('txn_id')}")
        assert parsed.get('amount') == expected_amt, f"Amount match failed for '{sms}'"
        assert parsed.get('txn_id') == expected_txn, f"Txn ID match failed for '{sms}'"

    print("ALL AIRTEL & MULTI-BANK DIRECTPAY ASSERTIONS PASSED CLEANLY!")

if __name__ == "__main__":
    test_airtel_directpay()

