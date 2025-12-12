import { FOOTER_LINKS, FOOTER_SOCIALS } from "./../../constants/footer";
import Link from "next/link";
import { Mail, MapPin, Heart } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="my-container py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div>
                  <Logo withTitle={false} />
                </div>
                <h3 className="text-2xl font-bold text-white">DawaLocate</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Connecting patients, pharmacies, and charities to ensure
                everyone in Lebanon gets the medicine they need. Find medicines
                faster, donate smarter, help better.
              </p>
              <div className="flex flex-col gap-3 text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  <a
                    href="mailto:info@dawalocate.com"
                    className="hover:text-(--color-primary)! transition-colors"
                  >
                    info@dawalocate.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  <span>Beirut, Lebanon</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="flex flex-col gap-3">
                {FOOTER_LINKS.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.link}
                      className="text-gray-400 hover:text-(--color-primary)! transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect & Get Started */}
            <div>
              <h4 className="font-bold text-white mb-4">Get Started</h4>
              <ul className="flex flex-col gap-3 mb-6">
                <li>
                  <Link
                    href="/login"
                    className="text-gray-400 hover:text-(--color-primary)! transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-gray-400 hover:text-(--color-primary)! transition-colors"
                  >
                    Register
                  </Link>
                </li>
              </ul>

              {/* Socials */}
              <h4 className="font-bold text-white mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {FOOTER_SOCIALS.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-(--color-primary)! hover:scale-105 transition-all duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                  >
                    <item.icon className="size-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 DawaLocate. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link
                href="/privacy"
                className="hover:text-(--color-primary)! transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-(--color-primary)! transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
