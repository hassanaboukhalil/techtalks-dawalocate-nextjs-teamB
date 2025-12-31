import team from "@/constants/the-team";
import Image from "next/image";
import { Linkedin } from "lucide-react";

const OurTeam = () => {
  return (
    <section className="bg-primary py-20" id="team">
      {/* Section Header */}
      <div className="text-center mb-16 px-4">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Meet Our Team
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          The passionate developers behind DawaLocate
        </p>
      </div>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 justify-items-center">
          {team.map((member, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group w-full max-w-[240px]"
            >
              {/* Card Container */}
              <div className="relative w-full">
                {/* Member Image - positioned to overlap */}
                <div className="relative z-10 w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#2750b8] to-[#af68e3]">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className={`object-cover transition-transform duration-500 ${
                      member.name === "Zainab Atris"
                        ? "object-[center_15%]"
                        : "object-center"
                    } ${
                      member.name === "Mohammad Saleh" ||
                      member.name === "Hadi Orabi"
                        ? "scale-125"
                        : ""
                    }`}
                  />
                </div>

                {/* White Card - behind image */}
                <div className="bg-card rounded-2xl pt-24 pb-6 px-4 -mt-20 flex flex-col items-center shadow-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    {member.name}
                  </h3>

                  <span className="inline-block border-2 bg-tertiary text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                    {member.title}
                  </span>

                  {/* Social Icons */}
                  <div className="flex gap-3">
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-tertiary transition-colors"
                        aria-label={`${member.name}'s LinkedIn`}
                      >
                        <Linkedin className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
