export const metadata = {
  title: "Maimará · Panel de administración",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {children}
    </div>
  );
}
