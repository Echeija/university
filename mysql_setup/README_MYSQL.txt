================================================
XAMPP / MySQL DEPLOYMENT INSTRUCTIONS
================================================

To deploy this application on your local XAMPP server with MySQL, follow these steps:

1. UPDATE DEPENDENCIES
   In your terminal, remove the PostgreSQL packages and install the MySQL ones:
   npm uninstall pg drizzle-orm/node-postgres @types/pg
   npm install mysql2 drizzle-orm --legacy-peer-deps

2. REPLACE DATABASE CONNECTION & SCHEMA
   Replace your existing PostgreSQL database files with the ones provided in this folder:
   - Copy `mysql_setup/schema.ts` to `src/db/schema.ts` (overwrite the existing file).
   - Copy `mysql_setup/index.ts` to `src/db/index.ts` (overwrite the existing file).
   - Copy `mysql_setup/drizzle.config.ts` to the root of your project (overwrite).

3. START YOUR XAMPP SERVER
   - Open the XAMPP Control Panel.
   - Start the "Apache" and "MySQL" modules.
   - Open phpMyAdmin (http://localhost/phpmyadmin) and create a new database called `school_db`.
   - **IMPORT DATABASE**: You can simply import the provided `database.sql` file in phpMyAdmin into your `school_db` database. This will create all the necessary tables for you.

4. SET ENVIRONMENT VARIABLES
   Create a `.env` file in the root of your project (or update your existing one) with the MySQL credentials:
   MYSQL_HOST="localhost"
   MYSQL_USER="root"
   MYSQL_PASSWORD="" 
   MYSQL_DB_NAME="school_db"

5. (OPTIONAL) PUSH SCHEMA CHANGES
   If you make further changes to the `schema.ts`, you can push them using Drizzle:
   npx drizzle-kit push

6. RUN THE APPLICATION
   Start the Node.js server and React frontend:
   npm run dev

You can now use the application locally connected to your XAMPP MySQL database!
