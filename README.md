FitnessTrackr 💪

Workout Management REST API

FitnessTrackr is a backend REST API built with Node.js, Express, and PostgreSQL that allows users to create and manage workout routines, organize fitness activities, and track exercise duration and repetitions.

The application features user registration, password hashing, JWT authentication, authorization, relational database management, and RESTful API endpoints.

This project demonstrates practical backend development, database design, API architecture, and automated testing.

⸻

🛠️ Technology Stack

Technology	Purpose
Node.js	Backend runtime
Express.js	REST API framework
PostgreSQL	Relational database
JavaScript	Application logic
SQL	Database queries and management
JWT	User authentication
bcrypt	Password hashing
Jest	Automated testing
Supertest	API endpoint testing
Axios	HTTP client dependency
Git	Version control

⸻

✨ Key Features

User Authentication

* User registration and login.
* Password hashing using bcrypt.
* JSON Web Token (JWT) authentication.
* Authenticated user retrieval.
* User-specific authorization.

Workout Routine Management

* Create workout routines.
* Update routine names, goals, and visibility.
* Delete existing routines.
* Organize public and private routines.
* Associate routines with individual users.

Activity Management

* Create and retrieve fitness activities.
* Update activity information.
* Retrieve public routines associated with specific activities.

Routine Activity Management

* Associate activities with workout routines.
* Track exercise duration and repetitions.
* Update routine activity information.
* Remove activities from routines.
* Prevent duplicate activity associations.

Database Management

* Relational PostgreSQL database.
* Primary and foreign key relationships.
* Unique constraints.
* Parameterized database queries in supported operations.
* Separate database access modules.

⸻

🗄️ Database Architecture

The application uses four primary relational tables.

Table	Description
users	Stores user accounts and hashed passwords
routines	Stores workout routines and their owners
activities	Stores available fitness activities
routine_activities	Connects routines with activities and tracks duration and count

The routine_activities table implements a many-to-many relationship between routines and activities.

⸻

🔌 API Endpoints

Authentication & Users

Method	Endpoint	Description
POST	/api/users/register	Register a user
POST	/api/users/login	Authenticate a user
GET	/api/users/me	Retrieve authenticated user
GET	/api/users/:username/routines	Retrieve public user routines

Activities

Method	Endpoint	Description
GET	/api/activities	Retrieve all activities
POST	/api/activities	Create an activity
PATCH	/api/activities/:activityId	Update an activity
GET	/api/activities/:activityId/routines	Retrieve public routines containing an activity

Routines

Method	Endpoint	Description
GET	/api/routines	Retrieve public routines
POST	/api/routines	Create a routine
PATCH	/api/routines/:routineId	Update a routine
DELETE	/api/routines/:routineId	Delete a routine
POST	/api/routines/:routineId/activities	Add an activity to a routine

Routine Activities

Method	Endpoint	Description
PATCH	/api/routine_activities/:routineActivityId	Update an exercise association
DELETE	/api/routine_activities/:routineActivityId	Remove an exercise association

⸻

📁 Project Structure

FitnessTrackr/
│
├── api/
│   ├── activities.js
│   ├── index.js
│   ├── routines.js
│   ├── routineActivities.js
│   ├── users.js
│   └── utils.js
│
├── db/
│   ├── activities.js
│   ├── client.js
│   ├── index.js
│   ├── routine_activities.js
│   ├── routines.js
│   ├── seed.js
│   ├── seedData.js
│   └── users.js
│
├── tests/
│   ├── api/
│   ├── db/
│   ├── helpers.js
│   └── setup.js
│
├── app.js
├── server.js
├── errors.js
├── package.json
└── README.md

⸻

⚙️ Getting Started

Prerequisites

* Node.js
* npm
* PostgreSQL
* Git

1. Clone the repository

git clone https://github.com/krlars27/FitnessTrackr.git

2. Navigate to the project

cd FitnessTrackr

3. Install dependencies

npm install

4. Configure environment variables

Create a .env file in the project root.

DATABASE_URL=postgres://localhost:5432/fitness-dev
JWT_SECRET=your_secure_secret
PORT=3000

Use a secure secret for JWT signing and configure the database connection for your local PostgreSQL environment.

5. Initialize the database

npm run seed

Important: The seed script drops and recreates the application’s tables and inserts sample data. Only use it with a development database whose existing data can be deleted.

6. Start the application

npm start

The API runs on port 3000 by default.

Development mode

npm run start:dev

⸻

🧪 Testing

FitnessTrackr uses Jest and Supertest for automated testing.

Run the test suite:

npm test

Run tests in watch mode:

npm run test:watch

The test suite includes API and database tests covering authentication, user management, activities, routines, and routine activity relationships.

⸻

🧠 Development Concepts Demonstrated

* RESTful API development.
* Backend application architecture.
* Relational database design.
* PostgreSQL and SQL queries.
* User authentication and authorization.
* Password hashing and JWT.
* CRUD operations.
* One-to-many and many-to-many relationships.
* Middleware and error handling.
* Automated API and database testing.
* Git-based version control.

⸻

👨‍💻 Author

Kevin Larson

B.S. Computer Science — Roosevelt University

* GitHub: @krlars27
* LinkedIn: linkedin.com/in/krlars27
