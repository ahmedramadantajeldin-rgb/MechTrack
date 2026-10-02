# Admin Guide — ME Portal

This guide explains how to manage content on the Mechanical Engineering Portal.

## Logging In

1. Go to `/admin/login`
2. Enter your administrator email and password
3. Click **Sign In**

If you see "You do not have administrator access", contact the system administrator.

## Dashboard

The admin dashboard shows:
- Total subjects, tasks, materials, and announcements
- Overdue tasks (red alert)
- Tasks due today (orange alert)
- Upcoming calendar events
- Quick action buttons to create new content

## Managing Subjects

### Add a Subject
1. Click **Add Subject** button or go to **Subjects** in the sidebar
2. Fill in: Name, Code, Description, Instructor, Semester, Academic Year
3. Choose a display color
4. Toggle **Active** to make it visible to students
5. Click **Create Subject**

### Edit a Subject
1. Go to **Subjects**
2. Click the pencil icon next to the subject
3. Make your changes
4. Click **Update Subject**

### Delete a Subject
1. Click the trash icon next to the subject
2. Confirm in the dialog

> ⚠️ Deleting a subject will leave tasks and materials without a subject (they won't be deleted, but will become "uncategorized").

## Managing Tasks

### Add a Task
1. Go to **Tasks** → **Add Task**
2. Fill in:
   - **Title**: Descriptive name (e.g., "Chapter 3 Assignment")
   - **Subject**: Which subject this belongs to
   - **Type**: Assignment / Quiz / Sheet / Project / Exam
   - **Deadline**: Date when it's due
   - **Priority**: Low / Medium / High / Urgent
   - **Description**: Detailed instructions
   - **External URL**: Link to YouTube, Google Drive, or any website
   - **Notes**: Additional notes visible to students
3. Click **Create Task**

### Upload an Attachment
After creating a task, use the edit page to add a file attachment through the API.

## Managing Materials

### Add a YouTube Video
1. Go to **Materials** → **Add Material**
2. Set Type to **YouTube Video**
3. Enter the YouTube URL (e.g., `https://youtube.com/watch?v=...`)
4. Add title and description
5. Click **Create Material**

### Add a Google Drive File
1. In Google Drive, right-click the file → **Share** → **Copy link**
2. In the admin, set Type to **Google Drive**
3. Paste the link as the URL

### Upload a File (PDF, Word, PowerPoint, etc.)
1. Create the material first with Type set to **PDF** (or appropriate type)
2. Use the edit page to manage the file

## Managing Announcements

### Create an Announcement
1. Go to **Announcements** → **New Announcement**
2. Enter title and content
3. Set priority: Normal / Important / Urgent
4. Optionally link to a subject
5. Toggle **Publish** to make it visible to students
6. Click **Create**

### Publish/Unpublish
Click the eye icon on any announcement to toggle its visibility.

## Managing Calendar Events

1. Go to **Calendar** → **Add Event**
2. Set event type: Exam / Quiz / Assignment / Project / Lecture / General
3. Enter date and optional time
4. Add location if applicable
5. Click **Create Event**

## Managing Administrators

### Grant Admin Access
1. Go to **Administrators**
2. Enter the user's email address
3. Click **Grant Admin Access**

> The user must have already registered an account on the portal.

### Remove Admin Access
1. Go to **Administrators**
2. Click **Remove** next to the admin
3. Confirm in the dialog

Note: You cannot remove your own admin access.

## Tips

- **Deadlines**: Always set deadlines so students see the countdown ("3 Days Left", "Due Today", "Overdue")
- **Subjects**: Use the display order number to control the order subjects appear
- **Priority**: Use "Urgent" priority sparingly so it retains impact
- **Announcements**: Use draft mode to prepare announcements before publishing
