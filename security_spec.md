# Security Specification — Nhà Rang Lạc Sơn Firestore

## 1. Data Invariants
1. **Default Deny**: All unmatched paths are explicitly denied (`allow read, write: if false`).
2. **PII Isolation**: `/users/{userId}` contains `email` and is strictly limited to `isOwner(userId)` or `isAdmin()`. Blanket `isSignedIn()` reads are forbidden.
3. **Owner-Scoped Queries**: `/orders` and `/bookings` `allow list` rules evaluate `resource.data.userId == request.auth.uid || isAdmin()` without calling `get()`/`exists()` inside non-admin list checks.
4. **Immutable Ownership & Timestamps**: `userId`, `orderNumber`, `bookingCode`, and `createdAt` are immutable after creation; `createdAt == request.time` on create and `updatedAt == request.time` on create/update.
5. **Terminal State Locking**: Orders with `status in ['completed', 'cancelled']` and bookings with `status in ['completed', 'cancelled']` cannot be mutated by non-admin users.
6. **Privilege Escalation Prevention**: `/admins/{adminId}` denies all client writes. User profiles cannot declare `role` or `isAdmin` fields (`hasOnly` enforced).
7. **Volumetric & Array Guarding**: Every string has an explicit `.size()` bound; `orders.items` is strictly bounded to `1 <= size <= 30` with element type checks; document IDs are validated by `isValidId()`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Order Read**: `GET /orders/ord_1` with `auth = null`.
2. **Cross-User PII Read**: `GET /users/victim_uid` signed in as `attacker_uid`.
3. **Unverified Email Write**: `CREATE /orders/ord_2` where `request.auth.token.email_verified == false`.
4. **Identity Spoofing on Order Create**: `CREATE /orders/ord_3` with `userId: "victim_uid"` while `auth.uid == "attacker_uid"`.
5. **Shadow Field Injection (Ghost Field)**: `CREATE /users/attacker_uid` adding `isAdmin: true` or `role: "admin"`.
6. **Admin Self-Promotion**: `CREATE /admins/attacker_uid` signed in as a normal customer.
7. **ID Poisoning**: `CREATE /orders/../../evil$id_200_chars...` failing `isValidId()`.
8. **Client Timestamp Forgery**: `CREATE /orders/ord_4` with backdated `createdAt != request.time`.
9. **State Shortcutting**: `CREATE /orders/ord_5` with `status: "completed"` instead of `"confirmed"`.
10. **Terminal State Tampering**: `UPDATE /orders/ord_completed` changing `status` from `"completed"` back to `"confirmed"` as owner.
11. **Value Poisoning on Update**: `UPDATE /orders/ord_6` mutating `total` or `userId` when cancelling an order (blocked by `affectedKeys().hasOnly(['status', 'statusLabel', 'updatedAt'])`).
12. **Unbounded Array / Empty Items**: `CREATE /orders/ord_7` with `items: []` or `items.size() == 50`, or `bookings` with `guests: 99`.
