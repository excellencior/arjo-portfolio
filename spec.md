# 🧾 Personal Portfolio Website Spec

## 1. Overview
A minimalistic, matte-themed personal portfolio website to showcase:
- Photography
- Academics
- Extracurriculars
- Blog posts

**Goal:** Clean, fast, interactive, and aesthetically pleasing experience.

---

## 2. Design Principles

### Style Guidelines
- Matte finish (no glossy/shiny UI)
- Minimalistic layout (no clutter)
- Low border-radius (sharp edges, not overly rounded)
- Subtle shadows only where necessary
- Smooth, meaningful animations

---

## 3. Color System (60 / 30 / 10)

### Light Theme
- 60% → Light Grey (`#F5F5F5`, `#EAEAEA`)
- 30% → Medium Grey (`#A0A0A0`)
- 10% → Accent (`#4A90E2` or muted teal)

### Dark Theme
- 60% → Dark Grey (`#121212`, `#1A1A1A`)
- 30% → Mid Grey (`#2A2A2A`)
- 10% → Accent (same as light)

---

## 4. Typography
- Font: Inter / system sans-serif
- Clean and readable hierarchy:
  - H1 → Bold, large
  - H2 → Semi-bold
  - Body → Regular
- Letter spacing slightly increased for headings

---

## 5. Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion (animations)

### Backend
- Express.js
- Cloudinary (image/file storage)

---

## 6. Navigation & Layout

### Top Sidebar Navigation
- Positioned at the **top**, slightly detached from main layout
- Floating/hanging appearance
- Not a traditional navbar (more like a dock)

### Behavior
- Smooth slide/fade animation on selection
- Active tab highlight
- Responsive (collapses into menu on mobile)

### Navigation Items
- Home
- Photography
- Academics
- Extracurriculars
- Blog
- Contact

---

## 7. Pages & Features

### 7.1 Home
- Intro section (name + short tagline)
- Quick links to sections
- Minimal hero animation

---

### 7.2 Photography
- Grid-based gallery layout
- Masonry-style preferred

#### Interactions
- Click → Expand image (modal/fullscreen)
- Features inside viewer:
  - Zoom in/out
  - Download button
  - Swipe/arrow navigation
- Lazy loading for performance

---

### 7.3 Academics
- Timeline or card-based layout
- Includes:
  - Education
  - Achievements
  - Projects

---

### 7.4 Extracurriculars
- Cards or timeline
- Focus on:
  - Activities
  - Leadership roles
  - Competitions

---

### 7.5 Blog
- List of posts (card/grid view)
- Markdown-supported posts

#### Features
- Tags/categories
- Read view:
  - Clean typography
  - Progress indicator
  - Estimated read time

---

### 7.6 Contact
- Simple form:
  - Name
  - Email
  - Message
- Social links

---

## 8. Animations

### Global
- Page transitions (fade + slight translate)
- Hover animations (subtle scale or opacity)

### Navigation
- Smooth tab switching animation
- Indicator movement

### Gallery
- Image zoom-in transition
- Modal fade + scale animation

---

## 9. Theme System

- Toggle between Light/Dark
- Persist theme in localStorage
- Smooth transition between themes

---

## 10. Backend API (Express)

### Endpoints

#### Upload Image
- `POST /upload`
- Upload to Cloudinary
- Return URL

#### Get Images
- `GET /images`
- Returns gallery list

#### Blog
- `GET /posts`
- `GET /posts/:id`

#### Contact
- `POST /contact`
- Store or email message

---

## 11. Data Handling

- Images stored in Cloudinary
- Blog posts:
  - Stored as markdown or JSON
- Minimal DB usage (optional)

---

## 12. Performance Considerations

- Lazy loading images
- Code splitting (React lazy)
- Optimized images via Cloudinary
- Minimal dependencies

---

## 13. First Sprint Scope (Full Implementation)

### Must Include
- All pages implemented
- Functional navigation
- Theme switching
- Photography gallery with modal
- Blog rendering (basic)
- Backend (upload + fetch)

---

## 14. Future Enhancements

- Admin dashboard
- Authentication
- Analytics
- Comments on blog
- Search functionality

---

## 15. UX Philosophy

- Fast interactions
- No unnecessary clicks
- Visual clarity over decoration
- Subtle delight through motion