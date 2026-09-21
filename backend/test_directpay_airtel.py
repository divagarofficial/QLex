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

    assert result.get('payee_vpa') == "thirudiva@upi", "VPA assertion failed!"
    assert result.get('payee_name') == "MINDURA TECHNOLOGIES", "Payee name assertion failed!"
    assert "MINDURA" in result.get('upi_intent_url'), "URI encoding assertion failed!"
    print("ALL AIRTEL DIRECTPAY ASSERTIONS PASSED CLEANLY!")

if __name__ == "__main__":
    test_airtel_directpay()
