# TODO

## Descope Flow: Make phone number optional (no SMS OTP)

The "sign-up-or-in" flow currently has a "User Information - Unverified - Phone Only" screen that requires phone number and triggers SMS OTP verification via the "Verify" button.

**Goal:** Collect phone number optionally without requiring SMS verification.

**Steps:**
1. In Descope Console → Build → Flows → "sign-up-or-in"
2. On the "User Information - Unverified - Phone Only" screen:
   - Click the "Verify" button → switch to **Behavior** tab
   - Change the button action from phone OTP verification to a simple form submit / next step
   - Make the phone number field **optional** (remove the `*` required marker)
3. Save and publish the flow

**Why:** Some users don't have cell phones or don't want to give their number for SMS verification. Email OTP is sufficient for identity verification. Phone can still be collected as optional contact info.
