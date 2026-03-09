import { useMemo, useState } from 'react';
import type { CalendarEvent } from '../types';
import { EventTooltip } from './EventTooltip';

interface Props {
	events: CalendarEvent[];
	removeEvent(id: string): void;
}
export function EventList({ events, removeEvent }: Props) {
	const [showPublic, setShowPublic] = useState(true);
	const sortedDisplayEvents = useMemo(
		() => events.slice().sort((a, b) => a.startDate.localeCompare(b.startDate)),
		[events]
	);
	const filteredEvents = showPublic
		? sortedDisplayEvents
		: sortedDisplayEvents.filter((e) => e.type !== 'public' && e.type !== 'school');

	if (sortedDisplayEvents.length === 0) {
		return null;
	}

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
			<div className="flex items-center justify-between mb-2">
				<h2 className="text-sm font-semibold text-gray-700 mb-2">Events</h2>
				<label className="inline-flex items-center text-xs text-gray-600">
					<input
						type="checkbox"
						className="form-checkbox h-4 w-4 text-blue-600"
						checked={showPublic}
						onChange={() => setShowPublic(!showPublic)}
					/>
					<span className="ml-2">Include Public/School Holidays</span>
				</label>
			</div>
			<div className="flex flex-wrap gap-2">
				{filteredEvents.map((event) => (
					<span
						key={event.id}
						className={`relative group/tip inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${
							event.type === 'public'
								? 'bg-green-100 text-green-800'
								: event.type === 'school'
								? 'bg-purple-100 text-purple-800'
								: 'bg-blue-100 text-blue-800'
							}`}
					>
						{event.title}: {event.startDate} to {event.endDate}
						{event.type !== 'public' && event.type !== 'school' && (
							<button
								onClick={() => removeEvent(event.id)}
								className="ml-1 text-blue-500 hover:text-blue-700"
								aria-label={`Remove ${event.title}`}
							>
								&times;
							</button>
						)}
						<EventTooltip events={[event]} position="below" />
					</span>
				))}
			</div>
		</div>
	);
}
