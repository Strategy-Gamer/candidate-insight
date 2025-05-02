import type { NextPage } from 'next';
import Member from '@/components/Member';
import "@/styles/pages/aboutus.css";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  githubUrl: string;
  linkedinUrl: string;
}

const members: Member[] = [
  {
    id: "1",
    firstName: "Buck",
    lastName: "Arthur",
    role: "Team Lead",
    githubUrl: "https://github.com/barthur426",
    linkedinUrl: "https://www.linkedin.com/in/buck-arthur-9b0ba5229/"
  }, {
    id: "2",
    firstName: "Brenna",
    lastName: "Brentley",
    role: "Back-End Developer",
    githubUrl: "https://github.com/bbentley4",
    linkedinUrl: "https://www.linkedin.com/in/brenna-bentley-40150910a"
  }, {
    id: "3",
    firstName: "Adison",
    lastName: "White",
    role: "Back-End Developer",
    githubUrl: "https://github.com/Strategy-Gamer",
    linkedinUrl: "https://www.linkedin.com/in/adison-white"
  }, {
    id: "4",
    firstName: "Sully",
    lastName: "Mohyuddin",
    role: "Full Stack Developer",
    githubUrl: "https://github.com/smohyud4",
    linkedinUrl: "https://www.linkedin.com/in/sulaiman-mohyuddin/"
  }, {
    id: "5",
    firstName: "Logan",
    lastName: "Caraway",
    role: "Front-End Developer",
    githubUrl: "https://github.com/logannick02",
    linkedinUrl: "https://www.linkedin.com/in/logan-caraway"
  }, {
    id: "6",
    firstName: "Logan",
    lastName: "Lett",
    role: "Front-End Developer",
    githubUrl: "https://github.com/10-Squares",
    linkedinUrl: "https://www.linkedin.com/in/logan-lett-3b0628324/"
  }
];



const AboutUs: NextPage = () => {
  return (
    <div className="members-container">
      {members.map((member) => (
        <Member
          key={member.id}
          firstName={member.firstName}
          lastName={member.lastName}
          role={member.role}
          githubUrl={member.githubUrl}
          linkedinUrl={member.linkedinUrl}
        />
      ))}
    </div>
  );
};

export default AboutUs;
