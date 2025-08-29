# Product Requirements Document: ArtVaani

## 1. Overview

ArtVaani is a web application designed to empower artisans by providing them with AI-powered tools to market their crafts and share their cultural stories. It also serves as a platform for consumers to discover, learn about, and purchase unique artisanal products. The platform supports multiple languages and features distinct user experiences for buyers and artisans.

## 2. Core User Roles

*   **Buyer:** A general user who can browse products, learn about crafts, manage a shopping cart, and make purchases. They can choose to become an artisan.
*   **Artisan:** A seller who has access to specialized AI tools to create product listings, generate cultural narratives, and manage their profile.

## 3. Key Features

### 3.1. User Authentication & Profiles
*   **Multi-Factor Sign-In:** Users can sign up or sign in using:
    *   Email and Password
    *   Google Account (OAuth)
    *   Phone Number with OTP verification
*   **Profile Completion:** New users are required to complete a profile after their first sign-in, providing their full name, city, and phone number. This data is stored in Firestore.
*   **Role-Based Access Control (RBAC):** Users are differentiated by an `isArtisan` flag in their Firestore profile.
    *   **Buyers** (`isArtisan: false`) see a product-focused interface.
    *   **Artisans** (`isArtisan: true`) gain access to content creation tools.
*   **Artisan Onboarding:** A dedicated "For Artisans" page allows buyers to register as artisans by providing additional information about their craft and experience.
*   **Editable Artisan Profile:** Artisans have a dedicated profile page to view and edit their personal and professional details.

### 3.2. E-Commerce & Product Discovery
*   **Product Gallery:** A public page displaying a curated list of artisanal products with images, names, prices, and descriptions.
*   **Shopping Cart:** Logged-in users have a persistent shopping cart. They can add products, adjust quantities, and remove items. Cart data is stored in a `cart` subcollection in Firestore.
*   **Dummy Checkout:** A placeholder checkout page provides a complete, albeit simulated, shopping flow for demonstration purposes.

### 3.3. AI-Powered Artisan Tools
*   **AI Product Listing Generator:**
    *   **Input:** Product name, description, target audience, and language.
    *   **Output:** Generates a compelling product title, a detailed marketing description, and relevant hashtags using a Gemini-powered Genkit flow.
    *   **Functionality:** Supports multiple languages.
*   **AI Storytelling Assistant:**
    *   **Input:** An audio recording of the artisan's story, and a selected language.
    *   **Functionality:** Transcribes the audio to text and then transforms the transcription into an engaging cultural narrative using a Gemini-powered Genkit flow.
*   **Cultural Insights Tool:**
    *   **Input:** The name of a craft (e.g., "Madhubani Painting") and a selected language.
    *   **Output:** Generates detailed information about the craft's origins, history, and cultural significance.

### 3.4. Multilingual & Accessibility Features
*   **Full Localization:** The entire UI is localized into seven languages: English, Hindi, Bengali, Telugu, Marathi, Tamil, and Kannada.
*   **Language Selector:** Users can select their preferred language on the landing page, and their choice is persisted throughout the application via React Context.
*   **Text-to-Speech (TTS):** On the Story Creation and Cultural Insights pages, users can click a button to have the generated text read aloud in the selected language, using the browser's native Web Speech API. The system gracefully falls back to an English voice if the selected language is not supported by the browser.

## 4. Technical Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with ShadCN UI components. The theme is customized with a terracotta, beige, and mustard yellow color palette.
*   **Generative AI:** Google's Gemini models accessed via Genkit flows.
*   **Backend & Database:**
    *   **Authentication:** Firebase Authentication
    *   **Database:** Firestore for user profiles, roles, and shopping carts.
*   **State Management:** React Context for managing authentication state and language preference.
*   **Deployment:** Configured for Firebase App Hosting.

## 5. User Flows

### 5.1. New Buyer Flow
1.  User lands on the homepage and selects a language.
2.  User navigates to the `/dashboard/products` page to browse items.
3.  User clicks "Add to Cart" and is prompted to sign in.
4.  User signs up via email, Google, or phone.
5.  User is redirected to the `/auth/complete-profile` page to enter their name, city, and phone number.
6.  Upon completion, they are redirected to the `/dashboard/products` page.
7.  The user can now add items to their cart, view their cart, and proceed to the dummy checkout page.

### 5.2. Artisan Onboarding Flow
1.  A logged-in buyer navigates to the "For Artisans" page from a prompt on the products page.
2.  The user fills out the form with their art type and experience.
3.  On submission, their `isArtisan` flag is set to `true` in Firestore.
4.  The user is redirected to the main artisan dashboard (`/dashboard`) and their sidebar is updated with artisan-specific tools ("Add Product", "Story Creation", "Profile").
5.  They can now access these tools to manage their craft.
