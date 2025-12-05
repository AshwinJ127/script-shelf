// features/step_definitions/steps.js

const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
require('chromedriver');

setDefaultTimeout(30 * 1000); 

let driver;

Before(async function () {
  driver = await new Builder().forBrowser('chrome').build();
  await driver.get('http://localhost:5173'); 
  await driver.executeScript('window.localStorage.clear();');
  await driver.get('http://localhost:5173'); 
});

After(async function () {
  await driver.quit();
});

Given('I am on the login page', async function () {
  // Wait for the LOGIN email field
  await driver.wait(until.elementLocated(By.id('login-email')), 10000);
});

Then('I should be on the login page', async function () {
  // Wait for the LOGIN email field
  await driver.wait(until.elementLocated(By.id('login-email')), 10000);
});

When('I click the "Sign Up" link', async function () {
  await driver.findElement(By.xpath("//*[contains(text(), 'Sign Up')]")).click();
});

Then('I should be on the registration page', async function () {
  // Wait for the REGISTER email field
  await driver.wait(until.elementLocated(By.id('register-email')), 10000);
});

When('I enter a new, unique email', async function () {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  this.email = uniqueEmail; 
  // Use the REGISTER email field
  await driver.findElement(By.id('register-email')).sendKeys(uniqueEmail);
});

When('I enter a secure password', async function () {
  const password = 'password123';
  this.password = password; 
  // Use the REGISTER password field
  await driver.findElement(By.id('register-password')).sendKeys(password);
});

When('I click the "Create Account" button', async function () {
  await driver.sleep(100); // Keep this just in case
  await driver.findElement(By.xpath("//button[@type='submit' and text()='Create Account']")).click();
});

Then('I should see a success message "Success! Account created"', async function () {
  const successMessage = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Success! Account created')]")), 10000);
  expect(await successMessage.isDisplayed()).to.be.true;
});

When('I enter that same email', async function () {
  // Wait for and use the LOGIN email field
  await driver.wait(until.elementLocated(By.id('login-email')), 10000);
  await driver.findElement(By.id('login-email')).sendKeys(this.email);
});

When('I enter that same password', async function () {
  // Use the LOGIN password field
  await driver.findElement(By.id('login-password')).sendKeys(this.password);
});

When('I click the "Sign In" button', async function () {
  await driver.sleep(100); // Keep this just in case
  await driver.findElement(By.xpath("//button[@type='submit']")).click();
});

Then('I should be redirected to the "Dashboard"', async function () {
  await driver.wait(until.elementLocated(By.xpath("//h1[text()='Dashboard']")), 10000);
});

Then('the page header should say {string}', async function (expectedTitle) {
  const header = await driver.findElement(By.xpath("//h1"));
  const actualTitle = await header.getText();
  expect(actualTitle).to.equal(expectedTitle);
});

// ===== Settings Feature Steps =====

Given('I am logged in to the application', async function () {
  // First, register a new user
  await driver.wait(until.elementLocated(By.id('login-email')), 10000);
  
  // Click Sign Up link
  await driver.findElement(By.xpath("//*[contains(text(), 'Sign Up')]")).click();
  await driver.wait(until.elementLocated(By.id('register-email')), 10000);
  
  // Register with unique email
  const uniqueEmail = `test_settings_${Date.now()}@example.com`;
  this.email = uniqueEmail;
  this.originalPassword = 'password123';
  this.newPassword = 'newpassword456';
  
  await driver.findElement(By.id('register-email')).sendKeys(uniqueEmail);
  await driver.findElement(By.id('register-password')).sendKeys(this.originalPassword);
  await driver.findElement(By.xpath("//button[@type='submit' and text()='Create Account']")).click();
  
  // Wait for success message and then login
  await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Success! Account created')]")), 10000);
  await driver.sleep(500); // Brief wait for redirect
  
  // Login
  await driver.wait(until.elementLocated(By.id('login-email')), 10000);
  await driver.findElement(By.id('login-email')).sendKeys(this.email);
  await driver.findElement(By.id('login-password')).sendKeys(this.originalPassword);
  await driver.findElement(By.xpath("//button[@type='submit']")).click();
  
  // Wait for dashboard to confirm login
  await driver.wait(until.elementLocated(By.xpath("//h1[text()='Dashboard']")), 10000);
});

When('I navigate to the Settings page', async function () {
  // Click on Settings in the sidebar - look for link with Settings text
  await driver.sleep(200);
  const settingsLink = await driver.wait(
    until.elementLocated(By.xpath("//a[.//span[contains(text(), 'Settings')]]")),
    10000
  );
  await settingsLink.click();
  await driver.sleep(300); // Wait for navigation
});

Then('I should be on the Settings page', async function () {
  // Wait for Settings page header
  await driver.wait(until.elementLocated(By.xpath("//h1[text()='Settings']")), 10000);
});

When('I click the "Update Profile" button', async function () {
  await driver.sleep(200);
  const updateProfileButton = await driver.wait(
    until.elementLocated(By.xpath("//button[contains(text(), 'Update Profile')]")),
    10000
  );
  await updateProfileButton.click();
  await driver.sleep(300); // Wait for form to appear
});

When('I enter a new email address', async function () {
  await driver.sleep(200);
  const newEmail = `updated_${Date.now()}@example.com`;
  this.updatedEmail = newEmail;
  
  // Find the email input field in the profile form by label
  const emailInput = await driver.wait(
    until.elementLocated(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input[@type='email']")),
    10000
  );
  
  // Clear existing email and enter new one
  await emailInput.clear();
  await emailInput.sendKeys(newEmail);
});

When('I click the "Save Changes" button', async function () {
  await driver.sleep(200);
  const saveButton = await driver.wait(
    until.elementLocated(By.xpath("//form//button[@type='submit' and contains(text(), 'Save Changes')]")),
    10000
  );
  await saveButton.click();
  await driver.sleep(500); // Wait for API response
});

Then('I should see a success message "Profile updated successfully!"', async function () {
  const successMessage = await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(), 'Profile updated successfully!')]")),
    10000
  );
  expect(await successMessage.isDisplayed()).to.be.true;
});

When('I click the "Change Password" button', async function () {
  await driver.sleep(200);
  const changePasswordButton = await driver.wait(
    until.elementLocated(By.xpath("//button[contains(text(), 'Change Password')]")),
    10000
  );
  await changePasswordButton.click();
  await driver.sleep(300); // Wait for form to appear
});

When('I enter my current password', async function () {
  // Find the current password field by label
  await driver.sleep(200);
  const currentPasswordInput = await driver.wait(
    until.elementLocated(By.xpath("//label[contains(text(), 'Current Password')]/following-sibling::input[@type='password']")),
    10000
  );
  await currentPasswordInput.sendKeys(this.originalPassword);
});

When('I enter a new password', async function () {
  // Find the new password field by label
  await driver.sleep(200);
  const newPasswordInput = await driver.wait(
    until.elementLocated(By.xpath("//label[contains(text(), 'New Password')]/following-sibling::input[@type='password']")),
    10000
  );
  await newPasswordInput.sendKeys(this.newPassword);
});

When('I confirm the new password', async function () {
  // Find the confirm password field by label
  await driver.sleep(200);
  const confirmPasswordInput = await driver.wait(
    until.elementLocated(By.xpath("//label[contains(text(), 'Confirm New Password')]/following-sibling::input[@type='password']")),
    10000
  );
  await confirmPasswordInput.sendKeys(this.newPassword);
});

When('I click the "Update Password" button', async function () {
  await driver.sleep(200);
  const updatePasswordButton = await driver.wait(
    until.elementLocated(By.xpath("//form//button[@type='submit' and contains(text(), 'Update Password')]")),
    10000
  );
  await updatePasswordButton.click();
  await driver.sleep(500); // Wait for API response
});

Then('I should see a success message "Password updated successfully!"', async function () {
  const successMessage = await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(), 'Password updated successfully!')]")),
    10000
  );
  expect(await successMessage.isDisplayed()).to.be.true;
});

When('I change the theme from {string} to {string}', async function (fromTheme, toTheme) {
  await driver.sleep(200);
  
  // Find and click the theme button for the target theme
  const themeButton = await driver.wait(
    until.elementLocated(By.xpath(`//button[contains(text(), '${toTheme.charAt(0).toUpperCase() + toTheme.slice(1)} Theme')]`)),
    10000
  );
  await themeButton.click();
  await driver.sleep(500); // Wait for theme to apply
  this.currentTheme = toTheme;
});

Then('the theme should be set to {string}', async function (expectedTheme) {
  // Check if the body has the theme class
  const body = await driver.findElement(By.tagName('body'));
  const bodyClass = await body.getAttribute('class');
  expect(bodyClass).to.include(`${expectedTheme}-theme`);
});

Then('I should be able to see the dark theme applied', async function () {
  // Verify dark theme is applied by checking body class or specific dark theme styles
  const body = await driver.findElement(By.tagName('body'));
  const bodyClass = await body.getAttribute('class');
  expect(bodyClass).to.include('dark-theme');
  
  // Also verify the dark theme button is active/selected
  const darkThemeButton = await driver.findElement(By.xpath("//button[contains(text(), 'Dark Theme')]"));
  const buttonBgColor = await darkThemeButton.getCssValue('background-color');
  // Dark theme button should have a dark background when active
  expect(buttonBgColor).to.not.equal('rgba(0, 0, 0, 0)'); // Should have a background color
});