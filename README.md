# Wandra

<div align="center">
  <img src="public/icons/icon-192x192.png" alt="Wandra Logo" width="128" height="128" />
  <p><strong>Your journey, written for you.</strong></p>
  <p>An intelligent travel journal that captures your path, the weather, and the essence of your adventure—then uses AI to write your story.</p>
</div>

---

## 🏔️ About Wandra

Wandra is a Progressive Web App (PWA) designed for the modern explorer. It automates the tedious parts of travel journaling by auto-capturing GPS waypoints, local weather, and place names in the background. When your journey ends, Wandra uses Google Gemini AI to weave these moments into a beautiful, personalized narrative.

- **Effortless Capture**: Focus on the view; we'll handle the logistics.
- **Intelligent Storytelling**: Your facts, our AI, a shared memory.
- **Offline First**: Works in the remote corners of the world with background sync.

---

## ✨ Features

- 📍 **Live Tracking**: Real-time GPS path recording with battery-conscious background updates.
- ⛅ **Context Awareness**: Automatic weather enrichment and reverse geocoding for every moment.
- 🤖 **AI Journaling**: Personalized journal generation using Google Gemini with dynamic writing styles (Poetic, Descriptive, Brief).
- 📱 **PWA Experience**: Full offline support with background synchronization and real-time sync notifications.
- 📧 **Email Integration**: Automated welcome and journey summary emails via Resend.
- 🔒 **Secure & Private**: Row-Level Security (RLS) via Supabase ensures your memories stay yours.
- ✨ **Glass Liquid UI**: A premium, "Aurora" inspired design system with fluid animations and rich typography.

---

## 📸 Screenshots

<div align="center">
  <p><em>[Coming Soon: Mobile-focused screenshots of Journey Tracker, AI Processing, and Journal Detail]</em></p>
</div>

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router) |
| **State** | [Zustand](https://docs.pmnd.rs/zustand/) (with Persistence) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Auth** | [Supabase Auth](https://supabase.com/auth) |
| **AI** | [Google Gemini 1.5 Flash](https://aistudio.google.com/) |
| **APIs** | [OpenWeatherMap](https://openweathermap.org/), [Nominatim](https://nominatim.openstreetmap.org/) |
| **PWA** | [next-pwa](https://github.com/shadowwalker/next-pwa) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.17 or later
- **npm**: 9.x or later
- **Supabase Account**: Free project created
- **Google AI Studio Key**: For Gemini generation
- **OpenWeatherMap Key**: For weather data

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wandra.git
   cd wandra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your keys.
   ```bash
   cp .env.example .env.local
   ```

4. **Initialize Supabase**
   - Head to your Supabase SQL Editor.
   - Run the contents of `supabase/migrations/wandra_complete_schema.sql`.
   - Ensure the "Site URL" in Auth settings is set to `http://localhost:3000`.

5. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 🔑 Environment Variables

| Variable | Description | Source |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key for client-side Auth | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for server-side operations | Supabase Dashboard |
| `GEMINI_API_KEY` | API Key for Google Gemini | [Google AI Studio](https://aistudio.google.com/) |
| `OPENWEATHERMAP_API_KEY`| API Key for weather data | [OpenWeatherMap](https://openweathermap.org/) |
| `RESEND_API_KEY` | API Key for email notifications | [Resend](https://resend.com/) |

---

## 📁 Project Structure

```text
├── app/                  # Next.js App Router (pages & API routes)
│   ├── (auth)/           # Authentication flows (Login, Signup)
│   ├── (journey)/        # Core journey tracking & AI processing
│   ├── api/              # Standardized API endpoints
│   └── offline/          # PWA offline fallback page
├── components/           # Reusable UI components (Zustand-aware)
├── lib/                  # Shared utilities (AI, Geocoding, Weather, API)
├── store/                # Zustand stores (Journey, Auth, UI)
├── supabase/             # Database migrations and RLS policies
├── types/                # Standardized TypeScript interfaces
└── public/               # Static assets & Manifest files
```

---

## 📱 PWA Installation

Wandra is a full Progressive Web App.
- **iOS**: Open in Safari → Tap Share Button → "Add to Home Screen".
- **Android**: Open in Chrome → Tap Menu (three dots) → "Install App".
- **Desktop**: Chrome/Edge will show an "Install" icon in the address bar.

---

## 📡 API Documentation

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/journeys/start` | Create a new journey session | Yes |
| `POST` | `/api/journeys/[id]/moment`| Add a GPS waypoint/moment | Yes |
| `POST` | `/api/journeys/[id]/end` | Mark journey as complete | Yes |
| `POST` | `/api/journeys/[id]/generate`| Trigger AI journal generation | Yes |
| `PATCH`| `/api/profile` | Update user preferences | Yes |

---

## 🚢 Deployment

1. Push your code to a GitHub repository.
2. Connect the repository to [Vercel](https://vercel.com/).
3. Add all your `.env.local` variables to the Vercel project settings.
4. Deploy!

---

## 🎨 Design System

Wandra uses a custom design system centered around "Aurora" gradients and "Glass Liquid" surfaces.
- **Colors**: Deep Teal (#0B3D4A), Amber (#D97706), Sand (#F9F7F4).
- **Typography**: Cormorant Garamond (Serif), Outfit (Sans-Serif).
- **Reference**: [wandra-design-system.json](wandra-design-system.json)

---

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by the Wandra Team</p>
</div>
