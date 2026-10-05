# SportsFly Zero-Trust Security Specification (`security_spec.md`)

## 1. Core Security & Payment Invariants
1. **Default-Deny Catch-All**: Unmatched Firestore paths and unverified API endpoints default to `false` / `403 Forbidden`.
2. **PII Split-Collection Isolation (KVKK Compliance)**: Personal data (`email`, `phone`, `maskedTcKimlik`) is isolated in `/users/{userId}/private/info` and restricted strictly to the verified owner (`request.auth.uid == userId`) or verified Admin.
3. **Anti-Privilege Escalation**: Users cannot self-assign `super_admin` or modify their `role` field during profile updates (`incoming().role == existing().role`).
4. **PCI-DSS SAQ-A Zero-PAN Architecture**: Raw credit card numbers (13–19 digit Luhn-valid PANs) and CVVs are blocked at both the client (`secureFetch` & `secureStorageSet`) and the server WAF (`422 PCI_DSS_RAW_PAN_REJECTED`).
5. **Payment Terminal State Lock & Price Integrity**: Clients can only create `/paymentIntents/{intentId}` in `requires_3ds_authorization` state and cannot mutate `amountTry`, `planId`, or transition an intent to `succeeded`. Server-side `/api/payments/create-checkout-session` computes prices exclusively from `OFFICIAL_SERVER_PLANS` and enforces `X-Idempotency-Key` deduplication.

## 2. The "Dirty Dozen" Adversarial Payloads (Verified Denied)
1. **Shadow Field Injection**: Adding `isAdmin: true` to `/users/{userId}` -> Rejected by `data.keys().hasOnly(...)`.
2. **Role Escalation Update**: Updating `role` from `veli` to `kulup_yoneticisi` -> Rejected by `incoming().role == existing().role`.
3. **Unverified Email Admin Spoof**: Token with `email == 'selmanutkumarmara@gmail.com'` but `email_verified == false` -> Rejected by `isVerifiedUser()`.
4. **Cross-Tenant PII Read**: Authenticated user `uid_A` reading `/users/uid_B/private/info` -> Rejected by `request.auth.uid == userId`.
5. **ID Poisoning / Buffer Overflow**: 2KB document ID or special characters -> Rejected by `isValidId(id)`.
6. **Timestamp Forgery**: Client backdating `createdAt` or `updatedAt` -> Rejected by `incoming().createdAt == request.time`.
7. **Payment Self-Settlement**: Client updating `/paymentIntents/{id}` status to `succeeded` -> Rejected by Terminal State Lock.
8. **Payment Price Tampering**: Client modifying `amountTry` on `/paymentIntents/{id}` or sending `clientSubmittedPrice: 1` to `/api/payments/create-checkout-session` -> Rejected with `403 PRICE_TAMPERING_DETECTED`.
9. **Raw Credit Card PAN Leak**: Sending `4111 1111 1111 1111` in JSON body -> Rejected with `422 PCI_DSS_RAW_PAN_REJECTED`.
10. **XSS Script Payload**: `<script>alert(1)</script>` in request body -> Blocked by WAF (`400 WAF_PAYLOAD_BLOCKED`).
11. **SQL / NoSQL Operator Injection**: `{"$where": "1==1"}` or `UNION ALL SELECT` -> Blocked by WAF (`400 WAF_PAYLOAD_BLOCKED`).
12. **Prototype Pollution**: `{"__proto__": {"isAdmin": true}}` -> Stripped by recursive object sanitizer.
