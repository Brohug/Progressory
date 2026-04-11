# Progressory

Progressory is a full-stack SaaS-style web application built for Brazilian Jiu-Jitsu academies to manage curriculum structure, class logging, attendance, member progression, staff accounts, reporting, and an internal gym library. Built with React, Node.js, Express, MySQL, JWT, and REST APIs, the app helps coaches stay aligned on what is taught while giving gym owners better visibility into curriculum consistency and student development.

---

## Features

### Curriculum Management
- Create and manage programs
- Create and manage curriculum topics
- Organize topics by parent/child relationship
- Track positions, concepts, techniques, drills, and more

### Class Logging
- Create class records by program, date, and time
- Attach curriculum topics to classes
- Attach training entries to classes
- Record teaching methods and scenarios used in class

### Attendance Tracking
- Add members to classes
- Track attendance status
- Remove attendance records when needed

### Member Progression
- Create and manage member records
- Track progression by curriculum topic
- Save notes and progression status such as:
  - not_started
  - introduced
  - developing
  - competent

### Reporting
- Recent classes report
- Topic coverage report
- Neglected topics report
- Training method usage report

### Gym Library
- Create internal gym library entries
- Link entries to programs and topics
- Store notes, drill ideas, concept entries, and video links
- Set entries as coach-only or member-visible

### Staff Management
- Owner-controlled staff account creation
- Create coach/admin accounts
- Deactivate staff accounts
- Safer separation between staff logins and tracked student members

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express

### Database
- MySQL

### Authentication
- JWT
- bcryptjs

---

## Project Structure

```text
client/
  src/
    api/
    components/
    context/
    pages/

server/
  src/
    config/
    controllers/
    middleware/
    routes/