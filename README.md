Here's a solid **README** for your project:  

---

# **Chat-TFU** 🗨️  

Chat-TFU is a privacy-focused messaging app inspired by Facebook Messenger—but without the surveillance. This is a personal project where I'm building a secure and feature-rich communication platform that respects user privacy.  

## **🚀 Features (Planned & In Progress)**  
✅ **Real-time Messaging** – Send and receive messages instantly  
✅ **End-to-End Encryption** – Your conversations stay private  
✅ **Image & Video Sharing** – Share media without compression nightmares  
✅ **Video & Voice Calls** – Secure, high-quality calls  
✅ **No Data Tracking** – Your data stays **yours**  

## **🔧 Tech Stack**  
- **Frontend:** Next.js 15 (App Router), React 19  
- **Backend:** Node.js (Serverless with Edge functions)  
- **Database:** PostgreSQL (Prisma ORM)  
- **Authentication:** Bcrypt.js, JWT (Jose), Cookies  
- **Real-time Messaging:** Supabase / SSE (Server-Sent Events)  

## **⚡ Getting Started**  
### **1. Clone the repository**  
```bash
git clone https://github.com/yourusername/chat-tfu.git
cd chat-tfu
```

### **2. Install dependencies**  
```bash
pnpm install
```

### **3. Set up environment variables**  
Create a `.env.local` file and configure your **database connection**, **JWT secrets**, and **Supabase keys**.  

### **4. Start the development server**  
```bash
pnpm dev
```

### **5. Database setup (if using PostgreSQL + Prisma)**  
```bash
npx prisma migrate dev
```

## **📜 Roadmap**  
☑️ Basic real-time chat  
☑️ Encrypted messaging  
⬜ Image & video uploads  
☑️ End-to-end encryption for messages  
⬜ Video & voice calls  
⬜ Group chats  
