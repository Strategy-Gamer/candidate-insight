import "@/styles/globals.css";
import "@/styles/candidatecard.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Candidate Insight",
  description: "Web Application for Candidate Insight",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#ffffff]">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
