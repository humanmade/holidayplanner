interface HelpSectionProps {
  onDismiss: () => void;
}

export function HelpSection({ onDismiss }: HelpSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4 text-sm text-gray-700">
          <h2 className="font-semibold text-base mb-2">Welcome to the holiday planner</h2>
          <p>The holiday planner helps you sketch out your holidays for the year ahead to make sure you&apos;re maximising your time off. 🌴</p>
          <ul className="space-y-2">
            <li>
              <span className="font-medium">Add holidays:</span> Click and drag across days on the calendar to select a date range, then enter a name for your event.
            </li>
            <li>
              <span className="font-medium">Public holidays:</span> Open <span className="font-medium">Settings</span> and choose your country to display public holidays on the calendar. Some countries also support regional and school holidays.
            </li>
            <li>
              <span className="font-medium">Settings:</span> Adjust your annual leave if you&apos;ve got any rollover days, or adjust the year start month if needed.
            </li>
            <li>
              <span className="font-medium">Export:</span> Use the <span className="font-medium">Export</span> button to download your holidays as CSV or text.
            </li>
          </ul>
          <div className="flex items-center gap-3 pt-1 text-xs text-blue-700">
            <span>
              <span className="inline-block w-3 h-3 rounded-full mr-2 bg-blue-200 border border-blue-300" />
              Personal holiday
            </span>
            <span>
              <span className="inline-block w-3 h-3 rounded-full mr-2 bg-amber-200 border border-amber-300" />
              Company holiday
            </span>
            <span>
              <span className="inline-block w-3 h-3 rounded-full mr-2 border-2 border-green-500" />
              Public holiday
            </span>
            <span>
              <span className="inline-block w-3 h-3 rounded-full mr-2 border-2 border-purple-500" />
              School holiday
            </span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-blue-400 hover:text-blue-600"
          aria-label="Dismiss help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
