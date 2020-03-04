Feature: Sign up

  # Background:
  #   Given 

  Scenario: enter valid email
    Given I am on the "signup" page
    And A mocked "post" request to "/users" responding with a 201 status and body:
      """
        "fdd96fdf-9dc1-4862-885d-b4cf3068538c"
      """
    When I enter the text "kylejacobson1987+test@gmail.com" into the text field with the name "email"
    And I press the button with text "Sign up"
    Then I should be redirected to the "check email" page
    And I should see an h1 with the text "Check your email to complete verification"
