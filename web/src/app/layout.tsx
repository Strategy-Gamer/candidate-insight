import "@/styles/globals.css";
import "@/styles/components/candidatecard.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Candidate Insight",
  description: "Web Application for Candidate Insight",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#ffffff]">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
