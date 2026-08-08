"use client";

export default function StarField() {
  const stars = Array.from({ length: 120 });

  return (
    <>
      {stars.map((_, index) => (
        <span
          key={index}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
          }}
        />
      ))}
    </>
  );
}