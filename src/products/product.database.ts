import { Product, UnitProduct, Products } from './product.interface'
import {v4 as random} from 'uuid'
import fs from 'fs'

let products : Products = loadProducts()

function loadProducts () : Products {
    try {
        const data = fs.readFileSync('./products.json', 'utf-8')
        return JSON.parse(data)
    }
    catch (err) {
        console.log(`Error ${err}`)
        return {}
    }
}

const saveProducts = () => {
    try {
        fs.writeFileSync('./products.json', JSON.stringify(products), 'utf-8')
        console.log('Products saved successfully!')
    }
    catch (err) {
        console.log(`Error ${err}`)
    }
}

export const findAll = async () : Promise<UnitProduct[]> => Object.values(products);

export const findOne = async (id : string) : Promise<UnitProduct> => products[id];

export const create = async (productInfo : UnitProduct) : Promise<UnitProduct | null> => {
    let id = random()

    let product = await findOne(id)

    while (product) {
        id = random()
        await findOne(id)
    }

    products[id] = {
        ...productInfo,
        id: id
    }

    saveProducts()

    return products[id]
}


export const update = async (id : string, updateValues : Product) : Promise<UnitProduct | null> => {
    const product = await findOne(id)

    if (!product) {
        return null
    }

    products[id] = {
        id,
        ...updateValues
    }

    saveProducts()

    return products[id]
}

export const remove = async (id : string) : Promise <null | void> => {
    
    const product = await findOne(id)

    if (!product) {
        return null
    }

    delete products[id]

    saveProducts()
}