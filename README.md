# TechInsightsAi
This project is a React application built with Vite that utilizes the Gemini API to generate a dynamic blog page. The blog content updates every 3 hours, providing fresh and relevant information to users.

## Project Structure

The project is organized as follows:

```
gemini-blog
├── src
│   ├── components          # Contains reusable components
│   │   ├── Home.jsx       # Landing page component
│   │   ├── Blog.jsx       # Blog content component
│   │   ├── About.jsx      # About page component
│   │   ├── Header.jsx     # Navigation header component
│   │   ├── Footer.jsx     # Footer component
│   │   └── layout
│   │       └── MainLayout.jsx # Main layout component
│   ├── services            # API interaction services
│   │   └── geminiApi.js   # Functions to fetch data from the Gemini API
│   ├── hooks               # Custom hooks
│   │   └── useBlogContent.js # Hook for managing blog content fetching
│   ├── utils               # Utility functions
│   │   └── formatters.js   # Functions for formatting content
│   ├── assets
│   │   └── styles
│   │       └── animations.js # Animation styles using Framer Motion
│   ├── pages               # Page components
│   │   ├── HomePage.jsx    # Renders Home component
│   │   ├── BlogPage.jsx    # Renders Blog component
│   │   └── AboutPage.jsx   # Renders About component
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Entry point of the application
│   └── index.css           # Global styles and Tailwind CSS imports
├── public
│   └── favicon.svg         # Favicon for the application
├── .env.example            # Template for environment variables
├── index.html              # Main HTML template
├── package.json            # npm configuration file
├── vite.config.js          # Vite configuration file
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd gemini-blog
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Create a `.env` file:**
   Copy the `.env.example` file to `.env` and add your Gemini API credentials.

4. **Run the application:**
   ```
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Usage

- The **Home** page provides an introduction and links to the blog and about pages.
- The **Blog** page displays content fetched from the Gemini API, updating every 3 hours.
- The **About** page contains information about the project and its purpose.

## Technologies Used

- React
- Vite
- Tailwind CSS
- Framer Motion
- Gemini API

## License

This project is licensed under the MIT License.