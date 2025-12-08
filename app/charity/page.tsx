import { LogoutButton } from "@/components/ui/LogoutButton";

const page = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Charity Dashboard</h1>
        <LogoutButton />
      </div>
      <div>Charity page</div>
    </div>
  );
};
export default page;
