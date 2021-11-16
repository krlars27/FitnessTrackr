# fitnesstrackr
an API for our new fitness empire, FitnessTrac.kr, using node, express, and postgresql

## Getting Started
Install Packages

    npm i

Initialize Database

    createdb fitness-dev
    
Run Seed Script
    
    npm run seed:dev

## Automated Tests
**NOTE:**  At first, there will be too many errors for the tests to even run.  Start by running the seed:dev script above, until it is working.

Once you get to running the tests, we recommend to start with just the DB test first, and move to API next.  This is because there will be so many errors in the beginning, it's hard to see what tests are passing or failing.

To run all the tests in watch mode (re-runs on code update), run

    npm run test:watch

### DB Methods


    npm run test:watch db

### API Routes (server must be running for these to pass)

    npm run test:watch api

