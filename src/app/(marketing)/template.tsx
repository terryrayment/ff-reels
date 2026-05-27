export default function MarketingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  // View Transitions API handles the cross-fade between marketing routes.
  // No framer-motion fade-in here because that initial opacity:0 was
  // blocking MuxPlayer autoplay and clashing with the view transition.
  return <>{children}</>;
}
