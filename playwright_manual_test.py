#!/usr/bin/env python3
"""
Playwright Manual Test: Test 'Other' Option on Web UI
Run this on the server to test actual form interaction
Date: 2026-01-27
"""

from playwright.sync_api import sync_playwright
import time

def test_other_option_ui():
    """Test all 'other' options through the web UI"""

    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("=" * 70)
        print("Playwright UI Test: 'Other' Option in Forms")
        print("=" * 70)

        try:
            # Step 1: Navigate to login page
            print("\n▶ Step 1: Navigating to login page...")
            page.goto("http://localhost:3000/login")
            page.wait_for_load_state("networkidle")
            print("✓ Page loaded")

            # Step 2: Login
            print("\n▶ Step 2: Logging in...")
            page.fill('input[name="username"]', 'admin')
            page.fill('input[name="password"]', 'admin')  # Use actual admin password
            page.click('button[type="submit"]')
            page.wait_for_load_state("networkidle")
            time.sleep(2)
            print("✓ Logged in")

            # Step 3: Navigate to create system page
            print("\n▶ Step 3: Navigating to create system page...")
            page.goto("http://localhost:3000/systems/new")
            page.wait_for_load_state("networkidle")
            time.sleep(1)
            print("✓ Form loaded")

            # Step 4: Fill basic required fields
            print("\n▶ Step 4: Filling basic system information...")
            page.fill('input[name="system_name"]', 'Playwright Test - Other Options')

            # Select organization if needed
            try:
                page.click('select[name="org"]')
                page.select_option('select[name="org"]', index=1)
                print("✓ Organization selected")
            except:
                print("⚠ Organization field not found or already set")

            # Select scope
            try:
                page.select_option('select[name="scope"]', 'internal_unit')
                print("✓ Scope selected")
            except:
                print("⚠ Scope field not found")

            print("✓ Basic info filled")

            # Step 5: Test hosting_platform = 'other'
            print("\n▶ Step 5: Testing hosting_platform = 'other'...")
            try:
                page.click('select[name="hosting_platform"]')
                page.select_option('select[name="hosting_platform"]', 'other')
                print("✅ PASS: hosting_platform set to 'other'")
            except Exception as e:
                print(f"❌ FAIL: hosting_platform - {e}")

            # Step 6: Navigate to Architecture tab
            print("\n▶ Step 6: Testing Architecture tab fields...")
            try:
                # Click Architecture tab
                page.click('text="Kiến trúc"')  # Vietnamese for Architecture
                time.sleep(1)

                # Test database_model = 'other'
                try:
                    page.select_option('select[name="architecture_data.database_model"]', 'other')
                    print("✅ PASS: database_model set to 'other'")
                except Exception as e:
                    print(f"❌ FAIL: database_model - {e}")

                # Test mobile_app = 'other'
                try:
                    page.select_option('select[name="architecture_data.mobile_app"]', 'other')
                    print("✅ PASS: mobile_app set to 'other'")
                except Exception as e:
                    print(f"❌ FAIL: mobile_app - {e}")

            except Exception as e:
                print(f"⚠ Could not access Architecture tab: {e}")

            # Step 7: Navigate to Operations tab
            print("\n▶ Step 7: Testing Operations tab fields...")
            try:
                # Click Operations tab
                page.click('text="Vận hành"')  # Vietnamese for Operations
                time.sleep(1)

                # Test dev_type = 'other'
                try:
                    page.select_option('select[name="operations_data.dev_type"]', 'other')
                    print("✅ PASS: dev_type set to 'other'")
                except Exception as e:
                    print(f"❌ FAIL: dev_type - {e}")

                # Test warranty_status = 'other'
                try:
                    page.select_option('select[name="operations_data.warranty_status"]', 'other')
                    print("✅ PASS: warranty_status set to 'other'")
                except Exception as e:
                    print(f"❌ FAIL: warranty_status - {e}")

                # Test vendor_dependency = 'other'
                try:
                    page.select_option('select[name="operations_data.vendor_dependency"]', 'other')
                    print("✅ PASS: vendor_dependency set to 'other'")
                except Exception as e:
                    print(f"❌ FAIL: vendor_dependency - {e}")

                # Test deployment_location = 'other'
                try:
                    page.select_option('select[name="operations_data.deployment_location"]', 'other')
                    print("✅ PASS: deployment_location set to 'other'")
                except Exception as e:
                    print(f"❌ FAIL: deployment_location - {e}")

                # Test compute_type = 'other'
                try:
                    page.select_option('select[name="operations_data.compute_type"]', 'other')
                    print("✅ PASS: compute_type set to 'other'")
                except Exception as e:
                    print(f"❌ FAIL: compute_type - {e}")

            except Exception as e:
                print(f"⚠ Could not access Operations tab: {e}")

            # Step 8: Save the form
            print("\n▶ Step 8: Submitting form...")
            try:
                page.click('button[type="submit"]')
                time.sleep(3)

                # Check for success message or validation errors
                page_content = page.content()
                if "error" in page_content.lower() or "lỗi" in page_content.lower():
                    print("❌ FAIL: Form submission failed with error")
                    # Try to capture error message
                    try:
                        error_msg = page.locator('.error, .alert-error').first.text_content()
                        print(f"   Error: {error_msg}")
                    except:
                        pass
                else:
                    print("✅ PASS: Form submitted successfully")

            except Exception as e:
                print(f"⚠ Could not submit form: {e}")

            # Take screenshot
            print("\n▶ Taking screenshot...")
            page.screenshot(path="playwright_test_result.png")
            print("✓ Screenshot saved: playwright_test_result.png")

        except Exception as e:
            print(f"\n❌ Test failed with error: {e}")
            page.screenshot(path="playwright_test_error.png")
            print("Error screenshot saved: playwright_test_error.png")

        finally:
            # Cleanup
            browser.close()

        print("\n" + "=" * 70)
        print("Test Complete")
        print("=" * 70)

if __name__ == "__main__":
    test_other_option_ui()
