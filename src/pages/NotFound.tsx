import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <Link to="/" className="text-primary underline">
        voltar
      </Link>
    </div>
  );
}
