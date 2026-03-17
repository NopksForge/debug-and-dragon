type ErrorPopupProps = {
  message: string;
  onClose: () => void;
};

export function ErrorPopup({ message, onClose }: ErrorPopupProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-title"
    >
      <div
        className="w-full max-w-sm rounded-xl border border-red-700 bg-zinc-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="error-title"
          className="mb-3 text-lg font-semibold text-red-400"
        >
          Something went wrong
        </h2>
        <p className="mb-4 text-sm text-zinc-200">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}

