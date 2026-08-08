type Props = {
  children: React.ReactNode;
};

/**
 * Premium Glass Card — Deep glassmorphism
 * Apple Vision Pro inspired window
 */
export default function GlassCard({ children }: Props) {
  return (
    <div className="deep-glass group">
      {/* Environment reflection overlay — warm top-right + cool bottom-left */}
      <div className="deep-glass-reflection" />

      {/* Bottom rim cool light reflection */}
      <div className="deep-glass-rim" />

      {/* Light sweep on hover */}
      <div className="deep-glass-sweep" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

