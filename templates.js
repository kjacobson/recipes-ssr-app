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
    singleRecipe,
    importPage,
    showPage,
    loginPage,
    importRecipeNav
}
