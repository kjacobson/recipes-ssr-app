Feature: Import a recipe

  Scenario: enter URL with valid JSON-LD
    Given I am a logged-in user
    And I am on the "import recipe" page
    And a mocked create recipe POST request
    And a mocked "get" request for the "scraped recipe"
    Then I should see an h1 with the text "Import a recipe from the web"
    When I enter the text "https://www.simplyrecipes.com/recipes/chile_verde/" into the text field with the name "url"
    And I press the button with text "Import"
    Then I should be redirected to the "recipe details" page for the "scraped recipe"
    And I should see an h1 with the text "Chile Verde"

  Scenario: enter URL without JSON-LD
    Given I am a logged-in user
    And I am on the "import recipe" page
    Then I should see an h1 with the text "Import a recipe from the web"
    When I enter the text "https://cooking.nytimes.com/recipes/1020083-creamy-white-bean-and-fennel-casserole" into the text field with the name "url"
    And I press the button with text "Import"
    Then I should be redirected to the "import recipe" page
    And I should see the text "No recipe data found." inside the element matching selector "p.error"

  Scenario: enter URL that can't be found
    Given I am a logged-in user
    And I am on the "import recipe" page
    Then I should see an h1 with the text "Import a recipe from the web"
    When I enter the text "https://cooking.nytimes.com/foo" into the text field with the name "url"
    And I press the button with text "Import"
    Then I should be redirected to the "import recipe" page
    And I should see the text "No recipe data found." inside the element matching selector "p.error"
