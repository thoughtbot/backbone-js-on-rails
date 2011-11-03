Feature: Must sign up

  In order to access protected sections of the site
  As a visitor
  I want to sign up

  Scenario: Visitor is prompted to sign up
    When I am on the home page
    Then I should not be able to access the app
