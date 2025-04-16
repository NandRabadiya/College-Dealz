# 🛍️ College Dealz – Community-Based Reselling Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-College%20Dealz-blue?style=for-the-badge&logo=internet-explorer)](https://college-dealz.vercel.app/)


---

## 🚀 Overview

College Dealz helps connect buyers and sellers from the same or different universities with real-time communication, product listing, and personalized notifications. From authentication to admin controls, the platform is built to handle every part of the reselling journey with ease and clarity.

---

<details>
<summary>✨ Features</summary>

### 🔐 Authentication
- Sign up & login via email
- Login with Google OAuth

### 📦 Product Operations
- Post, edit, delete, repost products
- View product details
- Mark product as sold
- Pagination for fast loading

### 💬 Chat Module
- Real-time 1:1 chat using WebSocket & STOMP

### 🔔 Notification System
- Receive alerts for:
  - Wantlist notificatiion
  - Matched wantlist items

### 📝 Feedback & Ratings
- Buyers can leave 1–5 star ratings and comments 
- Admin can view feedback summary for moderation

### 🧾 Profile & Dashboard
- View personal deals
- Switch between user and admin dashboard

### 🧑‍💼 Admin Controls
- Manage users, products, universities
- Assign admin roles
- Send warnings via email
- Switch back to user mode

### 🧡 Wishlist & Wantlist
- **Wishlist**: Bookmark interesting products to view or purchase later
- **Wantlist**: Add specific product needs — get **real-time notifications** when any seller lists a **matching product**, regardless of where it’s posted (deal, profile, etc.)

</details>


---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Vite, Context API
- **Backend:** Spring Boot, Spring Security, WebSocket (STOMP), JPA
- **Database:** TiDB (dev), AWS RDS (prod)
- **Storage:** AWS S3
- **Hosting:**
  - Frontend: Vercel
  - Backend: Railway (dev), AWS EC2 (prod)

---

## 📂 Project Structure

- `/frontend` – React app with modular pages, routing, and global state
- `/backend` – Spring Boot REST APIs and WebSocket configuration

---


## 🎯 Vision

What started as a **university-specific reselling platform** is now equipped to scale as a **community-focused marketplace**, breaking the limitations of domain-based listing.

---

## 🤝 Acknowledgements

We sincerely thank our mentor **Prof. Kunal J. Sahitya** for his continuous guidance and **Dr. Vipul Dabhi** for his continuous support. This project reflects not just our academic foundation but also our applied skills in building scalable, real-world software.



