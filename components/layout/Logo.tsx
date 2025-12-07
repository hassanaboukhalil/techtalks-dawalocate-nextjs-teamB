import Image from "next/image";
import Link from "next/link";
import logo from "./../../public/Logo.svg";

interface LogoProps {
  withTitle: boolean;
  width?: number;
  height?: number;
}

const Logo = ({ withTitle, width = 32, height = 32 }: LogoProps) => {
  return (
    <Link
      href="/"
      className="flex justify-center items-center gap-4 cursor-pointer"
    >
      <Image src={logo} alt="logo" width={width} height={height} />
      {withTitle && (
        <span className="text-body-4">Hassan | Software Engineer</span>
      )}
    </Link>
  );
};

export default Logo;
