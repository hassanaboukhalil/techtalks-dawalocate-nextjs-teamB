export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 animate-pulse">
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 shadow-lg"></div>
        <span className="ml-3 text-slate-600 font-medium">{message}</span>
      </div>
    </div>
  );
}
