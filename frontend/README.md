# Frontend - Hệ thống Báo cáo Thống kê

React + TypeScript frontend application for System Report Management.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Ant Design** - UI component library
- **React Router DOM** - Routing
- **Axios** - HTTP client with JWT interceptor
- **Zustand** - State management

## 📦 Installation

```bash
npm install
```

## 🏃 Development

```bash
npm run dev
```

Application will run at: `http://localhost:5173`

## 🔧 Environment Variables

Create `.env.development` file:

```env
VITE_API_BASE_URL=https://thongkehethong.mindmaid.ai/api
```

## 📂 Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.tsx   # Main layout with sidebar
│   └── ProtectedRoute.tsx
├── pages/           # Page components
│   ├── Login.tsx    # Login page
│   ├── Dashboard.tsx
│   ├── Systems.tsx
│   └── Organizations.tsx
├── stores/          # Zustand stores
│   └── authStore.ts
├── config/          # Configuration
│   └── api.ts       # Axios instance with JWT
├── types/           # TypeScript types
│   └── index.ts
└── App.tsx          # Main app with routing
```

## 🔑 Features

### Authentication
- JWT token-based authentication
- Auto token refresh
- Protected routes
- Logout functionality

### Dashboard
- System statistics overview
- Status breakdown
- Criticality levels

### Systems Management
- List all systems
- Search & filter
- Pagination
- View/Edit actions (coming soon)

### Organizations Management
- List all organizations
- Search & filter
- Contact information
- System count per org

## 🎨 UI Components (Ant Design)

- **Layout**: Sidebar navigation, header, content area
- **Table**: Data tables with pagination
- **Form**: Form handling with validation
- **Modal**: Dialogs and popups
- **Message**: Toast notifications
- **Tag**: Status badges

## 🔐 API Integration

All API calls go through Axios instance with:
- Automatic JWT token injection
- Token refresh on 401 errors
- Error handling
- Request/response interceptors

**Base URL**: `https://thongkehethong.mindmaid.ai/api`

## 🏗️ Build

```bash
npm run build
```

Output will be in `dist/` folder.

## 🚢 Deployment

### Production Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## 📱 Responsive Design

Application is fully responsive:
- Desktop: Full sidebar navigation
- Tablet: Collapsible sidebar
- Mobile: Mobile-optimized layout

## 🎯 Next Steps

- [ ] Implement Create/Edit forms for Systems
- [ ] Implement Create/Edit forms for Organizations
- [ ] Add file upload for attachments
- [ ] Add form wizard for Level 1 & Level 2 forms
- [ ] Add data export (Word/Excel)
- [ ] Add advanced filters
- [ ] Add user profile page
- [ ] Add settings page

---

**Created**: 2026-01-15
**Version**: 1.0.0
