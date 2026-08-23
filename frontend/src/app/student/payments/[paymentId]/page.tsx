import PaymentDetailClient from "./PaymentDetailClient";

export function generateStaticParams() {
  return [{ paymentId: "placeholder" }];
}

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const resolvedParams = await params;
  return <PaymentDetailClient paymentId={resolvedParams.paymentId} />;
}
