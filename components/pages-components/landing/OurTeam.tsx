import team from "@/constants/the-team";
import Image from "next/image";
import { Linkedin } from "lucide-react";

const OurTeam = () => {
  return (
    <section className="bg-background pb-20" id="team">
      {/* Top Colored Section */}
      <div className="bg-primary pt-20 pb-32 px-4 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Meet Our Team
        </h2>
        <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
          The passionate developers behind DawaLocate
        </p>
      </div>

      {/* Team Grid - Overlapping */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 justify-items-center">
          {team.map((member, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group w-full"
            >
              {/* Member Image */}
              <div className="relative w-40 h-40 mb-4 rounded-full overflow-hidden border-[6px] border-white shadow-lg bg-white">
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Member Info */}
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                  {member.name}
                </h3>
                <p className="text-primary text-xs font-semibold mb-3 uppercase tracking-wide">
                  {member.title}
                </p>

                {/* Social Icons */}
                {member.linkedinUrl && (
                  <div className="flex gap-3">
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#0077b5] transition-colors"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
