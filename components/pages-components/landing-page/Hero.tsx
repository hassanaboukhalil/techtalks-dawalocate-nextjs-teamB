import Section from "../../layout/Section";

const Hero = () => {
  return (
    <Section className="h-screen flex-center flex-col">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight text-center">
        Find Medicines,
        <span className="block text-primary">Save Lives.</span>
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto text-center">
        Quickly locate nearby pharmacies with your needed medicines in stock.
        Connect patients, donors, pharmacies, and charities around hard-to-find
        medications.
      </p>
    </Section>
  );
};
export default Hero;
