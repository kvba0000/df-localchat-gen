const category = document.querySelector("div#categorypick")
const categoriesSelect = category.querySelector("select#categories")
const categoryName = category.querySelector("input#categoryname")
const categoryColor = category.querySelector("input#categorycolor")

const addBtn = category.querySelector("button#addcategory")
const removeBtn = category.querySelector("button#removecategory")

const generateBtn = category.querySelector("button#generatecategory")
const categoryOutput = category.querySelector("textarea#categoryoutput")

const iconsEl = document.querySelector("div#icons")

const iconPreview = document.querySelector("img#iconpreview")

const iconEls = {}
let categories = []
const loadSettings = async () => {
    categories = await fetch("../sprites/faces/categories.json").then(r => r.json())
    updateSettings()
}

const loadIcons = async () => {
    const icons = await fetch("../sprites/faces/metadata.json").then(r => r.json())

    for(let name of Object.keys(icons)) {
        const input = document.createElement("input")
        input.type = "checkbox"
        input.name = name
        input.value = name

        const label = document.createElement("label")
        label.htmlFor = name
        label.innerText = name
        
        label.addEventListener("mouseover", () => {
            iconPreview.src = `../sprites/faces/${name}/${name}_0.png`
            if(iconPreview.complete) iconPreview.style.visibility = "visible"
        })

        label.addEventListener("mouseout", () => {
            iconPreview.style.visibility = "hidden"
        })

        input.addEventListener("change", () => {
            const currentCategoryData = categories.find(c => c.name === currentCategory)
            if(input.checked) {
                currentCategoryData.icons = [...new Set([...currentCategoryData.icons || [], name])]
            } else {
                currentCategoryData.icons = currentCategoryData.icons.filter(i => i !== name)
            }
        })

        iconEls[name] = input

        const div = document.createElement("div")
        div.appendChild(input)
        div.appendChild(label)
        iconsEl.appendChild(div)
    }
}

let currentCategory = null
const updateSettings = () => {
    categoriesSelect.innerHTML = ""
    for(let { name } of categories) {
        const option = document.createElement("option")
        option.value = name
        option.innerText = name
        categoriesSelect.appendChild(option)
    }

    if(!currentCategory) currentCategory = categoriesSelect.value
    const currentCategoryData = categories.find(c => c.name === currentCategory) || categories[0]

    categoriesSelect.value = currentCategory
    categoryName.value = currentCategoryData.name
    categoryColor.value = currentCategoryData.color
    
    for(let name of Object.keys(iconEls)) {
        iconEls[name].checked = currentCategoryData.icons?.includes(name)
    }
}

const addCategory = () => {
    const newCategory = {
        name: categoryName.value,
        icons: [],
        color: categoryColor.value
    }
    categories.push(newCategory)
    updateSettings()
}

const removeCategory = () => {
    categories = categories.filter(c => c.name !== currentCategory)
    updateSettings()
}

const generateCategory = () => {
    const d = JSON.stringify(categories, null, 4)
    categoryOutput.value = d


    navigator.clipboard.writeText(categoryOutput.value)
    .then(() => alert("Category data copied to clipboard!"))
    .catch(e => {
        console.error(e)
        alert("Failed to copy data to clipboard! Copy it manually.")
    })
}

categoriesSelect.addEventListener("change", () => {
    currentCategory = categoriesSelect.value
    updateSettings()
})

iconPreview.addEventListener("load", () => iconPreview.style.visibility = "visible")

addBtn.addEventListener("click", addCategory)
removeBtn.addEventListener("click", removeCategory)
generateBtn.addEventListener("click", generateCategory)

document.addEventListener("DOMContentLoaded", async () => {
    await loadIcons()
    await loadSettings()
})