interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const Section = ({ children, className, id }: SectionProps) => {
  return (
    <section className={`my-container ${className || ""}`} id={id ? id : ""}>
      {children}
    </section>
  );
};

export default Section;
