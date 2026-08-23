import StudentOrderDetailClient from "./StudentOrderDetailClient";

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ orderId: "placeholder" }];
}

export default async function StudentOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = await params;
  return <StudentOrderDetailClient orderId={resolvedParams.orderId} />;
}
