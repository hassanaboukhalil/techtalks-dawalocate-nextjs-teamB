import { StaticImageData } from "next/image";
// import hassan_img from "../public/images/landing-page/our-team/hassan-abou-khalil.jpg";
// import zainab_img from "../public/images/landing-page/our-team/zainab-atris.jpeg";
// import mhmd_img from "../public/images/landing-page/our-team/mhmd-saleh.jpeg";
// import fatima_img from "../public/images/landing-page/our-team/fatima-hodroj.jpeg";
// import hadi_img from "../public/images/landing-page/our-team/hadi-orabi.jpeg";
import hassan_img from "../public/images/landing-page/our-team/hassan-abou-khalil.png";
import zainab_img from "../public/images/landing-page/our-team/zainab-atris.png";
import mhmd_img from "../public/images/landing-page/our-team/mhmd-saleh.png";
import fatima_img from "../public/images/landing-page/our-team/fatima-hodroj.png";
import hadi_img from "../public/images/landing-page/our-team/hadi-orabi.png";

export interface TeamMember {
  name: string;
  title: string;
  description: string;
  imageUrl: StaticImageData;
  linkedinUrl?: string;
}

const team: TeamMember[] = [
  {
    name: "Hassan Abou Khalil",
    title: "Full-Stack Software Engineer",
    description:
      "Full-Stack Software Engineer specializing in web and AI applications using technologies such as React.js, Next.js, Laravel, and Python. I build scalable, high-performance solutions with clean architecture, apply UI/UX best practices, and implement SEO optimization to deliver intuitive, user-centric, and highly discoverable products. I focus on transforming complex requirements into reliable, production-ready solutions that balance performance, usability, and maintainability.",
    imageUrl: hassan_img,
    linkedinUrl: "https://www.linkedin.com/in/hassan-abou-khalil/",
  },
  {
    name: "Zainab Atris",
    title: "Full-Stack Web Developer",
    description:
      "Computer Science student with a strong interest in AI, cybersecurity, and modern web technologies. I am a passionate software developer with hands-on experience in building web and mobile applications. I enjoy solving real-world problems through technology and have worked with modern frameworks and tools to design, develop, and improve user-focused solutions. I am continuously learning to strengthen my technical foundation and problem-solving skills.",
    imageUrl: zainab_img,
    linkedinUrl: "http://www.linkedin.com/in/zainab-atris-751b80320",
  },
  {
    name: "Mohammad Saleh",
    title: "Full-Stack Web Developer",
    description:
      "Full-Stack Developer with hands on experience in building scalable web applications using modern front-end and back-end technologies. Skilled in API design and integration (RESTful APIs), database design and management,and delivering clean, maintainable code. Experienced in developing responsive user interfaces, implementing secure back end logic, and optimizing application performance. Passionate about solving real world problems and continuously learning new technologies",
    imageUrl: mhmd_img,
    linkedinUrl: "https://www.linkedin.com/in/mohammad-saleh-762267379/",
  },
  {
    name: "Fatima Hodroj",
    title: "Full-Stack Web Developer",
    description:
      "Computer Science student and aspiring Full-Stack Developer with hands-on experience building full-stack web applications. Passionate about developing scalable, user-focused solutions and turning real-world problems into practical digital products.",
    imageUrl: fatima_img,
    linkedinUrl: "https://www.linkedin.com/in/fatima-hodroj",
  },
  {
    name: "Hadi Orabi",
    title: "Full-Stack Web Developer",
    description:
      " dedicated Computer Science student with a strong academic record and a passion for building technology that solves real-world problems. My expertise spans full-stack development, network systems, and hardware-software integration. I am committed to creating high-quality, user-centered solutions through a blend of technical excellence and analytical thinking. I pride myself on being a proactive collaborator and a fast learner. Beyond the code, I am focused on contributing to the professional society by working effectively within teams to deliver impactful results. I thrive in environments that challenge my technical skills and allow me to grow alongside other motivated professionals.",
    imageUrl: hadi_img,
    linkedinUrl: "https://www.linkedin.com/in/hadi-orabi-8a4667349/",
  },
];

export default team;
