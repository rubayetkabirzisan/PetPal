export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A47] mx-auto mb-4"></div>
        <p className="text-[#8B4513]">Loading applications...</p>
      </div>
    </div>
  )
}
