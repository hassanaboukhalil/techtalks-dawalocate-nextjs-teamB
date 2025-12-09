import Logo from "./Logo";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <header className="my-container sections-max-width w-full flex justify-between items-center py-4 absolute top-0 z-50 bg-background border-solid border-b-2 border-[#BBBBBB]">
      <Logo withTitle />
      <Navbar />
    </header>
  );
};
export default Header;
