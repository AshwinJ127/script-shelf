# features/auth.feature

Feature: User Authentication
  As a new user
  I want to register an account and then log in
  So I can access my snippet library

  Scenario: Successful registration and login
    Given I am on the login page
    When I click the "Sign Up" link
    Then I should be on the registration page

    When I enter a new, unique email
    And I enter a secure password
    And I click the "Create Account" button
    Then I should see a success message "Success! Account created"
    And I should be on the login page

    When I enter that same email
    And I enter that same password
    And I click the "Sign In" button
    Then I should be redirected to the "Dashboard"
    And the page header should say "Dashboard"