'use client';

interface RevisionTimelineProps {
  revisions: any[];
}

export function RevisionTimeline({ revisions }: RevisionTimelineProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (revisions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No revisions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {revisions.map((revision, index) => (
        <div key={revision.id} className="flex">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {index + 1}
            </div>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {revision.changes?.summary || 'Client updated'}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(revision.created_at)}
              </p>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Changed by {revision.changed_by}
            </p>
            
            {/* Show field changes if available */}
            {revision.changes?.fields && (
              <div className="mt-2 space-y-1">
                {Object.entries(revision.changes.fields).map(([field, change]: [string, any]) => (
                  <div key={field} className="text-xs">
                    <span className="font-medium text-gray-700 capitalize">
                      {field}:
                    </span>
                    <span className="text-gray-600 ml-1">
                      {change.from ? `${change.from} → ${change.to}` : change.to}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
