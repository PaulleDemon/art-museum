# Virtual Art Museum

**Please use non-touch devices**

* Use WASD to move, Space to jump (not necessary though)
* Mouse to drag and look around.
* To hide annotations press shift key.
* To upload, click on the annotation.
* To see details of the art-work hover your mouse
* Use Escape key for menu

## Running locally
* Git clone 
```
git clone https://github.com/PaulleDemon/art-museum
```

* Install dependencies using `npm install`

**Running the backend server**
1. Add `.env` file inside `backend` with 
```
SUPABASE_URL="https://.supabase.co"
SUPABASE_KEY=""

PINATA_API_KEY=""
PINATA_SECRET_API_KEY=""

PINATA_JWT=""
```
now run backend using
```
cd backend
node index.js
```

**Running the frontend**
  
1. Create `.env` file inside the src and add the following.
```
BACKEND_URL="http://localhost:3000"

PROD_BACKEND_URL="https://"
```   
now run the server
```
npm run start
```

## read more here: 
https://dev.to/paul_freeman/art-museum-g99