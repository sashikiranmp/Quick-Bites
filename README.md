---

# Quick Bites

A full-stack food ordering web application for students and stall owners, featuring chat, reviews, payments, and more.

## Table of Contents

- Features
- Project Structure
- Setup Instructions
- Environment Variables
- Scripts
- Contributing
- License

---

## Features

- Student and stall owner login/signup
- Menu management for stalls
- Order placement and history
- Favorites and reviews
- AI-powered chat interface
- Payment integration
- Responsive UI with Tailwind CSS

---

## Project Structure

```
food_ordering_v1/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── Pages/
│   │   ├── services/
│   │   └── assets/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── README.md
├── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- npm (comes with Node.js)
- MongoDB (local or cloud, for backend)

### 1. Clone the repository

```sh
git clone https://github.com/sashikiranmp/Quick-Bites.git
cd Quick-Bites
```

### 2. Install dependencies

#### Backend

```sh
cd backend
npm install
```

#### Frontend

```sh
cd ../frontend
npm install
```

### 3. Configure environment variables

- Create a `.env` file in both backend and frontend as needed.
- **Do not commit secrets or API keys.**
- Example for backend:
  ```
  MONGODB_URI=your_mongodb_connection_string
  OPENAI_API_KEY=your_openai_api_key
  ```

### 4. Start the servers

#### Backend

```sh
cd backend
npm start
# or
node server.js
```

#### Frontend

```sh
cd frontend
npm run dev
```

### 5. Access the app

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000) (or as configured)

---

## Environment Variables

- **Backend:**  
  - `MONGODB_URI` – MongoDB connection string  
  - `OPENAI_API_KEY` – OpenAI API key (if using AI chat)
- **Frontend:**  
  - Add any required API endpoints or keys, but do not commit secrets.

---

## Scripts

- **Backend**
  - `npm start` – Start backend server
- **Frontend**
  - `npm run dev` – Start frontend (Vite) dev server

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## License

This project is licensed under the MIT License.

---

Let me know if you want to customize any section or add more details!
