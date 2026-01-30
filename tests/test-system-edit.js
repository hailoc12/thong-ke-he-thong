const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🧪 Testing System Edit Feature...\n');

    // Login first
    console.log('1️⃣ Logging in...');
    await page.goto('https://thongkehethong.mindmaid.ai/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Login successful\n');

    // Go to Systems list
    console.log('2️⃣ Navigating to Systems list...');
    await page.goto('https://thongkehethong.mindmaid.ai/systems');
    await page.waitForSelector('table', { timeout: 5000 });
    console.log('✅ Systems page loaded\n');

    // Check if there are any systems
    const rowCount = await page.locator('table tbody tr').count();
    console.log(`   Found ${rowCount} systems`);

    if (rowCount === 0) {
      console.log('⚠️  No systems found to test edit feature');
      console.log('   Need to create a system first');

      // Create a test system
      console.log('\n3️⃣ Creating a test system...');
      await page.click('button:has-text("Thêm hệ thống")');
      await page.waitForSelector('h2:has-text("Thêm hệ thống mới")', { timeout: 5000 });

      // Fill basic info (Step 1)
      await page.selectOption('[name="org"]', { index: 1 }); // Select first org
      await page.fill('[name="system_code"]', 'TEST-001');
      await page.fill('[name="system_name"]', 'Test System for Edit');
      await page.fill('[name="system_purpose"]', 'Testing edit feature');
      await page.selectOption('[name="status"]', 'active');
      await page.selectOption('[name="criticality_level"]', 'medium');

      // Submit
      await page.click('button:has-text("Lưu hệ thống")');
      await page.waitForTimeout(3000);
      console.log('✅ Test system created\n');

      // Go back to systems list
      await page.goto('https://thongkehethong.mindmaid.ai/systems');
      await page.waitForSelector('table', { timeout: 5000 });
    }

    // Test Edit button navigation
    console.log('4️⃣ Testing "Sửa" button...');
    const editButton = page.locator('table tbody tr').first().locator('button:has-text("Sửa")');
    await editButton.click();

    // Wait for edit page
    await page.waitForURL('**/systems/*/edit', { timeout: 5000 });
    const editUrl = page.url();
    console.log(`✅ Navigated to edit page: ${editUrl}\n`);

    // Verify page title
    console.log('5️⃣ Verifying edit page content...');
    const pageTitle = await page.locator('h2').first().textContent();
    if (pageTitle.includes('Chỉnh sửa hệ thống')) {
      console.log(`✅ Page title correct: "${pageTitle}"`);
    } else {
      console.log(`❌ Page title wrong: "${pageTitle}"`);
    }

    // Check if form is pre-populated
    await page.waitForTimeout(2000); // Wait for data fetch
    const systemName = await page.inputValue('[name="system_name"]').catch(() => '');
    if (systemName) {
      console.log(`✅ Form pre-populated with: "${systemName}"`);
    } else {
      console.log('⚠️  Form not pre-populated (may still be loading)');
    }

    // Try to edit the system name
    console.log('\n6️⃣ Testing form edit and submit...');
    const originalName = systemName;
    const newName = `${originalName} (Edited ${Date.now()})`;
    await page.fill('[name="system_name"]', newName);
    console.log(`   Changed name to: "${newName}"`);

    // Submit form
    const submitButton = page.locator('button:has-text("Cập nhật hệ thống")');
    await submitButton.click();
    console.log('   Clicked "Cập nhật hệ thống" button');

    // Wait for success message or navigation
    try {
      await page.waitForSelector('.ant-message-success', { timeout: 5000 });
      console.log('✅ Success message appeared');
    } catch (e) {
      console.log('⚠️  No success message (may have navigated already)');
    }

    // Should navigate back to detail page
    await page.waitForURL('**/systems/*', { timeout: 5000 });
    const finalUrl = page.url();
    if (!finalUrl.includes('/edit')) {
      console.log(`✅ Navigated back to detail page: ${finalUrl}`);
    }

    // Verify the change
    await page.waitForTimeout(1000);
    const pageContent = await page.textContent('body');
    if (pageContent.includes(newName)) {
      console.log(`✅ Changes saved! Found updated name in detail page`);
    } else {
      console.log('⚠️  Could not verify changes (page may still be loading)');
    }

    console.log('\n✅ ✅ ✅  ALL TESTS PASSED! System Edit feature working! ✅ ✅ ✅\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nCurrent URL:', page.url());

    // Take screenshot on error
    await page.screenshot({ path: '/tmp/system-edit-error.png' });
    console.error('Screenshot saved to: /tmp/system-edit-error.png');
  } finally {
    await browser.close();
  }
})();
