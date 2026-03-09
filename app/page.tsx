export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">候鸟式养老服务运营后台</h1>
      <p className="text-lg mb-8">MVP 1.0 版本正在 Vibe Coding 敏捷研发中...</p>
      <div className="animate-pulse flex space-x-4">
        <div className="h-3 w-24 bg-orange-400 rounded"></div>
        <div className="h-3 w-32 bg-orange-300 rounded"></div>
        <div className="h-3 w-20 bg-orange-200 rounded"></div>
      </div>
    </div>
  );
}