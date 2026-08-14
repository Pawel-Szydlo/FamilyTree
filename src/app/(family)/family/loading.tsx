export default function FamilyHubLoading() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="h-10 w-36 rounded-2xl bg-secondary" />
        <div className="mt-14 h-10 max-w-md rounded-xl bg-secondary" />
        <div className="mt-4 h-5 max-w-xl rounded-xl bg-secondary" />
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <div className="h-36 rounded-3xl bg-secondary" />
          <div className="h-36 rounded-3xl bg-secondary" />
        </div>
      </div>
    </main>
  );
}
