
const express = require('express')
require('dotenv').config()

const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')
const multer = require('multer')
const bodyParser = require('body-parser')
const { isNumeric } = require('./utils')


const app = express()
const port = 3000

let corsOptions = {
	origin : ['http://localhost:8080'],
 }

// Parse JSON requests
app.use(express.json(), bodyParser.json(), cors(corsOptions))

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const pinataApiKey = process.env.PINATA_API_KEY
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY

const pinataJWT = process.env.PINATA_JWT

const Museum = {
	ART_GALLERY: 0,
	BRITISH_MUSEUM: 1,
	LOUVRE: 2
}

const storage = multer.memoryStorage() // In-memory storage
const upload = multer({ storage })


const validateData = (data) => {
	const errors = []

	// if (!data.ip_address || data.ip_address.length > 45) {
	// 	errors.push('IP address is required and must be at most 45 characters.')
	// }
	if (!data.title || data.title.length > 40) {
		errors.push('Title is required and must be at most 40 characters.')
	}
	if (!data.description || data.description.length > 200) {
		errors.push('Description is required and must be at most 200 characters.')
	}

	if (data.name.length < 3 || data.name.length > 30) {
		errors.push('Handle must be atleast 3 character and most 30 characters.')
	}

	if (data.price && isNumeric(data.price.length)) {
		errors.push('Price has to be a number')
	}

	if (data.price > 2000){
		errors.push('Please keep the price below 1000')
	}

	console.log("Museum: ", Object.values(Museum).includes(data.museum), typeof data.museum)


	if (!Object.values(Museum).includes(parseInt(data.museum))){
		errors.push('Museum must be 0, 1 or 2')

	}

	return errors
}

// Define a couple of endpoints
app.get('/list/:museum', async (req, res) => {
	
	const museum = req.params.museum

	try {
		
		const { data, error: checkError } = await supabase
					.from('items')
					.select('*')
					.eq('museum', museum)
					.single() // Get a single entry if it exists
		
		if (checkError) {
			throw checkError
		}
			
		return res.status(200).json({ success: true, data, message: 'Items retrieved successfully' })
		

	} catch (error) {
		return res.status(500).json({ success: false, message: 'List error', error: err.message })
	}


})


const uploadToPinata = async (file) => {

	const options = {
		method: 'POST',
		headers: {Authorization: `Bearer ${pinataJWT}`, 'Content-Type': 'multipart/form-data'}
	};

	const url = `https://uploads.pinata.cloud/v3/files`
	const formData = new FormData()

	formData.append('file', file.buffer, file.originalname)

	options.body = formData

	try {
		const response = await fetch(url, options)

		if (response.status === 200){
			const body = await response.json()

			const fileID = body.id
			const fileUrl = `https://api.pinata.cloud/v3/files/${fileID}`
			return fileUrl
		}else{
			throw new Error('File upload to Pinata failed: ' + body)

		}
	} catch (error) {
		throw new Error('File upload to Pinata failed: ' + error.message)
	}
}


app.post('/upload', upload.single('file'), async (req, res) => {
	const ipAddress = req.headers['x-forwarded-for'] || req.ip

	const { img_id, title, description, price, name, museum } = req.body

	console.log("Museum: ", museum)

	// Validate input data
	const errors = validateData(req.body)
	if (errors.length > 0) {
		return res.status(400).json({ success: false, errors })
	}

	let fileUrl = null

	// Handle file upload to Pinata
	if (req.file) {
		try {
			fileUrl = await uploadToPinata(req.file)
		} catch (err) {
			return res.status(500).json({ success: false, message: 'File upload failed', error: err.message })
		}
	}

	try {
		// check if data already exist 
		const { data: existingEntries, error: checkError } = await supabase
															.from('items')
															.select('*')
															.eq('ip_address', ipAddress)
															.eq('name', name)

		if (checkError) {
			throw checkError
		}

		if (existingEntries.length > 0) {
			return res.status(409).json({ success: false, message: 'The name and IP address combination already exists.' })
		}
	} catch (error) {
		res.status(500).json({ success: false, message: 'An error occurred', error: err.message })
	}

	try {

		// check for existing entry, if it exist, updated it else insert it as a new row
		const { data: existingEntries, error: checkError } = await supabase
				.from('items')
				.select('*')
				.eq('img_id', img_id)
				.single() // Get a single entry if it exists

		if (checkError && checkError.code !== 'PGRST100') { // Ignore not found error
			throw checkError
    	}

		if (existingEntries) {
			const { data, error: updateError } = await supabase
														.from('items')
														.update({
															ip_address: ipAddress,
															title,
															description,
															price,
															name,
															url: fileUrl,
															museum: parseInt(museum)
														})
														.eq('img_id', img_id)

			if (updateError) {
				throw updateError
			}

			return res.status(200).json({ success: true, data, message: 'Item updated successfully' })

		}else{

			// Insert the item into Supabase with file URL
			const { data, error } = await supabase
											.from('items')
											.insert([{ ip_address: ipAddress, title, description, 
													price, name, url: fileUrl, museum: parseInt(museum) }])

			if (error) {
				throw error
			}

		}
	
		return res.status(200).json({ success: true, data })
	
	} catch (err) {
		// Handle database errors gracefully
		res.status(500).json({ success: false, message: 'An error occurred', error: err.message })
	}
})

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`)
})
