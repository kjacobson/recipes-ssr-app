const htmlEscape = (str='') => {
    return str.replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;')
}

const htmlTagger = (strings, values) => {
    const raw = strings.raw

    let result = ''

    values.forEach((val, i) => {
        let lit = raw[i]
        if (Array.isArray(val)) {
            val = val.join('')
        }
        if (lit.endsWith('!')) {
            val = htmlEscape(val)
            lit = lit.slice(0, -1)
        }
        result += lit
        result += val
    })
    result += raw[raw.length-1]
    return result
}

const H = (strings, ...values) => {
    return htmlTagger(strings, values)
}

const asyncH = async (strings, ...values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            resolve(
                htmlTagger(strings, values)
            )
        })
    })
}

const head = ({lang, title, h1, nav}) => {
    return H`
        <!doctype html>
        <html lang="${lang}">
            <head>
                <meta charset="utf-8">
                <title>!${title}</title>
                <meta name="description" content="">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="preload" href="index.css" as="style">
                <link rel="stylesheet" href="/index.css">
            </head>
            <body>
                <nav>
                    ${ nav ? nav : '' }
                </nav>
                ${ h1 ? H`
                <header>
                    <h1>!${h1}</h1>
                </header>
                ` : ''}
                <main>
    `
}

const footer = () => {
    return H`</main></body></html>`
}

const ingredient = (ingredient) => {
    return H`<li>!${ingredient}</li>`
}

const ingredientList = (ingredients) => {
    return H`
        <h2>Ingredients:</h2>
        <ul>
            ${ ingredients.map(ingredient) }
        </ul>
    `
}

const instructions = (instructions) => {
    return H`
        <h2>Instructions:</h2>
        ${Array.isArray(instructions)
            ? H`<ol>${instructions.map(instructionItem)}</ol>`
            : H`<p>!${instructions}</p>`
        }
    `
}

const instructionItem = (instruction) => {
    return instruction.name && instruction.itemListElement
        ? H`<h3>!${instruction.name}:</h3>${instruction.itemListElement.map(instructionItem)}`
        : H`<li>!${instruction.text}</li>`;
}

const singleRecipe = (recipeId, recipe, asynchronous=false) => {
    let image = recipe.image
    if (Array.isArray(image) && image.length) {
        image = image[0]
    }
    if (image.url) {
        image = image.url
    }
    return (asynchronous ? asyncH : H)`
        <article>
            <h1>
                <a href="/recipes/${recipeId}" title="View full recipe">
                    !${(recipe.name || '')}</h1>
                </a>
            </h1>
            <em>!${recipe.author ? recipe.author.name : ''}</em>

            ${image ?
                H`<img src="!${image}" loading="lazy" alt="" />` : ''
            }

            <p>!${recipe.description || ''}</p>

            ${recipe.recipeIngredient 
                ? ingredientList(recipe.recipeIngredient)
                : ''
            }

            ${recipe.recipeInstructions ? instructions(recipe.recipeInstructions) : ''}
            <a href="!${recipe.url}" target="_blank" rel="noopener" title="View original">
                !${recipe.url}
            </a>
        </article>
    `
}

const importRecipeNav = () => {
    return `
        <a href="/recipes/import" title="Import a recipe from the web">
            ⊕ Import a recipe
        </a>
    `
}

const allRecipesNav = () => {
    return `
        <a href="/recipes" title="See all saved recipes">
           ⭠ All recipes
        </a>
    `
}

const homePage = () => {
    return H`
        ${head({
            lang: 'en',
            title: 'RecipeGrab',
            h1: 'Welcome (back?) to RecipeGrab!',
            nav: '<a href="/">Home</a>'
        })}
        <form action="/loginsignup" method="POST">
            <h3>Enter your email and get a one&#45;time login link</h3>
            <p>If you don't have an account yet, we'll create one for you.</p>
            <input
                type="email"
                name="email"
                placeholder="foo@example.com"
                size="60"
                required
            />
            <button type="submit">Email me</button>
        </form>
        ${footer()}
    `
}

const showPage = (recipe) => {
    return H`
        ${head({lang: 'en', title: recipe.json.name, nav: allRecipesNav()})}
        ${singleRecipe(recipe.id, recipe.json)}
        ${footer()}
    `
}

const errorMessage = (error) => {
    return H`<p class="error">${error}</p>`
}

const importPage = (errors) => {
    return H`
        ${head({
            lang: 'en',
            title: 'Import a new recipe',
            h1: 'Import a recipe from the web',
            nav: allRecipesNav()
        })}
        <form action="/recipes" method="POST">
            ${errors ? errors.map(errorMessage) : ''}
            <label for="importUrlInput">Paste your recipe URL here:</label>
            <input type="url" name="url" id="importUrlInput"
                required size="60"
                placeholder="https://www.saveur.com/article/Recipes/Creamed-Brussels-Sprouts/"
            />
            <button type="submit">Import</button>
            <h3>Some sites we can definitely import from:</h3>
            <ul>
                <li>bon appétit</li>
                <li>allrecipes</li>
                <li>Food &amp; Wine</li>
                <li>the kitchn</li>
                <li>tasty.co</li>
                <li>myrecipes</li>
                <li>Epicurious</li>
            </ul>

            <h3>Some sites we can't import from:</h3>
            <ul>
                <li>Saveur</li>
                <li>NYTimes</li>
                <li>BBC Good Food</li>
            </ul>
        </form>
        ${footer()}
    `
}

const bookmarklet = () => {
    return H`
        ${head({
            lang: 'en',
            title: 'Import a new recipe',
        })}
        <script>
          const url = "https://recipes-ui-dycgvjyr2a-uw.a.run.app/recipes";
          const params = new URLSearchParams(window.location.search);
          const recipeURL = params.get('url');
          const autoCloseDelay = 5000;
          const openDelay = 300;
          const removeIFrameDelay = 600;

          function saveUrl(url) {
            document.getElementById('msg-text').innerHTML = "Saving...";

            fetch(url, {
              method: 'POST',
              body: JSON.stringify({ url: recipeURL }),
              headers: {
                "Content-Type": "application/json",
              },
            }).then((response) => {
              if (!response.ok) {
                if (response.status === 401) {
                  showLoginMsg();
                } else {
                  document.getElementById('msg-text').innerHTML = "Error saving.";
                }
                closeAndRemoveBookmarklet(false);

                return;
              }

              document.getElementById('msg-text').innerHTML = "Saved"
              closeAndRemoveBookmarklet(false);
            }, () => {
              document.getElementById('msg-text').innerHTML = "Error saving.";
              closeAndRemoveBookmarklet(false);
            });
          }

          function showLoginMsg() {
            document.getElementById('msg-text').innerHTML = 'To save this recipe, please <a href="https://recipes-ui-dycgvjyr2a-uw.a.run.app/login">log in to your account</a>';
          }

          function openBookmarklet() {
            // change height
            parent.postMessage('bookmarkletHeight', '*');

            window.setTimeout(function() {
              document.getElementById('bookmarklet').className += " open";
            }, openDelay);
          }

          // Just close and keep iFrame
          function closeBookmarklet() {
            window.setTimeout(function() {
              document.getElementById('bookmarklet').className = "bookmarklet";
            }, 50);
          }

          // Close and Remove iFrame
          function closeAndRemoveBookmarklet(closeNow) {
            var delay = autoCloseDelay;
            if (closeNow) {
              delay = 50;
            }
            window.setTimeout(function() {
              document.getElementById('bookmarklet').className = "bookmarklet";
              // remove the iframe after transition is finished
              window.setTimeout(function() {
                removeIFrame();
              }, removeIFrameDelay);
            }, delay);
          }

          // send message to parent to remove the iframe
          function removeIFrame() {
            // if this value changes, update bookmarklet.js and extension
            parent.postMessage('remove', '*');
          }
        </script>
        <div id="bookmarklet" class="bookmarklet">
            <div class="msg">
              <div id="msg-text"></div>
              <div class="close" onclick="closeBookmarklet(true);"></div>
            </div>
        </div>
        <div id="backdrop"></div>
        <script>
          openBookmarklet();
          saveUrl(url);
        </script>
        ${footer()}
    `
}

const loginPage = () => {
    return H`
        ${head({
            lang: 'en',
            title: 'Log in to RecipeGrab',
            h1: 'Welcome back!',
            nav: '<a href="/">Home</a>'
        })}
        <form action="/login" method="POST">
            <h3>Enter your email and get a one&#45;time login link</h3>
            <input
                type="email"
                name="email"
                placeholder="foo@example.com"
                size="60"
                required
            />
            <button type="submit">Email me</button>
        </form>
        ${footer()}
    `
}

const loginPendingPage = (email) => {
    return H`
        ${head({
            lang: 'en',
            title: 'Check your email',
            h1: 'Check your email to complete verification',
            nav: '<a href="/">Home</a>'
        })}
        <p>
            We sent you an email containing a verification link to <strong>${email}</strong>.
            If this email address is not correct, please
            <a href="/login" title="Go back to the login page">go back to the login page</a>
            and re-enter your email.
        </p>
    `
}

const signupPage = (errors) => {
    return H`
        ${head({
            lang: 'en',
            title: 'RecipeGrab Signup',
            h1: 'Create a RecipeGrab account',
            nav: '<a href="/">Home</a>'
        })}
        <form action="/users" method="POST">
            <h3>All we need is your email address</h3>
            ${errors ? errors.map(errorMessage) : ''}
            <input
                type="email"
                name="email"
                placeholder="foo@example.com"
                size="60"
                required
            />
            <button type="submit">Sign up</button>
            <p>
                We don&rsquo;t share your address with anyone,
                we just need something to remember you by so you
                find your saved recipes when you come back.
            <p>
        </form>
        ${footer()}
    `
}

const errorPage = (message) => {
    return H`
        ${head({
            lang: 'en',
            title: 'Error',
            h1: 'Something went wrong',
            nav: allRecipesNav()
        })}
        <p>${message}</p>
        ${footer()}
    `
}


module.exports = {
    head,
    footer,
    homePage,
    singleRecipe,
    importPage,
    bookmarklet,
    showPage,
    loginPage,
    loginPendingPage,
    signupPage,
    importRecipeNav,
    errorPage
}
