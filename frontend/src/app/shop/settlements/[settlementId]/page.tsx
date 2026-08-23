import SettlementDetailClient from "./SettlementDetailClient";

export function generateStaticParams() {
  return [{ settlementId: "placeholder" }];
}

export default async function SettlementDetailPage({
  params,
}: {
  params: Promise<{ settlementId: string }>;
}) {
  const resolvedParams = await params;
  return <SettlementDetailClient settlementId={resolvedParams.settlementId} />;
}
