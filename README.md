# 🛍️ College Dealz – Community-Based Reselling Platform

[![Demo](https://img.shields.io/badge/Demo-College%20Dealz-blue?style=for-the-badge&logo=internet-explorer)](https://drive.google.com/file/d/1RnacIhkwju0lFp-iG7TfbVP8FpRYwolU/view?usp=drive_link)

---

## 🚀 Overview

**College Dealz** is a community-based platform that makes it easy for students to buy and sell used products within universities. It supports everything — from login, product posting, and real-time chat, to feedback and admin controls.

What makes it unique:

* ✅ **Wantlist**: Buyers can post what they *need*, not just browse listings. They get real-time alerts when matching items are posted.
* 💬 **Live Chat**: One-on-one messaging is powered by WebSocket (STOMP), allowing smooth and instant communication between users.
* ☁️ **Cloud Hosted**: Deployed using **AWS EC2, RDS, and S3**, ensuring scalability and fast performance in real-world use.

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
- **Wantlist**: Add specific product needs — get **real-time notifications** when any seller lists a **matching product**.
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



