import React, { useEffect, useState } from 'react';
import { shiftService } from '../services/shiftService';
import { Shift } from '../types';

export const MyShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadMyShifts();
  }, []);

  const loadMyShifts = async () => {
    try {
      setLoading(true);
      const data = await shiftService.getMyShifts();
      setShifts(data);
    } catch (err: any) {
      setError('Fehler beim Laden der Schichten');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShifts = shifts.filter(
    (shift) => new Date(shift.shiftDate) >= today
  );
  const pastShifts = shifts.filter(
    (shift) => new Date(shift.shiftDate) < today
  );

  const displayedShifts = tab === 'upcoming' ? upcomingShifts : pastShifts;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meine Schichten</h1>
        <p className="text-gray-600 mt-1">Übersicht deiner zugewiesenen Schichten</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTab('upcoming')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              tab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Kommend ({upcomingShifts.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              tab === 'past'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vergangen ({pastShifts.length})
          </button>
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Shifts List */}
      {displayedShifts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Keine Schichten gefunden
          </h3>
          <p className="text-gray-600">
            {tab === 'upcoming'
              ? 'Du hast aktuell keine kommenden Schichten'
              : 'Du hast keine vergangenen Schichten'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedShifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
          ))}
        </div>
      )}

      {/* Summary */}
      {shifts.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Zusammenfassung</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {upcomingShifts.length}
              </div>
              <div className="text-sm text-blue-700">Kommende Schichten</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {pastShifts.length}
              </div>
              <div className="text-sm text-blue-700">Abgeschlossene Schichten</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {calculateTotalHours(shifts)}h
              </div>
              <div className="text-sm text-blue-700">Gesamtstunden</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShiftCard: React.FC<{ shift: Shift }> = ({ shift }) => {
  const calculateHours = () => {
    const [startHour, startMin] = shift.startTime.split(':').map(Number);
    const [endHour, endMin] = shift.endTime.split(':').map(Number);
    const hours = endHour - startHour + (endMin - startMin) / 60;
    return hours.toFixed(1);
  };

  const hours = parseFloat(calculateHours());
  const earnings = shift.hourlyRate ? hours * shift.hourlyRate : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{shift.positionName}</h3>
          <p className="text-gray-600 mt-1">{shift.event?.name}</p>
        </div>
        {shift.hourlyRate && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {earnings.toFixed(2)} €
            </div>
            <div className="text-sm text-gray-500">
              {shift.hourlyRate}€/h × {hours}h
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            {new Date(shift.shiftDate).toLocaleDateString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="flex items-center">
            <span className="mr-2">⏰</span>
            {shift.startTime} - {shift.endTime} Uhr ({hours} Stunden)
          </div>
          <div className="flex items-center">
            <span className="mr-2">📍</span>
            {shift.event?.location}
          </div>
        </div>

        {shift.event && (
          <div className="space-y-2 text-sm text-gray-600">
            {shift.event.contactPerson && (
              <div className="flex items-center">
                <span className="mr-2">👤</span>
                {shift.event.contactPerson}
              </div>
            )}
            {shift.event.contactPhone && (
              <div className="flex items-center">
                <span className="mr-2">📞</span>
                <a
                  href={`tel:${shift.event.contactPhone}`}
                  className="text-blue-600 hover:underline"
                >
                  {shift.event.contactPhone}
                </a>
              </div>
            )}
            {shift.event.address && (
              <div className="flex items-center">
                <span className="mr-2">🗺️</span>
                {shift.event.address}
              </div>
            )}
          </div>
        )}
      </div>

      {(shift.notes || shift.requirements) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {shift.requirements && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">
                Anforderungen:{' '}
              </span>
              <span className="text-sm text-gray-600">{shift.requirements}</span>
            </div>
          )}
          {shift.notes && (
            <div>
              <span className="text-sm font-medium text-gray-700">Hinweise: </span>
              <span className="text-sm text-gray-600">{shift.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function calculateTotalHours(shifts: Shift[]): number {
  return shifts.reduce((total, shift) => {
    const [startHour, startMin] = shift.startTime.split(':').map(Number);
    const [endHour, endMin] = shift.endTime.split(':').map(Number);
    const hours = endHour - startHour + (endMin - startMin) / 60;
    return total + hours;
  }, 0);
}
