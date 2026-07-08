# Feedback & Comments

Effective communication is facilitated through a commenting system attached to the weekly reports.

## 1. Leaving Comments
- **Contextual Feedback**: Both managers and team members can leave comments on specific reports.
- **Manager Feedback**: Managers use comments to provide constructive feedback, ask for clarification on specific tasks, or provide reasons for rejecting a report.
- **Team Member Replies**: Team members can reply to comments, creating a threaded dialogue directly tied to the weekly progress.

## 2. Comment Data Structure
- Comments are linked to specific `WeeklyReport` entities.
- Each comment tracks the author (`User`), the timestamp, and the comment text.

## 3. UI Integration
- The frontend dynamically displays comments alongside the report details.
- Real-time or optimistic UI updates ensure that when a comment is posted, it appears immediately in the conversation thread.
