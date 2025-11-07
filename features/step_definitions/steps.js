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