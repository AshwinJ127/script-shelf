# features/settings.feature

Feature: User Profile and Settings Management
  As a logged-in user
  I want to update my profile information, change my password, and switch themes
  So I can customize my account settings and preferences

  Scenario: Update username, password, and change theme from light to dark
    Given I am logged in to the application
    When I navigate to the Settings page
    Then I should be on the Settings page
    
    When I click the "Update Profile" button
    And I enter a new email address
    And I click the "Save Changes" button
    Then I should see a success message "Profile updated successfully!"
    
    When I click the "Change Password" button
    And I enter my current password
    And I enter a new password
    And I confirm the new password
    And I click the "Update Password" button
    Then I should see a success message "Password updated successfully!"
    
    When I change the theme from "light" to "dark"
    Then the theme should be set to "dark"
    And I should be able to see the dark theme applied

