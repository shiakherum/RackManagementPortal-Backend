### The Philosophy: Enterprise-Grade Structure

* **Controllers:** Responsible *only* for handling the request and response cycle. They parse incoming requests, call the appropriate service method, and format the final response (or error) to send back to the client. They should not contain any business logic or database queries.
* **Services:** Contain all the business logic. If you need to calculate token costs, check for booking conflicts, process a payment, or decide if a user is eligible for an action, that logic lives here. Services orchestrate calls to one or more repositories.
* **Repositories:** The only layer that interacts directly with the database. They handle all the MongoDB query logic using Mongoose. This isolates your database operations, making it easier to manage, optimize, or even switch databases in the future.
* **Models:** Define the Mongoose schemas and models for our MongoDB collections. This is the blueprint for our data.

---

### Project Index & Step-by-Step Roadmap

Here is the complete index of how we will structure and build the application from an empty folder. We will tackle each phase in order.

**Phase 0: Project Scaffolding & Foundational Setup**
1.  **Directory Structure:** Create the complete backend folder structure for our enterprise application.
2.  **Initial Setup:** Initialize `npm`, install core dependencies (`express`, `mongoose`, `dotenv`, `cors`).
3.  **Server Entry Point:** Create the main `index.js` or `server.js` file.
4.  **Environment Variables:** Set up the `.env` file for configuration management.
5.  **Database Connection:** Create a dedicated module to handle the MongoDB connection using Mongoose.
6.  **Core Error Handling:** Implement a centralized error handling middleware.
7.  **Logging Setup:** Integrate a robust logger like Winston for application-level logging.

**Phase 1: Core Models & Authentication**
1.  **Define Mongoose Models:** Create the schema files for all our database collections (`User`, `TokenPack`, `Rack`, `Booking`, etc.), incorporating all the new client requirements.
2.  **User Registration API:** Build the Controller, Service, and Repository for user signup (email/password), including password hashing with `bcryptjs`.
3.  **Authentication API:**
    * Implement JWT generation upon successful login.
    * Create a login endpoint.
    * Set up middleware to protect routes by verifying the JWT.
4.  **Role-Based Access Control (RBAC):** Create a middleware to restrict access based on user roles (`Admin`, `Power User`, `Standard User`).
5.  **Social Authentication:** Integrate Google Login using Passport.js (`passport-google-oauth20`).
6.  **Password Management:** Build the "Forgot Password" and "Reset Password" flow using secure tokens and email.

**Phase 2: The Token Economy**
1.  **Token Pack Management (Admin):** Build the full CRUD API (`Create`, `Read`, `Update`, `Delete`) for an Admin to manage token packs (e.g., "100 Tokens for $10").
2.  **User Token Purchase Flow:**
    * API for users to view available token packs.
    * Integrate Razorpay: Create an order on the backend when a user decides to buy a pack.
    * Implement Razorpay webhook to listen for successful payments.
    * Upon successful payment, update the user's token balance in the `User` model.

**Phase 3: Rack & Booking Management**
1.  **Rack Management API (Admin):**
    * Build the CRUD API for Racks.
    * The `Rack` model will include fields for `availableAciVersions` (as an array of strings), `preConfigOptions`, etc. This makes it modular as requested.
    * API to toggle rack status between `available` and `not available` (for maintenance).
2.  **Booking Engine API (User):**
    * **View Availability:** API to fetch available time slots for a given rack, showing a calendar view.
    * **Create Booking:** The core logic. The service will:
        * Validate the requested time slot.
        * Check for conflicts.
        * Retrieve the user's token balance.
        * Calculate the required tokens for the booking duration.
        * If tokens are sufficient, create the booking record and deduct tokens from the user.
        * The booking record will store the user's selected ACI version and other pre-config choices.
    * **Cancel Booking:** API to cancel a booking. The service will implement the penalty logic (e.g., if `booking.startTime - now < 4 hours`, refund 50% of tokens, otherwise 100%).
3.  **Waitlist & Notification Feature:**
    * API for a user to join a waitlist for a fully booked time slot.
    * When a booking is canceled, the service will check if there are users on the waitlist for that slot and trigger a notification.

**Phase 4: Integrations & Automation**
1.  **Python Script Execution Service:**
    * Create a Node.js service that uses the `child_process` module to securely call Python scripts.
    * This service will be triggered after a successful booking to start the provisioning process, passing parameters like `rackId`, `aciVersion`, etc.
2.  **Telegram Bot Integration:**
    * Create a `TelegramService` in Node.js.
    * Integrate this service into the Booking and Admin modules to send notifications for:
        * Booking confirmation/cancellation.
        * Waitlist availability alerts.
        * System alerts (e.g., admin disables a rack).
3.  **Scheduled Jobs (CRON):**
    * Use `node-cron` or a similar library.
    * Create schedulers for:
        * Running power-on scripts just before a session starts.
        * Running power-off/de-provisioning scripts after a session ends.
        * Sending pre-session reminder notifications.

**Phase 5: Learning Management & Admin Portal Features**
1.  **LMS API:** Build the CRUD APIs for Courses, Topics, and Resources, along with endpoints for users to track their progress.
2.  **Admin Dashboard API:** Create aggregated endpoints to fetch statistics for the admin dashboard (e.g., total bookings, revenue, active users).
3.  **User Management API (Admin):** Build endpoints for admins to view, enable, or disable users.
4.  **Logging & History API:** Endpoints to view various logs (bookings, payments, user activity).

**Phase 6: Frontend Development (React/Next.js)**
1.  **Project Setup:** Initialize a Next.js application.
2.  **Structure:** Set up a clean structure (`/pages`, `/components`, `/lib`, `/hooks`, `/styles`, `/context` or `/store` for state management).
3.  **API Integration:** Create a centralized API client (e.g., using Axios) to communicate with our backend.
4.  **Component Development:** Build out the UI components for each feature, page by page, integrating with the backend APIs we've built.
5.  **State Management:** Implement a global state management solution (like Redux Toolkit or Zustand) to handle user auth state, token balance, etc.

---
