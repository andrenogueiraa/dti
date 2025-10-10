export default function LoadingPage() {
  return (
    <div className="fixed inset-0 flex justify-center items-center h-dvh">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
