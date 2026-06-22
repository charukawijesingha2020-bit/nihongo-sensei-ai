export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold">
        NihongoSensei AI
      </h1>

      <p className="mt-4 text-lg">
        Master JLPT N4 with AI
      </p>

      <div className="mt-8 flex gap-4">
        <button className="px-4 py-2 border rounded">
          Get Started
        </button>

        <button className="px-4 py-2 border rounded">
          Login
        </button>
      </div>
    </main>
  );
}