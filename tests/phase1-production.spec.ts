import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://thongkehethong.mindmaid.ai';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@2026';

test.describe('Phase 1: SelectWithOther Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${PRODUCTION_URL}/login`);
    await page.fill('input[placeholder="Tên đăng nhập"]', ADMIN_USERNAME);
    await page.fill('input[placeholder="Mật khẩu"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${PRODUCTION_URL}/dashboard`);
  });

  test('Test 1: system_group field with "Khác" option', async ({ page }) => {
    console.log('Test 1: Testing system_group field...');

    // Navigate to Create System page
    await page.goto(`${PRODUCTION_URL}/systems/create`);
    await page.waitForLoadState('networkidle');

    // Fill required fields first
    await page.fill('input[id="system_name"]', 'Test System Phase 1');
    await page.fill('textarea[id="description"]', 'Testing SelectWithOther component');

    // Find system_group select (should be SelectWithOther component)
    const systemGroupLabel = page.locator('label').filter({ hasText: 'Nhóm hệ thống' });
    const systemGroupField = systemGroupLabel.locator('..').locator('.ant-select');

    console.log('Clicking system_group dropdown...');
    await systemGroupField.click();

    // Wait for dropdown options
    await page.waitForTimeout(500);

    // Check if "Khác" option exists
    const khacOption = page.locator('.ant-select-dropdown .ant-select-item').filter({ hasText: 'Khác' });
    const khacExists = await khacOption.count() > 0;

    console.log(`"Khác" option exists: ${khacExists}`);
    expect(khacExists).toBeTruthy();

    // Click "Khác" option
    await khacOption.click();
    await page.waitForTimeout(500);

    // Check if custom input appears
    const customInput = page.locator('input[placeholder*="Nhập thông tin khác"]').or(page.locator('input[placeholder*="nhập"]'));
    const customInputVisible = await customInput.isVisible();

    console.log(`Custom input visible: ${customInputVisible}`);
    expect(customInputVisible).toBeTruthy();

    // Fill custom input
    await customInput.fill('Hệ thống IoT Custom');
    console.log('Custom value entered: Hệ thống IoT Custom');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/phase1-test1-system_group.png' });
  });

  test('Test 2: authentication_method field with "Khác" option', async ({ page }) => {
    console.log('Test 2: Testing authentication_method field...');

    await page.goto(`${PRODUCTION_URL}/systems/create`);
    await page.waitForLoadState('networkidle');

    // Navigate to Tab 6 (An toàn thông tin)
    const tab6 = page.locator('.ant-tabs-tab').filter({ hasText: 'An toàn thông tin' });
    await tab6.click();
    await page.waitForTimeout(500);

    // Find authentication_method select
    const authMethodLabel = page.locator('label').filter({ hasText: 'Phương thức xác thực' });
    const authMethodField = authMethodLabel.locator('..').locator('.ant-select');

    console.log('Clicking authentication_method dropdown...');
    await authMethodField.click();
    await page.waitForTimeout(500);

    // Check if "Khác" option exists
    const khacOption = page.locator('.ant-select-dropdown .ant-select-item').filter({ hasText: 'Khác' });
    const khacExists = await khacOption.count() > 0;

    console.log(`"Khác" option exists: ${khacExists}`);
    expect(khacExists).toBeTruthy();

    // Click "Khác" option
    await khacOption.click();
    await page.waitForTimeout(500);

    // Check if custom input appears
    const customInput = page.locator('input[placeholder*="Nhập thông tin khác"]').or(page.locator('input[placeholder*="nhập"]'));
    const customInputVisible = await customInput.isVisible();

    console.log(`Custom input visible: ${customInputVisible}`);
    expect(customInputVisible).toBeTruthy();

    // Fill custom input
    await customInput.fill('2FA Token Custom');
    console.log('Custom value entered: 2FA Token Custom');

    await page.screenshot({ path: 'tests/screenshots/phase1-test2-authentication_method.png' });
  });

  test('Test 3: integration_method field with "Khác" option', async ({ page }) => {
    console.log('Test 3: Testing integration_method field...');

    await page.goto(`${PRODUCTION_URL}/systems/create`);
    await page.waitForLoadState('networkidle');

    // Navigate to Tab 5 (Tích hợp & Liên thông)
    const tab5 = page.locator('.ant-tabs-tab').filter({ hasText: 'Tích hợp' });
    await tab5.click();
    await page.waitForTimeout(500);

    // Click "Thêm kết nối" button
    const addButton = page.locator('button').filter({ hasText: 'Thêm kết nối' });
    await addButton.click();
    await page.waitForTimeout(500);

    // Find integration_method select in the form
    const integrationMethodLabel = page.locator('label').filter({ hasText: 'Phương thức tích hợp' });
    const integrationMethodField = integrationMethodLabel.locator('..').locator('.ant-select');

    console.log('Clicking integration_method dropdown...');
    await integrationMethodField.click();
    await page.waitForTimeout(500);

    // Check if "Khác" option exists
    const khacOption = page.locator('.ant-select-dropdown .ant-select-item').filter({ hasText: 'Khác' });
    const khacExists = await khacOption.count() > 0;

    console.log(`"Khác" option exists: ${khacExists}`);
    expect(khacExists).toBeTruthy();

    // Click "Khác" option
    await khacOption.click();
    await page.waitForTimeout(500);

    // Check if custom input appears
    const customInput = page.locator('input[placeholder*="Nhập thông tin khác"]').or(page.locator('input[placeholder*="nhập"]'));
    const customInputVisible = await customInput.isVisible();

    console.log(`Custom input visible: ${customInputVisible}`);
    expect(customInputVisible).toBeTruthy();

    // Fill custom input
    await customInput.fill('gRPC Custom');
    console.log('Custom value entered: gRPC Custom');

    await page.screenshot({ path: 'tests/screenshots/phase1-test3-integration_method.png' });
  });

  test('Test 4: Complete flow - Create system with custom values', async ({ page }) => {
    console.log('Test 4: Complete flow - Create and save system with custom values...');

    await page.goto(`${PRODUCTION_URL}/systems/create`);
    await page.waitForLoadState('networkidle');

    // Fill basic required fields
    await page.fill('input[id="system_name"]', `Phase1 Test ${Date.now()}`);
    await page.fill('textarea[id="description"]', 'E2E test with SelectWithOther');

    // Tab 1: system_group with custom value
    const systemGroupField = page.locator('label').filter({ hasText: 'Nhóm hệ thống' }).locator('..').locator('.ant-select');
    await systemGroupField.click();
    await page.waitForTimeout(300);
    await page.locator('.ant-select-dropdown .ant-select-item').filter({ hasText: 'Khác' }).click();
    await page.waitForTimeout(300);
    const customInput1 = page.locator('input[placeholder*="Nhập thông tin khác"]').or(page.locator('input[placeholder*="nhập"]')).first();
    await customInput1.fill('IoT Platform Test');

    console.log('Filled system_group with custom value');

    // Try to submit
    const submitButton = page.locator('button').filter({ hasText: 'Lưu' });
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Check if saved successfully (should redirect or show success message)
    const currentUrl = page.url();
    const hasSuccessMessage = await page.locator('.ant-message-success').isVisible().catch(() => false);

    console.log(`Current URL after submit: ${currentUrl}`);
    console.log(`Success message visible: ${hasSuccessMessage}`);

    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/phase1-test4-complete-flow.png', fullPage: true });

    // Verify we're not on create page anymore (success redirect) OR success message shown
    expect(currentUrl.includes('/systems/create') === false || hasSuccessMessage).toBeTruthy();
  });
});
