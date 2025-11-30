import React, { useEffect, useState } from 'react';
import { shiftService } from '../services/shiftService';
import { Shift } from '../types';

export const AvailableShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  useEffect(() => {
    loadAvailableShifts();
  }, []);

  const loadAvailableShifts = async () => {
    try {
      setLoading(true);
      const data = await shiftService.getAvailable();
      setShifts(data);
    } catch (err: any) {
      setError('Fehler beim Laden der verfügbaren Schichten');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuccess = () => {
    setSelectedShift(null);
    loadAvailableShifts(); // Reload to remove applied shift
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Verfügbare Schichten</h1>
        <p className="text-gray-600 mt-1">
          Bewirb dich für offene Schichten
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Shifts List */}
      {shifts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Keine verfügbaren Schichten
          </h3>
          <p className="text-gray-600">
            Aktuell gibt es keine offenen Schichten für die du dich bewerben könntest
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {shifts.map((shift) => (
            <AvailableShiftCard
              key={shift.id}
              shift={shift}
              onApply={() => setSelectedShift(shift)}
            />
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {selectedShift && (
        <ApplyModal
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
};

const AvailableShiftCard: React.FC<{
  shift: Shift;
  onApply: () => void;
}> = ({ shift, onApply }) => {
  const calculateHours = () => {
    const [startHour, startMin] = shift.startTime.split(':').map(Number);
    const [endHour, endMin] = shift.endTime.split(':').map(Number);
    return (endHour - startHour + (endMin - startMin) / 60).toFixed(1);
  };

  const hours = parseFloat(calculateHours());
  const earnings = shift.hourlyRate ? hours * shift.hourlyRate : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-900">{shift.positionName}</h3>
          <p className="text-gray-600 mt-1">{shift.event?.name}</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {shift.startTime} - {shift.endTime} ({hours} Stunden)
              </div>
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                {shift.event?.location}
              </div>
            </div>

            <div className="space-y-2">
              {shift.hourlyRate && (
                <div className="text-right md:text-left">
                  <div className="text-3xl font-bold text-green-600">
                    {earnings.toFixed(2)} €
                  </div>
                  <div className="text-sm text-gray-500">
                    {shift.hourlyRate}€/h × {hours}h
                  </div>
                </div>
              )}
            </div>
          </div>

          {shift.requirements && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm">
                <span className="font-medium text-yellow-900">
                  ⚠️ Anforderungen:{' '}
                </span>
                <span className="text-yellow-800">{shift.requirements}</span>
              </div>
            </div>
          )}

          {shift.notes && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Hinweise: </span>
              {shift.notes}
            </div>
          )}
        </div>

        <button
          onClick={onApply}
          className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold whitespace-nowrap"
        >
          Jetzt bewerben
        </button>
      </div>
    </div>
  );
};

const ApplyModal: React.FC<{
  shift: Shift;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ shift, onClose, onSuccess }) => {
  const [priority, setPriority] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await shiftService.apply(shift.id, { priority, notes });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bewerbung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Für Schicht bewerben</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900">{shift.positionName}</h3>
          <p className="text-sm text-gray-600 mt-1">{shift.event?.name}</p>
          <p className="text-sm text-gray-600 mt-2">
            📅 {new Date(shift.shiftDate).toLocaleDateString('de-DE')} •{' '}
            ⏰ {shift.startTime} - {shift.endTime}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorität (1 = höchste)
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    priority === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              1 = Diese Schicht ist mir sehr wichtig | 5 = Würde machen wenn nichts
              anderes geht
            </p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Deine Nachricht (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Warum bist du geeignet für diese Schicht? Erfahrungen, Qualifikationen, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Bewerbung wird gesendet...' : 'Bewerbung absenden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
