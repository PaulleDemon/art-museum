const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

// Middleware to parse JSON requests
app.use(bodyParser.json())

// Supabase configuration
const supabaseUrl = 'your-supabase-url'
const supabaseKey = 'your-supabase-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Validation function
export const validateData = (data) => {
  const errors = []

  if (!data.ip_address || data.ip_address.length > 45) {
    errors.push('IP address is required and must be at most 45 characters.')
  }
  if (!data.title || data.title.length > 40) {
    errors.push('Title is required and must be at most 40 characters.')
  }
  if (!data.description || data.description.length > 250) {
    errors.push('Description is required and must be at most 250 characters.')
  }
  if (data.name && data.name.length > 30) {
    errors.push('Name must be at most 30 characters.')
  }
  return errors
}

// Route to insert a new item into the Supabase table
app.post('/items', async (req, res) => {
  const { ip_address, title, description, price, name } = req.body

  // Validate input data
  const errors = validateData(req.body)
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors })
  }

  try {
    // Insert the item into Supabase
    const { data, error } = await supabase
      .from('items')
      .insert([{ ip_address, title, description, price, name }])

    if (error) {
      throw error
    }

    res.status(201).json({ success: true, data })
  } catch (err) {
    // Handle errors gracefully
    res.status(500).json({ success: false, message: 'An error occurred', error: err.message })
  }
})

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
