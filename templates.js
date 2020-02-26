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

const head = (lang, title, h1) => {
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
    return H`<ul>
        ${ ingredients.map(ingredient) }
    </ul>`
}

const instructionItem = (instruction) => {
    return instruction.name && instruction.itemListElement
        ? H`<h3>!${instruction.name}:</h3>${instruction.itemListElement.map(instructionItem)}`
        : H`<li>!${instruction.text}</li>`;
}

const singleRecipe = (recipeId, recipe, asynchronous=false) => {
    let image = recipe.image
    debugger
    if (Array.isArray(image) && image.length) {
        image = image[0]
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
                H`<img src="!${image}" alt="" />` : ''
            }

            <p>!${recipe.description || ''}</p>

            <h2>Ingredients:</h2>
            ${recipe.recipeIngredient 
                ? ingredientList(recipe.recipeIngredient)
                : ''
            }

            <h2>Instructions:</h2>
            <ol>
                ${recipe.recipeInstructions ? recipe.recipeInstructions.map(instructionItem) : ''}
            </ol>
            <a href="!${recipe.url}" target="_blank" rel="noopener" title="View original">
                !${recipe.url}
            </a>
        </article>
    `
}

const showPage = (recipe) => {
    return H`
        ${head('en', recipe.json.name)}
        ${singleRecipe(recipe.id, recipe.json)}
        ${footer()}
    `
}

const importPage = () => {
    return H`
        ${head('en', 'Import a new recipe', 'Import a recipe from the web')}
        <form action="/recipes" method="POST">
            <input type="url" name="url"
                required
                placeholder="https://www.saveur.com/article/Recipes/Creamed-Brussels-Sprouts/"
            />
            <button type="submit">Import</button>
        </form>
        ${footer()}
    `
}

const errorPage = (message) => {
    return H`
        ${head('en', 'Error', 'Something went wrong')}
        <p>${message}</p>
        ${footer()}
    `
}


module.exports = {
    head,
    footer,
    singleRecipe,
    importPage,
    showPage
}
