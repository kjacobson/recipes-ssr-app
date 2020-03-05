Feature: Import a recipe

    Scenario: enter URL with valid JSON-LD
        Given I am a logged-in user
        And I am on the "import recipe" page
        # And A mocked "post" request to "/recipes" responding with a 201 status and body:
        #   """
        #     "fdd96fdf-9dc1-4862-885d-b4cf3068538c"
        #   """
        Then I should see an h1 with the text "Import a recipe from the web"
