import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { shiftService } from '../services/shiftService';
import { Event, EventStats, Shift, EventStatus } from '../types';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isManagement } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadEventDetails();
    }
  }, [id]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const [eventData, shiftsData] = await Promise.all([
        eventService.getOne(id!),
        shiftService.getAll({ eventId: id }),
      ]);
      
      setEvent(eventData);
      setShifts(shiftsData);

      if (isManagement) {
        const statsData = await eventService.getStats(id!);
        setStats(statsData);
      }
    } catch (err: any) {
      setError('Event nicht gefunden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Möchten Sie dieses Event wirklich löschen?')) return;
    
    try {
      await eventService.delete(id!);
      navigate('/dashboard/events');
    } catch (err: any) {
      setError('Fehler beim Löschen');
    }
  };

  const handleStatusChange = async (newStatus: EventStatus) => {
    try {
      const updated = await eventService.changeStatus(id!, newStatus);
      setEvent(updated);
    } catch (err: any) {
      setError('Fehler beim Ändern des Status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
        <Link
          to="/dashboard/events"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Zurück zu Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600">
        <Link to="/dashboard/events" className="hover:text-blue-600">
          Events
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{event.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              {getStatusBadge(event.status)}
            </div>
            {event.description && (
              <p className="text-gray-600 mt-2">{event.description}</p>
            )}
          </div>

          {isManagement && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => navigate(`/dashboard/events/${id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Bearbeiten
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Löschen
              </button>
            </div>
          )}
        </div>

        {/* Status Change (Management) */}
        {isManagement && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status ändern:
            </label>
            <div className="flex space-x-2">
              {(['draft', 'published', 'active', 'completed', 'cancelled'] as EventStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={event.status === status}
                    className={`px-3 py-1 text-sm rounded-lg transition ${
                      event.status === status
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date & Time */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">📅 Datum & Zeit</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Datum</div>
              <div className="font-medium text-gray-900">
                {new Date(event.eventDate).toLocaleDateString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Uhrzeit</div>
              <div className="font-medium text-gray-900">
                {event.startTime} - {event.endTime} Uhr
              </div>
            </div>
            {event.expectedAttendees && (
              <div>
                <div className="text-sm text-gray-600">Erwartete Besucher</div>
                <div className="font-medium text-gray-900">
                  👥 {event.expectedAttendees.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">📍 Standort</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Veranstaltungsort</div>
              <div className="font-medium text-gray-900">{event.location}</div>
            </div>
            {event.address && (
              <div>
                <div className="text-sm text-gray-600">Adresse</div>
                <div className="font-medium text-gray-900">{event.address}</div>
              </div>
            )}
            {event.what3words && (
              <div>
                <div className="text-sm text-gray-600">What3Words</div>
                <div className="font-medium text-blue-600">
                  ///{event.what3words}
                </div>
              </div>
            )}
            {event.latitude && event.longitude && (
              <div>
                <div className="text-sm text-gray-600">Koordinaten</div>
                <div className="font-medium text-gray-900">
                  {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        {(event.contactPerson || event.contactPhone || event.contactEmail) && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">👤 Kontakt</h3>
            <div className="space-y-3">
              {event.contactPerson && (
                <div>
                  <div className="text-sm text-gray-600">Ansprechpartner</div>
                  <div className="font-medium text-gray-900">
                    {event.contactPerson}
                  </div>
                </div>
              )}
              {event.contactPhone && (
                <div>
                  <div className="text-sm text-gray-600">Telefon</div>
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {event.contactPhone}
                  </a>
                </div>
              )}
              {event.contactEmail && (
                <div>
                  <div className="text-sm text-gray-600">E-Mail</div>
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {event.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats (Management) */}
        {isManagement && stats && (
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-4">📊 Statistiken</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-700">Schichten gesamt</span>
                <span className="font-bold text-blue-900">{stats.totalShifts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Besetzt</span>
                <span className="font-bold text-green-600">{stats.filledShifts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Offen</span>
                <span className="font-bold text-yellow-600">{stats.openShifts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Bewerbungen</span>
                <span className="font-bold text-purple-600">
                  {stats.totalApplications}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Ausstehend</span>
                <span className="font-bold text-orange-600">
                  {stats.pendingApplications}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {event.notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">📝 Notizen</h3>
          <p className="text-yellow-800">{event.notes}</p>
        </div>
      )}

      {/* Shifts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Schichten ({shifts.length})
          </h2>
          {isManagement && (
            <Link
              to={`/dashboard/shifts/create?eventId=${id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Schicht erstellen
            </Link>
          )}
        </div>

        {shifts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Schichten
            </h3>
            <p className="text-gray-600">
              {isManagement
                ? 'Erstelle Schichten für dieses Event'
                : 'Für dieses Event wurden noch keine Schichten angelegt'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {shifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ShiftCard: React.FC<{ shift: Shift }> = ({ shift }) => {
  const { isManagement } = useAuth();

  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800',
    filled: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    open: 'Offen',
    filled: 'Besetzt',
    cancelled: 'Abgesagt',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-bold text-lg text-gray-900">
              {shift.positionName}
            </h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                statusColors[shift.status]
              }`}
            >
              {statusLabels[shift.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                📅{' '}
                {new Date(shift.shiftDate).toLocaleDateString('de-DE', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </div>
              <div>
                ⏰ {shift.startTime} - {shift.endTime}
              </div>
              <div>👥 {shift.requiredCount} Person(en)</div>
            </div>

            <div className="space-y-2">
              {shift.hourlyRate && (
                <div className="text-right md:text-left">
                  <div className="text-2xl font-bold text-green-600">
                    {shift.hourlyRate}€/h
                  </div>
                </div>
              )}
              {shift.assignedUser && (
                <div className="text-sm text-gray-600">
                  ✅ {shift.assignedUser.firstName} {shift.assignedUser.lastName}
                </div>
              )}
            </div>
          </div>

          {shift.requirements && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Anforderungen: </span>
              {shift.requirements}
            </div>
          )}
        </div>

        {isManagement && (
          <div className="ml-4 space-y-2">
            <Link
              to={`/dashboard/shifts/${shift.id}/edit`}
              className="block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-center"
            >
              Bearbeiten
            </Link>
            {shift.applicationsCount && shift.applicationsCount > 0 && (
              <div className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded text-center">
                {shift.applicationsCount} Bewerbung(en)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
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
  return (
    <span className={`px-3 py-1 text-sm rounded-full ${badges[status]}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function getStatusLabel(status: EventStatus): string {
  const labels = {
    draft: 'Entwurf',
    published: 'Veröffentlicht',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    cancelled: 'Abgesagt',
  };
  return labels[status];
}
