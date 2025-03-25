## Database Integration

DOWNLOAD DOTENV_CLI with the command ```npm install -g dotenv-cli```
If you've set up pgAdmin on your machine and would like to integrate the database with the front-end, you will have to create three .env files in the root directory. They will all have the format: 
```
   DB_HOST="localhost"
   DB_NAME=
   DB_PASSWORD=
   DB_PORT="5432"
   URL = "http://localhost:3000"
```
Substitute the name and password with whatever you used in the setup of pgAdmin.

Name them .env.devmock, .env.devreal, .env.prodreal.

Alternatively, you can opt to make one .env file if you'd like. To test with multiple databases, you will just have to change the values of the .env file each time. That would only work with **npm run dev**

These lines need to be in package.json:

```
"scripts": {
    "dev": "next dev --turbopack",
    "dev:mock": "dotenv -e .env.devmock next dev --turbopack",
    "dev:real": "dotenv -e .env.devreal next dev --turbopack",
    "build:prod": "dotenv -e .env.prodreal next build",
    "start:prod": "dotenv -e .env.prodreal next start",
    "lint": "next lint"
  },
```
## General

Make sure to run ``` npm install``` after every pull. If we continue to use Ant Design, you may have to append a --legacy-peer-deps to the install

To run the web app, there are five options:

```
npm run dev:mock
npm run dev:real
npm run build:prod
npm run start:prod

OR, if you just made one .env, you can do the normal npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
