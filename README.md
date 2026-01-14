# RezerveMe

A simple reservation application.

## Project Structure

```
rezerveme/
├── backend/          # Spring Boot backend
└── frontend/         # React frontend (Vite)
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Ensure you have PostgreSQL running and create a database named `rezerveme`

3. Update database credentials in `src/main/resources/application.properties` if needed

4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

The backend API will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Web
- Spring Data JPA
- PostgreSQL
- Spring Security
- Lombok

### Frontend
- React 18
- Vite 5
- Modern JavaScript (ES6+)
