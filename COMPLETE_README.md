# EduSync - College Faculty Status Management System

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [System Features](#system-features)
4. [File Structure & Components](#file-structure--components)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Installation & Setup](#installation--setup)
8. [How It Works](#how-it-works)
9. [API & Data Flow](#api--data-flow)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**EduSync** is a professional college status management application built with **Expo + React Native + Firebase**. It enables students to view faculty real-time availability status and enables administrators to manage faculty accounts and live status updates.

### Key Goals

- ✅ Real-time faculty status management (Available/Busy/Leave)
- ✅ Role-based access control (Student, Faculty, Super Admin)
- ✅ Hardware integration for display panels
- ✅ Cross-platform mobile app (iOS, Android, Web)
- ✅ Secure Firebase Realtime Database with strict rules

---

## Architecture & Tech Stack

### Frontend

- **Framework**: React Native 0.81.5 with Expo 54.0.33
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API (AuthContext)
- **UI Components**: React Native built-in components
- **Styling**: StyleSheet (React Native native styling)

### Backend

- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Firebase Realtime Database (RTDB)
- **Deployment**: Firebase Cloud (Realtime DB)

### Development Tools

- **Language**: TypeScript 5.9.2
- **Linting**: ESLint with Expo config
- **Build Tool**: Expo CLI

### Key Dependencies

```json
{
  "expo": "~54.0.33",
  "expo-router": "~6.0.23",
  "firebase": "^12.11.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@react-navigation/bottom-tabs": "^7.4.0"
}
```

---

## System Features

### User Roles & Permissions

#### 1. **Super Admin** (admin@college.edu / 12345678)

- Create/edit/delete faculty accounts
- Monitor all faculty status in real-time
- View total faculty count dashboard
- Manage system settings
- Access all protected resources

#### 2. **Faculty**

- Update own live status (Available/Busy/Leave)
- Add custom messages for students
- Sync status to hardware display panels
- View own profile and update personal details
- Cannot delete own account (only super admin can)

#### 3. **Student**

- View all faculty status directory (read-only)
- Search faculty by name/department/cabin number
- View individual faculty profile details
- View custom messages from faculty
- Cannot create or modify any faculty data

---

## File Structure & Components

### Project Root Files

#### 📄 **package.json**

- **Purpose**: npm package configuration
- **Contains**: Dependencies, scripts, project metadata
- **Scripts**:
  - `npm start`: Start development server
  - `npm run android`: Build for Android
  - `npm run ios`: Build for iOS
  - `npm run web`: Build for web
  - `npm run lint`: Run ESLint
  - `npm run reset-project`: Reset project to clean state

#### 📄 **app.json**

- **Purpose**: Expo app configuration
- **Contains**: App name, icon, splash screen, Android/iOS configs
- **Key Settings**:
  - App slug: "Edusync"
  - Orientation: portrait
  - New Architecture: enabled
  - Typed Routes: enabled

#### 📄 **tsconfig.json**

- **Purpose**: TypeScript compiler configuration
- **Contains**: Path aliases (`@/*` → root), strict mode enabled
- **Compiler Options**: Strict type checking enabled

#### 📄 **eslint.config.js**

- **Purpose**: Code linting configuration
- **Uses**: Expo ESLint config with custom ignores

#### 📄 **firebase-realtime-database.rules.json**

- **Purpose**: Firebase RTDB security rules
- **Defines**:
  - User read/write permissions (role-based)
  - Faculty status visibility rules
  - Data validation for all writes
  - Super admin override permissions

#### 📄 **firebase.json**

- **Purpose**: Firebase deployment configuration
- **Specifies**: Database rules file path for CLI deployment

#### 📄 **.firebaserc**

- **Purpose**: Firebase project linking
- **Contains**: Default project ID for deployment

#### 📄 **expo-env.d.ts**

- **Purpose**: TypeScript type definitions for Expo environment
- **Ensures**: Type safety for Expo constants

#### 📄 **.env**

- **Purpose**: Environment variables (do not commit)
- **Contains**: Firebase API keys, database URLs, hardware base URL

#### 📄 **.env.example**

- **Purpose**: Template for environment variables
- **Usage**: Copy to `.env` and fill with your Firebase credentials

#### 📄 **.gitignore**

- **Purpose**: Git ignore file
- **Excludes**: node_modules, .env, build artifacts

---

### Directories & Components

### 📁 **app/** - Application Routing Layer (Expo Router)

#### **app/\_layout.tsx**

```typescript
Root layout wrapper with AuthProvider and ThemeProvider
- Wraps entire app with authentication context
- Sets up navigation theme
- Initializes Firebase on app start
- Shows splash screen while loading auth state
```

#### **app/index.tsx**

```typescript
Landing/splash screen
- Checks if user is authenticated
- Redirects to /(tabs) if logged in
- Redirects to /(auth)/sign-in if not authenticated
- Shows loading spinner while checking auth state
```

#### **app/modal.tsx**

```typescript
Modal component for future use
- Currently unused
- Can be extended for modal overlays
```

---

### 📁 **app/(auth)/** - Authentication Routes

#### **app/(auth)/\_layout.tsx**

```typescript
Authentication stack layout
- Contains sign-in and sign-up routes
- No header shown (headerShown: false)
- Nested Stack navigation
```

#### **app/(auth)/sign-in.tsx**

```typescript
User login screen
Component: SignInScreen()

Features:
- Dual login sections: Student & Faculty/Admin
- Student login inputs: email, password
- Faculty/Admin inputs: email, password
- Default admin credentials hint: admin@college.edu / 12345678

Functions:
- handleStudentSignIn(): Calls useAuth.signIn()
- handleFacultyAdminLogin(): Calls useAuth.signInFacultyAdmin()
- Error alerts with Firebase error messages
- Loading states during authentication

Flow:
1. User enters email/password
2. Validate inputs (non-empty)
3. Call appropriate signIn function
4. On success: Auto-redirect to /(tabs)
5. On error: Show alert with error message
```

#### **app/(auth)/sign-up.tsx**

```typescript
Student account creation screen
Component: SignUpScreen()

Features:
- Student name input
- Email input (email-address keyboard)
- Password input (secured)
- Confirm password input

Validations:
- All fields required
- Password === Confirm Password
- Non-empty checks

Functions:
- handleStudentCreate():
  - Calls useAuth.createStudentAccount()
  - Creates user in Firebase Auth + RTDB
  - Sets role: 'student'

Flow:
1. User fills all fields
2. Validate password match
3. Call createStudentAccount()
4. On success: Auto-redirect to /(tabs)
5. On error: Show alert with error message
```

---

### 📁 **app/(tabs)/** - Main App Tabs

#### **app/(tabs)/\_layout.tsx**

```typescript
Tab navigation layout
Component: TabLayout()

Tabs:
1. Home (house.fill icon)
   - Route: /(tabs)/index
   - Visible to: All users

2. Admin/Profile (gearshape.fill icon)
   - Route: /(tabs)/explore
   - Title: "Admin" for super_admin, "Profile" for others
   - Visible to: All users

3. Create Faculty (person.badge.plus icon)
   - Route: /(tabs)/create-faculty
   - Visible to: Only super_admin (href: null for others)

Authentication Check:
- Shows loading spinner while auth initializes
- Redirects to /(auth)/sign-in if not authenticated

Tab Styling:
- Active tint: #1d4ed8 (blue)
- Background: white
- Border: light blue (#dbeafe)
```

#### **app/(tabs)/index.tsx**

```typescript
Home/Faculty Status Dashboard
Component: HomeScreen()

Three Modes:

1. FACULTY USER MODE:
   - Status Update Section:
     - Toggle buttons: Available/Busy/Leave
     - Custom message input field
     - "Custom Msg" button to sync message + status to hardware
     - Current status display card

2. SUPER ADMIN MODE:
   - Admin Summary Box: Shows total faculty count
   - Faculty Management:
     - "View Profile" button → routes to /faculty/[facultyId]
     - "Delete" button with confirmation alert
     - Delete removes both users/{id} and facultyStatus/{id}

3. STUDENT MODE (READ-ONLY):
   - See all faculty status
   - Tap cards to view profile details
   - Cannot modify any data

Common Features:
- Faculty Directory with search
- Real-time status updates (green/red/yellow badges)
- Department and cabin number display
- Live message display

Data Source:
- facultyStatuses: Retrieved from context (subscribes to RTDB)
- profile: User profile from context

Search Functionality:
- Filters by: name, department, cabin number
- Case-insensitive matching
- Real-time filtering

Functions:
- handleStatusClick(status): Toggle status and update hardware
- handleSendMessage(): Send custom message
- handleDeleteFaculty(facultyId, name): Delete faculty with confirmation
- executeDeleteFaculty(facultyId): Actual deletion logic
```

#### **app/(tabs)/explore.tsx**

```typescript
User Profile Screen
Component: ProfileScreen()

For Super Admin: "Admin Profile"
For Faculty/Student: "My Profile"

Editable Fields:
- Name (required)
- Department (optional)
- Cabin Number (optional)
- Photo URL (optional, displays as avatar)

Display Fields:
- Role (from profile, read-only)
- Email (from profile, read-only)

Buttons:
- Save Profile: Updates user profile in RTDB
- Sign Out: Logs out user and returns to sign-in

Data Binding:
- useEffect: Syncs profile data to form on mount
- onChange: Updates local state on input change
- Save: Calls updateMyProfile() with new data

Faculty-specific logic:
- When faculty updates profile, facultyStatus is also updated
- Students: Only personal profile visible
```

#### **app/(tabs)/create-faculty.tsx**

```typescript
Faculty Account Creation (Admin Only)
Component: CreateFacultyScreen()

Access Control:
- Only accessible if profile.role === 'super_admin'
- Non-admin users see: "Only super admin can access this page"

Form Fields:
- Faculty Name (required)
- Faculty Email (required, email-address keyboard)
- Faculty Password (required, secured input)
- Department (optional)
- Cabin Number (optional)

Validations:
- All required fields non-empty
- Email format validation (client-side only)
- Password minimum length (recommended 6+ chars)

Creates:
- Firebase Auth account (email/password)
- users/{newUid} entry with role: 'faculty'
- facultyStatus/{newUid} entry with status: 'Available'

On Success:
- Clear form inputs
- Show success alert: "Faculty created"
- facultyStatuses list updates automatically in context

On Error:
- Show error alert with Firebase error message
- Common errors:
  - "auth/email-already-in-use": Faculty email exists
  - "auth/invalid-password": Password too weak

Display:
- Total faculty accounts counter at top
```

---

### 📁 **app/faculty/** - Faculty Detail Routes

#### **app/faculty/[facultyId].tsx**

```typescript
Individual Faculty Detail Page
Component: FacultyDetailScreen()

Route Params:
- facultyId: University ID of faculty

Data Sources:
- users/{facultyId}: User profile data
- facultyStatus/{facultyId}: Current status

Displays:
- Faculty name
- Email
- Department
- Cabin number
- Photo (if available)
- Current status badge (Available/Busy/Leave)
- Custom message from faculty

Loading State:
- Shows ActivityIndicator while fetching

Real-time Updates:
- Subscribes to both user profile and status
- Updates live if faculty changes status while viewing

Error Handling:
- Shows "Faculty Not Found" if neither profile nor status exists

Styling:
- Status badge color-coded (green/red/yellow)
```

---

### 📁 **components/** - Reusable UI Components

#### **components/themed-text.tsx**

- Exports `ThemedText` component
- Applies theme colors from context
- Used throughout app for consistent text styling

#### **components/themed-view.tsx**

- Exports `ThemedView` component
- Background color adapts to light/dark theme

#### **components/parallax-scroll-view.tsx**

- Parallax scroll effect component
- Header scrolls slower than content

#### **components/haptic-tab.tsx**

- Custom tab bar button with haptic feedback
- Provides tactile feedback on tap

#### **components/hello-wave.tsx**

- Greeting wave emoji component
- Animated welcome indicator

#### **components/external-link.tsx**

- Wrapper for external link navigation

#### **components/ui/collapsible.tsx**

- Collapsible section component
- Expandable/collapsible content

#### **components/ui/icon-symbol.tsx**

- Icon rendering component (platform-specific)

#### **components/ui/icon-symbol.ios.tsx**

- iOS-specific icon implementation

---

### 📁 **context/** - Application State Management

#### **context/auth-context.tsx**

```typescript
Central authentication and authorization context

Exported Types:
- UserRole: 'student' | 'faculty' | 'super_admin'
- UserProfile: uid, email, name, role, department, cabinNumber, photoUrl
- FacultyStatus: facultyId, name, department, cabinNumber, status, message, updatedAt
- AuthContextType: All auth functions and state

Exported Context: useAuth()
- Provides access to all auth state and functions globally

State Variables:
- user: Current Firebase Auth user
- profile: User profile from RTDB
- facultyStatuses: Array of all faculty statuses (real-time)
- loading: Boolean indicating auth initialization

Core Functions:

1. signIn(email, password)
   - Firebase signInWithEmailAndPassword
   - Sets user in context
   - Automatically redirects based on role

2. signInFacultyAdmin(email, password)
   - Extended signIn with role verification
   - Checks if user.email === 'admin@college.edu' OR role in ['faculty', 'super_admin']
   - Throws error if non-faculty account tries faculty login

3. createStudentAccount(input: CreateStudentInput)
   - Creates Firebase Auth account
   - Creates users/{uid} entry with role: 'student'
   - Sets default profile fields

4. createFacultyAccount(input: CreateFacultyInput) [ADMIN ONLY]
   - Creates second Firebase app instance (secondary auth)
   - Creates Faculty Auth account in secondary app
   - Creates users/{newUid} entry with role: 'faculty'
   - Creates facultyStatus/{newUid} entry with status: 'Available'
   - Handles 'auth/email-already-in-use' error

5. updateMyStatus(status, message)
   - Updates facultyStatus/{uid}
   - Syncs status to hardware via HTTP fetch
   - Only callable by faculty

6. updateMyMessageOnly(message)
   - Updates message in facultyStatus/{uid}
   - Keeps current status unchanged

7. updateMyProfile(input: UpdateProfileInput)
   - Updates users/{uid} entry
   - If faculty: Also updates facultyStatus/{uid}

8. deleteFacultyByAdmin(facultyId) [ADMIN ONLY]
   - Deletes users/{facultyId}
   - Deletes facultyStatus/{facultyId}
   - Only super_admin can call

9. updateFacultyByAdmin(input: UpdateFacultyInput) [ADMIN ONLY]
   - Updates users/{facultyId}
   - Updates facultyStatus/{facultyId}

10. signOutUser()
    - Firebase signOut
    - Clears user and profile from context

Hardware Sync Logic:
- syncStatusToHardware(status, message)
- Fetches: http://192.168.4.1/{Available|Busy|Leave}
- Sets message: http://192.168.4.1/setText?msg={message}&sp=40&i=0
- 4-second timeout per request
- Errors logged but don't break app flow

Default Admin Bootstrap:
- createDefaultAdminIfMissing()
- Runs on first app load
- Creates admin@college.edu account if not exists
- Only runs once (handled by Firebase 'auth/email-already-in-use' error)
- Uses secondary Firebase app for isolated auth

Real-time Listeners:
- onAuthStateChanged: Monitors login/logout
- onValue(users/{uid}): Monitors current user profile
- onValue(facultyStatus): Monitors all faculty statuses
- All listeners auto-unsubscribe on unmount

RTDB Subscription Setup:
- facultyStatus listener only starts AFTER user authentication
- Prevents permission denied errors on cold start
- Handles missing data gracefully with fallback values
- Filters invalid status values
```

---

### 📁 **hooks/** - Custom React Hooks

#### **hooks/use-color-scheme.ts**

```typescript
Re-exports React Native's useColorScheme hook
- Detects system color scheme preference
- Returns: 'light' | 'dark' | null
```

#### **hooks/use-theme-color.ts**

```typescript
Custom hook for theme colors
- Takes color name as parameter
- Returns appropriate color from Colors[colorScheme]
- Used for dynamic theming
```

#### **hooks/use-color-scheme.web.ts**

```typescript
Web-specific color scheme implementation
- Overrides native implementation for web
- Detects browser dark mode preference
```

---

### 📁 **lib/** - Utility Libraries

#### **lib/firebase.ts**

```typescript
Firebase initialization and configuration

Exports:
- app: Initialized Firebase app instance
- auth: Firebase Authentication instance
- db: Firebase Realtime Database instance
- firebaseConfig: Raw Firebase configuration object

Validation:
- Checks all required environment variables on import
- Throws error if any Firebase config missing
- Ensures app won't start without Firebase setup

EXPO_PUBLIC_ Variables Required:
1. EXPO_PUBLIC_FIREBASE_API_KEY
2. EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
3. EXPO_PUBLIC_FIREBASE_PROJECT_ID
4. EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
5. EXPO_PUBLIC_FIREBASE_DATABASE_URL
6. EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
7. EXPO_PUBLIC_FIREBASE_APP_ID

Optional:
- EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID

Initialization:
- getApps().length > 0: Uses existing app
- else: Initializes new Firebase app with config
- Prevents multiple app instances
```

---

### 📁 **constants/** - App Constants

#### **constants/theme.ts**

```typescript
Centralized theme configuration

Exports:

Colors Object (light & dark modes):
- text: #0f172a (dark gray)
- background: #f8fbff (light blue)
- tint: #1d4ed8 (primary blue)
- icon: #64748b (medium gray)
- tabIconDefault: #64748b
- tabIconSelected: #1d4ed8

Fonts Object (platform-specific):
- iOS: Uses 'system-ui', 'ui-serif', 'ui-rounded', 'ui-monospace'
- Android: Uses 'normal', 'serif', 'monospace'
- Web: Uses full CSS font stacks

Usage:
- Colors[colorScheme].text: Get text color
- Fonts.sans: Get sans-serif font family
```

---

### 📁 **scripts/** - Build & Setup Scripts

#### **scripts/reset-project.js**

```
Project reset utility
- Clears node_modules
- Removes cache
- Reinstalls dependencies
- Resets development environment to clean state

Usage: npm run reset-project
```

---

### 📁 **assets/** - Static Assets

#### **assets/images/**

- `icon.png`: App icon (all platforms)
- `splash-icon.png`: Splash screen icon
- `favicon.png`: Web favicon
- `android-icon-*.png`: Android adaptive icons

---

## Database Schema

### Firebase Realtime Database Structure

```
edusync-46fff-default-rtdb
├── users/
│   ├── {uid1}/
│   │   ├── email: "student@college.edu"
│   │   ├── name: "John Doe"
│   │   ├── role: "student"
│   │   ├── department: ""
│   │   ├── cabinNumber: ""
│   │   ├── photoUrl: ""
│   │   ├── createdAt: 1735906800000
│   │   └── updatedAt: 1735906800000
│   │
│   ├── {uid2}/
│   │   ├── email: "faculty@college.edu"
│   │   ├── name: "Dr. Jane Smith"
│   │   ├── role: "faculty"
│   │   ├── department: "CSE"
│   │   ├── cabinNumber: "B-204"
│   │   ├── photoUrl: ""
│   │   ├── createdAt: 1735906800000
│   │   └── updatedAt: 1735906800000
│   │
│   └── {uid3}/
│       ├── email: "admin@college.edu"
│       ├── name: "System Admin"
│       ├── role: "super_admin"
│       ├── department: "Administration"
│       ├── cabinNumber: "A-101"
│       ├── photoUrl: ""
│       ├── createdAt: 1735906800000
│       └── updatedAt: 1735906800000
│
└── facultyStatus/
    ├── {uid2}/
    │   ├── facultyId: "{uid2}"
    │   ├── name: "Dr. Jane Smith"
    │   ├── department: "CSE"
    │   ├── cabinNumber: "B-204"
    │   ├── status: "Available" | "Busy" | "Leave"
    │   ├── message: "In cabin for student queries"
    │   └── updatedAt: 1735906800000
    │
    └── {uid3}/
        ├── facultyId: "{uid3}"
        ├── name: "System Admin"
        ├── department: "Administration"
        ├── cabinNumber: "A-101"
        ├── status: "Available"
        ├── message: ""
        └── updatedAt: 1735906800000
```

### Data Types

**User Profile:**

```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;            // Login email
  name: string;             // Full name
  role: 'student' | 'faculty' | 'super_admin';
  department?: string;      // Department name
  cabinNumber?: string;     // Office cabin number
  photoUrl?: string;        // Profile photo URL
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Faculty Status:**

```typescript
{
  facultyId: string;        // Maps to users.{uid}
  name: string;             // Faculty name
  department?: string;
  cabinNumber?: string;
  status: 'Available' | 'Busy' | 'Leave';
  message?: string;         // Custom status message
  updatedAt: timestamp;
}
```

---

## Authentication & Authorization

### Firebase Security Rules

```json
{
  "rules": {
    ".read": false,
    ".write": false,

    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || data.child('role').val() === 'faculty' || data.child('role').val() === 'super_admin')",
        ".write": "auth != null && (auth.uid === $uid || root.child('users/' + auth.uid + '/role').val() === 'super_admin')",
        ".validate": "[Complex validation for role creation]"
      }
    },

    "facultyStatus": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && ((auth.uid === $uid && (root.child('users/' + auth.uid + '/role').val() === 'faculty' || root.child('users/' + auth.uid + '/role').val() === 'super_admin')) || root.child('users/' + auth.uid + '/role').val() === 'super_admin')",
        ".validate": "[Status must be one of: Available, Busy, Leave]"
      }
    }
  }
}
```

### Role-Based Access Control (RBAC)

| Feature             | Student | Faculty | Super Admin |
| ------------------- | ------- | ------- | ----------- |
| View faculty status | ✅      | ✅      | ✅          |
| Update own status   | ❌      | ✅      | ✅          |
| Update own profile  | ✅      | ✅      | ✅          |
| Create faculty      | ❌      | ❌      | ✅          |
| Delete faculty      | ❌      | ❌      | ✅          |
| View all profiles   | ❌      | ✅      | ✅          |
| Manage system       | ❌      | ❌      | ✅          |

---

## Installation & Setup

### Prerequisites

- Node.js 16+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Firebase account with Realtime Database project
- Mobile device or emulator (optional)

### Step 1: Clone & Install

```bash
cd "d:\6th sem\EduSync\app\Edusync"
npm install
```

### Step 2: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create new project: "edusync-46fff"
3. Create Realtime Database (select "Start in test mode")
4. Copy your Firebase config

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=edusync-46fff.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=edusync-46fff
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=edusync-46fff.firebasestorage.app
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://edusync-46fff-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
EXPO_PUBLIC_HARDWARE_BASE_URL=http://192.168.4.1
```

### Step 4: Deploy Firebase Rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only database --project edusync-46fff
```

### Step 5: Start Development Server

```bash
npm start
```

Choose platform:

- **Press a** for Android emulator
- **Press i** for iOS simulator
- **Press w** for web browser
- **Press e** for Expo app (scan QR)

---

## How It Works

### Application Flow Diagram

```
┌─────────────────┐
│   App Launch    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  AuthProvider Initialization    │
│  - Firebase Init                │
│  - createDefaultAdmin()         │
│  - onAuthStateChanged()         │
│  - Sync facultyStatus listener  │
└────────┬────────────────────────┘
         │
         ▼
     ┌───┴───┐
     │ Auth? │
     └───┬───┘
         │
    ┌────┴─────┐
    │           │
   NO          YES
    │           │
    ▼           ▼
┌──────┐   ┌────────────┐
│Auth  │   │Check Role  │
│Stack │   └────┬───────┘
└──────┘        │
            ┌───┴────┬──────────┬─────────┐
            │        │          │         │
          Student  Faculty  Super Admin   │
            │        │          │         │
            └────┬───┘          │         │
                 │              │         │
                 ▼              ▼         ▼
            Tabs Layout     Faculty Tabs  Admin Tabs
```

### Authentication Flow

```
1. USER VISITS APP
   ↓
2. CHECK AUTH STATE (onAuthStateChanged)
   ├─ No user → Show /auth/sign-in
   └─ User exists → Continue
   ↓
3. LOAD USER PROFILE
   ├─ Query: users/{uid}
   └─ Set profile + role in context
   ↓
4. LOAD FACULTY STATUSES
   ├─ Subscribe: facultyStatus/*
   └─ Update list in real-time
   ↓
5. ROUTE BASED ON ROLE
   ├─ Student → /tabs (home shows status directory)
   ├─ Faculty → /tabs (home shows own status + directory)
   └─ Super Admin → /tabs (home shows admin panel + create faculty)
```

### Status Update Flow (Faculty)

```
FACULTY UPDATES STATUS
   ↓
Input: Status + Message
   ↓
validateInput() [not empty]
   ↓
updateMyStatus(status, message)
   ├─ Update RTDB: facultyStatus/{uid}
   ├─ Validate: status in [Available, Busy, Leave]
   └─ Server timestamp: updatedAt
   ↓
syncStatusToHardware(status, message)
   ├─ POST to: http://192.168.4.1/{Available|Busy|Leave}
   └─ POST message to: http://192.168.4.1/setText?msg={msg}&sp=40&i=0
   ↓
SUCCESS
   ├─ Alert: "Status updated"
   ├─ All connected students see live update
   └─ Hardware display updates
```

### Data Fetching & Real-time Updates

```
CONTEXT SUBSCRIBES TO FACULTY STATUS

useEffect(() => {
  if (!user) return;  // Only after auth

  const statusRef = ref(db, 'facultyStatus');

  onValue(statusRef, (snapshot) => {
    // Process snapshot.val() into FacultyStatus[]
    // Sort by name
    setFacultyStatuses(statuses)
  })
})

RESULT:
- Any faculty status change → immediate UI update
- New faculty created → appears in list instantly
- Faculty deleted → removed from list
- All screens see same live data
```

---

## API & Data Flow

### Key Functions & Methods

#### **Authentication Functions**

1. **signIn(email, password)**

   ```typescript
   // Student login
   const { signIn } = useAuth();
   await signIn("student@college.edu", "password123");
   // Automatically updates context.user
   // Routes to /(tabs)
   ```

2. **signInFacultyAdmin(email, password)**

   ```typescript
   // Faculty/Admin login with role check
   const { signInFacultyAdmin } = useAuth();
   await signInFacultyAdmin("faculty@college.edu", "password");
   // Validates role: must be 'faculty' or 'super_admin'
   // Throws error if student account tries
   ```

3. **createStudentAccount(input)**
   ```typescript
   // Create student account
   await createStudentAccount({
     email: "newstudent@college.edu",
     password: "secure123",
     name: "New Student",
   });
   // Creates Firebase Auth user
   // Creates users/{uid} with role: 'student'
   ```

#### **Faculty Management (Admin Only)**

4. **createFacultyAccount(input)**

   ```typescript
   // Admin creates faculty
   await createFacultyAccount({
     email: "faculty@college.edu",
     password: "pass123",
     name: "Dr. Name",
     department: "CSE",
     cabinNumber: "B-204",
   });
   // Creates in Firebase Auth
   // Creates users/{uid} + facultyStatus/{uid}
   ```

5. **deleteFacultyByAdmin(facultyId)**

   ```typescript
   // Admin deletes faculty
   await deleteFacultyByAdmin("faculty_uid");
   // Deletes users/{uid}
   // Deletes facultyStatus/{uid}
   ```

6. **updateFacultyByAdmin(input)**
   ```typescript
   // Admin updates faculty details
   await updateFacultyByAdmin({
     facultyId: "uid",
     name: "Updated Name",
     department: "ECE",
     cabinNumber: "B-205",
     status: "Available",
     message: "In cabin",
   });
   // Updates both users and facultyStatus nodes
   ```

#### **Faculty Status Management**

7. **updateMyStatus(status, message)**

   ```typescript
   // Faculty updates their status
   await updateMyStatus("Busy", "In class");
   // Updates: facultyStatus/{uid}
   // Syncs to hardware
   ```

8. **updateMyMessageOnly(message)**

   ```typescript
   // Faculty updates message only
   await updateMyMessageOnly("New message");
   // Keeps current status
   // Updates: facultyStatus/{uid}/message
   ```

9. **updateMyProfile(input)**
   ```typescript
   // Any user updates own profile
   await updateMyProfile({
     name: "New Name",
     department: "New Dept",
     cabinNumber: "C-101",
     photoUrl: "https://...",
   });
   // Updates: users/{uid}
   // If faculty: Also updates facultyStatus/{uid}
   ```

#### **Logout**

10. **signOutUser()**
    ```typescript
    // Sign out current user
    await signOutUser();
    // Clears Firebase Auth
    // Clears context user + profile
    // Routes to /(auth)/sign-in
    ```

---

## Real-time Data Sync

### Hardware Integration

```typescript
// Faculty status syncs to hardware display
syncStatusToHardware('Available', 'In cabin');

// HTTP Calls:
GET http://192.168.4.1/available
GET http://192.168.4.1/setText?msg=In%20cabin&sp=40&i=0

// Response: Must be HTTP 200 OK
// Timeout: 4 seconds per request
```

### Firebase Real-time Listeners

```typescript
// All faculty statuses update live
onValue(ref(db, "facultyStatus"), (snapshot) => {
  // Updates whenever ANY faculty status changes
  // Propagates to all connected clients
});

// Single faculty detail
onValue(ref(db, `facultyStatus/{facultyId}`), (snapshot) => {
  // Real-time update on detail screen
});
```

---

## Project Initialization

### Bootstrap Process

1. **App Starts**
   - Firebase initialized from `.env` config
   - AuthProvider wraps app

2. **Default Admin Created** (if not exists)
   - Email: admin@college.edu
   - Password: 12345678
   - Role: super_admin
   - Runs in secondary Firebase app (isolated auth)

3. **User Authentication State Checked**
   - onAuthStateChanged fires
   - If logged in: Load user profile + faculty statuses
   - If not: Show login screen

4. **Faculty Status Listeners Attached**
   - Only after user authentication succeeds
   - Prevents permission denied errors
   - Subscribes to all facultyStatus data

5. **App Ready**
   - User routed based on role
   - UI updates reactively to real-time data

---

## Troubleshooting

### Common Issues & Solutions

#### 1. **Login Shows "Permission Denied"**

```
Root Cause: RTDB rules not deployed or profile node not accessible
Solution:
1. Deploy rules: firebase deploy --only database
2. Check Firebase console: rules are valid syntax
3. Ensure admin user exists: users/{uid} for admin@college.edu
4. Check .env has correct database URL
```

#### 2. **Faculty Not Showing on Admin Home**

```
Root Cause: facultyStatus listener subscribed before auth
Solution:
1. Full app restart (not just reload)
2. Check: facultyStatus node has data in Firebase console
3. Check: Faculty UID in users node matches facultyStatus UID
4. Admin role must be 'super_admin' in profile
```

#### 3. **Student Can't See Faculty Directory**

```
Root Cause: RTDB read permissions restricted
Solution:
1. Check rule: ".read": "auth != null" for facultyStatus
2. Check user authenticated: profile should exist
3. Check facultyStatus has data
4. Search filter might be hiding results (clear search)
```

#### 4. **Hardware Sync Fails**

```
Root Cause: Hardware not reachable or wrong IP
Solution:
1. Check EXPO_PUBLIC_HARDWARE_BASE_URL in .env
2. Verify hardware is powered on and connected
3. Check network connectivity
4. Default: http://192.168.4.1 (change if different)
5. Errors are logged but don't block status update
```

#### 5. **Firebase Config Missing Error**

```
Root Cause: .env file not configured
Solution:
1. cp .env.example .env
2. Add all FIREBASE credentials from Firebase console
3. Restart app: npm start
4. All EXPO_PUBLIC_* variables are required
```

#### 6. **Faculty Creation Fails with "Email Already in Use"**

```
Root Cause: Faculty email already exists in Firebase Auth
Solution:
1. Use different email for faculty
2. If faculty was deleted, also remove from:
   - Firebase Console > Authentication > Users
   - RTDB: users/{uid}
   - RTDB: facultyStatus/{uid}
3. Then recreate with same email
```

#### 7. **App Won't Start / Babel Error**

```
Root Cause: node_modules corrupted or TypeScript compilation error
Solution:
1. npm run reset-project
2. npm install
3. npm start
4. Check tsconfig.json paths: "@/*" → "./*"
```

#### 8. **Status Update Takes Long Time / Times Out**

```
Root Cause: Hardware unreachable or network slow
Solution:
1. Hardware timeout is 4 seconds per request
2. Check network connection
3. Verify hardware IP in .env
4. Status updates RTDB immediately (hardware is async)
5. App won't hang on hardware failure (safe fallback)
```

---

## Development Guidelines

### Code Structure Best Practices

1. **File Organization**
   - Routes: In `app/` directory (Expo Router)
   - Context: In `context/` (state management)
   - Components: In `components/` (reusable UI)
   - Hooks: In `hooks/` (custom React hooks)
   - Constants: In `constants/` (theme, config)
   - Lib: In `lib/` (Firebase, utilities)

2. **Naming Conventions**
   - Components: PascalCase (HomeScreen)
   - Functions: camelCase (handleStatusClick)
   - Constants: UPPER_SNAKE_CASE (DEFAULT_ADMIN_EMAIL)
   - Files: kebab-case (sign-in.tsx)

3. **Type Safety**
   - Use TypeScript for all files
   - Define interfaces for data types
   - Export types for reusability
   - Use strict: true in tsconfig

4. **Error Handling**
   - Catch Firebase errors with try-catch
   - Show user-friendly error alerts
   - Log to console for debugging
   - Validate inputs before API calls

---

## Deployment

### Deploy to Firebase

```bash
# Deploy Realtime Database rules
firebase deploy --only database --project edusync-46fff

# Deploy everything (if hosting configured)
firebase deploy --project edusync-46fff
```

### Build for Production

```bash
# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios

# Web build
npm run web
```

---

## Additional Resources

- **Expo Documentation**: https://docs.expo.dev
- **Firebase Realtime DB**: https://firebase.google.com/docs/database
- **React Native**: https://reactnative.dev
- **TypeScript**: https://www.typescriptlang.org

---

## License & Credits

**EduSync v1.0.0**

- Built with ❤️ using Expo + Firebase
- For educational college management

---

**Last Updated**: May 5, 2026
**Maintainer**: EduSync Development Team
