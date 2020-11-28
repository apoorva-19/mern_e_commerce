# Intial commands for getting the project running

1. Set up the virtual environment

```
    nodeenv --node=14.15.0 env
```

2. Activate the virtual environment

```
    cd env/Script
    .\Activate.ps1
```

3. Install dependencies

```
    npm i express dotenv nodemon
```

4. Setting up the database connection

```
   The database connection has been done in the app.js file
```

5. Run app.js
   In package.json, "start" has been added to the scripts section. This will allow the server to run continuously and render even after updates.

```
    npm start
```

## Directory Structure

```
MERN_E-COMMERCE
|___.env
|___.gitignore
|___Setup.md
|___package.json
|___controllers/
    |___ auth.js
    |___ category.js
    |___ products.js
    |___ user.js
|___helpers/
    |___ dbErrorHandler.js
|___ images/
|___models/
    |___ category.js
    |___ products.js
    |___ user.js
|___routes/
    |___ auth.js
    |___ category.js
    |___ products.js
    |___ user.js
|___validators/
    |___ index.js
|___node_modules/
```
