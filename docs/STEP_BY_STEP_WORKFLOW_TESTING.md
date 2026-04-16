# P2P Food App — Step-by-Step Workflow Testing Document

## 1) Scope and Objective
This testing guide converts the app workflow into executable QA steps for Buyer, Seller, Organization, Rider, and Shared modules.

### Objective
- Validate role-based navigation and startup routing.
- Validate end-to-end order lifecycle (browse → cart → checkout → order tracking).
- Validate onboarding and authentication paths for Organization and Rider.
- Validate seller-side catalog/order operations and chat handoffs.
- Validate shared modules (notifications, settings, deep links, back button behavior).

## 2) Test Environment & Preconditions
- Build: Latest QA build of the app.
- Devices: Android (required for hardware back-button checks), iOS optional.
- Test data:
  - At least one buyer account
  - At least one seller/organization account with active kitchen and dishes
  - At least one rider account
- Network: Stable internet connection.
- App state: Ability to clear AsyncStorage between selected scenarios.

## 3) Execution Rules
- For each case, execute steps in order and capture screenshots/logs for failures.
- Use this expectation format:
  - **Expected:** what must happen
  - **Fail if:** failure condition
- Record route transitions when validating navigation.
- When validating edge cases, verify both UI message and API behavior (if logs are available).

---

## 4) Role Initialization & Navigation Bootstrap

### TC-INIT-01: Unauthenticated launch
1. Clear app storage.
2. Launch app.
- **Expected:** `WelcomeScreen` appears.
- **Fail if:** app opens directly on any role dashboard.

### TC-INIT-02: Customer persistence
1. On `WelcomeScreen`, select role `Customer`.
2. Tap **Get Started** and complete terms consent.
3. Close and relaunch app.
- **Expected:** app opens on `HomeScreen`.
- **Fail if:** role is lost or user is redirected to incorrect flow.

### TC-INIT-03: Vendor startup routing
1. Select `Vendor` on `WelcomeScreen`.
2. Continue through `AgreeAndContinue`.
- **Expected:** user is routed to vendor onboarding/sign-in flow (organization path).
- **Fail if:** app opens buyer/rider flow.

### TC-INIT-04: Rider startup routing
1. Select `Rider` on `WelcomeScreen`.
2. Continue through `AgreeAndContinue`.
- **Expected:** user is routed to `RiderSignin`.
- **Fail if:** wrong role flow opens.

### TC-INIT-05: Deep-link routing
1. Open app using supported deep links for:
   - `SelectedFoodScreen`
   - `KitchenScreen`
   - `AddFoodScreen`
2. Observe resulting route.
- **Expected:** app opens target route after nav initialization.
- **Fail if:** app ignores link or crashes.

---

## 5) Buyer Workflow Testing

### TC-BUY-01: Kitchen discovery
1. Login as buyer and open `HomeScreen`.
2. Enter search term in search bar.
3. Open `SearchScreen` and select suggestion/recent item.
- **Expected:** selected kitchen opens in `KitchenScreen`.
- **Fail if:** mismatch between selected item and opened kitchen.

### TC-BUY-02: Dish selection and required options
1. From `KitchenScreen`, open a dish on `SelectedFoodScreen`.
2. Attempt add-to-cart without selecting required options.
3. Select required options and quantity >= 1.
4. Tap **Add to Cart**.
- **Expected:** validation blocks incomplete selection; valid payload adds item.
- **Fail if:** incomplete option set is accepted.

### TC-BUY-03: Cart constraints
1. Open `CartScreen`.
2. Increase quantity repeatedly beyond stock.
- **Expected:** app blocks increase and shows stock constraint error.
- **Fail if:** quantity exceeds available stock.

### TC-BUY-04: Multi-cart behavior
1. Add items from Kitchen A.
2. Add items from Kitchen B.
3. Open all-cart listing.
- **Expected:** `AllCartScreen` shows separate carts and allows switching.
- **Fail if:** carts merge incorrectly.

### TC-BUY-05: Checkout with coupon
1. From `CartScreen`, tap **Checkout** to open `ConfirmOrderScreen`.
2. Apply valid coupon from `BuyerCouponScreen`.
3. Confirm totals update.
4. Apply invalid/expired coupon.
- **Expected:** valid coupon updates total; invalid coupon shows explicit error.
- **Fail if:** totals don’t change correctly or invalid coupon is accepted.

### TC-BUY-06: Delivery address enforcement
1. In `ConfirmOrderScreen`, enable delivery toggle.
2. Try placing order without selecting address.
3. Select address and place order.
- **Expected:** address is mandatory for delivery; successful flow lands on `OrderDetailsScreen`.
- **Fail if:** delivery order is placed without address.

### TC-BUY-07: Guest cart pending flow
1. Log out / use guest state.
2. Attempt add-to-cart on `SelectedFoodScreen`.
- **Expected:** pending cart/login prompt flow appears and data is preserved for continuation.
- **Fail if:** item silently disappears or no prompt is shown.

### TC-BUY-08: Review prompt trigger
1. Prepare a recently delivered order.
2. Open `HomeScreen`.
- **Expected:** rating prompt appears via order-review logic.
- **Fail if:** no prompt for eligible delivered order.

---

## 6) Seller Workflow Testing

### TC-SEL-01: Seller dashboard access
1. Login as seller.
2. Open `SellerHomeScreen`.
- **Expected:** dashboard renders tabs/metrics without crash.
- **Fail if:** role lands on incorrect dashboard.

### TC-SEL-02: Recipe create and edit
1. Go to `SellerRecipeScreen`.
2. Tap add dish and fill required fields.
3. Save.
4. Reopen same dish and edit details.
- **Expected:** dish appears in list and updates persist.
- **Fail if:** missing-field validation is bypassed or save fails silently.

### TC-SEL-03: Coupon management
1. Open coupon module.
2. Create coupon with valid fields.
3. Create coupon with invalid format/dates.
- **Expected:** valid coupon saved; invalid input blocked with clear message.
- **Fail if:** invalid coupon is accepted.

### TC-SEL-04: Discount lifecycle
1. Create discount campaign.
2. Verify active/inactive behavior by date range.
- **Expected:** discount status reflects configured dates.
- **Fail if:** incorrect activation window.

### TC-SEL-05: Order operations
1. Open `SellerOrderScreen` and select order.
2. View in `OrderViewScreen`.
3. Attempt valid status update.
- **Expected:** order details load and update succeeds with refreshed status.
- **Fail if:** status remains stale or wrong transition allowed.

---

## 7) Organization Workflow Testing

### TC-ORG-01: Registration validation
1. Open `OrganizationSignup`.
2. Submit empty form.
3. Submit duplicate phone (if available).
- **Expected:** required and availability validations block progression.
- **Fail if:** invalid form proceeds.

### TC-ORG-02: OTP verification control
1. Complete signup initiation.
2. Enter wrong OTP.
3. Wait for resend timer and request resend.
4. Enter correct OTP.
- **Expected:** wrong OTP blocked; resend gated by timer; correct OTP proceeds.
- **Fail if:** timer enforcement fails.

### TC-ORG-03: Kitchen profile onboarding
1. Complete `OrganizationKitchenSignup` including logo upload.
2. Validate kitchen type behavior.
- **Expected:** required fields enforced with proper formatting (phone, CNIC, email).
- **Fail if:** malformed data accepted.

### TC-ORG-04: CNIC image enforcement
1. On `OrganizationVendorCNIC`, upload only one side.
2. Try continue.
3. Upload both sides and continue.
- **Expected:** both images required before proceeding.
- **Fail if:** single-image progression allowed.

### TC-ORG-05: Business doc conditional requirement
1. Select `Restaurant` and skip business doc.
2. Select `HOMECHEF` and skip business doc.
- **Expected:** document required for restaurant; optional for home chef.
- **Fail if:** requirement does not vary by type.

### TC-ORG-06: Verification completion
1. Complete onboarding and land on `VerificationScreen`.
2. Tap continue.
- **Expected:** user reaches `OrganizationHomeScreen`.
- **Fail if:** dead-end or incorrect route.

---

## 8) Rider Workflow Testing

### TC-RID-01: Rider sign-in validation
1. Open `RiderSignin`.
2. Submit empty/invalid fields.
3. Submit valid credentials.
- **Expected:** invalid input blocked; valid login opens `RiderHomeScreen`.
- **Fail if:** malformed credentials pass client validation.

### TC-RID-02: Forgot password flow
1. Trigger `RiderForgotPassword`.
2. Submit phone and receive OTP.
3. Verify OTP in `RiderOtpVerify`.
4. Reset password in `RiderResetPassword`.
- **Expected:** successful reset returns user to `RiderSignin`.
- **Fail if:** reset accepts mismatched passwords.

### TC-RID-03: Order filtering and update
1. In `RiderHomeScreen`, switch status pills.
2. Open an assigned order and update lifecycle status.
- **Expected:** list filters correctly; status update persists.
- **Fail if:** filters do not change data set.

### TC-RID-04: Rider chat handoff
1. Open chat from rider order context.
2. Send message.
- **Expected:** message appears in conversation history.
- **Fail if:** message send appears successful but history does not update.

---

## 9) Shared Module Testing

### TC-SHARED-01: App settings links
1. Open `AppSetting`.
2. Tap policy/delete-account links.
- **Expected:** `DeleteAccountWebViewScreen` opens with provided URL.
- **Fail if:** screen opens blank without URL handling.

### TC-SHARED-02: Notifications
1. Open notifications screen.
2. Select notification item (if applicable).
- **Expected:** list loads and item navigation follows notification type.
- **Fail if:** screen fails to render list.

### TC-SHARED-03: Android root back behavior
1. Open each role home root screen.
2. Press hardware back.
- **Expected:** app exits when no previous route exists.
- **Fail if:** app loops or pops to invalid state.

---

## 10) Regression Matrix (Minimum Smoke Set)
Run these before release candidate sign-off:
1. `TC-INIT-01` Unauthenticated launch
2. `TC-INIT-05` Deep-link routing
3. `TC-BUY-02` Dish required options
4. `TC-BUY-05` Coupon totals
5. `TC-BUY-06` Delivery address enforcement
6. `TC-SEL-02` Recipe create/edit
7. `TC-ORG-02` OTP flow
8. `TC-RID-03` Rider status update
9. `TC-SHARED-03` Android back-button exit

## 11) Defect Logging Template
- **Test Case ID:**
- **Build/Version:**
- **Role:**
- **Device/OS:**
- **Precondition:**
- **Steps to Reproduce:**
- **Actual Result:**
- **Expected Result:**
- **Severity/Priority:**
- **Evidence:** screenshot/video/log reference

## 12) Sign-off Criteria
- No blocker/critical defects in checkout, login, order state transitions, or onboarding.
- All smoke tests pass.
- Known medium/low defects documented with workaround/impact.
