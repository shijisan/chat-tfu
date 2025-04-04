# **Chat-TFU** 🗨️  

Chat-TFU is a privacy-focused messaging app inspired by Facebook Messenger—but without the surveillance. This is a personal project where I'm building a secure and feature-rich communication platform that respects user privacy.  

## **🔧 Tech Stack**  
- **Frontend:** Next.js 15 (App Router), React 19  
- **Backend:** Node.js (Serverless with Edge functions)  
- **Database:** PostgreSQL (Prisma ORM)  
- **Authentication:** Bcrypt.js, JWT (Jose), Cookies, Reddis, Crypto
- **Real-time Messaging:** Listen to DB changes then update to show "Real-time Messages"

## **⚡ Getting Started**  
### **1. Clone the repository**  
```bash
git clone https://github.com/shijisan/chat-tfu.git
cd chat-tfu
```

### **2. Install dependencies**  
```bash
pnpm install
```

### **3. Set up environment variables**  
Create a `.env.local` file and configure your **database connection**, **JWT secrets**, **Nodemailer user and pass**, **Redis URL**, and **Supabase keys**.  

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
☑️ End-to-end encryption for messages  
☑️ Reactions to messages  
☑️ Mobile responsiveness web app  
☑️ Video & voice calls  
⬜ Load states  
⬜ Block Contacts  
⬜ Image & video uploads  
⬜ Group chats  
⬜ Mobile App  
