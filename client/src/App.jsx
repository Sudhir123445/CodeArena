import AppRouter from './router';
import Navbar from './components/layout/Navbar';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <AppRouter />
      </main>
    </div>
  );
}
