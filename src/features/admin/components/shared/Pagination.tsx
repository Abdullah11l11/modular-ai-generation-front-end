interface Props {
  page: number;

  lastPage: number;

  onChange(page: number): void;
}

export function Pagination({
  page,

  lastPage,

  onChange,
}: Props) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-2 rounded border"
      >
        Previous
      </button>

      <span>
        {page} / {lastPage}
      </span>

      <button
        disabled={page === lastPage}
        onClick={() => onChange(page + 1)}
        className="px-3 py-2 rounded border"
      >
        Next
      </button>
    </div>
  );
}
