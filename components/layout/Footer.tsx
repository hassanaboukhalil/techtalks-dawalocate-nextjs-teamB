import { FOOTER_LINKS, FOOTER_SOCIALS } from "./../../constants/footer";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="my-container mt-48 flex-center flex-col bg-background z-10 border-solid border-t-2 border-[#BBBBBB] relative">
      <div className="max-w-[90rem]">
        <div className="mt-16 flex flex-col lg:flex-row items-start justify-between gap-16 lg:gap-4 w-full">
          {/* DawaLocate and a summary about the platform */}
          <div className="flex flex-col lg:w-[30%]">
            <h3 className="text-h3 text-primary">DawaLocate</h3>
            <p className="mt-4">
              DawaLocate is a web platform that helps patients find nearby
              pharmacies with their needed medicine in stock, manage a digital
              health profile with QR health card, and connect with donations and
              charity campaigns.
            </p>
          </div>

          {/* Footer links and socials */}
          <div className="flex w-full justify-between lg:w-fit lg:justify-start lg:gap-24">
            {/* Footer links */}
            <div className="flex flex-col w-full gap-4">
              <p className="font-bold">Quick Links</p>
              <ul className="flex flex-col gap-2 text-gray">
                {FOOTER_LINKS.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="hover:text-[#0AA6C8]"
                  >
                    {item.label}
                  </Link>
                ))}
              </ul>
            </div>

            {/* Data and Socials */}
            <div className="flex flex-col gap-4 w-full">
              <p className="font-bold">Let&apos;s Connect</p>

              {/* Socials */}
              <div className="flex gap-2">
                {FOOTER_SOCIALS.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="p-2 border-solid border-1 border-[#BBBBBB] rounded-2xl z-10
                  hover:bg-gradient-to-r hover:from-[#0AA6C8] hover:to-[#0AA6C8] hover:transform hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300"
                    target="_blank"
                  >
                    <item.icon />
                  </Link>
                ))}
              </div>

              {/* Email and Location */}
              <div className="text-gray">
                <p>info@dawalocate.com</p>
                <p>Beirut, Lebanon</p>
              </div>
            </div>
          </div>
        </div>

        {/* copyright */}
        <div className="mt-16 w-full flex-center border-solid border-t-2 border-[#0AA6C8]">
          <span className="pt-4 pb-2 text-sm text-gray">
            © 2025 DawaLocate. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
