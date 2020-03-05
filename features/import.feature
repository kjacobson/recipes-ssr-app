Feature: Import a recipe

    Scenario: enter URL with valid JSON-LD
        Given I am a logged-in user
        And I am on the "import recipe" page
        And A mocked recipe scrape request
        And A mocked "create recipe" "post" request
        And A mocked "recipe details" "get" request
        Then I should see an h1 with the text "Import a recipe from the web"
        When I enter the text "https://www.simplyrecipes.com/recipes/chile_verde/" into the text field with the name "url"
        And I press the button with text "Import"
        Then I should be redirected to the "recipe details" page for the "second" "recipe"
        And I should see an h1 with the text "Chile Verde"
