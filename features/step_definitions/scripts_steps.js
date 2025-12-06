// features/step_definitions/scripts_steps.js
// IMPORTANT: This file uses the driver from steps.js
// DO NOT define Before/After hooks here - they're already in steps.js

const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');

// Access driver from steps.js module
const stepsModule = require('./steps.js');

function getDriver() {
  const driver = stepsModule.driver;
  if (!driver) {
    throw new Error('Driver not initialized. Make sure steps.js Before hook runs first.');
  }
  return driver;
}

const BASE_URL = 'http://localhost:5173';

// ---------- Helper functions ----------

async function loginAndNavigate(path) {
  const driver = getDriver();
  
  // Check if already logged in
  const token = await driver.executeScript('return window.localStorage.getItem("authToken");');
  
  if (!token || token === 'null') {
    // Try to use test token from env
    const testToken = process.env.TEST_AUTH_TOKEN;
    if (testToken && testToken !== 'DUMMY_TEST_TOKEN_REPLACE_ME_WITH_REAL_OR_DEV_TOKEN') {
      await driver.executeScript(`window.localStorage.setItem('authToken', arguments[0]);`, testToken);
    } else {
      throw new Error('Authentication required. Set TEST_AUTH_TOKEN env var or ensure user is logged in via UI first.');
    }
  }
  
  await driver.get(`${BASE_URL}${path}`);
  await driver.sleep(500);
}

async function waitForTextVisible(text, timeout = 10000) {
  const driver = getDriver();
  const element = await driver.wait(
    until.elementLocated(By.xpath(`//*[contains(text(), '${text}')]`)),
    timeout
  );
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

async function findSnippetContainerByTitle(title) {
  const driver = getDriver();
  // Find snippet container - snippet-item class contains h4 with title
  const xpath = `//div[contains(@class, 'snippet-item')]//h4[contains(text(), '${title}')]/ancestor::div[contains(@class, 'snippet-item')]`;
  const container = await driver.wait(until.elementLocated(By.xpath(xpath)), 10000);
  return container;
}

async function clickButtonByText(text) {
  const driver = getDriver();
  const button = await driver.wait(
    until.elementLocated(By.xpath(`//button[contains(normalize-space(), '${text}')]`)),
    10000
  );
  await button.click();
}

async function ensureSnippetExists({ title, language = 'python', code = "print('Hello World')" }, context) {
  const driver = getDriver();
  
  // Check if snippet exists
  const elements = await driver.findElements(By.xpath(`//h4[normalize-space()='${title}']`));
  if (elements.length > 0) {
    if (context) context.snippetTitle = title;
    return;
  }
  
  // Create snippet via UI
  await clickButtonByText('New Snippet');
  await driver.sleep(500);
  
  // Fill Title (input after "Title" label)
  const titleInput = await driver.wait(
    until.elementLocated(By.xpath("//label[text()='Title']/following-sibling::input | //div[label[text()='Title']]//input")),
    10000
  );
  await titleInput.clear();
  await titleInput.sendKeys(title);
  
  // Select language
  const langSelect = await driver.wait(
    until.elementLocated(By.xpath("//label[text()='Language']/following-sibling::select | //div[label[text()='Language']]//select")),
    10000
  );
  await langSelect.click();
  await driver.sleep(200);
  
  const langCapitalized = language.charAt(0).toUpperCase() + language.slice(1);
  const langOption = await driver.wait(
    until.elementLocated(By.xpath(`//option[text()='${langCapitalized}'] | //option[@value='${language.toLowerCase()}']`)),
    10000
  );
  await langOption.click();
  
  // Fill code
  const codeTextarea = await driver.wait(
    until.elementLocated(By.xpath("//label[text()='Code']/following-sibling::textarea | //div[label[text()='Code']]//textarea")),
    10000
  );
  await codeTextarea.clear();
  await codeTextarea.sendKeys(code);
  
  // Save
  await clickButtonByText('Save Snippet');
  await driver.sleep(1000);
  
  await waitForTextVisible(title);
  if (context) context.snippetTitle = title;
}

// ---------- Step definitions ----------

Given('I am logged in and on the scripts page', async function () {
  await loginAndNavigate('/scripts');
  await waitForTextVisible('All Snippets');
});

Given('I am logged in and on the dashboard page', async function () {
  await loginAndNavigate('/');
  await waitForTextVisible('Dashboard');
});

When('I enter a folder name {string} in the new folder input', async function (folderName) {
  const driver = getDriver();
  const input = await driver.wait(
    until.elementLocated(By.css('input[placeholder="New Folder"]')),
    10000
  );
  await input.clear();
  await input.sendKeys(folderName);
  this.folderName = folderName;
});

When('I submit the folder creation form', async function () {
  const driver = getDriver();
  const input = await driver.findElement(By.css('input[placeholder="New Folder"]'));
  const form = await input.findElement(By.xpath('./ancestor::form'));
  const submitButton = await form.findElement(By.xpath('.//button[@type="submit"]'));
  await driver.sleep(300);
  await submitButton.click();
  await driver.sleep(500);
});

Then('I should see {string} in the folder list', async function (folderName) {
  const folder = await waitForTextVisible(folderName);
  expect(await folder.isDisplayed()).to.be.true;
});

When('I click the {string} button', async function (buttonText) {
  await clickButtonByText(buttonText);
  await getDriver().sleep(300);
});

When('I click the "New Snippet" button', async function () {
  await clickButtonByText('New Snippet');
  await getDriver().sleep(500);
});

When('I enter title {string}', async function (title) {
  const driver = getDriver();
  const titleInput = await driver.wait(
    until.elementLocated(By.xpath("//label[text()='Title']/following-sibling::input | //div[label[text()='Title']]//input")),
    10000
  );
  await titleInput.clear();
  await titleInput.sendKeys(title);
  this.snippetTitle = title;
});

When('I select language {string}', async function (language) {
  const driver = getDriver();
  const langSelect = await driver.wait(
    until.elementLocated(By.xpath("//label[text()='Language']/following-sibling::select | //div[label[text()='Language']]//select")),
    10000
  );
  await langSelect.click();
  await driver.sleep(200);
  
  const langCapitalized = language.charAt(0).toUpperCase() + language.slice(1);
  const langOption = await driver.wait(
    until.elementLocated(By.xpath(`//option[text()='${langCapitalized}'] | //option[@value='${language.toLowerCase()}']`)),
    10000
  );
  await langOption.click();
});

When('I enter code {string}', async function (code) {
  const driver = getDriver();
  const codeTextarea = await driver.wait(
    until.elementLocated(By.xpath("//label[text()='Code']/following-sibling::textarea | //div[label[text()='Code']]//textarea")),
    10000
  );
  await codeTextarea.clear();
  await codeTextarea.sendKeys(code);
});

When('I click "Save Snippet"', async function () {
  await clickButtonByText('Save Snippet');
  await getDriver().sleep(1000);
});

Then('I should see {string} in the snippet list', async function (snippetTitle) {
  const driver = getDriver();
  const element = await driver.wait(
    until.elementLocated(By.xpath(`//h4[contains(text(), '${snippetTitle}')]`)),
    10000
  );
  expect(await element.isDisplayed()).to.be.true;
});

Given('I am logged in and have a snippet with title {string}', async function (title) {
  await loginAndNavigate('/scripts');
  await waitForTextVisible('All Snippets');
  await ensureSnippetExists({ title }, this);
  this.snippetTitle = title;
});

When('I click the Edit button on that snippet', async function () {
  const driver = getDriver();
  const title = this.snippetTitle || 'Old Title';
  
  const container = await findSnippetContainerByTitle(title);
  const editButton = await container.findElement(By.xpath(".//button[@title='Edit']"));
  await editButton.click();
  await driver.sleep(500);
});

When('I change the title to {string}', async function (newTitle) {
  const driver = getDriver();
  const titleInput = await driver.wait(
    until.elementLocated(By.xpath("//label[text()='Title']/following-sibling::input | //div[label[text()='Title']]//input")),
    10000
  );
  await titleInput.clear();
  await titleInput.sendKeys(newTitle);
  this.newTitle = newTitle;
});

Then('the snippet should display {string} in the list', async function (newTitle) {
  const driver = getDriver();
  
  const backButtons = await driver.findElements(By.xpath("//button[contains(normalize-space(), 'Back')]"));
  if (backButtons.length > 0) {
    await backButtons[0].click();
    await driver.sleep(500);
  }
  
  const element = await driver.wait(
    until.elementLocated(By.xpath(`//h4[contains(text(), '${newTitle}')]`)),
    10000
  );
  expect(await element.isDisplayed()).to.be.true;
});

Given('I am logged in and have an unfavorited snippet with title {string}', async function (title) {
  await loginAndNavigate('/scripts');
  await waitForTextVisible('All Snippets');
  await ensureSnippetExists({ title }, this);
  
  const driver = getDriver();
  const container = await findSnippetContainerByTitle(title);
  const starButton = await container.findElement(By.xpath(".//button[.//*[local-name()='svg']]"));
  
  try {
    const svg = await starButton.findElement(By.xpath(".//*[local-name()='svg']"));
    const fill = await svg.getAttribute('fill') || '';
    const color = await svg.getAttribute('color') || '';
    
    if ((fill && fill !== 'none') || color.includes('fbbf24')) {
      await starButton.click();
      await driver.sleep(500);
    }
  } catch (e) {
    // Assume unfavorited
  }
  
  this.snippetTitle = title;
});

Given('I am logged in and have a favorited snippet with title {string}', async function (title) {
  await loginAndNavigate('/scripts');
  await waitForTextVisible('All Snippets');
  await ensureSnippetExists({ title }, this);
  
  const driver = getDriver();
  const container = await findSnippetContainerByTitle(title);
  const starButton = await container.findElement(By.xpath(".//button[.//*[local-name()='svg']]"));
  
  try {
    const svg = await starButton.findElement(By.xpath(".//*[local-name()='svg']"));
    const fill = await svg.getAttribute('fill') || '';
    const color = await svg.getAttribute('color') || '';
    
    if (!fill || fill === 'none') {
      if (!color.includes('fbbf24')) {
        await starButton.click();
        await driver.sleep(500);
      }
    }
  } catch (e) {
    await starButton.click();
    await driver.sleep(500);
  }
  
  this.snippetTitle = title;
});

When('I click the star icon on that snippet', async function () {
  const driver = getDriver();
  const title = this.snippetTitle;
  
  if (!title) {
    throw new Error('No snippet title in context');
  }
  
  const container = await findSnippetContainerByTitle(title);
  const starButton = await container.findElement(By.xpath(".//button[.//*[local-name()='svg']]"));
  await starButton.click();
  await driver.sleep(500);
});

Then('the star should be filled for snippet {string}', async function (title) {
  const driver = getDriver();
  const container = await findSnippetContainerByTitle(title);
  const starButton = await container.findElement(By.xpath(".//button[.//*[local-name()='svg']]"));
  const svg = await starButton.findElement(By.xpath(".//*[local-name()='svg']"));
  
  const fill = await svg.getAttribute('fill') || '';
  const color = await svg.getAttribute('color') || '';
  const isFavorited = (fill && fill !== 'none') || color.includes('fbbf24');
  
  expect(isFavorited).to.be.true;
});

Then('the snippet {string} should remain favorited after page refresh', async function (title) {
  const driver = getDriver();
  await driver.navigate().refresh();
  await waitForTextVisible('All Snippets');
  
  const container = await findSnippetContainerByTitle(title);
  const starButton = await container.findElement(By.xpath(".//button[.//*[local-name()='svg']]"));
  const svg = await starButton.findElement(By.xpath(".//*[local-name()='svg']"));
  
  const fill = await svg.getAttribute('fill') || '';
  const color = await svg.getAttribute('color') || '';
  const isFavorited = (fill && fill !== 'none') || color.includes('fbbf24');
  
  expect(isFavorited).to.be.true;
});

Then('the star should be empty for snippet {string}', async function (title) {
  const driver = getDriver();
  const container = await findSnippetContainerByTitle(title);
  const starButton = await container.findElement(By.xpath(".//button[.//*[local-name()='svg']]"));
  const svg = await starButton.findElement(By.xpath(".//*[local-name()='svg']"));
  
  const fill = await svg.getAttribute('fill') || '';
  const color = await svg.getAttribute('color') || '';
  const isFavorited = (fill && fill !== 'none') || color.includes('fbbf24');
  
  expect(isFavorited).to.be.false;
});

Given('I am logged in and have a snippet with title "Delete Me"', async function () {
  await loginAndNavigate('/scripts');
  await waitForTextVisible('All Snippets');
  await ensureSnippetExists({ title: 'Delete Me' }, this);
  this.snippetTitle = 'Delete Me';
});

When('I click the Delete button on that snippet', async function () {
  const driver = getDriver();
  const title = this.snippetTitle || 'Delete Me';
  
  const container = await findSnippetContainerByTitle(title);
  const deleteButton = await container.findElement(By.xpath(".//button[@title='Delete']"));
  await deleteButton.click();
  await driver.sleep(300);
});

When('I confirm the deletion in the dialog', async function () {
  const driver = getDriver();
  try {
    const alert = await driver.switchTo().alert();
    await alert.accept();
  } catch (e) {
    // Not an alert dialog, might be custom modal - wait for it
    await driver.sleep(500);
  }
  await driver.sleep(500);
});

Then('"Delete Me" should not appear in the snippet list', async function () {
  const driver = getDriver();
  await driver.sleep(1000);
  
  const elements = await driver.findElements(By.xpath("//h4[contains(text(), 'Delete Me')]"));
  expect(elements.length).to.equal(0);
});

When('I click the "Create New Snippet" button in Quick Actions', async function () {
  const driver = getDriver();
  const button = await driver.wait(
    until.elementLocated(
      By.xpath("//h3[contains(text(), 'Quick Actions')]/following-sibling::div//button[contains(normalize-space(), 'Create New Snippet')]")
    ),
    10000
  );
  await button.click();
  await driver.sleep(500);
});

Then('I should be on the scripts page', async function () {
  const driver = getDriver();
  await driver.wait(until.urlContains('/scripts'), 10000);
  await waitForTextVisible('All Snippets');
});

Then('the snippet creation form should be visible', async function () {
  const driver = getDriver();
  const titleInput = await driver.wait(
    until.elementLocated(By.xpath("//label[text()='Title']/following-sibling::input | //div[label[text()='Title']]//input")),
    10000
  );
  expect(await titleInput.isDisplayed()).to.be.true;
});
