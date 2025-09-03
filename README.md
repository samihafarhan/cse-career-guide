<div align="center">

# **CSE-CAREER-GUIDE**

### Empowering Careers, Igniting Future Success

<p>
    <img src="https://img.shields.io/github/last-commit/abrarfahim-1000/cse-career-guide" alt="Last Commit">
    <img src="https://img.shields.io/github/languages/top/abrarfahim-1000/cse-career-guide" alt="Top Language">
    <img src="https://img.shields.io/github/languages/count/abrarfahim-1000/cse-career-guide" alt="Language Count">
</p>

_Built with the tools and technologies:_

<p>
    <img src="https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white" alt="JSON">
    <img src="https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="NPM">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
</p>
<p>
    <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
</p>

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

## 🚀 About

CSE Career Guide is a comprehensive platform designed specifically for Computer Science and Engineering students to navigate their career journey. The platform provides personalized career guidance, project ideas, interview preparation, work opportunities, and community features to help students build successful careers in the tech industry.

## ⚡ Quick Start

1. **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account
- Google Gemini API key

2. **Clone the repository**
   ```bash
   git clone https://github.com/abrarfahim-1000/cse-career-guide.git
   cd cse-career-guide
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Create a .env file in the root directory and add:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application running.

## ✨ Features

### 🎯 **Career Path Guidance**
- AI-powered career path recommendations based on skills and interests
- Personalized roadmaps for different tech career tracks
- Progress tracking and milestone achievements

### 💡 **Project Ideas Hub**
- Curated collection of project ideas for skill development
- Difficulty levels from beginner to advanced
- Community voting and feedback system
- Project submission and showcase platform

### 👥 **Study Groups & Community**
- Create and join study groups
- Collaborative learning environment
- Group discussions and resource sharing
- Member management and group analytics

### 📰 **Tech News & Updates**
- Latest industry news and trends
- Curated content for CSE students
- Educational articles and tutorials

### 💼 **Work Opportunities**
- Job postings and internship opportunities
- Remote work listings
- Application tracking and management
- Company insights and reviews

### 🎤 **Interview Preparation**
- Comprehensive question bank categorized by topics
- AI-powered interview practice sessions
- Community-contributed questions
- Performance analytics and improvement suggestions

### 📊 **User Dashboard**
- Personalized activity tracking
- Progress visualization with charts
- Goal setting and achievement tracking
- Profile customization and preferences

### 🛡️ **Safety & Moderation**
- Content moderation system
- User verification process
- Report and feedback mechanisms
- Admin dashboard for platform management

### 💬 **Interactive Chat System**
- Real-time messaging with AI assistance
- Context-aware responses
- Help and support integration

### 📱 **Responsive Design**
- Mobile-first approach
- Cross-platform compatibility
- Modern UI with Tailwind CSS
- Dark/light theme support

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Backend**: Supabase (Database & Auth)
- **AI Integration**: Google Gemini AI
- **Charts**: Chart.js, Recharts
- **Form Handling**: React Hook Form, Zod validation
- **Styling**: Tailwind CSS with custom animations
- **Development**: ESLint, Vite dev server

## 📁 Project Structure

```
cse-career-guide/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and icons
│   ├── components/        # Reusable UI components
│   │   └── ui/           # Shadcn/ui components
│   ├── context/          # React context providers
│   ├── db/               # Database configuration
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── pages/            # Application pages/routes
│   ├── services/         # API and external services
│   ├── utils/            # Helper functions
│   └── App.jsx           # Main application component
├── components.json        # Shadcn/ui configuration
├── vite.config.js        # Vite configuration
└── package.json          # Project dependencies
```


## 📖 Usage

1. **Getting Started**
   - Visit the landing page and create an account
   - Complete your profile setup
   - Explore the dashboard to see available features

2. **Career Guidance**
   - Take the career assessment quiz
   - Receive personalized career recommendations
   - Follow your custom learning roadmap

3. **Community Engagement**
   - Join or create study groups
   - Participate in discussions
   - Share and discover project ideas

4. **Interview Prep**
   - Browse interview questions by category
   - Practice with AI-powered mock interviews
   - Track your preparation progress

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs**: Found a bug? Open an issue with detailed information
- 💡 **Suggest Features**: Have ideas for new features? We'd love to hear them
- 🔧 **Code Contributions**: Submit pull requests for bug fixes or new features
- 📚 **Documentation**: Help improve our documentation and guides
- 🎨 **Design**: Contribute to UI/UX improvements

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with clear, commented code
4. **Test thoroughly** to ensure no regressions
5. **Commit with descriptive messages**: `git commit -m 'Add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a clear description of your changes

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 👨‍💻 Contributors

We appreciate all contributors who have helped make this project better:

<!-- Add contributor list here when you have actual contributors -->
- **[abrarfahim-1000](https://github.com/abrarfahim-1000)** - Project Creator & Lead Developer
- **[samihafarhan](https://github.com/samihafarhan)** - Co-Developer
- **[Shahriar-Khan-Shirso](https://github.com/Shahriar-Khan-Shirso)** - Co-Developer

*Want to see your name here? Check out our [Contributing Guidelines](#contributing) and make your first contribution!*

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

Made with ❤️ for the CSE community

**[Live Demo](#) | [Documentation](#) | [Report Bug](https://github.com/abrarfahim-1000/cse-career-guide/issues) | [Request Feature](https://github.com/abrarfahim-1000/cse-career-guide/issues)**

</div>
