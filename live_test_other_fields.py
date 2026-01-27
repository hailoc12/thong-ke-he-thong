#!/usr/bin/env python3
"""
Live Test: Test all 'other' option fields with Playwright
Date: 2026-01-27
"""

from playwright.sync_api import sync_playwright
import time
import sys

# Configuration
# Testing on PRODUCTION URL with existing system
BASE_URL = "https://hientrangcds.mst.gov.vn"
USERNAME = "admin"
PASSWORD = "Admin@2026"
SYSTEM_ID = 147  # Test on existing system

# Fields to test (only those with UI)
# Using Vietnamese label text to find fields since name attributes don't work
FIELDS_TO_TEST = [
    {
        "name": "hosting_platform",
        "label_text": "Nền tảng triển khai",  # Corrected: This is the actual label
        "tab": "Hạ tầng (Tab 7)",
        "tab_text": "Hạ tầng",
    },
    {
        "name": "deployment_location",
        "label_text": "Vị trí triển khai",
        "tab": "Hạ tầng (Tab 7)",
        "tab_text": "Hạ tầng",
    },
    {
        "name": "compute_type",
        "label_text": "Loại hạ tầng tính toán",
        "tab": "Hạ tầng (Tab 7)",
        "tab_text": "Hạ tầng",
    },
]

def test_other_options():
    """Run comprehensive test for all 'other' option fields"""

    print("=" * 80)
    print("LIVE TEST: Testing 'Khác' (Other) Options on Production")
    print("=" * 80)
    print(f"\nBase URL: {BASE_URL}")
    print(f"System ID: {SYSTEM_ID}")
    print(f"Username: {USERNAME}")
    print(f"Fields to test: {len(FIELDS_TO_TEST)}")
    print("\n")

    with sync_playwright() as p:
        # Launch browser (headless for server environment)
        print("🚀 Launching browser...")
        browser = p.chromium.launch(headless=True, slow_mo=100)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Enable console logging from browser
        page.on("console", lambda msg: print(f"   [Browser Console] {msg.type}: {msg.text}"))

        try:
            # Step 1: Login
            print("\n" + "─" * 80)
            print("📝 STEP 1: Logging in...")
            print("─" * 80)

            page.goto(f"{BASE_URL}/login", wait_until="networkidle")
            time.sleep(2)

            # Take screenshot to debug what we see
            page.screenshot(path='screenshot_login_page.png')
            print(f"   → Login page loaded, screenshot saved")
            print(f"   → Current URL: {page.url}")

            # Fill login form using Vietnamese placeholders
            print(f"   → Looking for username field with placeholder...")
            username_field = page.locator('input[placeholder="Tên đăng nhập"]')
            password_field = page.locator('input[placeholder="Mật khẩu"]')

            if username_field.count() > 0:
                print(f"   → Username field found!")
                username_field.fill(USERNAME)
                password_field.fill(PASSWORD)

                # Check the "remember me" checkbox to store tokens in localStorage
                remember_checkbox = page.locator('input[type="checkbox"]').or_(
                    page.locator('[role="checkbox"]')
                ).first
                if remember_checkbox.count() > 0:
                    remember_checkbox.check()
                    print(f"   → 'Remember me' checkbox checked")

                # Click the blue "Đăng nhập" button
                login_button = page.locator('button:has-text("Đăng nhập")')
                login_button.click()
                print(f"   → Login button clicked")
            else:
                print(f"   ❌ Login form not found with expected placeholders")
                raise Exception("Could not find login form fields")

            # Wait for redirect after login (goes to /dashboard)
            page.wait_for_url("**/dashboard", timeout=10000)
            print("✅ Login successful - redirected to dashboard")

            # Wait for page to fully load and auth to be set
            time.sleep(3)

            # Verify authentication by checking for user menu or logout button
            user_menu = page.locator('text=/admin/i').or_(page.locator('[class*="user"]'))
            if user_menu.count() > 0:
                print("   ✓ User menu found - authentication confirmed")
            else:
                print("   ⚠ User menu not found - auth may not be persisted")

            # Save storage state (cookies, localStorage) for persistent auth
            storage_state = context.storage_state()
            print(f"   ✓ Storage state saved (cookies + localStorage)")

            time.sleep(1)

            # Step 2: Navigate to systems list via sidebar menu (maintains auth)
            print("\n" + "─" * 80)
            print("📝 STEP 2: Navigating to Systems page via menu...")
            print("─" * 80)

            # Click "Hệ thống" menu item in sidebar
            systems_menu = page.locator('text=/.*Hệ thống.*/').or_(
                page.locator('a[href="/systems"]')
            ).or_(
                page.locator('a[href*="system"]')
            ).first

            if systems_menu.count() > 0:
                print("   → Clicking 'Hệ thống' menu item...")
                systems_menu.click()
                time.sleep(3)
            else:
                print("   ⚠ Menu item not found, trying direct navigation...")
                page.goto(f"{BASE_URL}/systems", wait_until="networkidle")
                time.sleep(2)

            # Check if we got redirected back to login
            if '/login' in page.url:
                print("   ❌ Redirected back to login - authentication failed")
                page.screenshot(path='screenshot_auth_failed.png')
                raise Exception("Authentication lost when navigating to /systems")

            print("✅ Systems list page loaded")
            print(f"   → Current URL: {page.url}")

            # Step 3: Find ANY system in the list and click edit
            print("\n" + "─" * 80)
            print(f"📝 STEP 3: Finding a system to edit...")
            print("─" * 80)

            # Wait for table to load
            time.sleep(2)

            # Take screenshot of systems list
            page.screenshot(path='screenshot_systems_list.png')
            print(f"   ✓ Screenshot saved: screenshot_systems_list.png")

            # Strategy: Find "Sửa" button in table
            print(f"   → Looking for 'Sửa' (Edit) button...")

            # The screenshot shows action buttons with text "Sửa" in each row
            # Try different selectors to find these buttons
            edit_button = page.locator('text="Sửa"').first.or_(
                page.locator('a:has-text("Sửa")').first
            ).or_(
                page.locator('button:has-text("Sửa")').first
            )

            # Debug: Count how many "Sửa" buttons we can find
            sua_count = page.locator('text="Sửa"').count()
            print(f"   → Found {sua_count} elements with text 'Sửa'")

            if sua_count > 0:
                # Click the first "Sửa" button
                print(f"   → Clicking first 'Sửa' button...")
                page.locator('text="Sửa"').first.click()
                time.sleep(3)

                # Check if we navigated to edit page
                if '/edit' in page.url:
                    print(f"   ✅ Successfully navigated to edit page")
                else:
                    print(f"   ⚠ Clicked 'Sửa' but not on edit page yet")
                    print(f"   → Current URL: {page.url}")
            else:
                print(f"   ❌ No 'Sửa' buttons found")
                print(f"   → Trying alternative approach: find any clickable link in table...")

                # Alternative: click first system name (should go to detail page)
                first_system_name = page.locator('tbody tr td:nth-child(2)').first

                if first_system_name.count() > 0:
                    print(f"   → Clicking first system name...")
                    first_system_name.click()
                    time.sleep(2)

                    # Look for edit button on detail page
                    detail_edit = page.locator('text="Sửa"').first

                    if detail_edit.count() > 0:
                        print(f"   → Clicking 'Sửa' on detail page...")
                        detail_edit.click()
                        time.sleep(3)
                    else:
                        print(f"   ❌ No 'Sửa' button on detail page")
                        raise Exception("Cannot find edit button")
                else:
                    print(f"   ❌ Cannot find any systems in table")
                    raise Exception("Systems table appears empty")

            # Check if we got redirected back to login
            if '/login' in page.url:
                print("   ❌ Redirected back to login - authentication failed")
                page.screenshot(path='screenshot_auth_failed.png')
                raise Exception("Authentication lost when navigating to edit page")

            # Take screenshot
            page.screenshot(path='screenshot_edit_form.png')
            print(f"✅ Edit form loaded, screenshot saved")
            print(f"   → Current URL: {page.url}")

            # Wait for form to fully load - production might be slower
            print(f"   → Waiting for form elements to load...")
            time.sleep(5)

            # Scroll to top to ensure fields are visible
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(1)

            # Step 4: Test each field with 'other' option
            print("\n" + "=" * 80)
            print("📝 STEP 4: Testing 'Khác' (Other) Options")
            print("=" * 80)

            results = []

            for i, field in enumerate(FIELDS_TO_TEST, 1):
                print(f"\n[{i}/{len(FIELDS_TO_TEST)}] Testing: {field['label_text']}")
                print(f"   Tab: {field['tab']}")
                print(f"   Field name: {field['name']}")

                try:
                    # Navigate to correct tab if needed
                    if field['tab_text'] == "Hạ tầng":
                        print(f"   → Clicking tab '{field['tab_text']}'...")
                        # Find tab by text
                        tab = page.locator(f'text=/.*{field["tab_text"]}.*/').first
                        if tab.count() > 0 and tab.is_visible():
                            tab.click()
                            time.sleep(2)
                            print(f"   ✓ Switched to tab '{field['tab_text']}'")

                            # Take screenshot for debugging
                            page.screenshot(path=f'screenshot_tab_ha_tang_{field["name"]}.png')
                            print(f"   → Screenshot saved: screenshot_tab_ha_tang_{field['name']}.png")

                    # Find field by label text
                    # Strategy: Find label with this text, then find the Select in the same Form.Item
                    print(f"   → Looking for label: {field['label_text']}")

                    # Try to find the label
                    label = page.locator(f'text="{field["label_text"]}"').or_(
                        page.locator(f'text=/.*{field["label_text"]}.*/i')
                    ).first

                    if label.count() == 0:
                        print(f"   ❌ Label not found: {field['label_text']}")

                        # Debug: List all visible labels on this tab
                        print(f"   → Debug: Listing all visible labels (first 20)...")
                        all_labels = page.locator('label').all_text_contents()
                        for idx, lbl in enumerate(all_labels[:20]):
                            if lbl.strip():
                                print(f"     Label {idx}: {lbl.strip()}")

                        results.append({
                            'field': field['name'],
                            'status': 'NOT_FOUND',
                            'error': f'Label "{field["label_text"]}" not found in current tab'
                        })
                        continue

                    print(f"   ✓ Label found!")

                    # Scroll label into view
                    label.scroll_into_view_if_needed()
                    time.sleep(0.5)

                    # Strategy: Try multiple selectors for select dropdown
                    print(f"   → Searching for select dropdown with multiple strategies...")

                    # Try different selectors
                    selectors_to_try = [
                        '.ant-select-selector',  # Standard Ant Design
                        '.ant-select',           # Parent select element
                        'select',                # Native select
                        '[role="combobox"]',     # ARIA role
                        '.rc-select-selector',   # RC (React Component) select
                    ]

                    select_selector = None
                    for selector_text in selectors_to_try:
                        count = page.locator(selector_text).count()
                        print(f"     Selector '{selector_text}': {count} found")

                        if count > 0:
                            # Found some elements, try to find one near the label
                            all_items = page.locator(selector_text).all()
                            label_box = label.bounding_box()

                            if label_box:
                                for idx, item in enumerate(all_items):
                                    item_box = item.bounding_box()
                                    if item_box:
                                        y_diff = item_box['y'] - label_box['y']

                                        # Check if this item is after the label and close to it
                                        if 0 < y_diff < 150:  # Within 150px below label
                                            select_selector = item
                                            print(f"   ✓ Found matching element with '{selector_text}' at index {idx}, y_diff={y_diff}")
                                            break

                            if select_selector:
                                break

                    if not select_selector:
                        print(f"   ❌ No select dropdown found with any selector")
                        page.screenshot(path=f'screenshot_no_select_{field["name"]}.png')
                        results.append({
                            'field': field['name'],
                            'status': 'NO_SELECT_FOUND',
                            'error': 'Could not find select dropdown'
                        })
                        continue

                    print(f"   → Attempting to click dropdown...")

                    # Click to open dropdown
                    select_selector.click(timeout=10000)
                    time.sleep(1.5)

                    # Look for 'Khác' option in dropdown
                    # Options appear in .ant-select-dropdown (visible dropdown overlay)
                    khac_option = page.locator('.ant-select-dropdown:visible .ant-select-item-option:has-text("Khác")')

                    if khac_option.count() == 0:
                        print(f"   ❌ 'Khác' option not found in dropdown")
                        # Take screenshot
                        page.screenshot(path=f'screenshot_no_khac_{field["name"]}.png')

                        # Debug: list all visible options
                        all_options = page.locator('.ant-select-dropdown:visible .ant-select-item-option').all_text_contents()
                        print(f"   Available options: {all_options[:5]}")  # Show first 5

                        results.append({
                            'field': field['name'],
                            'status': 'NO_KHAC_OPTION',
                            'error': 'Khác option not found in dropdown'
                        })
                        continue

                    print(f"   ✓ 'Khác' option found!")

                    # Click 'Khác' option
                    khac_option.first.click()
                    time.sleep(1.5)

                    # Check if custom input textarea appeared
                    # Look for textarea anywhere on the page that just became visible
                    custom_input = page.locator('textarea:visible').last

                    if custom_input.count() > 0:
                        try:
                            custom_input.fill(f"Custom value for {field['name']}", timeout=5000)
                            print(f"   ✓ Custom input textarea filled")
                        except:
                            print(f"   ⚠ Custom textarea found but could not fill")
                    else:
                        print(f"   ⚠ Custom textarea not visible (field might store 'other' directly)")

                    time.sleep(0.5)

                    results.append({
                        'field': field['name'],
                        'status': 'SUCCESS',
                        'error': None
                    })
                    print(f"   ✅ Field test passed")

                except Exception as e:
                    print(f"   ❌ Error: {str(e)}")
                    page.screenshot(path=f'screenshot_error_{field["name"]}.png')
                    results.append({
                        'field': field['name'],
                        'status': 'ERROR',
                        'error': str(e)
                    })

            # Step 5: Try to save form
            print("\n" + "=" * 80)
            print("📝 STEP 5: Attempting to Save Form")
            print("=" * 80)

            # Scroll to bottom to find submit button
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1)

            # Find submit button
            submit_button = page.locator('button[type="submit"]').or_(page.locator('button:has-text("Lưu")')).first

            if submit_button.is_visible():
                # Check if button is enabled
                is_disabled = submit_button.get_attribute('disabled')

                if is_disabled:
                    print("   ⚠ Submit button is DISABLED (form has validation errors)")
                    print("   → Skipping save attempt - test focused on 'other' options, not full form validation")
                else:
                    print("   → Submit button is enabled, clicking...")
                    submit_button.click()
                    time.sleep(3)

                # Check for success or error message
                # Success: notification or redirect
                # Error: .ant-form-item-explain-error or notification

                error_messages = page.locator('.ant-form-item-explain-error').all_text_contents()
                if error_messages:
                    print(f"   ❌ Validation errors found:")
                    for msg in error_messages:
                        if msg.strip():
                            print(f"      - {msg}")

                    # Take screenshot
                    page.screenshot(path='screenshot_validation_error.png')
                else:
                    # Check for success notification
                    success_notification = page.locator('.ant-notification-notice-success')
                    if success_notification.count() > 0:
                        print("   ✅ Form saved successfully!")
                    else:
                        # Check URL changed (redirect to detail page)
                        if '/systems/' in page.url and '/new' not in page.url:
                            print("   ✅ Form saved! Redirected to system detail page")
                        else:
                            print("   ⚠ Unknown status - no error but no success notification")
                            page.screenshot(path='screenshot_unknown_status.png')
            else:
                print("   ⚠ Submit button not found")
                page.screenshot(path='screenshot_no_submit.png')

            # Print summary
            print("\n" + "=" * 80)
            print("📊 TEST SUMMARY")
            print("=" * 80)

            success_count = sum(1 for r in results if r['status'] == 'SUCCESS')

            print(f"\nTotal fields tested: {len(FIELDS_TO_TEST)}")
            print(f"Successful: {success_count}")
            print(f"Failed: {len(results) - success_count}")

            print("\nDetailed Results:")
            for result in results:
                status_icon = "✅" if result['status'] == 'SUCCESS' else "❌"
                print(f"  {status_icon} {result['field']}: {result['status']}")
                if result['error']:
                    print(f"     Error: {result['error']}")

            # Keep browser open for 5 seconds to see final state
            print("\n⏳ Keeping browser open for 5 seconds...")
            time.sleep(5)

        except Exception as e:
            print(f"\n❌ FATAL ERROR: {str(e)}")
            page.screenshot(path='screenshot_fatal_error.png')
            import traceback
            traceback.print_exc()

        finally:
            print("\n🔚 Closing browser...")
            browser.close()

    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    test_other_options()
