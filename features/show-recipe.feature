Feature: show recipe

  Scenario: an invalid recipe ID 
    Given I am a logged-in user
    And a mocked "get" request to "/recipes/5d933cac-491a-4938-b040-27a8f3136dda/" responding with a 404 status
    When I navigate to the "recipe" "5d933cac-491a-4938-b040-27a8f3136dda" details page
    Then I should see an h1 with the text "Something went wrong"
    And I should see the text "No recipe was found matching that URL" inside the element matching selector "p"

  Scenario: a recipe with ingredients, steps, photos, and an author
    Given I am a logged-in user
    And a mocked "get" request for the "full recipe"
    When I navigate to the "recipe" "5d933cac-491a-4938-b040-27a8f3136dda" details page
    Then I should see an h1 with the text "Crisp-Skinned Spatchcocked (Butterflied) Roast Turkey With Gravy Recipe"
    And I should see the text "J. Kenji López-Alt" inside the element matching selector "article em"
    # And I should see "11" items within the "ingredient" list
  # Scenario: a recipe with no steps
  # Scenario: a recipe with no photos
  # Scenario: a recipe with no author
