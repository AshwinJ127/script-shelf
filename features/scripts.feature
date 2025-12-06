# features/scripts.feature

Feature: Scripts page management
  As a ScriptShelf user
  I want to manage folders and code snippets
  So that I can organize and edit my code efficiently

  Scenario: Create New Folder
    Given I am logged in and on the scripts page
    When I enter a folder name "Test Folder" in the new folder input
    And I submit the folder creation form
    Then I should see "Test Folder" in the folder list

  Scenario: Create New Snippet
    Given I am logged in and on the scripts page
    When I click the "New Snippet" button
    And I enter title "My Test Snippet"
    And I select language "Python"
    And I enter code "print('Hello World')"
    And I click "Save Snippet"
    Then I should see "My Test Snippet" in the snippet list

  Scenario: Edit Existing Snippet
    Given I am logged in and have a snippet with title "Old Title"
    When I click the Edit button on that snippet
    And I change the title to "New Title"
    And I click "Save Snippet"
    Then the snippet should display "New Title" in the list

  Scenario: Favorite a Snippet
    Given I am logged in and have an unfavorited snippet with title "Favorite Me"
    When I click the star icon on that snippet
    Then the star should be filled for snippet "Favorite Me"
    And the snippet "Favorite Me" should remain favorited after page refresh

  Scenario: Unfavorite a Snippet
    Given I am logged in and have a favorited snippet with title "Unfavorite Me"
    When I click the star icon on that snippet
    Then the star should be empty for snippet "Unfavorite Me"

  Scenario: Delete Snippet
    Given I am logged in and have a snippet with title "Delete Me"
    When I click the Delete button on that snippet
    And I confirm the deletion in the dialog
    Then "Delete Me" should not appear in the snippet list

  Scenario: Quick Actions - Create New Snippet
    Given I am logged in and on the dashboard page
    When I click the "Create New Snippet" button in Quick Actions
    Then I should be on the scripts page
    And the snippet creation form should be visible
