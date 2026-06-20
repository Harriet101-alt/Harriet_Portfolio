# Portfolio Template

A customizable personal portfolio website built with React, TypeScript, and Tailwind CSS. Features interactive elements, smooth animations, dark/light mode, and a clean design.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/cupidbity/portfolio-template.git
cd portfolio-template
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Start the development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

## Customization Guide

### 1. Personal Information

**Name & Title** — Update your name in these files:

| File | What to change |
|------|---------------|
| `index.html` | Page `<title>` |
| `src/components/section/Navigation.tsx` | Nav bar name and aria-label |
| `src/components/section/About.tsx` | Hero greeting text (`AsciiMorphText`) |
| `src/components/Footer.tsx` | Copyright name |

**Roles** — Edit the typewriter carousel roles in `src/components/section/About.tsx`:
```tsx
const roles = [
  'Software Engineer',
  'Full-Stack Developer',
  // Add your own roles
];
```

### 2. Profile Images

Add your profile images to `src/assets/`:
- `profile1.jpg`
- `profile2.jpg`
- `profile3.jpg`

Then uncomment the imports in `src/assets/index.ts`:
```ts
import profile1 from './profile1.jpg';
import profile2 from './profile2.jpg';
import profile3 from './profile3.jpg';
```

Update the captions in `src/components/section/About.tsx`:
```tsx
const profileImages = [
  { src: profile1, caption: "your caption" },
  { src: profile2, caption: "your caption" },
  { src: profile3, caption: "your caption" }
];
```

### 3. Journal Image

Replace `src/assets/journal.PNG` with your own journal-style background image for the About section.

### 4. Resume

Place your resume PDF at `public/resume.pdf` — the Resume button in the About section and Footer link to this path.

### 5. Social Links & Environment Variables

Edit your `.env` file with your actual URLs:
```env
VITE_GITHUB_URL=https://github.com/yourusername
VITE_LINKEDIN_URL=https://linkedin.com/in/yourusername
VITE_EMAIL=your.email@example.com

VITE_GITHUB_PROJECT1_URL=https://github.com/yourusername/project-one
VITE_GITHUB_PROJECT2_URL=https://github.com/yourusername/project-two
VITE_GITHUB_PROJECT3_URL=https://github.com/yourusername/project-three
VITE_GITHUB_PROJECT4_URL=https://github.com/yourusername/project-four
```

These are consumed in `src/config/socialLinks.ts` — add more repository entries there as needed.

### 6. Projects

**Gallery cards** — Edit the projects array in `src/components/section/Projects.tsx`:
```tsx
{
  title: "Your Project",
  description: "A brief description of your project.",
  technologies: ["React", "TypeScript", "Node.js"],
  icon: YourProjectIcon,        // or use comingSoon as placeholder
  detailsUrl: "/projects/your-project",
  githubUrl: socialLinks.repositories.yourProject
}
```

**Project icons** — Add icon images to `src/assets/project_icons/` and register them in `src/assets/project_icons/index.ts`:
```ts
import YourProjectIcon from './YourProjectIcon.webp';
export { YourProjectIcon };
```

**Project detail pages** — Create a detail page for each project at `src/pages/projects/YourProject.tsx`. Use the available components:
- `ProjectLayout` — Page wrapper with dark mode theming
- `ProjectHeader` — Icon, title, subtitle, GitHub link, feature grid
- `ImageCarousel` — Screenshot carousel with navigation
- `ProjectOverview` — Multi-paragraph description
- `TechStack` — Technology badges
- `TechnicalHighlights` — Bulleted achievements list

**Project snapshots** — Add screenshot images to `src/assets/project_snapshots/your-project/` and import them in `src/assets/index.ts`.

**Routing** — Register your project pages in `src/App.tsx`:
```tsx
const YourProject = lazy(() => import('./pages/projects/YourProject'))
// ...
<Route path="/projects/your-project" element={<YourProject />} />
```

### 7. Experience

Edit `src/components/section/Experience.tsx` with your work history:
```tsx
{
  title: "Your Job Title",
  company: "Company Name",
  location: "City, State",
  period: "Month Year - Month Year",
  description: [
    "Your accomplishment or responsibility",
  ]
}
```

### 8. Certifications

Edit `src/components/section/Certifications.tsx` with your credentials. The section supports two types:
- **Badges** (e.g., AWS) — with image, title, subtitle, and Credly URL
- **Credentials** (e.g., CITI) — with image, title, issuer, dates, and credential ID/URL

Replace badge images in `src/assets/badges/` with your own.

### 9. Skills

Update your technical skills in `src/components/section/Skills.tsx`. Skill icons are in `src/assets/techstack/`.

## Project Structure

```
portfolio-template/
├── src/
│   ├── assets/
│   │   ├── project_icons/       # Project icon images
│   │   ├── project_snapshots/   # Project screenshot folders
│   │   ├── badges/              # Certification badge images
│   │   ├── stars/               # Decorative star images
│   │   ├── stickers/            # Sticker images
│   │   └── techstack/           # Skill/technology icons
│   ├── components/
│   │   ├── section/             # Main page sections
│   │   ├── project/             # Project detail page components
│   │   └── ui/                  # Reusable UI components
│   ├── config/
│   │   └── socialLinks.ts       # Social media & repo URLs
│   ├── contexts/
│   │   └── DarkModeContext.tsx   # Theme management
│   ├── pages/
│   │   ├── projects/            # Individual project detail pages
│   │   └── Contact.tsx          # Contact page
│   ├── styles/
│   │   └── colors.ts            # Color palette
│   └── App.tsx                  # Routes & layout
├── public/
│   └── resume.pdf               # Your resume (add this)
├── .env                         # Your environment variables (create from .env.example)
└── .env.example                 # Environment variable template
```

## Features

- Dark/light mode with system preference detection
- Interactive ASCII text with morphing effects
- Draggable star decorations
- Aurora gradient backgrounds
- Animated stickers on scroll
- Image carousel for project screenshots
- Responsive design across all devices
- Lazy-loaded routes and components

## Technologies

- React 19, TypeScript, Vite
- Tailwind CSS, Radix UI, Lucide Icons
- GSAP, React Spring, OGL (WebGL)
- React Router DOM

## License

MIT
