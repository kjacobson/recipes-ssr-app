Feature: Sign up

  Scenario: enter valid email
    Given I am on the "signup" page
    When I enter the text "kylejacobson1987@gmail.com" into the text field with the name "email"
    And I press the button with text "Sign up"
    Then I should see the text "Check email"
