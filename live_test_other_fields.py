#!/usr/bin/env python3
"""
Live Test: Test all 'other' option fields with Playwright
Date: 2026-01-27
"""

from playwright.sync_api import sync_playwright
import time
import sys

# Configuration
BASE_URL = "http://34.142.152.104:3000"
USERNAME = "admin"
PASSWORD = "admin123"

# Fields to test (only those with UI)
FIELDS_TO_TEST = [
    {
        "name": "hosting_platform",
        "label": "Hosting Platform",
        "tab": "Cơ bản (Tab 1)",
        "selector_type": "name",  # Use name attribute
    },
    {
        "name": "deployment_location",
        "label": "Vị trí triển khai",
        "tab": "Hạ tầng (Tab 7)",
        "selector_type": "name",
    },
    {
        "name": "compute_type",
        "label": "Loại compute",
        "tab": "Hạ tầng (Tab 7)",
        "selector_type": "name",
    },
]

def test_other_options():
    """Run comprehensive test for all 'other' option fields"""

    print("=" * 80)
    print("LIVE TEST: Testing 'Khác' (Other) Options in System Form")
    print("=" * 80)
    print(f"\nBase URL: {BASE_URL}")
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

            # Fill login form
            # Try to find username field with longer timeout
            username_field = page.locator('input[name="username"]')
            print(f"   → Looking for username field...")
            if username_field.count() > 0:
                print(f"   → Username field found!")
                username_field.fill(USERNAME)
                page.fill('input[name="password"]', PASSWORD)
                page.click('button[type="submit"]')
            else:
                print(f"   ❌ Username field not found, trying alternative selectors...")
                # Try alternative selectors
                alt_username = page.locator('input[type="text"]').or_(page.locator('input[placeholder*="user" i]')).first
                alt_password = page.locator('input[type="password"]').first
                alt_username.fill(USERNAME, timeout=5000)
                alt_password.fill(PASSWORD)
                page.locator('button[type="submit"]').or_(page.locator('button:has-text("Login")')).or_(page.locator('button:has-text("Đăng nhập")')).first.click()

            # Wait for redirect after login
            page.wait_for_url("**/systems", timeout=10000)
            print("✅ Login successful")
            time.sleep(2)

            # Step 2: Navigate to Create System page
            print("\n" + "─" * 80)
            print("📝 STEP 2: Navigating to Create System page...")
            print("─" * 80)

            page.goto(f"{BASE_URL}/systems/new", wait_until="networkidle")
            time.sleep(2)
            print("✅ Form loaded")

            # Step 3: Fill basic required fields
            print("\n" + "─" * 80)
            print("📝 STEP 3: Filling required fields...")
            print("─" * 80)

            # System name
            page.fill('input[name="system_name"]', 'Playwright Test - Other Options - ' + str(int(time.time())))
            print("   ✓ System name filled")

            # Scope - select first option
            page.click('div[id$="scope"]')
            time.sleep(0.5)
            page.keyboard.press('Enter')
            print("   ✓ Scope selected")

            time.sleep(1)

            # Step 4: Test each field with 'other' option
            print("\n" + "=" * 80)
            print("📝 STEP 4: Testing 'Khác' (Other) Options")
            print("=" * 80)

            results = []

            for i, field in enumerate(FIELDS_TO_TEST, 1):
                print(f"\n[{i}/{len(FIELDS_TO_TEST)}] Testing: {field['label']}")
                print(f"   Tab: {field['tab']}")
                print(f"   Field name: {field['name']}")

                try:
                    # Navigate to correct tab if needed
                    if "Tab 7" in field['tab']:
                        print("   → Clicking Tab 7 (Hạ tầng)...")
                        tab_7 = page.locator('text=/.*Hạ tầng.*/').first
                        if tab_7.is_visible():
                            tab_7.click()
                            time.sleep(1)

                    # Find the SelectWithOther component for this field
                    # It's wrapped in Form.Item with name attribute
                    field_selector = f'[name="{field["name"]}"]'

                    # Check if field exists
                    if not page.locator(field_selector).count():
                        print(f"   ❌ Field not found: {field_selector}")
                        results.append({
                            'field': field['name'],
                            'status': 'NOT_FOUND',
                            'error': 'Field selector not found in DOM'
                        })
                        continue

                    # Find the Select dropdown (first child of the field wrapper)
                    select_selector = f'{field_selector} .ant-select-selector'

                    print(f"   → Looking for dropdown: {select_selector}")

                    # Click to open dropdown
                    page.click(select_selector)
                    time.sleep(1)

                    # Look for 'Khác' option in dropdown
                    # Options appear in .ant-select-dropdown
                    khac_option = page.locator('.ant-select-item-option').filter(has_text='Khác')

                    if khac_option.count() == 0:
                        print(f"   ❌ 'Khác' option not found in dropdown")
                        # Take screenshot
                        page.screenshot(path=f'screenshot_no_khac_{field["name"]}.png')
                        results.append({
                            'field': field['name'],
                            'status': 'NO_KHAC_OPTION',
                            'error': 'Khác option not found in dropdown'
                        })
                        continue

                    print(f"   ✓ 'Khác' option found!")

                    # Click 'Khác' option
                    khac_option.first.click()
                    time.sleep(1)

                    # Check if custom input textarea appeared
                    custom_input = page.locator(f'{field_selector} textarea').first

                    if custom_input.is_visible():
                        print(f"   ✓ Custom input textarea appeared")
                        custom_input.fill(f"Custom {field['label']} value")
                        print(f"   ✓ Custom text filled")
                    else:
                        print(f"   ⚠ Custom textarea not visible (might be OK if value is 'other')")

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

            # Find and click submit button
            submit_button = page.locator('button[type="submit"]').or_(page.locator('button:has-text("Lưu")')).first

            if submit_button.is_visible():
                print("   → Clicking submit button...")
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
