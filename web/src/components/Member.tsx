import Link from 'next/link';
import Image from 'next/image';
import "@/styles/components/member.css";

interface MemberProps {
     firstName: string;
     lastName: string;
     role: string;
     githubUrl: string;
     linkedinUrl: string;
}

const Member: React.FC<MemberProps> = ({firstName, lastName, role, githubUrl, linkedinUrl}: MemberProps) => {
     return (
          <div className="member-card">
               <div className="name-section">
                    <h1 className="full-name">{firstName} {lastName}</h1>
               </div>

               <h2 className="role">{role}</h2>

               <div className="social-links">
                    <Link href={githubUrl}>
                         <Image src="images/github.svg" alt="Github Icon" height="50" width="50" className="media-icon"></Image>
                    </Link>
                    <Link href={linkedinUrl}>
                         <Image src="images/linkedin.svg" alt="Linkedin Icon" height="50" width="50" className="media-icon"></Image>
                    </Link>
               </div>
          </div>
     );
};

export default Member;