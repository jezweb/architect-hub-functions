# Conference Registration System: Database & Admin UI Plan

**Version:** 1.0
**Date:** 2025-05-06

## 1. Overview

This document outlines the proposed database design and admin frontend visualization strategy for the conference registration system.

*   **Frontend:** Angular
*   **Backend:** Symfony

**Core Functionality:**
*   Attendees register for a conference.
*   Attendees select a specific booth during registration.
*   Booths have predefined capacities (5, 10, 20, 30).
*   Admins can view a visual representation of booths (similar to Ticketmaster).
*   Admins can click a booth to see its current registration status and potentially the list of registered attendees.

## 2. Database Design (Relational - e.g., PostgreSQL/MySQL)

We'll use a relational database structure.

**Tables:**

*   **`conferences`**
    *   `id` (PK, Auto-increment, INT/BIGINT)
    *   `name` (VARCHAR, NOT NULL)
    *   `start_date` (DATETIME/TIMESTAMP, NOT NULL)
    *   `end_date` (DATETIME/TIMESTAMP, NOT NULL)
    *   `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
    *   `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP on update)
*   **`booths`**
    *   `id` (PK, Auto-increment, INT/BIGINT)
    *   `conference_id` (FK references `conferences.id`, INT/BIGINT, NOT NULL)
    *   `name` (VARCHAR, NOT NULL) - e.g., "Booth A1", "Sponsor Area 5"
    *   `capacity` (INT, NOT NULL) - Values like 5, 10, 20, 30
    *   `location_identifier` (VARCHAR, NULLABLE) - Optional identifier for mapping on the visual layout (e.g., "grid_x1_y5")
    *   `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
    *   `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP on update)
    *   *Index:* `conference_id`
*   **`attendees`**
    *   `id` (PK, Auto-increment, INT/BIGINT)
    *   `first_name` (VARCHAR, NOT NULL)
    *   `last_name` (VARCHAR, NOT NULL)
    *   `email` (VARCHAR, UNIQUE, NOT NULL)
    *   `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
    *   `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP on update)
    *   *Index:* `email`
*   **`registrations`**
    *   `id` (PK, Auto-increment, INT/BIGINT)
    *   `conference_id` (FK references `conferences.id`, INT/BIGINT, NOT NULL)
    *   `attendee_id` (FK references `attendees.id`, INT/BIGINT, NOT NULL)
    *   `booth_id` (FK references `booths.id`, INT/BIGINT, NOT NULL)
    *   `registration_time` (TIMESTAMP, default CURRENT_TIMESTAMP)
    *   `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
    *   `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP on update)
    *   *Indexes:* `conference_id`, `attendee_id`, `booth_id`
    *   *Unique Constraint:* (`conference_id`, `attendee_id`) - An attendee can only register once per conference.
    *   *Unique Constraint:* (`conference_id`, `booth_id`, `attendee_id`) - Ensures an attendee isn't double-booked for the same booth (covered by the previous constraint but explicit).

**Relationships:**

*   One `conference` has many `booths`.
*   One `conference` has many `registrations`.
*   One `attendee` can have many `registrations` (across different conferences).
*   One `booth` belongs to one `conference`.
*   One `booth` can have many `registrations` (up to its `capacity`).
*   One `registration` links one `attendee` to one `booth` for one `conference`.

**Capacity Handling:**

*   The application logic (Symfony backend) MUST check the current number of registrations for a specific `booth_id` against the `booths.capacity` *before* creating a new `registrations` record. This should ideally be done within a database transaction to prevent race conditions.

## 3. Backend API Endpoints (Symfony)

The Symfony backend will need to expose RESTful API endpoints:

*   **Conferences:**
    *   `GET /api/conferences` - List conferences.
    *   `GET /api/conferences/{id}` - Get conference details.
*   **Booths:**
    *   `GET /api/conferences/{conf_id}/booths` - List booths for a conference (include current registration count).
    *   `GET /api/booths/{id}` - Get specific booth details (include capacity and current registration count).
*   **Attendees:**
    *   `POST /api/attendees` - Create a new attendee (or find existing by email).
*   **Registrations:**
    *   `POST /api/registrations` - Create a new registration (handles attendee creation/lookup and booth capacity check).
    *   `GET /api/booths/{booth_id}/registrations` - List attendees registered for a specific booth (Admin only).
    *   `GET /api/attendees/{attendee_id}/registrations` - List registrations for an attendee.

## 4. Admin Frontend Visualization (Angular)

**Goal:** Display booths visually, allow clicking for status.

**Approach:**

1.  **Data Fetching:**
    *   The Angular admin component will fetch booth data from the `GET /api/conferences/{conf_id}/booths` endpoint. This endpoint should return the list of booths, including their `id`, `name`, `capacity`, `location_identifier` (if used), and the *current count* of registrations for each booth.
2.  **Visual Layout:**
    *   **Option A (Simple Grid):** Use CSS Grid or Flexbox to arrange booth representations (e.g., simple `div` elements) in a grid layout. The `location_identifier` could potentially map to grid coordinates if needed, otherwise arrange sequentially.
    *   **Option B (SVG/Canvas):** For a more literal "Ticketmaster-like" map, use SVG or Canvas.
        *   **SVG:** Define booth shapes (rectangles, polygons) within an SVG element. Booth data can be bound to these shapes. Easier for interactivity and styling with CSS. Libraries like `d3.js` could help, but might be overkill. Standard Angular data binding might suffice.
        *   **Canvas:** Draw booth shapes programmatically. Potentially better performance for very large numbers of booths, but more complex to handle interactivity and styling.
    *   **Recommendation:** Start with **Option A (Simple Grid)** or **Option B (SVG with basic shapes)** unless a highly precise map layout is a strict requirement.
3.  **Styling & Status:**
    *   Style each booth element based on its status (derived from `current_registration_count` vs `capacity`):
        *   Available: Green background / border
        *   Nearing Capacity (e.g., >80% full): Orange background / border
        *   Full: Red background / border / disabled appearance
    *   Display key info directly on the booth element (e.g., Name, "5/10 registered").
4.  **Interactivity:**
    *   Add a `(click)` handler to each booth element in the Angular template.
    *   On click, trigger a function that:
        *   Fetches detailed registration data for that booth using `GET /api/booths/{booth_id}/registrations`.
        *   Displays this information in a modal dialog, sidebar panel, or dedicated detail area. This detail view would show the list of registered attendees (first name, last name, email).

**Potential Angular Libraries:**

*   None strictly required for the basic grid/SVG approach.
*   Consider UI component libraries (like Angular Material, NG-Bootstrap, PrimeNG) for modals, panels, and consistent styling.

## 5. Next Steps

1.  Refine database schema based on any further specific requirements.
2.  Implement Symfony backend entities, repositories, and API controllers.
3.  Develop Angular admin components for booth visualization and interaction.
4.  Implement attendee registration flow.