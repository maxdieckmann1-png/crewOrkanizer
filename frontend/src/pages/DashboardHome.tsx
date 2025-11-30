import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { shiftService } from '../services/shiftService';
import { Event, Shift, ShiftStats } from '../types';

export const DashboardHome: React.FC = () => {
  const { user, isManagement } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [stats, setStats] = useState<ShiftStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [events, shifts] = await Promise.all([
        eventService.getUpcoming(5),
        shiftService.getMyShifts(),
      ]);

      setUpcomingEvents(events);
      setMyShifts(shifts.slice(0, 3));

      if (isManagement) {
        const shiftStats = await shiftService.getStats();
        setStats(shiftStats);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Laden...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Willkommen, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Hier ist eine Übersicht über deine kommenden Events und Schichten
        </p>
      </div>

      {/* Stats Cards (Management only) */}
      {isManagement && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Alle Schichten"
            value={stats.total}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Offen"
            value={stats.open}
            icon="🔓"
            color="yellow"
          />
          <StatCard
            title="Besetzt"
            value={stats.filled}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Bewerbungen"
            value={stats.pendingApplications}
            icon="✉️"
            color="purple"
          />
        </div>
      )}

      {/* Upcoming Events */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Kommende Events</h2>
          <Link
            to="/dashboard/events"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Alle anzeigen →
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            Keine kommenden Events
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* My Next Shifts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Meine nächsten Schichten</h2>
          <Link
            to="/dashboard/my-shifts"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Alle anzeigen →
          </Link>
        </div>

        {myShifts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            Keine zugewiesenen Schichten
          </div>
        ) : (
          <div className="space-y-4">
            {myShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`text-4xl p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  return (
    <Link
      to={`/dashboard/events/${event.id}`}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
    >
      <h3 className="font-bold text-lg text-gray-900 mb-2">{event.name}</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <div>📅 {new Date(event.eventDate).toLocaleDateString('de-DE')}</div>
        <div>⏰ {event.startTime} - {event.endTime}</div>
        <div>📍 {event.location}</div>
      </div>
    </Link>
  );
};

const ShiftCard: React.FC<{ shift: Shift }> = ({ shift }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{shift.positionName}</h3>
          <p className="text-gray-600 mt-1">{shift.event?.name}</p>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <div>📅 {new Date(shift.shiftDate).toLocaleDateString('de-DE')}</div>
            <div>⏰ {shift.startTime} - {shift.endTime}</div>
            <div>📍 {shift.event?.location}</div>
          </div>
        </div>
        {shift.hourlyRate && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {shift.hourlyRate}€
            </div>
            <div className="text-sm text-gray-500">pro Stunde</div>
          </div>
        )}
      </div>
    </div>
  );
};
