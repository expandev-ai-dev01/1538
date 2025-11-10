import type { HomePageProps } from './types';

export const HomePage = (props: HomePageProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to TODO List App</h1>
        <p className="text-lg text-gray-600 mb-8">Sistema de gerenciamento de tarefas</p>
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-700">
            This is the foundation structure for your TODO list application. The project is ready to
            receive feature implementations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
