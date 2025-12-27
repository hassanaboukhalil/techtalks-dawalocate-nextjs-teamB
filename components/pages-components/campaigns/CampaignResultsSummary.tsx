interface CampaignResultsSummaryProps {
  showing: number;
  total: number;
  searchMedicine?: string;
  searchCharity?: string;
}

export default function CampaignResultsSummary({
  showing,
  total,
  searchMedicine,
  searchCharity,
}: CampaignResultsSummaryProps) {
  if (showing === 0) return null;

  return (
    <div className="mt-8 text-center">
      <p className="text-gray-600">
        Showing <span className="font-semibold">{showing}</span> of{" "}
        <span className="font-semibold">{total}</span> campaign(s)
        {(searchMedicine || searchCharity) && (
          <>
            {" "}
            matching{" "}
            {[
              searchMedicine && `medicine: "${searchMedicine}"`,
              searchCharity && `charity: "${searchCharity}"`,
            ]
              .filter(Boolean)
              .join(", ")}
          </>
        )}
      </p>
    </div>
  );
}
