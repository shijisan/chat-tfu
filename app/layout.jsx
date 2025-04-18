import { Poppins, Roboto_Flex, Noto_Color_Emoji } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const notoColorEmoji = Noto_Color_Emoji({
  subsets: ["emoji"],
  weight: "400",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  weight: "variable",
});

export const metadata = {
  title: "Chat-TFU",
  description: "Chatting app with p2p video call.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${[robotoFlex.className]} antialiased`}
      >
        <Nav />
        {children}
      </body>
    </html>
  );
}
