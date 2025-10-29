const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
          Repository Siap Digunakan
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Blank Repository
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Repository kosong yang siap untuk dikembangkan. Mulai bangun proyek Anda di sini.
        </p>
      </div>
    </div>
  );
};

export default Index;
