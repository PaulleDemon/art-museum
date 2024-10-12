// import { configDotenv } from "dotenv"

import { toastMessage } from "./utils"

// configDotenv()


export async function getMuseumList(museumId) {

    return await fetch(`${process.env.BACKEND_URL}/${museumId}`, {
        method: 'GET',
    })
}


const validateData = (data) => {

	if (!data.title || data.title.length > 40) {
		return 'Title is required and must be at most 40 characters.'
	}
	if (!data.description || data.description.length > 200) {
		return 'Description is required and must be at most 200 characters.'
	}

	if (data.name.length < 3 || data.name.length > 30) {
		return 'Handle must be atleast 3 character and most 30 characters.'
	}

	if (data.price && isNumeric(data.price.length)) {
		return 'Price has to be a number'
	}

	if (data.price > 2000){
		return 'Please keep the price below 1000'
	}


	return ''
}



export const uploadItem = async (file, title, description, name, price, imgId, museum) => {
    const formData = new FormData()

    console.log("name: ", name)

    const error = validateData({title, description, price, name})

    if (error !== ''){
        return toastMessage(error)
    }

    // Append the file to the form data
    formData.append('file', file)

    // Append other form fields
    formData.append('title', title)
    formData.append('description', description)
    formData.append('price', price)
    formData.append('name', name)
    formData.append('img_id', imgId)
    formData.append('museum', museum)

    try {
        const response = await fetch(`${process.env.BACKEND_URL}/upload/`, {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`)
        }

        const result = await response.json()
        console.log('Upload successful:', result)
    } catch (error) {
        console.error('Error uploading item:', error)
    }
}
