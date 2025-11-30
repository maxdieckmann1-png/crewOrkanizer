import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { Event, EventStatus } from '../types';

export const EventsPage: React.FC = () => {
  const { isManagement } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EventStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadEvents();
  }, [search, status, page]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAll({
        search,
        status: status || undefined,
        page,
        limit: 9,
        sortBy: 'eventDate',
        sortOrder: 'ASC',
      });
      setEvents(response.data);
      setTotalPages(response.lastPage);
    } catch (err: any) {
      setError('Fehler beim Laden der Events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      draft: 'Entwurf',
      published: 'Veröffentlicht',
      active: 'Aktiv',
      completed: 'Abgeschlossen',
      cancelled: 'Abgesagt',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">Verwalte alle Veranstaltungen</p>
        </div>
        {isManagement && (
          <Link
            to="/dashboard/events/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Event erstellen
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suche
            </label>
            <input
              type="text"
              placeholder="Event suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus | '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Alle Status</option>
              <option value="draft">Entwurf</option>
              <option value="published">Veröffentlicht</option>
              <option value="active">Aktiv</option>
              <option value="completed">Abgeschlossen</option>
              <option value="cancelled">Abgesagt</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setStatus('');
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Keine Events gefunden
          </h3>
          <p className="text-gray-600">
            {isManagement
              ? 'Erstelle dein erstes Event um loszulegen'
              : 'Es gibt aktuell keine Events'}
          </p>
          {isManagement && (
            <Link
              to="/dashboard/events/create"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Event erstellen
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zurück
              </button>
              <span className="text-gray-700">
                Seite {page} von {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const { isManagement } = useAuth();

  return (
    <Link
      to={`/dashboard/events/${event.id}`}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition">
            {event.name}
          </h3>
        </div>
        {getStatusBadge(event.status)}
      </div>

      {event.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="mr-2">📅</span>
          {new Date(event.eventDate).toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <div className="flex items-center">
          <span className="mr-2">⏰</span>
          {event.startTime} - {event.endTime}
        </div>
        <div className="flex items-center">
          <span className="mr-2">📍</span>
          {event.location}
        </div>
      </div>

      {(event.shiftsCount !== undefined || event.expectedAttendees) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
          {event.shiftsCount !== undefined && (
            <div className="text-gray-600">
              <span className="font-medium text-gray-900">
                {event.filledShiftsCount || 0}/{event.shiftsCount}
              </span>{' '}
              Schichten besetzt
            </div>
          )}
          {event.expectedAttendees && (
            <div className="text-gray-600">
              👥 {event.expectedAttendees.toLocaleString()}
            </div>
          )}
        </div>
      )}
    </Link>
  );
};

function getStatusBadge(status: EventStatus) {
  const badges = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-800',
  };
  const labels = {
    draft: 'Entwurf',
    published: 'Veröffentlicht',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    cancelled: 'Abgesagt',
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${badges[status]}`}>
      {labels[status]}
    </span>
  );
}
