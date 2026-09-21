package com.qlex.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * QLex Native Instant SMS Payment Relay Receiver.
 * Listens for incoming bank payment credit SMS (Airtel, SBI, PhonePe, Paytm, etc.)
 * and relays them directly to the QLex Backend API in under 10ms for instant auto-verification.
 */
public class QlexSmsReceiver extends BroadcastReceiver {

    private static final String TAG = "QLexSmsRelay";
    private static final String BACKEND_RELAY_URL = "https://qlex-backend-ybnb435gbq-el.a.run.app/orders/directpay-relay";
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !"android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            return;
        }

        Bundle bundle = intent.getExtras();
        if (bundle == null) return;

        try {
            Object[] pdus = (Object[]) bundle.get("pdus");
            String format = bundle.getString("format");

            if (pdus != null) {
                for (Object pdu : pdus) {
                    SmsMessage sms;
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                        sms = SmsMessage.createFromPdu((byte[]) pdu, format);
                    } else {
                        sms = SmsMessage.createFromPdu((byte[]) pdu);
                    }

                    if (sms != null) {
                        String body = sms.getMessageBody();
                        String sender = sms.getOriginatingAddress();
                        Log.d(TAG, "SMS Received from [" + sender + "]: " + body);

                        // Check if message is a payment credit notification
                        if (isPaymentSms(body, sender)) {
                            Log.i(TAG, "Payment SMS detected! Relaying to QLex Backend...");
                            relaySmsToBackend(body, sender);
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error processing incoming SMS broadcast", e);
        }
    }

    private boolean isPaymentSms(String body, String sender) {
        if (body == null) return false;
        String lower = body.toLowerCase();
        
        // Match credit keywords (e.g. "credited with", "credit of", "received Rs", "recieved INR")
        boolean hasCreditKeyword = lower.contains("credited") 
                || lower.contains("credit of") 
                || lower.contains("received rs") 
                || lower.contains("payment of rs")
                || lower.contains("upi ref");

        boolean isKnownBankSender = sender != null && (
                sender.toUpperCase().contains("AIRTEL")
                || sender.toUpperCase().contains("SBI")
                || sender.toUpperCase().contains("HDFC")
                || sender.toUpperCase().contains("ICICI")
                || sender.toUpperCase().contains("PNB")
                || sender.toUpperCase().contains("AXIS")
                || sender.toUpperCase().contains("PYTM")
                || sender.toUpperCase().contains("PHONEPE")
        );

        return hasCreditKeyword || isKnownBankSender;
    }

    private void relaySmsToBackend(final String smsBody, final String sender) {
        executor.execute(() -> {
            HttpURLConnection conn = null;
            try {
                URL url = new URL(BACKEND_RELAY_URL);
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; utf-8");
                conn.setRequestProperty("Accept", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);

                JSONObject payload = new JSONObject();
                payload.put("sms_text", smsBody);
                payload.put("sender", sender != null ? sender : "UNKNOWN");
                payload.put("relayed_at_ms", System.currentTimeMillis());

                byte[] input = payload.toString().getBytes(StandardCharsets.UTF_8);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                Log.i(TAG, "QLex Relay HTTP Response Code: " + code);
            } catch (Exception err) {
                Log.e(TAG, "Failed to relay SMS to QLex backend", err);
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        });
    }
}
